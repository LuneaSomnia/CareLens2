import { pgTable, text, serial, integer, boolean, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  bloodType: text("blood_type"),
  medicalHistory: json("medical_history").$type<string[]>().default([]).notNull(),
  familyHistory: json("family_history").$type<string[]>().default([]).notNull(),
  lifestyle: json("lifestyle").$type<{
    smoking: boolean;
    alcohol: boolean;
    diet: string[];
    exercise: {
      type: string;
      frequency: string;
      duration: string;
    };
  }>().notNull(),
  emergencyContacts: json("emergency_contacts").$type<{
    name: string;
    email: string;
    phone: string;
  }[]>().default([]).notNull(),
  organDonor: boolean("organ_donor").default(false).notNull(),
  dataSharing: boolean("data_sharing").default(false).notNull(),
});

export const healthLogs = pgTable("health_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'symptom', 'lifestyle', 'assessment'
  data: json("data").notNull(),
  createdAt: date("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const userProfileSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type User = typeof users.$inferSelect;
export type HealthLog = typeof healthLogs.$inferSelect;
