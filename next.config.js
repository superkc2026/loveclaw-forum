/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config
  },
}
