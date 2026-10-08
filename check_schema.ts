import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://olbdbpzfjxniybmqdeqx.supabase.co',
  'sb_publishable_U6CexKfRqzQPEeY79yM4Ow_aBP8l3C3'
);

async function checkTables() {
  const tables = [
    'profiles',
    'cafes',
    'cafe_opening_hours',
    'cafe_amenities',
    'cafe_images',
    'menu_categories',
    'menu_items',
    'orders',
    'order_items',
    'reservations',
    'reviews',
    'favorites',
    'in_app_notifications',
  ];

  console.log('--- VERIFYING TABLES IN LIVE SUPABASE ---');
  for (const table of tables) {
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${table.padEnd(22)}: ERROR (${error.code}) ${error.message}`);
    } else {
      console.log(`✅ ${table.padEnd(22)}: EXISTS (row count: ${count})`);
    }
  }
}

checkTables();
