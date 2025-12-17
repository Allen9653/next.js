import type { ServerResponse } from 'http'
import { CACHE_ONE_YEAR } from '../../lib/constants'

/**
 * The revalidate option used internally for pages. A value of `false` means
 * that the page should not be revalidated. A number means that the page
 * should be revalidated after the given number of seconds (this also includes
 * `1` which means to revalidate after 1 second). A value of `0` is not a valid
 * value for this option.
 */
export type Revalidate = number | false

export interface CacheControl {
  revalidate: Revalidate
  expire: number | undefined
}

export interface CacheHeaders {
  'Cache-Control': string
  cdnCacheControl?: string
}

export function getCacheControlHeader({
  revalidate,
  expire,
}: CacheControl): CacheHeaders {
  const swrHeader =
    typeof revalidate === 'number' &&
    expire !== undefined &&
    revalidate < expire
      ? `, stale-while-revalidate=${expire - revalidate}`
      : ''

  if (revalidate === 0) {
    return {
      'Cache-Control':
        'private, no-cache, no-store, max-age=0, must-revalidate',
    }
  }

  // For non-zero revalidation, we want to leverage CDN stale-while-revalidate caching
  // semantics without allowing the browser to cache the response.
  const cdnDirective = `max-age=${
    typeof revalidate === 'number' ? revalidate : CACHE_ONE_YEAR
  }${swrHeader}`

  return {
    'Cache-Control': 'max-age=0, must-revalidate',
    cdnCacheControl: cdnDirective,
  }
}

/**
 * The default header name used for CDN cache control.
 */
export const DEFAULT_CDN_CACHE_CONTROL_HEADER = 'CDN-Cache-Control'

/**
 * Sets cache control headers on a ServerResponse object.
 * Use this helper to consistently set Cache-Control and CDN cache control headers.
 *
 * @param res - The ServerResponse object
 * @param cacheControl - The cache control configuration
 * @param cdnCacheControlHeader - Optional custom CDN cache control header name (defaults to 'CDN-Cache-Control')
 */
export function setCacheControlHeaders(
  res: ServerResponse,
  cacheControl: CacheControl,
  cdnCacheControlHeader: string = DEFAULT_CDN_CACHE_CONTROL_HEADER
): void {
  const cacheHeaders = getCacheControlHeader(cacheControl)
  res.setHeader('Cache-Control', cacheHeaders['Cache-Control'])
  if (cacheHeaders.cdnCacheControl) {
    res.setHeader(cdnCacheControlHeader, cacheHeaders.cdnCacheControl)
  }
}

/**
 * Sets cache control headers on a Headers object (for Web API responses).
 * Use this helper to consistently set Cache-Control and CDN cache control headers.
 *
 * @param headers - The Headers object
 * @param cacheControl - The cache control configuration
 * @param cdnCacheControlHeader - Optional custom CDN cache control header name (defaults to 'CDN-Cache-Control')
 */
export function setCacheControlHeadersOnHeaders(
  headers: Headers,
  cacheControl: CacheControl,
  cdnCacheControlHeader: string = DEFAULT_CDN_CACHE_CONTROL_HEADER
): void {
  const cacheHeaders = getCacheControlHeader(cacheControl)
  headers.set('Cache-Control', cacheHeaders['Cache-Control'])
  if (cacheHeaders.cdnCacheControl) {
    headers.set(cdnCacheControlHeader, cacheHeaders.cdnCacheControl)
  }
}
