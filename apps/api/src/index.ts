import { createApp } from "./app";
import { config } from "./config";
const app = createApp();

const server = Bun.serve({
  hostname: config.host,
  port: config.port,
  fetch: app.fetch,
});

console.log(`Server run in ${server.url} (bind: ${config.host}:${config.port})`);
