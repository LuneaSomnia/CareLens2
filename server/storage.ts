import { User, InsertUser, UserProfile, HealthLog } from "@shared/schema";
import { users, healthLogs } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, profile: UserProfile): Promise<User>;
  createHealthLog(log: Omit<HealthLog, "id">): Promise<HealthLog>;
  getUserHealthLogs(userId: number, type?: string): Promise<HealthLog[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Add default values for required fields
    const userWithDefaults = {
      ...insertUser,
      fullName: "",
      dateOfBirth: new Date(),
      gender: "",
      email: "",
      phone: "",
      address: "",
      bloodType: null,
      medicalHistory: [],
      familyHistory: [],
      lifestyle: {
        smoking: false,
        alcohol: false,
        diet: [],
        exercise: {
          type: "",
          frequency: "",
          duration: ""
        }
      },
      emergencyContacts: [],
      organDonor: false,
      dataSharing: false
    };

    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    return user;
  }

  async updateUser(id: number, profile: UserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        bloodType: profile.bloodType,
        medicalHistory: profile.medicalHistory,
        familyHistory: profile.familyHistory,
        lifestyle: profile.lifestyle,
        emergencyContacts: profile.emergencyContacts,
        organDonor: profile.organDonor,
        dataSharing: profile.dataSharing
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) throw new Error("User not found");
    return user;
  }

  async createHealthLog(log: Omit<HealthLog, "id">): Promise<HealthLog> {
    const [healthLog] = await db
      .insert(healthLogs)
      .values({
        ...log,
        createdAt: new Date()
      })
      .returning();
    return healthLog;
  }

  async getUserHealthLogs(userId: number, type?: string): Promise<HealthLog[]> {
    const query = db
      .select()
      .from(healthLogs)
      .where(eq(healthLogs.userId, userId));

    if (type) {
      return query.where(eq(healthLogs.type, type));
    }

    return query;
  }
}

export const storage = new DatabaseStorage();