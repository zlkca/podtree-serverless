// format Canada and USA phone number
export function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if the number has 10 digits
  if (cleaned.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // If it's 11 digits starting with 1, assume it's a US number with country code
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else {
    // If the number doesn't fit the expected format, return it as is
    return phoneNumber;
  }
}

export const toUrlFriendly = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get the start and end timestamps of the current month
  const startTimestamp = new Date(currentYear, currentMonth, 1).getTime();
  const endTimestamp = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).getTime();

  return {startTimestamp, endTimestamp};
}

export const getMonthRangeByTimestamp = (timestamp) => {
  const now = new Date(timestamp);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get the start and end timestamps of the current month
  const startTimestamp = new Date(currentYear, currentMonth, 1).getTime();
  const endTimestamp = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).getTime();

  return {startTimestamp, endTimestamp};
}
