module.exports = {
  apps: [
    {
      name: "tech-store-backend",
      script: "src/server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
