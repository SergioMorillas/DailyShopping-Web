import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/listas': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/stats': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/mercadona': {
        target: 'https://7uzjkl1dj0-dsn.algolia.net',
        changeOrigin: true,
        rewrite: () => '/1/indexes/products_prod_4315_es/query?x-algolia-application-id=7UZJKL1DJ0&x-algolia-api-key=9d8f2e39e90df472b4f2e559a116fe17',
      },
      '/api/alcampo': {
        target: 'https://www.compraonline.alcampo.es',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/alcampo', '/api/webproductpagews/v6/product-pages/search'),
      },
      '/api/dia': {
        target: 'https://www.dia.es',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/dia', '/api/v1/search-back/search/reduced'),
      },
      '/api/bm': {
        target: 'https://www.online.bmsupermercados.es',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/bm', '/api/rest/V1.0/catalog/searcher/products'),
      },
      '/api/carrefour': {
        target: 'https://www.carrefour.es',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/carrefour', '/search-api/query/v1/search'),
      },
    },
  },
})
