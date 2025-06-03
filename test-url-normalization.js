// Test file to demonstrate URL normalization functionality
// This shows that URLs without https:// are automatically normalized

const testUrls = [
    'dev.to',
    'www.rocketseat.com.br/blog',
    'css-tricks.com',
    'youtube.com/@vercel',
    'techcrunch.com/feed',
    'https://already-has-protocol.com',
    'http://with-http.com'
];

function normalizeUrl(url) {
    // Remove whitespace
    url = url.trim()

    // If URL doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
    }

    return url
}

console.log('🔗 URL Normalization Examples:\n');

testUrls.forEach(url => {
    const normalized = normalizeUrl(url);
    const status = url === normalized ? '✅ Already normalized' : '🔧 Auto-added https://';
    console.log(`Input:  ${url}`);
    console.log(`Output: ${normalized}`);
    console.log(`Status: ${status}\n`);
});
