export function orderedUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);

    // --- Normalize search params in the main URL ---
    const mainParams = new URLSearchParams(url.search);
    const sortedMainParams = [...mainParams.entries()].sort((a, b) => {
      if (a[0] === b[0]) return a[1].localeCompare(b[1]);
      return a[0].localeCompare(b[0]);
    });
    url.search = '';
    for (const [key, value] of sortedMainParams) {
      url.searchParams.append(key, value);
    }

    // --- Normalize fragment-based query string (if present) ---
    if (url.hash.includes('?')) {
      const [fragmentPath, fragmentQuery = ''] = url.hash.slice(1).split('?');
      const fragParams = new URLSearchParams(fragmentQuery);

      const sortedFragParams = [...fragParams.entries()].sort((a, b) => {
        if (a[0] === b[0]) return a[1].localeCompare(b[1]);
        return a[0].localeCompare(b[0]);
      });

      const newFragmentQuery = sortedFragParams
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      url.hash = `#${fragmentPath}?${newFragmentQuery}`;
    }

    return url.toString();
  } catch (e) {
    throw new Error(`Invalid URL: ${inputUrl}`);
  }
}
