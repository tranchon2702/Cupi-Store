module.exports = {
  apps: [
    {
      name: "cupi-store",
      cwd: __dirname,
      script: ".output/server/index.mjs",
      interpreter: process.env.CUPI_NODE_INTERPRETER || "node",
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3001",
      },
    },
  ],
};
