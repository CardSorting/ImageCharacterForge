import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getCharacterById } from "@/lib/character-data";

interface ResultsGalleryProps {
  packId: number;
  onGenerateNew: () => void;
}

interface GeneratedImage {
  id: number;
  characterId: string;
  imageUrl: string;
  variation: number;
  prompt: string;
  enhancedPrompt?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

interface CharacterPack {
  id: number;
  name: string;
  characters: string[];
  settings: any;
  status: string;
  createdAt: string;
  images: GeneratedImage[];
}

export default function ResultsGallery({ packId, onGenerateNew }: ResultsGalleryProps) {
  const { data: pack, isLoading } = useQuery<CharacterPack>({
    queryKey: [`/api/character-packs/${packId}`],
    enabled: !!packId,
  });

  const handleDownloadAll = () => {
    if (!pack?.images) return;
    
    // Create download links for all images
    pack.images.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `${pack.name}_${image.characterId}_variation_${image.variation}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownloadPack = (characterId: string) => {
    if (!pack?.images) return;
    
    const characterImages = pack.images.filter(img => img.characterId === characterId);
    characterImages.forEach((image) => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `${characterId}_pack_variation_${image.variation}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${image.characterId}_variation_${image.variation}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-400">Loading results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pack) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-slate-400">No results found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedImages = pack.images.reduce((acc, image) => {
    if (!acc[image.characterId]) {
      acc[image.characterId] = [];
    }
    acc[image.characterId].push(image);
    return acc;
  }, {} as Record<string, GeneratedImage[]>);

  const getCategoryColor = (characterId: string) => {
    const character = getCharacterById(characterId);
    switch (character?.category) {
      case 'anime': return 'bg-red-500';
      case 'games': return 'bg-blue-500';
      case 'movies': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Generated Character Packs</h2>
          <p className="text-slate-400">Your AI-generated character variations are ready for download</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleDownloadAll}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <i className="fas fa-download mr-2"></i>
            Download All
          </Button>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <i className="fas fa-share mr-2"></i>
            Share Pack
          </Button>
          <Button 
            onClick={onGenerateNew}
            className="bg-primary hover:bg-primary/80"
          >
            <i className="fas fa-plus mr-2"></i>
            New Pack
          </Button>
        </div>
      </div>

      {/* Character Pack Results */}
      <div className="space-y-8">
        {Object.entries(groupedImages).map(([characterId, images]) => {
          const character = getCharacterById(characterId);
          
          return (
            <Card key={characterId} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-white">{character?.name || characterId} Pack</h3>
                    <Badge className={`${getCategoryColor(characterId)} text-white`}>
                      {character?.category === 'games' ? 'Game' : 
                       character?.category === 'movies' ? 'Movie' : 'Anime'}
                    </Badge>
                    <Badge className="bg-emerald-500 text-white">
                      {images.length} Images
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                    >
                      <i className="fas fa-heart"></i>
                    </Button>
                    <Button 
                      onClick={() => handleDownloadPack(characterId)}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-white"
                    >
                      <i className="fas fa-download mr-1"></i>Pack
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {images.map((image) => (
                    <Card key={image.id} className="bg-slate-700 border-slate-600 overflow-hidden">
                      <div className="relative group">
                        <img 
                          src={image.imageUrl} 
                          alt={image.title || `Generated ${characterId} variation ${image.variation}`} 
                          className="w-full aspect-square object-cover" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <Button 
                            onClick={() => handleDownloadImage(image)}
                            className="bg-white text-black hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                            size="sm"
                          >
                            <i className="fas fa-download mr-1"></i>Download
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          1024×1024
                        </div>
                        <div className="absolute top-2 left-2 bg-primary bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium">
                          #{image.variation}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                            {image.title || `${characterId} - Variation ${image.variation}`}
                          </h4>
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                            {image.description || `AI-generated artwork featuring ${characterId} with unique artistic interpretation.`}
                          </p>
                        </div>
                        
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {image.tags.slice(0, 4).map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="bg-slate-600 text-slate-200 text-xs px-2 py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {image.tags.length > 4 && (
                              <Badge 
                                variant="secondary" 
                                className="bg-slate-600 text-slate-200 text-xs px-2 py-0.5"
                              >
                                +{image.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <i className="fas fa-robot"></i>
                            <span>AI Generated</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white h-8 w-8 p-0"
                            >
                              <i className="fas fa-heart text-xs"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white h-8 w-8 p-0"
                            >
                              <i className="fas fa-share text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pack Stats */}
      <Card className="bg-slate-800 border-slate-700 mt-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{pack.images.length}</p>
              <p className="text-xs text-slate-400">Images Generated</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">4.2s</p>
              <p className="text-xs text-slate-400">Avg Generation Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">1024px</p>
              <p className="text-xs text-slate-400">Resolution</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">Ready</p>
              <p className="text-xs text-slate-400">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
