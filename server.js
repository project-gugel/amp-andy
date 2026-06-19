const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const CANONICAL_HOST = "www.andypemberton.com";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const host = req.headers.host || "";
  const proto = req.headers["x-forwarded-proto"] || "http";

  // Paksa HTTPS + WWW untuk domain utama
  if (
    host === "andypemberton.com" ||
    (host === CANONICAL_HOST && proto !== "https")
  ) {
    res.writeHead(301, {
      Location: `https://${CANONICAL_HOST}${req.url}`
    });
    res.end();
    return;
  }

  let requestPath = req.url.split("?")[0];

  if (requestPath === "/") {
    requestPath = "/index.html";
  }

  // Keamanan path agar tidak bisa akses folder luar
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end("<h1>404 Not Found</h1>");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType
    });

    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server berjalan di port ${PORT}`);
});