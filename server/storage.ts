import { characterPacks, generatedImages, users, type User, type InsertUser, type CharacterPack, type InsertCharacterPack, type GeneratedImage, type InsertGeneratedImage } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characterPacks: Map<number, CharacterPack>;
  private generatedImages: Map<number, GeneratedImage>;
  private currentUserId: number;
  private currentPackId: number;
  private currentImageId: number;

  constructor() {
    this.users = new Map();
    this.characterPacks = new Map();
    this.generatedImages = new Map();
    this.currentUserId = 1;
    this.currentPackId = 1;
    this.currentImageId = 1;
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCharacterPack(pack: InsertCharacterPack & { userId: number }): Promise<CharacterPack> {
    const id = this.currentPackId++;
    const characterPack: CharacterPack = {
      ...pack,
      id,
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    this.characterPacks.set(id, characterPack);
    return characterPack;
  }

  async getCharacterPack(id: number): Promise<CharacterPack | undefined> {
    return this.characterPacks.get(id);
  }

  async getCharacterPacksByUser(userId: number): Promise<CharacterPack[]> {
    return Array.from(this.characterPacks.values()).filter(
      (pack) => pack.userId === userId,
    );
  }

  async updateCharacterPackStatus(id: number, status: string, completedAt?: Date): Promise<void> {
    const pack = this.characterPacks.get(id);
    if (pack) {
      pack.status = status;
      if (completedAt) {
        pack.completedAt = completedAt;
      }
      this.characterPacks.set(id, pack);
    }
  }

  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const id = this.currentImageId++;
    const generatedImage: GeneratedImage = {
      ...image,
      id,
      packId: image.packId ?? null,
      enhancedPrompt: image.enhancedPrompt ?? null,
      createdAt: new Date(),
    };
    this.generatedImages.set(id, generatedImage);
    return generatedImage;
  }

  async getGeneratedImagesByPack(packId: number): Promise<GeneratedImage[]> {
    return Array.from(this.generatedImages.values()).filter(
      (image) => image.packId === packId,
    );
  }
}

export const storage = new MemStorage();
