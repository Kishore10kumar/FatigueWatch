import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  driverId: text("driver_id").notNull().unique(),
  profileImage: text("profile_image"),
  shiftStart: text("shift_start").notNull(),
  shiftEnd: text("shift_end").notNull(),
  status: text("status").notNull().default("inactive"), // active, inactive, break
  createdAt: timestamp("created_at").defaultNow(),
});

export const detectionLogs = pgTable("detection_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  yawnDetected: boolean("yawn_detected").default(false),
  eyeState: text("eye_state").notNull(), // open, closed, drowsy
  blinkRate: integer("blink_rate").notNull(),
  headPosition: text("head_position").notNull(), // center, left, right, down
  drowsinessScore: real("drowsiness_score").notNull(),
  alertLevel: text("alert_level").notNull(), // safe, drowsy, critical
});

export const alertEvents = pgTable("alert_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  alertType: text("alert_type").notNull(), // drowsiness, yawn, eyes_closed, head_position
  severity: text("severity").notNull(), // low, medium, high, critical
  message: text("message").notNull(),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
});

export const driverSessions = pgTable("driver_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalDriveTime: integer("total_drive_time"), // in minutes
  totalAlerts: integer("total_alerts").default(0),
  maxDrowsinessScore: real("max_drowsiness_score").default(0),
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
});

export const insertDetectionLogSchema = createInsertSchema(detectionLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAlertEventSchema = createInsertSchema(alertEvents).omit({
  id: true,
  timestamp: true,
  resolvedAt: true,
});

export const insertDriverSessionSchema = createInsertSchema(driverSessions).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type DetectionLog = typeof detectionLogs.$inferSelect;
export type InsertDetectionLog = z.infer<typeof insertDetectionLogSchema>;
export type AlertEvent = typeof alertEvents.$inferSelect;
export type InsertAlertEvent = z.infer<typeof insertAlertEventSchema>;
export type DriverSession = typeof driverSessions.$inferSelect;
export type InsertDriverSession = z.infer<typeof insertDriverSessionSchema>;
