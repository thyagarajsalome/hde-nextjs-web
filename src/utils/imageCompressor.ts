// src/utils/imageCompressor.ts

export interface CompressionResult {
  file: File;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
  width: number;
  height: number;
  previewUrl: string;
}

/**
 * Automatically crops to 9:16 aspect ratio, resizes to target resolution (720x1280 px),
 * and compresses into modern WebP format to minimize bandwidth while retaining crisp visual quality.
 */
export async function compressAndCropTo916(
  file: File,
  targetWidth: number = 720,
  targetHeight: number = 1280,
  quality: number = 0.82
): Promise<CompressionResult> {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];
  const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

  if (file.type && !ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(`Unsupported image format: ${file.type}. Please upload a JPG, PNG, or WebP image.`);
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 20 MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const srcWidth = img.naturalWidth || img.width;
        const srcHeight = img.naturalHeight || img.height;
        const targetRatio = 9 / 16; // 0.5625
        const srcRatio = srcWidth / srcHeight;

        let cropWidth = srcWidth;
        let cropHeight = srcHeight;
        let cropX = 0;
        let cropY = 0;

        // Smart center crop to 9:16
        if (srcRatio > targetRatio) {
          // Source is wider than 9:16 -> crop left and right sides
          cropWidth = Math.round(srcHeight * targetRatio);
          cropX = Math.round((srcWidth - cropWidth) / 2);
        } else if (srcRatio < targetRatio) {
          // Source is taller than 9:16 -> crop top and bottom
          cropHeight = Math.round(srcWidth / targetRatio);
          cropY = Math.round((srcHeight - cropHeight) / 2);
        }

        // Create canvas with 9:16 target dimensions
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context is not supported in this browser.'));
          return;
        }

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped and scaled image onto canvas
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed to produce a valid blob.'));
              return;
            }

            // Replace file extension with .webp
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const webpFileName = `${baseName}.webp`;

            const compressedFile = new File([blob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const originalSizeKb = Math.round(file.size / 1024);
            const compressedSizeKb = Math.round(compressedFile.size / 1024);
            const reductionPercentage = originalSizeKb > 0
              ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
              : 0;

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: compressedFile,
              originalSizeKb,
              compressedSizeKb,
              reductionPercentage,
              width: targetWidth,
              height: targetHeight,
              previewUrl,
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file for compression.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}

export type CompressedImageResult = CompressionResult;

/**
 * Automatically center-crops real estate photos to strict 16:9 aspect ratio (640x360 px)
 * and compresses into low-bandwidth WebP format (~18 KB to 35 KB).
 */
export async function compressToWebP(
  file: File,
  targetWidth = 640,
  targetHeight = 360,
  quality = 0.60
): Promise<CompressedImageResult> {
  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('compressToWebP can only run in browser environment'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const srcWidth = img.naturalWidth || img.width;
      const srcHeight = img.naturalHeight || img.height;
      const targetRatio = 16 / 9;
      const srcRatio = srcWidth / srcHeight;

      let cropWidth = srcWidth;
      let cropHeight = srcHeight;
      let cropX = 0;
      let cropY = 0;

      // Smart center-crop to exact 16:9 ratio
      if (srcRatio > targetRatio) {
        // Image is wider than 16:9 -> crop horizontal sides
        cropWidth = Math.round(srcHeight * targetRatio);
        cropX = Math.round((srcWidth - cropWidth) / 2);
      } else if (srcRatio < targetRatio) {
        // Image is taller than 16:9 (e.g. portrait or square) -> crop top/bottom
        cropHeight = Math.round(srcWidth / targetRatio);
        cropY = Math.round((srcHeight - cropHeight) / 2);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not initialize 2D canvas context'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }

          const compressedSizeKb = Math.max(1, Math.round(blob.size / 1024));
          const reductionPercentage = Math.round(
            ((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100
          );

          const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
          const compressedFileName = `${cleanBaseName}_16x9.webp`;
          const compressedFile = new File([blob], compressedFileName, {
            type: 'image/webp',
          });

          const previewUrl = URL.createObjectURL(blob);

          resolve({
            file: compressedFile,
            originalSizeKb,
            compressedSizeKb,
            reductionPercentage: Math.max(0, reductionPercentage),
            width: targetWidth,
            height: targetHeight,
            previewUrl,
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image file: ${err}`));
    };
  });
}


