import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderItem, OrderStatus, OrderType, MenuItem, Cafe } from '../types';
import { SEED_ORDERS, SEED_CAFES, generateAllMenuItems } from '../data/seedData';

// Fallback in-memory storage for offline / mock testing
const localMockOrders: Order[] = [...SEED_ORDERS];
const localSeedCafes = [...SEED_CAFES];
const localSeedMenuItems = generateAllMenuItems(localSeedCafes);

export interface CreateOrderParams {
  userId: string;
  cafeId: string;
  orderType: OrderType;
  items: {
    menuItemId: string;
    quantity: number;
    customizations?: Record<string, string>;
  }[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  dineInTable?: string;
  notes?: string;
  paymentMethod: 'UPI / Card' | 'Cash on Pickup' | 'Card at Cafe';
}

export const orderService = {
  /**
   * Helper: Validate status transition rules
   * Prevents arbitrary status jumps
   */
  isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    if (currentStatus === newStatus) return true;
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return false; // Final states cannot be changed
    }

    switch (currentStatus) {
      case 'order_placed':
        return newStatus === 'confirmed' || newStatus === 'cancelled';
      case 'confirmed':
        return newStatus === 'preparing' || newStatus === 'cancelled';
      case 'preparing':
        return newStatus === 'ready' || newStatus === 'cancelled';
      case 'ready':
        return newStatus === 'completed' || newStatus === 'cancelled';
      default:
        return false;
    }
  },

  /**
   * 1. Create Order with STRICT Server/DB validation
   * NEVER trusts client-submitted prices, subtotals, or availability.
   * Preserves historical item price snapshot.
   */
  async createOrder(params: CreateOrderParams): Promise<{ success: boolean; order?: Order; error?: string }> {
    const {
      userId,
      cafeId,
      orderType,
      items: rawItems,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryPostalCode,
      dineInTable,
      notes,
      paymentMethod,
    } = params;

    if (!rawItems || rawItems.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items before checking out.' };
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      return { success: false, error: 'Please provide full contact details (name, phone, email).' };
    }

    if (orderType === 'delivery' && !deliveryAddress?.trim()) {
      return { success: false, error: 'Please provide a valid delivery address for home delivery.' };
    }

    // Step A: Validate Cafe exists and is approved
    let cafeData: Cafe | null = null;
    let availableMenuItems: MenuItem[] = [];

    if (isSupabaseConfigured) {
      const { data: cafe, error: cafeErr } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .single();

      if (cafeErr || !cafe) {
        return { success: false, error: 'Selected cafe does not exist.' };
      }

      if (!cafe.is_approved || (cafe.status && cafe.status !== 'approved')) {
        return { success: false, error: 'This cafe is currently not accepting public orders.' };
      }

      cafeData = cafe as Cafe;

      // Fetch trusted menu items from Supabase
      const { data: menuItems, error: menuErr } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId);

      if (menuErr || !menuItems || menuItems.length === 0) {
        return { success: false, error: 'Menu items could not be loaded for this cafe.' };
      }

      availableMenuItems = menuItems as MenuItem[];
    } else {
      // Local fallback lookup
      const cafe = localSeedCafes.find((c) => c.id === cafeId);
      if (!cafe) {
        return { success: false, error: 'Selected cafe does not exist.' };
      }
      if (!cafe.is_approved || (cafe.status && cafe.status !== 'approved')) {
        return { success: false, error: 'This cafe is currently not accepting public orders.' };
      }
      cafeData = cafe;
      availableMenuItems = localSeedMenuItems.filter((m) => m.cafe_id === cafeId);
    }

    // Step B: Validate every item belongs to the cafe, is available, and recompute pricing
    const itemMap = new Map(availableMenuItems.map((item) => [item.id, item]));
    const verifiedOrderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (let i = 0; i < rawItems.length; i++) {
      const entry = rawItems[i];
      if (entry.quantity <= 0) {
        return { success: false, error: 'Item quantities must be greater than zero.' };
      }

      const menuItem = itemMap.get(entry.menuItemId);
      if (!menuItem) {
        return { success: false, error: `One or more items do not belong to ${cafeData.name}.` };
      }

      if (!menuItem.is_available) {
        return { success: false, error: `"${menuItem.name}" is currently sold out and cannot be ordered.` };
      }

      // Calculate unit price from database record + customization options
      let unitPrice = Number(menuItem.price);
      if (entry.customizations && menuItem.customization_options) {
        menuItem.customization_options.forEach((group) => {
          const selectedVal = entry.customizations?.[group.name];
          if (selectedVal) {
            const matchedOpt = group.options.find((opt) => opt.name === selectedVal);
            if (matchedOpt) {
              unitPrice += Number(matchedOpt.price);
            }
          }
        });
      }

      const itemTotal = Number((unitPrice * entry.quantity).toFixed(2));
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        id: `oi-${Date.now()}-${i}`,
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        item_price: unitPrice,
        quantity: entry.quantity,
        item_total: itemTotal,
        customizations: entry.customizations,
      });
    }

    calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));
    const taxes = Number((calculatedSubtotal * 0.05).toFixed(2)); // 5% GST
    const serviceFee = orderType === 'dine_in' ? 25 : 15;
    const deliveryFee = orderType === 'delivery' ? 40 : 0;
    const calculatedTotal = Number((calculatedSubtotal + taxes + serviceFee + deliveryFee).toFixed(2));

    const orderNumber = `CH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      user_id: userId,
      cafe_id: cafeId,
      cafe_name: cafeData.name,
      cafe_image: cafeData.cover_image,
      order_type: orderType,
      status: 'order_placed',
      items: verifiedOrderItems,
      subtotal: calculatedSubtotal,
      taxes,
      service_fee: serviceFee,
      delivery_fee: deliveryFee,
      total_amount: calculatedTotal,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim(),
      delivery_address: orderType === 'delivery' ? deliveryAddress?.trim() : undefined,
      delivery_city: orderType === 'delivery' ? deliveryCity?.trim() : undefined,
      delivery_postal_code: orderType === 'delivery' ? deliveryPostalCode?.trim() : undefined,
      dine_in_table: orderType === 'dine_in' ? dineInTable?.trim() : undefined,
      notes: notes?.trim() || undefined,
      payment_status: 'pending', // No faked payment success when gateway is not active
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      estimated_time: orderType === 'delivery' ? '30-40 mins' : orderType === 'pickup' ? '15 mins' : '10-15 mins',
    };

    // Step C: Persist to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: dbOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: newOrder.order_number,
            user_id: newOrder.user_id,
            cafe_id: newOrder.cafe_id,
            order_type: newOrder.order_type,
            status: newOrder.status,
            subtotal: newOrder.subtotal,
            taxes: newOrder.taxes,
            service_fee: newOrder.service_fee,
            delivery_fee: newOrder.delivery_fee,
            total_amount: newOrder.total_amount,
            customer_name: newOrder.customer_name,
            customer_phone: newOrder.customer_phone,
            customer_email: newOrder.customer_email,
            delivery_address: newOrder.delivery_address,
            delivery_city: newOrder.delivery_city,
            delivery_postal_code: newOrder.delivery_postal_code,
            dine_in_table: newOrder.dine_in_table,
            notes: newOrder.notes,
            payment_status: newOrder.payment_status,
            payment_method: newOrder.payment_method,
          })
          .select()
          .single();

        if (orderErr || !dbOrder) {
          console.error('Database order creation error:', orderErr);
          return { success: false, error: orderErr?.message || 'Failed to persist order to database.' };
        }

        // Insert historical order item snapshots
        const orderItemsPayload = verifiedOrderItems.map((item) => ({
          order_id: dbOrder.id,
          menu_item_id: item.menu_item_id,
          item_name: item.item_name,
          item_price: item.item_price,
          quantity: item.quantity,
          item_total: item.item_total,
          customizations: item.customizations || {},
        }));

        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItemsPayload);

        if (itemsErr) {
          console.error('Database order items insertion error:', itemsErr);
        }

        newOrder.id = dbOrder.id;
      } catch (err: any) {
        console.error('Order creation exception:', err);
        return { success: false, error: err?.message || 'Error occurred while saving order.' };
      }
    }

    localMockOrders.unshift(newOrder);
    return { success: true, order: newOrder };
  },

  /**
   * 2. Update Order Status with Controlled Transitions
   * Prevents arbitrary jumping
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    operator: { userId: string; role: string; ownedCafeIds: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    // Lookup target order
    let targetOrder: Order | undefined;

    if (isSupabaseConfigured) {
      const { data: dbOrder, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !dbOrder) {
        return { success: false, error: 'Order not found in database.' };
      }
      targetOrder = dbOrder as Order;
    } else {
      targetOrder = localMockOrders.find((o) => o.id === orderId);
      if (!targetOrder) {
        return { success: false, error: 'Order not found.' };
      }
    }

    // Security check: Only the cafe owner of this order or admin can modify status
    if (operator.role !== 'admin' && !operator.ownedCafeIds.includes(targetOrder.cafe_id)) {
      return { success: false, error: 'Access Denied: You do not own the cafe associated with this order.' };
    }

    // Lifecycle check: Disallow invalid jumps
    if (!orderService.isValidStatusTransition(targetOrder.status, newStatus)) {
      return {
        success: false,
        error: `Invalid transition from "${targetOrder.status.replace('_', ' ')}" to "${newStatus.replace('_', ' ')}". Statuses must advance sequentially.`,
      };
    }

    // Persist to Supabase
    if (isSupabaseConfigured) {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
    }

    // Update in fallback store
    const localIdx = localMockOrders.findIndex((o) => o.id === orderId);
    if (localIdx > -1) {
      localMockOrders[localIdx].status = newStatus;
    }

    return { success: true };
  },

  /**
   * 3. Fetch Orders (Strictly isolated by role/user)
   */
  async getOrders(operator: {
    userId?: string;
    role?: string;
    ownedCafeIds?: string[];
  }): Promise<{ success: boolean; orders: Order[]; error?: string }> {
    if (!operator.userId) {
      return { success: true, orders: [] }; // Logged out users see zero orders
    }

    if (!isSupabaseConfigured) {
      if (operator.role === 'admin') {
        return { success: true, orders: [...localMockOrders] };
      }
      if (operator.role === 'cafe_owner') {
        const owned = operator.ownedCafeIds || [];
        return {
          success: true,
          orders: localMockOrders.filter((o) => owned.includes(o.cafe_id)),
        };
      }
      // Customer
      return {
        success: true,
        orders: localMockOrders.filter((o) => o.user_id === operator.userId),
      };
    }

    try {
      let query = supabase.from('orders').select(`
        *,
        order_items (
          id,
          menu_item_id,
          item_name,
          item_price,
          quantity,
          item_total,
          customizations
        )
      `);

      if (operator.role === 'admin') {
        // Admin sees all
      } else if (operator.role === 'cafe_owner') {
        const owned = operator.ownedCafeIds || [];
        if (owned.length === 0) return { success: true, orders: [] };
        query = query.in('cafe_id', owned);
      } else {
        // Customer sees only own
        query = query.eq('user_id', operator.userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, orders: [], error: error.message };
      }

      // Map joined structure to Order type
      const formatted: Order[] = (data || []).map((row: any) => ({
        ...row,
        items: row.order_items || [],
      }));

      return { success: true, orders: formatted };
    } catch (err: any) {
      return { success: false, orders: [], error: err?.message };
    }
  },
};
