const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log(`Received request for: ${req.url}`);
  next();
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://192.168.1.206:4000",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
    onProxyRes: (proxyRes) => {
      console.log(`Proxy Response Status: ${proxyRes.statusCode}`);
    },
    onError: (err) => {
      console.error("Proxy error:", err);
    },
  })
);

const PORT = 5000;
const HOST = "0.0.0.0"; // Allows access from any device on the network

app.listen(PORT, HOST, () => {
  console.log(`✅ Proxy server running on http://${HOST}:${PORT}`);
});
