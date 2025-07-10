import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude MongoDB and Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        dns: false,
        'fs/promises': false,
        'timers/promises': false,
        util: false,
        events: false,
        buffer: false,
        querystring: false,
        punycode: false,
      }

      // Exclude MongoDB entirely from client bundle
      config.externals = config.externals || []
      config.externals.push({
        mongodb: 'commonjs mongodb',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        aws4: 'commonjs aws4',
        snappy: 'commonjs snappy',
        socks: 'commonjs socks',
        'bson-ext': 'commonjs bson-ext',
        kerberos: 'commonjs kerberos',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      })

      // Additional MongoDB modules to exclude
      config.module.rules.push({
        test: /node_modules\/mongodb/,
        use: 'null-loader',
      })

      // Also exclude our auth lib from client bundle
      config.module.rules.push({
        test: /src\/lib\/auth\.ts$/,
        use: 'null-loader',
      })
    }
    return config
  },
  serverExternalPackages: ['mongodb'],
}

export default nextConfig
