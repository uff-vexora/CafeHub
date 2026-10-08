import React, { useState } from 'react';
import { Cafe, CafeImage } from '../../../types';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ownerService } from '../../../services/ownerService';

interface StepPhotosProps {
  cafe: Cafe;
  galleryImages: CafeImage[];
  onUpdateBranding: (branding: { logo_url?: string; cover_image?: string }) => Promise<{ success: boolean; error?: string }>;
  onImageUploaded: (image: CafeImage) => void;
  onImageDeleted: (imageId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepPhotos: React.FC<StepPhotosProps> = ({
  cafe,
  galleryImages,
  onUpdateBranding,
  onImageUploaded,
  onImageDeleted,
  onNext,
  onBack,
}) => {
  const [logoUrl, setLogoUrl] = useState(cafe.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(cafe.cover_image || '');
  const [uploadTarget, setUploadTarget] = useState<'logo' | 'cover' | 'gallery' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'cover' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadTarget(target);

    try {
      const res = await ownerService.uploadCafeImage(
        cafe.id,
        file,
        target === 'logo' ? 'Cafe Logo' : target === 'cover' ? 'Cover Banner' : 'Atmosphere Photo'
      );

      if (!res.success || !res.url) {
        setError(res.error || 'Failed to upload photo. Please check the file format and size.');
        return;
      }

      if (target === 'logo') {
        setLogoUrl(res.url);
        await onUpdateBranding({ logo_url: res.url });
      } else if (target === 'cover') {
        setCoverUrl(res.url);
        await onUpdateBranding({ cover_image: res.url });
      } else {
        if (res.imageRecord) {
          onImageUploaded(res.imageRecord);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during image upload.');
    } finally {
      setUploadTarget(null);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string, url: string) => {
    if (!confirm('Are you sure you want to remove this photo?')) return;
    setError(null);
    try {
      const res = await ownerService.deleteCafeImage(imageId, url);
      if (res.success) {
        onImageDeleted(imageId);
      } else {
        setError(res.error || 'Failed to delete photo.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete photo.');
    }
  };

  const handleSaveAndProceed = async () => {
    setIsSavingBranding(true);
    try {
      const res = await onUpdateBranding({ logo_url: logoUrl, cover_image: coverUrl });
      if (res && !res.success) {
        setError(res.error || 'Failed to save cafe branding.');
        return;
      }
      onNext();
    } finally {
      setIsSavingBranding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div>
          <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-600" />
            <span>Cafe Branding & Visuals</span>
          </h3>
          <p className="text-xs text-coffee-600 mt-1">
            High quality photos increase customer discovery and order conversions.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Cafe Logo & Cover Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Logo Card */}
          <div className="p-5 rounded-2xl border border-cream-200 bg-cream-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-espresso-950 block">Cafe Logo / Emblem</span>
                <span className="text-[11px] text-coffee-500">Square or circular icon</span>
              </div>
              {logoUrl && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border border-cream-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-coffee-400">Logo</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-cream-100 border border-cream-300 text-espresso-900 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadTarget === 'logo' ? 'Uploading...' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadTarget !== null}
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-coffee-400">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Cover Photo Card */}
          <div className="p-5 rounded-2xl border border-cream-200 bg-cream-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-espresso-950 block">Cover Banner Photo</span>
                <span className="text-[11px] text-coffee-500">Wide hero image for your storefront</span>
              </div>
              {coverUrl && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>

            <div className="space-y-3">
              <div className="w-full h-24 rounded-2xl bg-white border border-cream-300 overflow-hidden flex items-center justify-center shadow-xs">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-coffee-400">Cover Banner (16:9)</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-cream-100 border border-cream-300 text-espresso-900 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadTarget === 'cover' ? 'Uploading...' : 'Upload Banner'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadTarget !== null}
                    onChange={(e) => handleFileUpload(e, 'cover')}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-coffee-400">Recommended: 1200x600 px</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Atmosphere & Gallery Photos */}
        <div className="space-y-3 pt-4 border-t border-cream-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-espresso-950 block">
                Atmosphere & Space Gallery ({galleryImages.length})
              </span>
              <span className="text-[11px] text-coffee-500">
                Seating area, espresso machine, counter, and barista moments.
              </span>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-espresso-900 hover:bg-espresso-950 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs self-start sm:self-auto">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadTarget === 'gallery' ? 'Uploading...' : 'Add Gallery Photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadTarget !== null}
                onChange={(e) => handleFileUpload(e, 'gallery')}
                className="hidden"
              />
            </label>
          </div>

          {galleryImages.length === 0 ? (
            <div className="p-8 text-center bg-cream-50/50 rounded-2xl border border-dashed border-cream-300">
              <ImageIcon className="w-8 h-8 text-coffee-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-espresso-900">No gallery photos uploaded yet</p>
              <p className="text-[11px] text-coffee-500 mt-0.5">
                Upload 2 to 4 photos of your venue to help diners visualize their visit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden aspect-square border border-cream-200 bg-cream-100 shadow-xs"
                >
                  <img src={img.image_url} alt={img.caption || 'Cafe'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-espresso-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(img.id, img.image_url)}
                      className="p-2 bg-rose-600 text-white rounded-xl hover:scale-105 transition-transform cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-xs font-bold text-coffee-700 hover:text-espresso-950 hover:bg-cream-100 rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndProceed}
          disabled={isSavingBranding}
          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-warm hover:shadow-warm-md flex items-center gap-2 text-xs cursor-pointer"
        >
          {isSavingBranding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Review Setup & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
