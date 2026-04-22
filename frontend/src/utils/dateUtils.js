/**
 * Calculates age based on a date of birth string.
 * @param {string} dobString - Date of birth in YYYY-MM-DD format.
 * @returns {number|null} - Age in years or null if invalid.
 */
export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : 0;
};
