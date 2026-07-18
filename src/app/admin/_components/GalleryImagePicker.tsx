"use client";

import { useEffect, useState, useCallback } from "react";

interface GalleryImage {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink: string;
  createdTime: string;
}

interface GalleryImagePickerProps {
  /** The current imageUrl value (to highlight selected image) */
  currentImageUrl: string;
  /** Called when the user picks an image — receives the public proxied URL */
  onSelect: (url: string) => void;
  /** Label for the trigger button */
  buttonLabel?: string;
}

function getPublicUrl(fileId: string, width = 400): string {
  return `/api/image/${fileId}?w=${width}`;
}

function getPublicFullUrl(fileId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/image/${fileId}?w=1200`;
  }
  return `/api/image/${fileId}?w=1200`;
}

export default function GalleryImagePicker({
  currentImageUrl,
  onSelect,
  buttonLabel = "Select from Gallery",
}: GalleryImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (res.ok && data.images) {
        setImages(data.images);
      } else {
        setError(data.error || "Failed to load gallery images");
      }
    } catch {
      setError("Could not connect to gallery. Check your Google Drive configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && images.length === 0) {
      fetchImages();
    }
  }, [open, images.length, fetchImages]);

  const handleSelect = (fileId: string) => {
    onSelect(getPublicFullUrl(fileId));
    setOpen(false);
  };

  const isSelected = (fileId: string) =>
    currentImageUrl.includes(`/api/image/${fileId}`) ||
    currentImageUrl.includes(`id=${fileId}`);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors shrink-0"
        title="Pick an image from the gallery"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {buttonLabel}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Select from Gallery</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pick an image to use. Images are fetched from your Google Drive folder.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading gallery images...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-amber-800">Configuration Required</p>
                  <p className="text-sm text-amber-700 mt-1">{error}</p>
                </div>
              )}

              {!loading && !error && images.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-sm text-gray-500">No images in gallery yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Upload images via the Gallery page first.</p>
                </div>
              )}

              {!loading && !error && images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map((img) => {
                    const selected = isSelected(img.id);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelect(img.id)}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square bg-gray-100 ${
                          selected
                            ? "border-indigo-500 ring-2 ring-indigo-200 shadow-lg scale-[1.03]"
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={getPublicUrl(img.id, 300)}
                          alt={img.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${img.id}&sz=w300`;
                          }}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          {selected && (
                            <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1 shadow-lg">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Name tooltip */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white truncate">{img.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between">
              <span className="text-xs text-gray-400">{images.length} image{images.length !== 1 ? "s" : ""} available</span>
              <div className="flex gap-2">
                {currentImageUrl && (
                  <button
                    type="button"
                    onClick={() => { onSelect(""); setOpen(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Clear Image
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
