const TRACKING_PARAM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'yclid', 'mc_cid', 'mc_eid',
  'ref', 'ref_src', 'ref_url', 'referrer', '_ga', '_gl',
];

export function normalizeUrl(input: string): string {
  if (!input) return '';
  try {
    const u = new URL(input.startsWith('http') ? input : `https://${input}`);
    u.hash = '';
    for (const key of TRACKING_PARAM_KEYS) u.searchParams.delete(key);
    // Preserve the path casing but lowercase host
    u.hostname = u.hostname.toLowerCase();
    let out = u.toString();
    if (out.endsWith('/')) out = out.slice(0, -1);
    return out;
  } catch {
    return input.trim().toLowerCase();
  }
}
