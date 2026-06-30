const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Mapping file extensions to their corresponding content types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
    // Strip query parameters and hash anchors before decoding and locating the file on disk
    const rawPath = req.url.split(/[?#]/)[0];
    let safeUrl = decodeURIComponent(rawPath);
    
    // Default route points to home.html
    if (safeUrl === '/' || safeUrl === '') {
        safeUrl = '/Component/page/client/home.html';
    }

    // Resolve absolute file path
    const filePath = path.join(__dirname, safeUrl);

    // Get the file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Log the request
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File Not Found
                console.log(`\x1b[31m[${timestamp}] 404 - Not Found: ${safeUrl}\x1b[0m`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 File Not Found</h1><p>The requested file does not exist on this server.</p>', 'utf-8');
            } else {
                // Internal Server Error
                console.log(`\x1b[31m[${timestamp}] 500 - Server Error: ${safeUrl} (${err.code})\x1b[0m`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success response
            console.log(`\x1b[32m[${timestamp}] 200 - OK: ${safeUrl}\x1b[0m`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('\x1b[36m==================================================');
    console.log('   🚀 LOCAL DEVELOPMENT WEB SERVER IS RUNNING 🚀');
    console.log('==================================================\x1b[0m');
    console.log(`\n  * Candidate Portal Link:   \x1b[34m\x1b[4mhttp://localhost:${PORT}/Component/page/client/home.html\x1b[0m`);
    console.log(`  * Recruiter Console Link:  \x1b[34m\x1b[4mhttp://localhost:${PORT}/Component/page/employee/dashboard.html\x1b[0m`);
    console.log(`\n\x1b[33m  Press Ctrl+C to stop the server.\x1b[0m\n`);
});
