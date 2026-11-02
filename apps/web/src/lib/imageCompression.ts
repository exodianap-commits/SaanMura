/**
 * SaanMura Image Compression Utility (Client-Side)
 * 
 * Compresses camera captures and uploaded images to substantially lower file size
 * while strictly preserving original resolution (width × height) for OCR and forensic audit readability.
 */

export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: string;
}

/**
 * Compresses an image file, blob, or data URL using JPEG DCT quantization.
 * 
 * @param source File, Blob, or base64 DataURL
 * @param quality JPEG quality factor (0.0 to 1.0). Default 0.65 lowers size by ~65-80% without reducing resolution.
 * @returns Promise with compressed data URL and dimensions/size metadata.
 */
export async function compressImagePreserveResolution(
  source: File | Blob | string,
  quality: number = 0.65
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    let originalSize = 0;
    let srcUrl = '';

    if (source instanceof File || source instanceof Blob) {
      originalSize = source.size;
      srcUrl = URL.createObjectURL(source);
    } else {
      // Estimate size from base64 string
      const base64Content = source.split(',')[1] || source;
      originalSize = Math.round((base64Content.length * 3) / 4);
      srcUrl = source;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not available for compression');
        }

        // Draw image onto canvas at exact 1:1 original native resolution
        ctx.drawImage(img, 0, 0, width, height);

        // Compress via JPEG encoding with target quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Result = compressedDataUrl.split(',')[1] || compressedDataUrl;
        const compressedSize = Math.round((base64Result.length * 3) / 4);

        if (source instanceof File || source instanceof Blob) {
          URL.revokeObjectURL(srcUrl);
        }

        const savingsPercent = originalSize > 0 
          ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
          : 0;

        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
          originalSizeBytes: originalSize,
          compressedSizeBytes: compressedSize,
          compressionRatio: `-${savingsPercent}%`,
        });
      } catch (err) {
        if (source instanceof File || source instanceof Blob) {
          URL.revokeObjectURL(srcUrl);
        }
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (source instanceof File || source instanceof Blob) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error(`Failed to load image for compression: ${err}`));
    };

    img.src = srcUrl;
  });
}

/**
 * Format bytes into human-readable MB/KB string
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
