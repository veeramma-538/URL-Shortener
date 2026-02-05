document.addEventListener('DOMContentLoaded', () => {
    // 1. Configure your Bitly access token here (replace this)
    const BITLY_ACCESS_TOKEN = '44b3ed22b04d2df3c6e3f6788eba9c6e1aae7b20'; 

    const longUrlInput = document.getElementById('longUrl');
    const shortenBtn = document.getElementById('shortenBtn');
    const resultContainer = document.getElementById('resultContainer');
    const shortUrlInput = document.getElementById('shortUrl');
    const copyBtn = document.getElementById('copyBtn');
    const message = document.getElementById('message');

    // Bitly API v4 endpoint
    const BITLY_API_URL = 'https://api-ssl.bitly.com/v4/shorten';

    // ----------------------------------------------------
    // URL Shortening Feature
    // ----------------------------------------------------

    shortenBtn.addEventListener('click', async () => {
        const longUrl = longUrlInput.value.trim();
        message.textContent = ''; 
        resultContainer.style.display = 'none';

        // 📌 TOKEN VERIFICATION (for development)
        if (!BITLY_ACCESS_TOKEN === 'V44b3ed22b04d2df3c6e3f6788eba9c6e1aae7b20') {
            message.textContent = '❌ Configuration error: Bitly access token is missing or not replaced in the script.';
            return;
        }

        // 📌 PRE-VALIDATION AND URL FIX
        if (!longUrl) {
            message.textContent = '⚠️ Please enter a URL to shorten first.';
            return;
        }
        
        // Add https:// by default if missing, to satisfy Bitly requirements
        let urlToShorten = longUrl;
        if (!urlToShorten.startsWith('http://') && !urlToShorten.startsWith('https://')) {
            urlToShorten = 'https://' + urlToShorten;
        }

        try {
            message.textContent = '⏳ Shortening in progress...';

            const response = await fetch(BITLY_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BITLY_ACCESS_TOKEN}`, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "long_url": urlToShorten // Using the corrected URL
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                const shortLink = data.link; 
                shortUrlInput.value = shortLink;
                resultContainer.style.display = 'flex'; 
                message.textContent = '✅ Link shortened successfully!';

            } else {
                // 📌 BITLY API ERROR HANDLING
                let userFriendlyError = '❌ An unknown error occurred while shortening. Please check the URL and try again.';

                switch (response.status) {
                    case 400:
                        // Client request error (invalid URL, missing argument)
                        if (data.message && data.message.includes('INVALID_ARG_LONG_URL')) {
                            userFriendlyError = "❌ The submitted URL is invalid. Please make sure the domain exists and the URL is complete.";
                        } else {
                            userFriendlyError = '❌ Invalid data: The server did not understand the provided URL.';
                        }
                        break;
                    case 403:
                        // Authentication or permission error
                        userFriendlyError = '🔑 Authentication error (403): Your Bitly token may be expired, invalid, or missing required permissions.';
                        break;
                    case 404:
                        // Resource not found
                        userFriendlyError = '🌐 API resource not found: Bitly-side issue. Please contact support.';
                        break;
                    default:
                        // All other errors
                        userFriendlyError = `❌ Server error (Code ${response.status}): Please try again. If the problem persists, contact the administrator.`;
                        break;
                }
                
                message.textContent = userFriendlyError;
                console.error('Detailed Bitly API error:', data);
            }

        } catch (error) {
            // 📌 NETWORK / CONNECTION ERROR HANDLING
            console.error('Network/connection error:', error);
            message.textContent = '🔌 Connection error: Unable to reach Bitly server. Check your internet connection.';
        }
    });

    // ----------------------------------------------------
    // Copy Feature
    // ----------------------------------------------------

    copyBtn.addEventListener('click', () => {
        const shortUrl = shortUrlInput.value;
        
        if (shortUrl) {
            navigator.clipboard.writeText(shortUrl).then(() => {
                message.textContent = '📋 URL copied to clipboard!';
                copyBtn.textContent = 'Copied!';
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    message.textContent = '';
                }, 2000);

            }).catch(err => {
                // Fallback for compatibility
                shortUrlInput.select();
                document.execCommand('copy');
                message.textContent = '📋 URL copied (fallback method).';
            });
        }
    });
});
const loader = document.getElementById('loader');

// Before API call
loader.style.display = 'block';
shortenBtn.disabled = true;

// After success or error (inside finally)
loader.style.display = 'none';
shortenBtn.disabled = false;
