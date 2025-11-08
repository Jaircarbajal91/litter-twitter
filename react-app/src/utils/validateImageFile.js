const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const extension = file.name?.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return { valid: false, error: 'Invalid file selected. Please choose a PNG, JPG, JPEG, GIF, or WEBP image.' };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: 'Invalid file selected. Please choose a PNG, JPG, JPEG, GIF, or WEBP image.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image is too large. Max file size is 5MB.' };
  }

  return { valid: true };
};

export default validateImageFile;

