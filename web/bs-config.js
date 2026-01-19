const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  port: 3000,
  server: {
    baseDir: [
      "./public",
      "./dist"
    ],
    middleware: [
      {
        route: "/api",
        handle: createProxyMiddleware({
          target: "http://localhost:8000",
          changeOrigin: true,
          pathRewrite: {
            "^/api": ""
          }
        })
      }
    ]
  },
  files: [
    "./public/**/*.html",
    "./public/**/*.css",
    "./dist/**/*.js"
  ]
};