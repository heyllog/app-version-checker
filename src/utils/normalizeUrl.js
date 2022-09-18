const normalizeUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url)

export default normalizeUrl
