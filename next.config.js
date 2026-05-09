/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
}
