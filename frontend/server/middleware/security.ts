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
  }
})
