const configuredUrl = process.env.VITE_API_URL?.trim()
if (!configuredUrl) {
  console.warn('VITE_API_URL is not set. Build will continue; set it in Netlify before using the deployed app.')
} else {
  let apiUrl
  try {
    apiUrl = new URL(configuredUrl)
  } catch {
    throw new Error('VITE_API_URL must be an absolute API origin, such as https://api.example.com.')
  }

  const hostname = apiUrl.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  const isLoopbackHost = hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname === '::1'
    || hostname === '0.0.0.0'
    || /^127(?:\.\d{1,3}){3}$/.test(hostname)

  if (apiUrl.protocol !== 'https:' || isLoopbackHost) {
    throw new Error('Netlify production builds require a public HTTPS VITE_API_URL, not localhost.')
  }
  if (apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash || apiUrl.username || apiUrl.password) {
    throw new Error('VITE_API_URL must be the API origin only, without credentials, path, query, or hash.')
  }

  console.info(`Netlify API origin configured: ${apiUrl.origin}`)
}
