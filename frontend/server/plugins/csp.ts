function cspFor(nonce: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "connect-src 'self' https: http: ws: wss:",
    'frame-src https://widget.cloudpayments.ru',
  ].join('; ')
}

function withNonce(fragments: string[], nonce: string): string[] {
  return fragments.map((fragment) =>
    fragment.replace(/<script(?![^>]*\snonce=)/g, `<script nonce="${nonce}"`),
  )
}

export default defineNitroPlugin((nitro) => {
  if (import.meta.dev) {
    return
  }

  nitro.hooks.hook('render:html', (html, { event }) => {
    if (event.path.startsWith('/embed/')) {
      return
    }

    const nonce = globalThis.crypto.randomUUID().replace(/-/g, '')
    html.head = withNonce(html.head, nonce)
    html.bodyPrepend = withNonce(html.bodyPrepend, nonce)
    html.bodyAppend = withNonce(html.bodyAppend, nonce)

    setResponseHeader(event, 'Content-Security-Policy', cspFor(nonce))
  })
})
