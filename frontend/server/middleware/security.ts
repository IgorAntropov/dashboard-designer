const APP_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' https://widget.cloudpayments.ru",
  "frame-src https://widget.cloudpayments.ru",
  "connect-src 'self' https: http: ws: wss:",
].join('; ')

export default defineEventHandler((event) => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  if (!import.meta.dev) {
    setResponseHeader(
      event,
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains',
    )
  }

  if (!event.path.startsWith('/embed/')) {
    setResponseHeader(event, 'X-Frame-Options', 'DENY')
    setResponseHeader(event, 'Content-Security-Policy', APP_CSP)
  }
})
