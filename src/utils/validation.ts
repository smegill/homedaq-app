export function isValidUSZip(zip?: string): boolean {
  return !!zip && /^\d{5}$/.test(zip);
}

export function isLikelyUrl(url?: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
