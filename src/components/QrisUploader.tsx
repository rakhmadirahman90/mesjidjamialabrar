import { useState, useEffect } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { subscribeToDocument, upsertDocument } from '../lib/db';

interface QrisUploaderProps {
  onAddLog: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}

export default function QrisUploader({ onAddLog }: QrisUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check file size (limit to 10MB original)
    if (file.size > 10 * 1024 * 1024) {
      onAddLog('Gagal', 'Ukuran gambar terlalu besar! Maksimal 10MB.', 'alert');
      return;
    }

    setUploading(true);
    setSuccess(false);

    try {
      onAddLog('Info', 'Memulai kompresi gambar...', 'info');
      const options = {
        maxSizeMB: 0.2, // More aggressive compression for better speed
        maxWidthOrHeight: 500, // Reduced dimensions for faster processing
        useWebWorker: false, // Disabled to ensure stability
      };
      const compressedFile = await imageCompression(file, options);
      onAddLog('Info', 'Kompresi selesai, memulai upload...', 'info');

      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `qris_image_${timestamp}.png`);
      await uploadBytes(storageRef, compressedFile);
      onAddLog('Info', 'Upload ke storage selesai, menyimpan data...', 'info');
      
      const url = await getDownloadURL(storageRef);
      
      // Save it to firestore so we can easily retrieve it
      await upsertDocument('settings', 'qris', { url, updatedAt: new Date().toISOString() });
      
      setPreviewUrl(url); // Set the preview URL
      setSuccess(true);
      onAddLog('Berhasil', 'QRIS Masjid telah diperbarui.', 'success');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading QRIS:", error);
      onAddLog('Gagal', `Gagal mengunggah QRIS: ${error instanceof Error ? error.message : 'Unknown error'}`, 'alert');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-inner">
      <h3 className="text-sm font-bold text-slate-300 mb-4">Perbarui QRIS Masjid</h3>
      
      {previewUrl && (
        <div className="mb-4 text-center">
            <p className="text-xs font-bold text-slate-400 mb-2">QRIS Saat Ini:</p>
            <img src={previewUrl} alt="Preview QRIS" className="w-32 h-32 mx-auto object-contain border border-slate-700 rounded-lg" />
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
            {uploading ? 'Mengunggah...' : success ? 'Berhasil!' : 'Klik untuk Unggah Gambar QRIS'}
        </span>
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
      </label>
    </div>
  );
}
