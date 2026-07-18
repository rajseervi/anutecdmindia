"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";

interface GalleryImage {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink: string;
  createdTime: string;
}

export const dynamic = "force-dynamic";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const selectedImage = selectedIdx !== null ? images[selectedIdx] : null;
  const totalImages = images.length;

  // Reset zoom/pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [selectedIdx]);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (res.ok && data.images) {
        setImages(data.images);
      } else {
        setError(data.error || "Failed to load gallery");
      }
    } catch {
      setError("Could not connect to gallery service. Check your Google Drive configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  // Keyboard
  useEffect(() => {
    if (selectedIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigateNext();
      else if (e.key === "ArrowLeft") navigatePrev();
      else if (e.key === "Escape") {
        if (zoom > 1) { setZoom(1); setPan({ x: 0, y: 0 }); }
        else setSelectedIdx(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx, totalImages, zoom]);

  const navigatePrev = () => setSelectedIdx((prev) => (prev !== null ? (prev - 1 + totalImages) % totalImages : null));
  const navigateNext = () => setSelectedIdx((prev) => (prev !== null ? (prev + 1) % totalImages : null));

  // Clamp pan so image doesn't fly off screen entirely
  const clampPan = useCallback((z: number, p: { x: number; y: number }) => {
    if (z <= 1) return { x: 0, y: 0 };
    const maxShift = (z - 1) * 200; // degrees of freedom grow with zoom
    return {
      x: Math.max(-maxShift, Math.min(maxShift, p.x)),
      y: Math.max(-maxShift, Math.min(maxShift, p.y)),
    };
  }, []);

  // Zoom via scroll wheel — centers on cursor position
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;

    setZoom((prevZoom) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(1, Math.min(5, prevZoom + delta));
      if (newZoom === 1) {
        setPan({ x: 0, y: 0 });
        return newZoom;
      }
      // Keep the point under the cursor fixed during zoom
      const scaleChange = newZoom / prevZoom;
      setPan((prevPan) => {
        const newX = cx - scaleChange * (cx - prevPan.x);
        const newY = cy - scaleChange * (cy - prevPan.y);
        return clampPan(newZoom, { x: newX, y: newY });
      });
      return newZoom;
    });
  };

  // Click toggle zoom — centers on click point
  const handleImageClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;

    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
      setPan(clampPan(2.5, { x: cx * 0.5, y: cy * 0.5 }));
    }
  };

  // Double-click to step zoom toward cursor
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;

    if (zoom >= 3) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const prevZoom = zoom;
    const newZoom = Math.min(5, prevZoom + 1);
    const scaleChange = newZoom / prevZoom;
    setZoom(newZoom);
    setPan((prevPan) => clampPan(newZoom, {
      x: cx - scaleChange * (cx - prevPan.x),
      y: cy - scaleChange * (cy - prevPan.y),
    }));
  };

  // Drag to pan — with boundaries
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;
    setPan(clampPan(zoom, { x: rawX, y: rawY }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support: pinch to zoom
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const newDist = Math.hypot(dx, dy);
    const scale = newDist / lastTouchDist.current;
    if (Math.abs(scale - 1) < 0.02) return;
    lastTouchDist.current = newDist;

    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = lastTouchCenter.current.x - rect.left - rect.width / 2;
    const cy = lastTouchCenter.current.y - rect.top - rect.height / 2;

    setZoom((prevZoom) => {
      const newZoom = Math.max(1, Math.min(5, prevZoom * scale));
      if (newZoom === 1) { setPan({ x: 0, y: 0 }); return newZoom; }
      const scaleChange = newZoom / prevZoom;
      setPan((prevPan) => clampPan(newZoom, {
        x: cx - scaleChange * (cx - prevPan.x),
        y: cy - scaleChange * (cy - prevPan.y),
      }));
      return newZoom;
    });
  };

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    setUploadError("");
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setUploadError("Please select image files only (JPEG, PNG, WebP).");
      setUploading(false);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/gallery", { method: "POST", body: formData });
        if (res.ok) { success++; } else { failed++; }
      } catch { failed++; }
    }

    setUploading(false);
    if (success > 0) {
      await fetchImages();
      if (failed > 0) setUploadError(`${success} uploaded, ${failed} failed.`);
    } else {
      setUploadError(`Upload failed for ${failed} file(s). Check SA Editor permissions.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleUpload(e.target.files);
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Permanently delete this image from Google Drive?")) return;
    setDeleting(fileId);
    try {
      const res = await fetch(`/api/gallery?fileId=${encodeURIComponent(fileId)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== fileId));
        if (selectedImage?.id === fileId) setSelectedIdx(null);
      } else { setError(data.error || "Delete failed"); }
    } catch { setError("Delete request failed"); }
    finally { setDeleting(null); }
  };

  const handleCopyUrl = async (fileId: string) => {
    const publicUrl = `${window.location.origin}/api/image/${fileId}?w=1200`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = publicUrl; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setCopiedId(fileId); setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/image/${fileId}?w=0`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; document.body.appendChild(a);
      a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* silent fail */ }
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  const getPublicUrl = (fileId: string, width = 800) => `/api/image/${fileId}?w=${width}`;
  const getPublicOriginUrl = (fileId: string) => {
    if (typeof window === "undefined") return getPublicUrl(fileId);
    return `${window.location.origin}/api/image/${fileId}?w=1200`;
  };

  const sorted = useMemo(
    () => [...images].sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()),
    [images]
  );

  // Filmstrip thumbnails around selected
  const filmstrip = useMemo(() => {
    if (selectedIdx === null) return [];
    const count = 5; // show 5 thumbnails
    const start = Math.max(0, selectedIdx - Math.floor(count / 2));
    return sorted.slice(start, start + count).map((img, i) => ({ img, idx: start + i, isActive: start + i === selectedIdx }));
  }, [sorted, selectedIdx]);

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Image Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalImages > 0 ? `${totalImages} image${totalImages !== 1 ? "s" : ""} synced from Google Drive` : "Images synced from Google Drive folder. Add images directly in Drive to have them appear here."}
          </p>
        </div>
        <button onClick={fetchImages} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shrink-0">
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Upload zone (drag & drop + file picker) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all p-6 sm:p-8 text-center ${
          isDragOver
            ? "border-indigo-400 bg-indigo-50/80 scale-[1.01] shadow-lg"
            : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-indigo-700">Uploading to Google Drive...</p>
            <p className="text-xs text-indigo-500">Please wait while files are being uploaded</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragOver ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — up to 16 MB each</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Browse Files
            </button>
          </div>
        )}

        {uploadError && (
          <p className="mt-3 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
            {uploadError}
          </p>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Configuration Required</p>
            <p className="text-sm text-amber-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Image grid */}
      {sorted.length === 0 && !loading && !error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No images in gallery</h3>
          <p className="text-sm text-gray-500 mb-6">Upload images to your configured Google Drive folder and refresh this page.</p>
          <button onClick={fetchImages} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md">
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sorted.map((img, idx) => (
            <div key={img.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
              <button onClick={() => setSelectedIdx(idx)} className="relative w-full aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                <img src={getPublicUrl(img.id, 400)} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${img.id}&sz=w400`; }} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center" />
              </button>
              <div className="p-3 space-y-2">
                <p className="text-xs font-medium text-gray-700 truncate" title={img.name}>{img.name}</p>
                <p className="text-[10px] text-gray-400">{formatDate(img.createdTime)}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => handleCopyUrl(img.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-semibold transition-colors">
                    {copiedId === img.id ? "Copied!" : "Copy URL"}
                  </button>
                  <button onClick={() => handleDelete(img.id)} disabled={deleting === img.id} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-[11px] font-semibold transition-colors disabled:opacity-50">
                    {deleting === img.id ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Immersive full-screen preview — constrained to viewport */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md animate-fadeIn"
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          
          {/* Top toolbar — responsive & scroll-safe */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 bg-black/60 border-b border-white/10 shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate max-w-[120px] sm:max-w-[300px]">{selectedImage.name}</span>
              <span className="text-[10px] sm:text-xs text-white/40 shrink-0">{selectedIdx! + 1} / {totalImages}</span>
              {zoom > 1 && <span className="hidden sm:inline text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{Math.round(zoom * 100)}%</span>}
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              <button onClick={() => handleDownload(selectedImage.id, selectedImage.name)} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Download">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              <button onClick={() => handleCopyUrl(selectedImage.id)} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Copy URL">
                {copiedId === selectedImage.id ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                )}
              </button>
              <a href={selectedImage.webViewLink || `https://drive.google.com/file/d/${selectedImage.id}/view`} target="_blank" rel="noopener noreferrer"
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Open in Drive">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
              <button onClick={() => { setSelectedIdx(null); }} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-1 sm:ml-2" title="Close (Esc)">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Main image area — fills remaining height */}
          <div ref={imageContainerRef} className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}>
            {/* Prev button — smaller on mobile */}
            {totalImages > 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigatePrev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-all hover:scale-110">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
            )}
            
            {/* Zoomable image — contained within parent */}
            <img
              src={getPublicUrl(selectedImage.id, 1200)}
              alt={selectedImage.name}
              className={`max-w-full max-h-full object-contain transition-transform duration-75 select-none ${zoom > 1 ? "cursor-grab" : "cursor-zoom-in"} ${isDragging ? "cursor-grabbing" : ""}`}
              style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
              draggable={false}
              onClick={handleImageClick}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              onError={(e) => { (e.target as HTMLImageElement).src = `https://drive.google.com/uc?export=view&id=${selectedImage.id}`; }}
            />
            
            {/* Next button — smaller on mobile */}
            {totalImages > 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigateNext(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-all hover:scale-110">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            )}

            {/* Zoom hint — hidden on mobile to save space */}
            {zoom === 1 && totalImages > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 text-white/30 sm:text-white/40 text-[10px] sm:text-xs whitespace-nowrap">
                <span>Scroll to zoom</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Click to zoom</span>
                <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline" />
                <span className="hidden sm:inline">Drag to pan</span>
              </div>
            )}
          </div>

          {/* Bottom bar — filmstrip + URL — responsive */}
          <div className="shrink-0 bg-black/60 border-t border-white/10 px-2 sm:px-4 py-2 sm:py-3">
            {/* Filmstrip — smaller on mobile */}
            {totalImages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto hide-scrollbar">
                {filmstrip.map(({ img, idx: fi, isActive }) => (
                  <button key={img.id} onClick={() => setSelectedIdx(fi)}
                    className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      isActive ? "border-amber-400 scale-105 sm:scale-110 shadow-lg shadow-amber-400/20" : "border-white/15 hover:border-white/30 opacity-70 hover:opacity-100"}`}>
                    <img src={getPublicUrl(img.id, 200)} alt={img.name} className="w-full h-full object-cover" loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${img.id}&sz=w100`; }} />
                  </button>
                ))}
                {selectedIdx !== null && selectedIdx > 2 && (
                  <span className="text-white/20 sm:text-white/30 text-[10px] sm:text-xs px-1 shrink-0">...</span>
                )}
              </div>
            )}
            
            {/* URL Bar — stacks on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 max-w-3xl mx-auto">
              <span className="text-[10px] sm:text-xs text-white/50 shrink-0 select-none hidden sm:inline">URL</span>
              <code className="flex-1 text-[10px] sm:text-xs bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-white/70 truncate select-all">
                {getPublicOriginUrl(selectedImage.id)}
              </code>
              <button onClick={() => handleCopyUrl(selectedImage.id)} className="shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-xs font-semibold transition-colors">
                {copiedId === selectedImage.id ? "Copied!" : "Copy"}
              </button>
              <button onClick={() => handleDownload(selectedImage.id, selectedImage.name)} className="shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-semibold transition-colors flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-900">Gallery Features</h3>
            <ul className="text-sm text-emerald-700 mt-1 space-y-0.5">
              <li><strong>Click</strong> any thumbnail to open full-screen preview</li>
              <li><strong>Scroll</strong> to zoom in/out • <strong>Click</strong> to toggle 2.5× • <strong>Double-click</strong> to step zoom</li>
              <li><strong>Drag</strong> to pan when zoomed • <strong>← →</strong> arrows or click side buttons to navigate</li>
              <li><strong>Filmstrip</strong> at bottom for quick jumps • <strong>Download</strong> saves the full image locally</li>
              <li><strong>Copy URL</strong> to use the image anywhere on the site via <code className="bg-emerald-100 px-1 rounded text-xs">/api/image/FILE_ID</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
