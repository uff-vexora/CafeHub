import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOwnerCafe } from '../../hooks/useOwnerCafe';
import { OnboardingStepper } from '../../components/owner/onboarding/OnboardingStepper';
import { StepBasicInfo } from '../../components/owner/onboarding/StepBasicInfo';
import { StepLocationContact } from '../../components/owner/onboarding/StepLocationContact';
import { StepOpeningHours } from '../../components/owner/onboarding/StepOpeningHours';
import { StepAmenities } from '../../components/owner/onboarding/StepAmenities';
import { StepMenuCategories } from '../../components/owner/onboarding/StepMenuCategories';
import { StepMenuItems } from '../../components/owner/onboarding/StepMenuItems';
import { StepPhotos } from '../../components/owner/onboarding/StepPhotos';
import { StepReviewSubmit } from '../../components/owner/onboarding/StepReviewSubmit';
import { CafeStatusCard } from '../../components/owner/CafeStatusCard';
import { CafeImage } from '../../types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const OwnerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cafe,
    openingHours,
    amenities,
    menuCategories,
    menuItems,
    images,
    completeness,
    isLoading,
    actionLoading,
    error: loadError,
    createCafe,
    updateCafe,
    submitForApproval,
    saveOpeningHours,
    saveAmenities,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    refresh,
  } = useOwnerCafe();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [localGalleryImages, setLocalGalleryImages] = useState<CafeImage[]>([]);

  // Keep gallery images synced
  useEffect(() => {
    if (images) {
      setLocalGalleryImages(images);
    }
  }, [images]);

  // Compute completed step IDs based on real saved database state
  const completedSteps: number[] = [];
  if (cafe?.name && (cafe.description?.trim().length || 0) >= 10) completedSteps.push(1);
  if (cafe?.address && cafe?.city && (cafe.phone?.trim().length || 0) >= 8) completedSteps.push(2);
  if (openingHours.length > 0 && openingHours.some((h) => h.is_open)) completedSteps.push(3);
  if (amenities.length > 0) completedSteps.push(4);
  if (menuCategories.length > 0) completedSteps.push(5);
  if (menuItems.length > 0) completedSteps.push(6);
  if (cafe?.cover_image || cafe?.logo_url || localGalleryImages.length > 0) completedSteps.push(7);

  // Can navigate to a step if previous prerequisite steps exist (or step 1)
  const canNavigateToStep = (stepId: number): boolean => {
    if (stepId === 1) return true;
    if (!cafe) return false;
    // Can jump to any step once cafe exists, or up to completedSteps + 1
    return true;
  };

  // Determine initial step on first load
  useEffect(() => {
    if (!isLoading && cafe) {
      // If cafe is already submitted or approved
      if (cafe.status === 'pending_approval' || cafe.status === 'approved') {
        setCurrentStep(8);
        return;
      }

      // Resume at the first incomplete step
      for (let s = 1; s <= 7; s++) {
        if (!completedSteps.includes(s)) {
          setCurrentStep(s);
          return;
        }
      }
      setCurrentStep(8); // All prerequisites done -> ready for review
    }
  }, [isLoading, cafe?.id]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-xs text-coffee-600 font-semibold">Loading merchant profile...</span>
        </div>
      </div>
    );
  }

  // Handle Step 1 Save
  const handleSaveBasicInfo = async (data: {
    name: string;
    tagline: string;
    description: string;
    price_range: '₹' | '₹₹' | '₹₹₹';
  }) => {
    if (cafe) {
      const res = await updateCafe(data);
      if (res.success) {
        setCurrentStep(2);
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = await createCafe({
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        price_range: data.price_range,
        email: user?.email || '',
        phone: user?.phone || '',
      });
      if (res.success) {
        setCurrentStep(2);
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  // Handle Step 2 Save
  const handleSaveLocation = async (data: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
  }) => {
    const res = await updateCafe(data);
    if (res.success) {
      setCurrentStep(3);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Step 3 Save
  const handleSaveHours = async (hours: typeof openingHours) => {
    const res = await saveOpeningHours(hours);
    if (res.success) {
      setCurrentStep(4);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Step 4 Save
  const handleSaveAmenities = async (newAmenities: typeof amenities) => {
    const res = await saveAmenities(newAmenities);
    if (res.success) {
      setCurrentStep(5);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Step 7 Branding
  const handleUpdateBranding = async (branding: { logo_url?: string; cover_image?: string }) => {
    const res = await updateCafe(branding);
    return { success: res.success, error: res.error };
  };

  // Handle Step 8 Final Submission
  const handleSubmitForApproval = async () => {
    const res = await submitForApproval();
    if (res.success) {
      await refresh();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const isStatusSubmittedOrApproved =
    cafe?.status === 'pending_approval' || cafe?.status === 'approved' || cafe?.status === 'suspended';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Top Banner if Cafe Status is not draft */}
      {cafe && cafe.status && cafe.status !== 'draft' && (
        <CafeStatusCard
          cafe={cafe}
          onEditOrResume={() => {
            setCurrentStep(1);
          }}
        />
      )}

      {/* Global Load Error */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Main Wizard Interface (Hidden only if approved, unless reviewing) */}
      {(!isStatusSubmittedOrApproved || currentStep !== 8) && (
        <>
          {/* Stepper Progress */}
          <OnboardingStepper
            currentStep={currentStep}
            totalSteps={8}
            completedSteps={completedSteps}
            progressScore={completeness.score}
            onStepClick={(stepId) => setCurrentStep(stepId)}
            canNavigateToStep={canNavigateToStep}
          />

          {/* Active Step Content */}
          <div className="transition-all">
            {currentStep === 1 && (
              <StepBasicInfo
                cafe={cafe}
                onSave={handleSaveBasicInfo}
                isSaving={actionLoading === 'createCafe' || actionLoading === 'updateCafe'}
              />
            )}

            {currentStep === 2 && cafe && (
              <StepLocationContact
                cafe={cafe}
                onSave={handleSaveLocation}
                onBack={() => setCurrentStep(1)}
                isSaving={actionLoading === 'updateCafe'}
              />
            )}

            {currentStep === 3 && cafe && (
              <StepOpeningHours
                cafeId={cafe.id}
                initialHours={openingHours}
                onSave={handleSaveHours}
                onBack={() => setCurrentStep(2)}
                isSaving={actionLoading === 'saveHours'}
              />
            )}

            {currentStep === 4 && (
              <StepAmenities
                initialAmenities={amenities}
                onSave={handleSaveAmenities}
                onBack={() => setCurrentStep(3)}
                isSaving={actionLoading === 'saveAmenities'}
              />
            )}

            {currentStep === 5 && (
              <StepMenuCategories
                categories={menuCategories}
                onCreateCategory={(name, order) => createCategory(name, order)}
                onUpdateCategory={(id, updates) => updateCategory(id, updates)}
                onDeleteCategory={(id) => deleteCategory(id)}
                onNext={() => setCurrentStep(6)}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {currentStep === 6 && cafe && (
              <StepMenuItems
                cafeId={cafe.id}
                categories={menuCategories}
                items={menuItems}
                onCreateItem={(item) => createMenuItem(item)}
                onUpdateItem={(id, updates) => updateMenuItem(id, updates)}
                onDeleteItem={(id) => deleteMenuItem(id)}
                onToggleAvailability={(id, avail) => toggleItemAvailability(id, avail)}
                onNext={() => setCurrentStep(7)}
                onBack={() => setCurrentStep(5)}
              />
            )}

            {currentStep === 7 && cafe && (
              <StepPhotos
                cafe={cafe}
                galleryImages={localGalleryImages}
                onUpdateBranding={handleUpdateBranding}
                onImageUploaded={(img) => setLocalGalleryImages((prev) => [...prev, img])}
                onImageDeleted={(imgId) =>
                  setLocalGalleryImages((prev) => prev.filter((i) => i.id !== imgId))
                }
                onNext={() => setCurrentStep(8)}
                onBack={() => setCurrentStep(6)}
              />
            )}

            {currentStep === 8 && cafe && (
              <StepReviewSubmit
                cafe={cafe}
                hours={openingHours}
                amenities={amenities}
                categories={menuCategories}
                items={menuItems}
                images={localGalleryImages}
                completeness={completeness}
                onJumpToStep={(stepId) => setCurrentStep(stepId)}
                onSubmitForApproval={handleSubmitForApproval}
                onBack={() => setCurrentStep(7)}
                isSubmitting={actionLoading === 'submitForApproval'}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
