/**
 * Client-side image compression utility.
 * Uses Canvas API to resize and compress images before upload.
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const TARGET_SIZE = 1 * 1024 * 1024; // 1MB target
const INITIAL_QUALITY = 0.9;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

/**
 * Compress an image file using Canvas API.
 * @param {File} file - The image file to compress.
 * @param {Object} options - Optional overrides.
 * @returns {Promise<File>} - Compressed image as a new File object.
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    targetSize = TARGET_SIZE,
    initialQuality = INITIAL_QUALITY,
    outputType = "image/jpeg",
  } = options;

  // Skip compression for small files (< 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Draw to canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Iterative quality reduction
          let quality = initialQuality;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Compression failed"));
                  return;
                }

                if (blob.size > targetSize && quality > MIN_QUALITY) {
                  quality -= QUALITY_STEP;
                  tryCompress();
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: outputType,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                }
              },
              outputType,
              quality
            );
          };

          tryCompress();
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images.
 * @param {FileList|File[]} files
 * @param {Object} options
 * @returns {Promise<File[]>}
 */
export async function compressImages(files, options = {}) {
  const fileArray = Array.from(files);
  return Promise.all(fileArray.map((file) => compressImage(file, options)));
}
