import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface AudioUploaderProps {
  onAddLog: (title: string, message: string, type: 'success' | 'alert' | 'system' | 'info') => void;
  onUpload: (dataUrl: string) => void;
}

export default function AudioUploader({ onAddLog, onUpload }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 5MB for Firestore Base64 stability)
    if (file.size > 5 * 1024 * 1024) {
      onAddLog('Upload Gagal', 'File terlalu besar (Maksimal 5MB).', 'alert');
      return;
    }

    if (!file.type.startsWith('audio/')) {
        onAddLog('Upload Gagal', 'Hanya format audio yang diizinkan.', 'alert');
        return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpload(base64String);
        onAddLog('Berhasil', 'Musik Adzan berhasil diupload.', 'success');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onAddLog('Gagal', 'Terjadi kesalahan saat upload.', 'alert');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
      >
        {isUploading ? 'Mengupload...' : <><Upload className="h-4 w-4" /> Upload Adzan Baru</>}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*"
      />
    </div>
  );
};
