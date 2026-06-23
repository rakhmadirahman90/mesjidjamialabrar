import { useState, useEffect, useRef } from 'react';
import { Upload, Check, Loader2, RotateCw, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { subscribeToDocument, upsertDocument } from '../lib/db';

interface QrisUploaderProps {
  onAddLog: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}

export default function QrisUploader({ onAddLog }: QrisUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Crop / Zoom states
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    console.log("QrisUploader: Subscribing to settings/qris");
    const unsub = subscribeToDocument('settings', 'qris', (data: any) => {
      console.log("QrisUploader: Received data:", data);
      if (data && data.url) {
        setPreviewUrl(data.url);
      }
    });
    return unsub;
  }, []);

  // Real-time canvas drawing based on adjustments
  useEffect(() => {
    if (!selectedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm white backdrop to blend perfectly with modern QR readers
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Translate to center to zoom, rotate, and reposition appropriately
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgWidth = selectedImage.width;
    const imgHeight = selectedImage.height;

    // Calculate initial scale to fit the image inside the 400x400 canvas gracefully
    const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight) * 0.9;
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    ctx.drawImage(selectedImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [selectedImage, zoom, rotation, offsetX, offsetY]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check file size (limit to 15MB original)
    if (file.size > 15 * 1024 * 1024) {
      onAddLog('Gagal', 'Ukuran gambar terlalu besar! Maksimal 15MB.', 'alert');
      return;
    }

    setSelectedFileName(file.name);
    onAddLog('Info', 'Membaca gambar...', 'info');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setSelectedImage(img);
        // Reset crop settings to initial state
        setZoom(1.0);
        setRotation(0);
        setOffsetX(0);
        setOffsetY(0);
        onAddLog('Info', 'Gambar berhasil dimuat. Silakan sesuaikan posisi QRIS.', 'info');
      };
      img.onerror = () => {
        onAddLog('Gagal', 'Gagal memuat gambar sebagai objek visual.', 'alert');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      onAddLog('Gagal', 'Gagal membaca berkas gambar.', 'alert');
    };
    reader.readAsDataURL(file);
  };

  // Mouse & Touch events for interactive dragging / panning
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!selectedImage) return;
    setIsDragging(true);
    setDragStart({ x: clientX - offsetX, y: clientY - offsetY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffsetX(clientX - dragStart.x);
    setOffsetY(clientY - dragStart.y);
  };

  const handleStopDrag = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!selectedImage) return;
    // Prevent document scrolling while zooming
    e.preventDefault();
    const zoomFactor = 0.05;
    let newZoom = zoom + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
    newZoom = Math.max(0.2, Math.min(newZoom, 6.0));
    setZoom(parseFloat(newZoom.toFixed(2)));
  };

  // Save the cropped & zoomed canvas as Base64 to Firestore setting
  const handleSaveAndUpload = async () => {
    if (!canvasRef.current) return;
    
    setUploading(true);
    setSuccess(false);

    try {
      onAddLog('Info', 'Memproses gambar QRIS rapi...', 'info');
      
      // Get perfect 400x400 JPG Base64 (approx. 20-30KB, clean and responsive)
      const compressedBase64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
      
      onAddLog('Info', 'Menyimpan konfigurasi QRIS baru ke database...', 'info');
      
      // Save directly to settings/qris
      await upsertDocument('settings', 'qris', { 
        url: compressedBase64, 
        updatedAt: new Date().toISOString() 
      });
      
      setPreviewUrl(compressedBase64); // Set local preview instantly
      setSuccess(true);
      setSelectedImage(null); // Close the editor panel upon success
      onAddLog('Berhasil', 'QRIS Masjid telah diperbarui secara rapi dan bersih.', 'success');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving refined QRIS:", error);
      onAddLog('Gagal', `Gagal menyimpan QRIS: ${error instanceof Error ? error.message : 'Unknown error'}`, 'alert');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-inner">
      <h3 className="text-sm font-bold text-slate-300 mb-4">Perbarui QRIS Masjid</h3>
      
      {/* Visual Editor Workspace */}
      {selectedImage ? (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/80 mb-4">
          <p className="text-xs font-bold text-emerald-400 mb-1 text-center">MODE EDIT (Arahkan & Hubungkan)</p>
          {selectedFileName && (
            <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] mx-auto text-center mb-1.5">
              Berkas: {selectedFileName}
            </p>
          )}
          
          {/* Interactive crop container canvas */}
          <div className="relative mx-auto w-64 h-64 border-2 border-emerald-500 rounded-lg overflow-hidden bg-white shadow-xl flex items-center justify-center cursor-move touch-none select-none">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleStopDrag}
              onMouseLeave={handleStopDrag}
              onWheel={handleWheel}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 1) {
                  handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={handleStopDrag}
            />
            
            {/* Elegant Viewfinder Safe Area Guide Overlays */}
            <div className="absolute inset-4 border border-dashed border-emerald-500/35 rounded pointer-events-none flex items-center justify-center">
              {/* Corner brackets */}
              <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-500/80 absolute top-0 left-0 pointer-events-none"></div>
              <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-500/80 absolute top-0 right-0 pointer-events-none"></div>
              <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-500/80 absolute bottom-0 left-0 pointer-events-none"></div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-500/80 absolute bottom-0 right-0 pointer-events-none"></div>
              
              {/* Subtle center crosshair */}
              <div className="w-3 h-0.5 bg-emerald-500/30 absolute pointer-events-none"></div>
              <div className="h-3 w-0.5 bg-emerald-500/30 absolute pointer-events-none"></div>
            </div>

            <div className="absolute top-2 right-2 bg-slate-900/85 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-400 pointer-events-none tracking-wide">
              Maksimal Pas Bingkai
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-2.5 mb-3.5 leading-relaxed">
            <span className="text-slate-300 font-bold block">💡 Tips Penyelarasan Rapi:</span>
            Seret gambar di dalam bingkai, scroll roda mouse atau gunakan tombol di bawah untuk zoom hingga kode QR pas di tengah kotak.
          </p>

          {/* Controls Panel */}
          <div className="space-y-3">
            {/* Zoom Slider and fine-tune Buttons */}
            <div className="space-y-1.5 bg-slate-800 p-2.5 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
                <span>Ukuran (Zoom)</span>
                <span className="text-emerald-400 font-mono bg-slate-900/50 px-1.5 py-0.5 rounded">{zoom.toFixed(2)}x</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.2, parseFloat((z - 0.05).toFixed(2))))}
                  className="p-1 px-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-bold text-xs transition border border-slate-600/60"
                  title="Perkecil"
                >
                  <ZoomOut className="h-3.5 w-3.5 text-slate-300" />
                </button>
                
                <input
                  type="range"
                  min="0.2"
                  max="6.0"
                  step="0.02"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(6.0, parseFloat((z + 0.05).toFixed(2))))}
                  className="p-1 px-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-bold text-xs transition border border-slate-600/60"
                  title="Perbesar"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Adjustments buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 border border-slate-700/60 transition"
              >
                <RotateCw className="h-3.5 w-3.5 text-emerald-400" />
                Rotasi 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1.0);
                  setRotation(0);
                  setOffsetX(0);
                  setOffsetY(0);
                }}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 border border-slate-700/60 transition"
                title="Reset Posisi"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                Reset
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleSaveAndUpload}
                disabled={uploading}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-900/30"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Simpan QRIS Baru
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Original Upload Area when no image is loaded for editing */
        <>
          {previewUrl && (
            <div className="mb-4 text-center">
              <p className="text-xs font-bold text-slate-400 mb-2">QRIS Saat Ini:</p>
              <img
                src={previewUrl}
                alt="Preview QRIS"
                className="w-36 h-36 mx-auto object-contain border border-slate-700 rounded-lg bg-white p-1"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-slate-700/50 transition">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            ) : success ? (
              <Check className="h-8 w-8 text-emerald-500" />
            ) : (
              <Upload className="h-8 w-8 text-slate-400" />
            )}
            <span className="text-xs font-bold text-slate-400 mt-2">
              {uploading ? 'Memproses berkas...' : success ? 'Berhasil!' : 'Klik untuk Pilih atau Unggah QRIS'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              onClick={(e) => {
                // Clear value so the same file selection triggers onChange again
                (e.target as HTMLInputElement).value = '';
              }}
            />
          </label>
        </>
      )}
    </div>
  );
}

