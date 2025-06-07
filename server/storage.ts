import { characterPacks, generatedImages, users, type User, type InsertUser, type CharacterPack, type InsertCharacterPack, type GeneratedImage, type InsertGeneratedImage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCharacterPack(pack: InsertCharacterPack & { userId: number }): Promise<CharacterPack>;
  getCharacterPack(id: number): Promise<CharacterPack | undefined>;
  getCharacterPacksByUser(userId: number): Promise<CharacterPack[]>;
  updateCharacterPackStatus(id: number, status: string, completedAt?: Date): Promise<void>;
  
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  getGeneratedImagesByPack(packId: number): Promise<GeneratedImage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createCharacterPack(pack: InsertCharacterPack & { userId: number }): Promise<CharacterPack> {
    const [characterPack] = await db
      .insert(characterPacks)
      .values({
        ...pack,
        status: "pending",
      })
      .returning();
    return characterPack;
  }

  async getCharacterPack(id: number): Promise<CharacterPack | undefined> {
    const [pack] = await db.select().from(characterPacks).where(eq(characterPacks.id, id));
    return pack || undefined;
  }

  async getCharacterPacksByUser(userId: number): Promise<CharacterPack[]> {
    return await db.select().from(characterPacks).where(eq(characterPacks.userId, userId));
  }

  async updateCharacterPackStatus(id: number, status: string, completedAt?: Date): Promise<void> {
    await db
      .update(characterPacks)
      .set({ 
        status, 
        completedAt: completedAt || null 
      })
      .where(eq(characterPacks.id, id));
  }

  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const [generatedImage] = await db
      .insert(generatedImages)
      .values({
        packId: image.packId ?? null,
        characterId: image.characterId,
        imageUrl: image.imageUrl,
        variation: image.variation,
        prompt: image.prompt,
        enhancedPrompt: image.enhancedPrompt ?? null,
        title: image.title ?? null,
        description: image.description ?? null,
        tags: image.tags ?? null,
      })
      .returning();
    return generatedImage;
  }

  async getGeneratedImagesByPack(packId: number): Promise<GeneratedImage[]> {
    return await db.select().from(generatedImages).where(eq(generatedImages.packId, packId));
  }
}

export const storage = new DatabaseStorage();
