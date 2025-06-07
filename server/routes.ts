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
  
  // Create default user if none exists
  const initializeDefaultUser = async () => {
    try {
      const existingUser = await storage.getUser(1);
      if (!existingUser) {
        await storage.createUser({
          username: "demo_user",
          password: "demo_password"
        });
        console.log("Created default user");
      }
    } catch (error) {
      console.error("Error initializing default user:", error);
    }
  };
  
  await initializeDefaultUser();
  
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
      console.log(`Starting generation for pack ${pack.id} with characters:`, characters);
      generateCharacterPack(pack.id, characters as string[], settings as any)
        .catch(error => console.error(`Failed to generate pack ${pack.id}:`, error));
      
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
      contents: `Generate metadata for an AI-generated character image. Respond with ONLY valid JSON, no markdown formatting or code blocks.

Character: ${characterId}
Prompt: ${prompt}
Style: ${style}
Variation: ${variation}

Return JSON with these exact fields:
{
  "title": "compelling descriptive title (max 60 chars)",
  "description": "detailed artistic description (100-150 words)",
  "tags": ["array", "of", "8-12", "relevant", "tags"]
}

Title: engaging, describes pose/expression/action
Description: artistic, visual elements, mood, character traits
Tags: character name, style, pose, emotions, colors, themes

IMPORTANT: Return only the JSON object, no other text or formatting.`,
    });
    
    const metadataText = response.text ?? '{}';
    
    try {
      // Comprehensive text cleaning for various markdown formats
      let cleanedText = metadataText;
      
      // Remove markdown code blocks (backticks)
      cleanedText = cleanedText.replace(/```(?:json)?\s*/gi, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      // Extract JSON object from the response
      const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const jsonMatches = cleanedText.match(jsonPattern);
      
      if (jsonMatches && jsonMatches.length > 0) {
        // Use the largest JSON object found
        cleanedText = jsonMatches.reduce((longest, current) => 
          current.length > longest.length ? current : longest
        );
      }
      
      // Clean up any remaining formatting
      cleanedText = cleanedText.trim();
      
      const metadata = JSON.parse(cleanedText);
      
      // Validate and clean the parsed data
      const title = typeof metadata.title === 'string' ? metadata.title.substring(0, 60) : `${characterId} - Variation ${variation}`;
      const description = typeof metadata.description === 'string' ? metadata.description : `A ${style} style artwork featuring ${characterId} in a dynamic pose.`;
      const tags = Array.isArray(metadata.tags) ? metadata.tags.filter((tag: any) => typeof tag === 'string') : [characterId, style, 'character', 'ai-generated'];
      
      return { title, description, tags };
      
    } catch (parseError) {
      console.log("Gemini response parsing failed, using regex extraction");
      
      // Regex-based extraction as fallback
      const titleMatch = metadataText.match(/"title":\s*"([^"]*?)"/i);
      const descMatch = metadataText.match(/"description":\s*"([^"]*?)"/i);
      const tagsSection = metadataText.match(/"tags":\s*\[([\s\S]*?)\]/);
      
      let extractedTags = [characterId, style, 'character', 'ai-generated'];
      if (tagsSection) {
        const tagMatches = tagsSection[1].match(/"([^"]*?)"/g);
        if (tagMatches) {
          extractedTags = tagMatches.map(tag => tag.replace(/"/g, '').trim()).filter(tag => tag.length > 0);
        }
      }
      
      return {
        title: titleMatch ? titleMatch[1].substring(0, 60) : `${characterId} - ${style} Style`,
        description: descMatch ? descMatch[1] : `A stunning ${style} style artwork featuring ${characterId} with intricate details and dynamic composition.`,
        tags: extractedTags.length > 0 ? extractedTags : [characterId, style, 'character', 'ai-generated', 'artwork']
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
  console.log(`[generateCharacterPack] Starting generation for pack ${packId}`);
  try {
    await storage.updateCharacterPackStatus(packId, "generating");
    console.log(`[generateCharacterPack] Updated status to generating for pack ${packId}`);
    
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
      console.log(`Generating ${settings.imagesPerCharacter || 4} images for ${characterId} with prompt: ${enhancedPrompt}`);
      
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

      console.log(`Runware API response structure:`, {
        images: result.images ? `Array with ${result.images.length} items` : 'undefined',
        warnings: result.warnings ? `Array with ${result.warnings.length} items` : 'undefined',
        responses: result.responses ? `Array with ${result.responses.length} items` : 'undefined'
      });

      // Extract image URLs from Runware response
      const imageUrls: string[] = [];
      
      // Check for direct image array in result
      if (result.images && Array.isArray(result.images)) {
        for (const img of result.images) {
          if (img && typeof img === 'object' && 'url' in img) {
            imageUrls.push(img.url as string);
          }
        }
      }
      
      // Check warnings for imageURL (Runware specific response format)
      if (result.warnings && Array.isArray(result.warnings)) {
        for (const warning of result.warnings) {
          try {
            const warningObj = warning as any;
            if (warningObj.message && typeof warningObj.message === 'string' && warningObj.message.includes('Response data:')) {
              const responseData = JSON.parse(warningObj.message.replace('Response data: ', ''));
              if (Array.isArray(responseData)) {
                for (const item of responseData) {
                  if (item && typeof item === 'object' && item.imageURL) {
                    imageUrls.push(item.imageURL);
                  }
                }
              }
            }
          } catch (e) {
            console.log('Failed to parse warning message');
          }
        }
      }

      console.log(`Extracted ${imageUrls.length} image URLs for ${characterId}:`, imageUrls);

      // Save generated images with AI-generated metadata
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        console.log(`Processing image ${i + 1} for ${characterId} with URL:`, imageUrl);
        
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
    console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    await storage.updateCharacterPackStatus(packId, "failed");
  }
}
