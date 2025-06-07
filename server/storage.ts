import {
  users,
  characterPacks,
  generatedImages,
  type User,
  type UpsertUser,
  type CharacterPack,
  type InsertCharacterPack,
  type GeneratedImage,
  type InsertGeneratedImage,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Other operations
  createCharacterPack(pack: InsertCharacterPack & { userId: string }): Promise<CharacterPack>;
  getCharacterPack(id: number): Promise<CharacterPack | undefined>;
  getCharacterPacksByUser(userId: string): Promise<CharacterPack[]>;
  updateCharacterPackStatus(id: number, status: string, completedAt?: Date): Promise<void>;
  
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  getGeneratedImagesByPack(packId: number): Promise<GeneratedImage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Other operations
  async createCharacterPack(pack: InsertCharacterPack & { userId: string }): Promise<CharacterPack> {
    const [characterPack] = await db
      .insert(characterPacks)
      .values({
        ...pack,
        status: "pending"
      })
      .returning();
    return characterPack;
  }

  async getCharacterPack(id: number): Promise<CharacterPack | undefined> {
    const [pack] = await db.select().from(characterPacks).where(eq(characterPacks.id, id));
    return pack;
  }

  async getCharacterPacksByUser(userId: string): Promise<CharacterPack[]> {
    return await db.select().from(characterPacks).where(eq(characterPacks.userId, userId));
  }

  async updateCharacterPackStatus(id: number, status: string, completedAt?: Date): Promise<void> {
    await db
      .update(characterPacks)
      .set({ status, completedAt })
      .where(eq(characterPacks.id, id));
  }

  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const [generatedImage] = await db
      .insert(generatedImages)
      .values(image)
      .returning();
    return generatedImage;
  }

  async getGeneratedImagesByPack(packId: number): Promise<GeneratedImage[]> {
    return await db.select().from(generatedImages).where(eq(generatedImages.packId, packId));
  }
}

export const storage = new DatabaseStorage();