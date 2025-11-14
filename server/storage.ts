import { 
  type Driver, 
  type InsertDriver,
  type DetectionLog,
  type InsertDetectionLog,
  type AlertEvent,
  type InsertAlertEvent,
  type DriverSession,
  type InsertDriverSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Driver operations
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByDriverId(driverId: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverStatus(id: string, status: string): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;

  // Detection log operations
  createDetectionLog(log: InsertDetectionLog): Promise<DetectionLog>;
  getDetectionLogsByDriver(driverId: string, limit?: number): Promise<DetectionLog[]>;
  getRecentDetectionLogs(minutes: number): Promise<DetectionLog[]>;

  // Alert operations
  createAlertEvent(alert: InsertAlertEvent): Promise<AlertEvent>;
  getAlertsByDriver(driverId: string, limit?: number): Promise<AlertEvent[]>;
  getUnresolvedAlerts(): Promise<AlertEvent[]>;
  resolveAlert(id: string): Promise<AlertEvent | undefined>;

  // Session operations
  createDriverSession(session: InsertDriverSession): Promise<DriverSession>;
  getCurrentSession(driverId: string): Promise<DriverSession | undefined>;
  endDriverSession(sessionId: string): Promise<DriverSession | undefined>;
  updateSessionStats(sessionId: string, stats: Partial<DriverSession>): Promise<DriverSession | undefined>;
}

export class MemStorage implements IStorage {
  private drivers: Map<string, Driver>;
  private detectionLogs: Map<string, DetectionLog>;
  private alertEvents: Map<string, AlertEvent>;
  private driverSessions: Map<string, DriverSession>;

  constructor() {
    this.drivers = new Map();
    this.detectionLogs = new Map();
    this.alertEvents = new Map();
    this.driverSessions = new Map();

    // Initialize with a default driver
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const defaultDriver = await this.createDriver({
      name: "John Mitchell",
      driverId: "DRV-2024-001",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      shiftStart: "06:00",
      shiftEnd: "14:00",
      status: "active"
    });

    // Create a current session
    await this.createDriverSession({
      driverId: defaultDriver.id
    });
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async getDriverByDriverId(driverId: string): Promise<Driver | undefined> {
    return Array.from(this.drivers.values()).find(driver => driver.driverId === driverId);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = randomUUID();
    const driver: Driver = { 
      ...insertDriver, 
      id,
      createdAt: new Date()
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriverStatus(id: string, status: string): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (driver) {
      const updatedDriver = { ...driver, status };
      this.drivers.set(id, updatedDriver);
      return updatedDriver;
    }
    return undefined;
  }

  async getAllDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async createDetectionLog(insertLog: InsertDetectionLog): Promise<DetectionLog> {
    const id = randomUUID();
    const log: DetectionLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.detectionLogs.set(id, log);
    return log;
  }

  async getDetectionLogsByDriver(driverId: string, limit = 100): Promise<DetectionLog[]> {
    return Array.from(this.detectionLogs.values())
      .filter(log => log.driverId === driverId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async getRecentDetectionLogs(minutes: number): Promise<DetectionLog[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return Array.from(this.detectionLogs.values())
      .filter(log => log.timestamp! > cutoff)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }

  async createAlertEvent(insertAlert: InsertAlertEvent): Promise<AlertEvent> {
    const id = randomUUID();
    const alert: AlertEvent = {
      ...insertAlert,
      id,
      timestamp: new Date()
    };
    this.alertEvents.set(id, alert);
    return alert;
  }

  async getAlertsByDriver(driverId: string, limit = 50): Promise<AlertEvent[]> {
    return Array.from(this.alertEvents.values())
      .filter(alert => alert.driverId === driverId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async getUnresolvedAlerts(): Promise<AlertEvent[]> {
    return Array.from(this.alertEvents.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }

  async resolveAlert(id: string): Promise<AlertEvent | undefined> {
    const alert = this.alertEvents.get(id);
    if (alert) {
      const resolvedAlert = { 
        ...alert, 
        resolved: true, 
        resolvedAt: new Date() 
      };
      this.alertEvents.set(id, resolvedAlert);
      return resolvedAlert;
    }
    return undefined;
  }

  async createDriverSession(insertSession: InsertDriverSession): Promise<DriverSession> {
    const id = randomUUID();
    const session: DriverSession = {
      ...insertSession,
      id,
      startTime: new Date(),
      totalAlerts: 0,
      maxDrowsinessScore: 0
    };
    this.driverSessions.set(id, session);
    return session;
  }

  async getCurrentSession(driverId: string): Promise<DriverSession | undefined> {
    return Array.from(this.driverSessions.values())
      .find(session => session.driverId === driverId && !session.endTime);
  }

  async endDriverSession(sessionId: string): Promise<DriverSession | undefined> {
    const session = this.driverSessions.get(sessionId);
    if (session) {
      const endedSession = { 
        ...session, 
        endTime: new Date(),
        totalDriveTime: session.startTime ? 
          Math.floor((Date.now() - session.startTime.getTime()) / (1000 * 60)) : 0
      };
      this.driverSessions.set(sessionId, endedSession);
      return endedSession;
    }
    return undefined;
  }

  async updateSessionStats(sessionId: string, stats: Partial<DriverSession>): Promise<DriverSession | undefined> {
    const session = this.driverSessions.get(sessionId);
    if (session) {
      const updatedSession = { ...session, ...stats };
      this.driverSessions.set(sessionId, updatedSession);
      return updatedSession;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
