/**
 * Translate a url into the url to use with a given proxy, if applicable.
 * 
 * Parameter httpProxies may specify a http proxy for urls starting with a given string.
 *
 * @param {string} url - the url
 * @param {array} httpProxies - array of httpProxy definitions
 * @returns {string} 
 */
export function translateUrlToProxiedUrl(url, httpProxies) {
  if (httpProxies) {
    for (const entry of httpProxies) {
      if (url.startsWith(entry.urlStart)) {
        return `${entry.httpProxy}${url}`;
      }
    }
  }
  return url;
}