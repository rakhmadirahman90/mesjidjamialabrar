/**
 * Utility for high-performance client-side image compression
 */
export async function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and apply max width
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Failed to get canvas context');

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly compressed JPEG/WebP data URL
        // jpeg is usually safer for max compatibility in base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Debug info (optional)
        console.log(`Original: ${(file.size / 1024).toFixed(2)}KB`);
        console.log(`Compressed: ${(compressedDataUrl.length * 0.75 / 1024).toFixed(2)}KB`);
        
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
