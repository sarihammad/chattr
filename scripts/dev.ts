#!/usr/bin/env ts-node

import { spawn } from "child_process";
import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { setupWebSocketServer } from "../src/server/websocket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

async function startDevServer() {
  try {
    // Start Redis if not running
    const redis = spawn("redis-server", ["--port", "6379"]);
    redis.stdout.on("data", (data) => {
      console.log(`Redis: ${data}`);
    });
    redis.stderr.on("data", (data) => {
      console.error(`Redis Error: ${data}`);
    });

    // Initialize Next.js
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    await app.prepare();

    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url || "", true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    // Set up WebSocket server
    setupWebSocketServer(server);

    // Start server
    server.listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });

    // Handle process termination
    const cleanup = () => {
      console.log("Cleaning up...");
      redis.kill();
      server.close();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (error) {
    console.error("Error starting development server:", error);
    process.exit(1);
  }
}

startDevServer();
