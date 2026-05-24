export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? "http://localhost:5000" : "");

export const R2_BASE_URL = import.meta.env.VITE_R2_BASE_URL || `${API_BASE_URL}/api`;

/**
 * Helper function to get the correct URL for an asset.
 * If the path already has a protocol, it returns it as is.
 * Otherwise, it prepends the R2 base URL and removes the local "assets" prefix if present.
 * 
 * @param {string} path - The relative path to the asset (e.g., 'media/photo.jpg' or 'assets/media/photo.jpg')
 * @returns {string} - The full URL to the asset on Cloudflare R2
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Remove 'assets/' prefix if it's there to avoid double mapping (R2 bucket starts from inside public/ usually)
  // Assuming the user uploads the *contents* of 'public/' to R2.
  // If they upload the 'assets' folder itself, we might need a different logic.
  // Let's assume standard practice: assets/media/filename.jpg -> R2_URL/assets/media/filename.jpg
  
  return `${R2_BASE_URL}/${path.replace(/^\//, '')}`;
};
