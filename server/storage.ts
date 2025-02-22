import { User, InsertUser, UserProfile, HealthLog } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, profile: UserProfile): Promise<User>;
  createHealthLog(log: Omit<HealthLog, "id">): Promise<HealthLog>;
  getUserHealthLogs(userId: number): Promise<HealthLog[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthLogs: Map<number, HealthLog>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.healthLogs = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
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
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, profile: UserProfile): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...profile };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createHealthLog(log: Omit<HealthLog, "id">): Promise<HealthLog> {
    const id = this.currentId++;
    const healthLog = { ...log, id };
    this.healthLogs.set(id, healthLog);
    return healthLog;
  }

  async getUserHealthLogs(userId: number): Promise<HealthLog[]> {
    return Array.from(this.healthLogs.values()).filter(
      (log) => log.userId === userId
    );
  }
}

export const storage = new MemStorage();
