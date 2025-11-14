import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertDetectionLogSchema, insertAlertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // API Routes
  
  // Get all drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  // Get current active driver
  app.get("/api/drivers/current", async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      const activeDriver = drivers.find(d => d.status === "active");
      if (!activeDriver) {
        return res.status(404).json({ message: "No active driver found" });
      }
      
      const session = await storage.getCurrentSession(activeDriver.id);
      res.json({ driver: activeDriver, session });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current driver" });
    }
  });

  // Create detection log
  app.post("/api/detection", async (req, res) => {
    try {
      const validatedData = insertDetectionLogSchema.parse(req.body);
      const log = await storage.createDetectionLog(validatedData);
      
      // Broadcast real-time update
      broadcast({
        type: 'detection_update',
        data: log
      });

      // Check if alert should be created
      if (log.alertLevel === 'critical' || log.drowsinessScore > 70) {
        const alert = await storage.createAlertEvent({
          driverId: log.driverId,
          alertType: log.alertLevel === 'critical' ? 'critical_drowsiness' : 'drowsiness',
          severity: log.alertLevel === 'critical' ? 'critical' : 'high',
          message: `Drowsiness detected: ${log.drowsinessScore}% drowsiness level`
        });

        broadcast({
          type: 'alert_created',
          data: alert
        });
      }

      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid detection data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create detection log" });
      }
    }
  });

  // Get detection history for driver
  app.get("/api/detection/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getDetectionLogsByDriver(driverId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch detection logs" });
    }
  });

  // Get recent detection data for charts
  app.get("/api/detection/recent/:minutes", async (req, res) => {
    try {
      const { minutes } = req.params;
      const logs = await storage.getRecentDetectionLogs(parseInt(minutes));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent detection data" });
    }
  });

  // Get alerts for driver
  app.get("/api/alerts/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const alerts = await storage.getAlertsByDriver(driverId, limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Create manual alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertEventSchema.parse(req.body);
      const alert = await storage.createAlertEvent(validatedData);
      
      broadcast({
        type: 'alert_created',
        data: alert
      });

      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create alert" });
      }
    }
  });

  // Resolve alert
  app.patch("/api/alerts/:alertId/resolve", async (req, res) => {
    try {
      const { alertId } = req.params;
      const alert = await storage.resolveAlert(alertId);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      broadcast({
        type: 'alert_resolved',
        data: alert
      });

      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Get system health status
  app.get("/api/system/health", (req, res) => {
    const health = {
      camera: {
        status: "active",
        fps: 30,
        resolution: "1080p",
        latency: Math.floor(Math.random() * 20) + 10 // 10-30ms
      },
      ai: {
        status: "optimal",
        accuracy: 95,
        cpu: Math.floor(Math.random() * 30) + 40, // 40-70%
        memory: 2.1
      },
      storage: {
        status: "connected",
        used: "847MB",
        lastSync: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      }
    };
    res.json(health);
  });

  return httpServer;
}
