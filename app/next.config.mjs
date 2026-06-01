/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: [
  "pino-pretty",
  "lokijs", 
  "encoding",
  "@piplabs/cdr-sdk",
  "@piplabs/cdr-crypto",
  "multiformats",
  "helia",
  "@helia/unixfs",
],
  webpack: (config, { isServer }) => {
    // Handle node: URI scheme used by cdr-crypto WASM loader
    config.externals = config.externals || [];

    if (!isServer) {
      // On the client (browser), stub out all Node built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        module: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
        "@react-native-async-storage/async-storage": false,
      };
    }

    // Tell webpack how to handle node: scheme
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/@piplabs/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Externalize the entire CDR crypto package from webpack bundling
    config.externals.push({
      "@piplabs/cdr-crypto": "commonjs @piplabs/cdr-crypto",
    });

    // Handle pino and other server-only packages
    config.externals.push("pino-pretty", "lokijs", "encoding");

    return config;
  },
};

export default nextConfig;
