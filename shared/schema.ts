import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const characterPacks = pgTable("character_packs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  characters: jsonb("characters").notNull(), // Array of character IDs
  settings: jsonb("settings").notNull(), // Generation settings
  status: text("status").notNull().default("pending"), // pending, generating, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").references(() => characterPacks.id),
  characterId: text("character_id").notNull(),
  imageUrl: text("image_url").notNull(),
  variation: integer("variation").notNull(),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt"),
  title: text("title"),
  description: text("description"),
  tags: jsonb("tags"), // Array of tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterPackSchema = createInsertSchema(characterPacks).pick({
  name: true,
  characters: true,
  settings: true,
});

export const insertGeneratedImageSchema = createInsertSchema(generatedImages).pick({
  packId: true,
  characterId: true,
  imageUrl: true,
  variation: true,
  prompt: true,
  enhancedPrompt: true,
  title: true,
  description: true,
  tags: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCharacterPack = z.infer<typeof insertCharacterPackSchema>;
export type CharacterPack = typeof characterPacks.$inferSelect;
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;
