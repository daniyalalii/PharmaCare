import express, { type Request, Response } from "express";
import { createServer } from "http";

export function registerRoutes(app: express.Application) {
  const server = createServer(app);
  
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "PharmaCare API is running" });
  });

  return server;
}
