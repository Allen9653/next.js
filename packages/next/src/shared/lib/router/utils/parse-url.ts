import type { ParsedUrlQuery } from 'querystring'

import { searchParamsToUrlQuery } from './querystring'
import { parseRelativeUrl } from './parse-relative-url'
import type { UrlObject } from 'url'

export interface ParsedUrl extends UrlObject {
  auth: string | null
  hash: string
  host: string | null
  hostname: string | null
  href: string
  origin?: string | null
  path: string
  pathname: string
  port: string | null
  protocol: string | null
  query: ParsedUrlQuery
  search: string
  slashes: boolean | null
}

export function parseUrl(url: string): ParsedUrl {
  if (url.startsWith('/')) {
    return parseRelativeUrl(url)
  }

  const parsedURL = new URL(url)
  const username = parsedURL.username
  const password = parsedURL.password
  const auth = username
    ? password
      ? `${username}:${password}`
      : username
    : null
  const pathname = parsedURL.pathname
  const search = parsedURL.search
  const path = pathname + search
  return {
    auth,
    host: parsedURL.host,
    hash: parsedURL.hash,
    hostname: parsedURL.hostname,
    href: parsedURL.href,
    path,
    pathname,
    port: parsedURL.port,
    protocol: parsedURL.protocol,
    query: searchParamsToUrlQuery(parsedURL.searchParams),
    search,
    origin: parsedURL.origin,
    slashes:
      parsedURL.href.slice(
        parsedURL.protocol.length,
        parsedURL.protocol.length + 2
      ) === '//',
  }
}
