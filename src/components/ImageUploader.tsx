import { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  onAddLog: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}

export default function ImageUploader({ onImageUploaded, currentImageUrl, onAddLog }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setSelectedImage(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    setUploading(true);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.7);
    onImageUploaded(base64);
    setUploading(false);
    setSelectedImage(null);
    onAddLog('Berhasil', 'Gambar berhasil diunggah.', 'success');
  };

  return (
    <div className="space-y-4">
      {currentImageUrl && !selectedImage && (
        <img src={currentImageUrl} className="w-full h-32 object-cover rounded-xl" alt="Preview" />
      )}
      {!selectedImage && (
        <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
      )}
      {selectedImage && (
        <div className="space-y-2">
          <canvas ref={canvasRef} width={300} height={300} className="w-full aspect-square rounded-xl bg-slate-100" />
          <div className="flex gap-2">
              <button onClick={handleSave} disabled={uploading} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl">
                {uploading ? 'Memproses...' : 'Simpan Foto'}
              </button>
              <button onClick={() => setSelectedImage(null)} className="py-2 px-4 bg-slate-200 text-slate-700 rounded-xl">
                Batal
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
