/**
 * Compress an image file before uploading.
 * Resizes to max 2048px on longest side and compresses to ~80% JPEG quality.
 * Returns a Promise<{ data: base64String, filename: string }>
 */

const MAX_DIM = 2048;
const QUALITY = 0.80;

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    // Only compress raster images
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
    if (!isImage) {
      // Non-image: just read as-is
      const reader = new FileReader();
      reader.onload = () => resolve({ data: reader.result.split(',')[1], filename: file.name });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Only resize if larger than max dimension
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Output as JPEG for photos, PNG for screenshots/diagrams with transparency
        const isPng = file.name.toLowerCase().endsWith('.png');
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : QUALITY;

        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(',')[1];

        // Use compressed version only if it's actually smaller
        const originalSize = file.size;
        const compressedSize = Math.ceil(base64.length * 0.75); // base64 → bytes estimate

        if (compressedSize < originalSize) {
          const ext = isPng ? '.png' : '.jpg';
          const newName = file.name.replace(/\.[^.]+$/, ext);
          resolve({ data: base64, filename: newName });
        } else {
          // Original was smaller — use it as-is
          const origReader = new FileReader();
          origReader.onload = () => resolve({ data: origReader.result.split(',')[1], filename: file.name });
          origReader.onerror = reject;
          origReader.readAsDataURL(file);
        }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
