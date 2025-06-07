import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterPackSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
// @ts-ignore - Module has types but package.json exports issue
import { runware } from '@runware/ai-sdk-provider';
import { experimental_generateImage as generateImage } from 'ai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get character pack history
  app.get("/api/character-packs", async (req, res) => {
    try {
      // For demo purposes, using userId = 1
      const packs = await storage.getCharacterPacksByUser(1);
      res.json(packs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character packs" });
    }
  });

  // Get character pack with images
  app.get("/api/character-packs/:id", async (req, res) => {
    try {
      const packId = parseInt(req.params.id);
      const pack = await storage.getCharacterPack(packId);
      
      if (!pack) {
        return res.status(404).json({ error: "Character pack not found" });
      }

      const images = await storage.getGeneratedImagesByPack(packId);
      res.json({ ...pack, images });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character pack" });
    }
  });

  // Create and generate character pack
  app.post("/api/character-packs", async (req, res) => {
    try {
      const { name, characters, settings } = insertCharacterPackSchema.parse(req.body);
      
      // Create character pack
      const pack = await storage.createCharacterPack({
        name,
        characters,
        settings,
        userId: 1, // For demo purposes
      });

      res.json(pack);

      // Start generation process asynchronously
      generateCharacterPack(pack.id, characters as string[], settings as any);
      
    } catch (error) {
      console.error("Error creating character pack:", error);
      res.status(400).json({ error: "Invalid character pack data" });
    }
  });

  // Enhance prompt with Gemini AI
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt, characters, style } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const enhancedPrompt = await enhancePromptWithGemini(prompt, characters, style);
      res.json({ enhancedPrompt });
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ error: "Failed to enhance prompt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Enhance prompt using Gemini AI
async function enhancePromptWithGemini(basePrompt: string, characters: string[], style: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Enhance this character description for high-quality ${style} image generation.
        
        Base prompt: ${basePrompt}
        Characters: ${characters.join(', ')}
        Style: ${style}
        
        Create a detailed, specific prompt that will generate high-quality character images while maintaining the distinctive features and personality of each character. Include details about poses, expressions, lighting, and artistic style. Keep it under 200 words.`,
    });
    
    return response.text ?? basePrompt;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return basePrompt; // Fallback to original prompt
  }
}

// Generate image metadata using Gemini AI
async function generateImageMetadata(characterId: string, prompt: string, variation: number, style: string): Promise<{
  title: string;
  description: string;
  tags: string[];
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate metadata for an AI-generated character image with the following details:

Character: ${characterId}
Prompt: ${prompt}
Style: ${style}
Variation: ${variation}

Please provide a JSON response with:
1. "title": A compelling, descriptive title (max 60 characters)
2. "description": A detailed description of the image (100-150 words)
3. "tags": An array of 8-12 relevant tags for categorization and search

The title should be engaging and describe the character's pose, expression, or action.
The description should be detailed and artistic, describing the visual elements, mood, and character traits.
The tags should include character name, style, pose, emotions, colors, and relevant themes.

Format as valid JSON only, no other text.`,
    });
    
    const metadataText = response.text ?? '{}';
    
    try {
      const metadata = JSON.parse(metadataText);
      return {
        title: metadata.title || `${characterId} - Variation ${variation}`,
        description: metadata.description || `A ${style} style artwork featuring ${characterId} in a dynamic pose.`,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [characterId, style, 'character', 'ai-generated']
      };
    } catch (parseError) {
      console.error("Error parsing Gemini metadata response:", parseError);
      // Fallback metadata
      return {
        title: `${characterId} - ${style} Style`,
        description: `A stunning ${style} style artwork featuring ${characterId} with intricate details and dynamic composition.`,
        tags: [characterId, style, 'character', 'ai-generated', 'artwork', 'digital']
      };
    }
  } catch (error) {
    console.error("Gemini metadata generation error:", error);
    // Fallback metadata
    return {
      title: `${characterId} - Variation ${variation}`,
      description: `An AI-generated ${style} style image of ${characterId} with unique artistic interpretation.`,
      tags: [characterId, style, 'character', 'ai-generated']
    };
  }
}

// Generate character pack using Runware
async function generateCharacterPack(packId: number, characters: string[], settings: any) {
  try {
    await storage.updateCharacterPackStatus(packId, "generating");
    
    const characterPrompts = {
      naruto: "orange ninja outfit, spiky blonde hair, determined expression, dynamic action pose",
      goku: "spiky black hair, orange martial arts gi, muscular build, energy aura, fighting stance", 
      luffy: "straw hat, red vest, cheerful smile, rubber powers, pirate captain pose",
      sasuke: "dark ninja outfit, black hair, serious expression, lightning chakra effects",
      link: "green tunic, pointed ears, master sword, hylian shield, heroic stance",
      mario: "red cap with M logo, blue overalls, mustache, cheerful jumping pose",
      batman: "black cape, cowl mask, bat symbol, dark armor, brooding pose on rooftop",
      spiderman: "red and blue suit, web pattern, web-slinging pose, dynamic movement",
      ironman: "red and gold armor, arc reactor, repulsors, high-tech suit, flying pose",
      wonderwoman: "golden tiara, red and blue outfit, lasso of truth, warrior stance"
    };

    for (const characterId of characters) {
      const basePrompt = characterPrompts[characterId as keyof typeof characterPrompts] || `${characterId} character`;
      
      // Enhance prompt with Gemini
      const enhancedPrompt = await enhancePromptWithGemini(
        basePrompt, 
        [characterId], 
        settings.style || "anime"
      );

      // Generate images with Runware
      const result = await generateImage({
        model: runware.image('runware:101@1'),
        prompt: enhancedPrompt,
        n: settings.imagesPerCharacter || 4,
        size: '1024x1024',
        providerOptions: {
          runware: {
            steps: 30,
            CFGScale: 7.5,
            scheduler: 'DPM++ 2M',
          },
        },
      });

      // Handle both single image and multiple images response
      const images = result.images || (result.image ? [result.image] : []);

      // Save generated images with AI-generated metadata
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i] as any;
        const imageUrl = imageData?.url || imageData?.base64 || `https://via.placeholder.com/1024x1024/8B5CF6/FFFFFF?text=${characterId}`;
        
        // Generate metadata for this image using Gemini AI
        const metadata = await generateImageMetadata(
          characterId, 
          enhancedPrompt || basePrompt, 
          i + 1, 
          settings.style || "anime"
        );
        
        await storage.createGeneratedImage({
          packId,
          characterId,
          imageUrl,
          variation: i + 1,
          prompt: basePrompt,
          enhancedPrompt: enhancedPrompt || null,
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
        });
      }
    }

    await storage.updateCharacterPackStatus(packId, "completed", new Date());
  } catch (error) {
    console.error("Generation error:", error);
    await storage.updateCharacterPackStatus(packId, "failed");
  }
}
