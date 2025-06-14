import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import CharacterSelection from "@/components/character-selection";
import GenerationProgress from "@/components/generation-progress";
import ResultsGallery from "@/components/results-gallery";
import { Calendar, Clock, Image, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ViewState = 'selection' | 'customization' | 'generating' | 'results' | 'gallery';

interface GenerationSettings {
  style: string;
  pose: string;
  background: string;
  imagesPerCharacter: number;
  quality: number;
}

interface CharacterPack {
  id: number;
  name: string;
  characters: string[];
  settings: GenerationSettings;
  status: string;
}

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [viewState, setViewState] = useState<ViewState>('selection');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [currentPackId, setCurrentPackId] = useState<number | null>(null);
  
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    style: 'anime',
    pose: 'standing',
    background: 'transparent',
    imagesPerCharacter: 4,
    quality: 20,
  });
  
  const [basePrompt, setBasePrompt] = useState('Generate multiple dynamic poses and expressions of the selected characters in their iconic styles');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');

  // Query for user's character packs
  const { data: userPacks = [], isLoading: isLoadingPacks } = useQuery({
    queryKey: ['/api/character-packs'],
    enabled: !!user,
  });

  // Mutations
  const enhancePromptMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/enhance-prompt', {
        prompt,
        characters: selectedCharacters,
        style: generationSettings.style,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEnhancedPrompt(data.enhancedPrompt);
      toast({
        title: "Prompt Enhanced",
        description: "Your prompt has been enhanced with Gemini AI",
      });
    },
    onError: () => {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance prompt. Using original prompt.",
        variant: "destructive",
      });
    },
  });

  const generatePackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/character-packs', {
        name: `Character Pack - ${new Date().toLocaleDateString()}`,
        characters: selectedCharacters,
        settings: generationSettings,
      });
      return response.json();
    },
    onSuccess: (data: CharacterPack) => {
      setCurrentPackId(data.id);
      setViewState('generating');
      queryClient.invalidateQueries({ queryKey: ['/api/character-packs'] });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to start character pack generation",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleStartGeneration = () => {
    if (selectedCharacters.length === 0) {
      toast({
        title: "No Characters Selected",
        description: "Please select at least one character to generate a pack",
        variant: "destructive",
      });
      return;
    }
    setViewState('customization');
  };

  const handleEnhancePrompt = () => {
    if (!basePrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to enhance",
        variant: "destructive",
      });
      return;
    }
    enhancePromptMutation.mutate(basePrompt);
  };

  const handleGeneratePack = () => {
    generatePackMutation.mutate();
  };

  const handleGenerationComplete = () => {
    setViewState('results');
    toast({
      title: "Generation Complete",
      description: "Your character pack has been generated successfully!",
    });
  };

  const handleGenerateNew = () => {
    setViewState('selection');
    setSelectedCharacters([]);
    setCurrentPackId(null);
    setEnhancedPrompt('');
    setBasePrompt('Generate multiple dynamic poses and expressions of the selected characters in their iconic styles');
  };

  const totalImages = selectedCharacters.length * generationSettings.imagesPerCharacter;
  const estimatedCredits = totalImages * 3; // 3 credits per image

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <i className="fas fa-magic text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold">CharacterForge</h1>
                <p className="text-xs text-slate-400">AI Character Pack Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-300">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Gemini AI</span>
                </div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Runware</span>
                </div>
              </div>
              
              {user && (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any).profileImageUrl || undefined} />
                    <AvatarFallback>
                      {(user as any).firstName?.charAt(0) || (user as any).email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-sm">
                    <p className="text-white">{(user as any).firstName || 'User'}</p>
                    <p className="text-slate-400 text-xs">{(user as any).email}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewState('gallery')}
                    className="border-slate-600 hover:bg-slate-700"
                  >
                    Gallery
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/api/logout'}
                    className="border-slate-600 hover:bg-slate-700"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {viewState === 'selection' && (
          <section className="text-center mb-12">
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Create Stunning Character Packs
              </h2>
              <p className="text-xl text-slate-300 mb-6 max-w-3xl mx-auto">
                Generate high-quality character variations using AI. Select from popular anime, game, and movie characters, 
                then let our AI create unique variations and complete character packs.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-sparkles text-accent"></i>
                  <span>Google Gemini AI Prompts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-images text-secondary"></i>
                  <span>Runware Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-download text-primary"></i>
                  <span>Instant Downloads</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Character Selection */}
        {viewState === 'selection' && (
          <CharacterSelection
            selectedCharacters={selectedCharacters}
            onCharacterToggle={handleCharacterToggle}
            onStartGeneration={handleStartGeneration}
          />
        )}

        {/* Customization Panel */}
        {viewState === 'customization' && (
          <section className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* AI Prompt Enhancement Panel */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">AI Prompt Enhancement</h3>
                      <p className="text-slate-400 text-sm">Let Gemini AI enhance your character descriptions for better results</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-medium">Gemini Connected</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Base Prompt</Label>
                      <Textarea 
                        value={basePrompt}
                        onChange={(e) => setBasePrompt(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mt-2" 
                        rows={3} 
                        placeholder="Describe the character variations you want to generate..."
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button 
                        onClick={handleEnhancePrompt}
                        disabled={enhancePromptMutation.isPending}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black"
                      >
                        {enhancePromptMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-sparkles mr-2"></i>
                        )}
                        Enhance with Gemini
                      </Button>
                    </div>

                    {enhancedPrompt && (
                      <Card className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <i className="fas fa-robot text-amber-400"></i>
                            <span className="font-medium text-white">Enhanced Prompt</span>
                            <Badge className="bg-amber-500 text-black">Gemini</Badge>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{enhancedPrompt}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generation Settings */}
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Generation Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Art Style</Label>
                      <Select value={generationSettings.style} onValueChange={(value) => 
                        setGenerationSettings(prev => ({ ...prev, style: value }))
                      }>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anime">Classic Anime</SelectItem>
                          <SelectItem value="realistic">Semi-Realistic</SelectItem>
                          <SelectItem value="chibi">Chibi Style</SelectItem>
                          <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300">Character Pose</Label>
                      <Select value={generationSettings.pose} onValueChange={(value) => 
                        setGenerationSettings(prev => ({ ...prev, pose: value }))
                      }>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standing">Standing Pose</SelectItem>
                          <SelectItem value="action">Action Pose</SelectItem>
                          <SelectItem value="sitting">Sitting Pose</SelectItem>
                          <SelectItem value="portrait">Portrait Shot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300">Background Setting</Label>
                      <Select value={generationSettings.background} onValueChange={(value) => 
                        setGenerationSettings(prev => ({ ...prev, background: value }))
                      }>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transparent">Transparent</SelectItem>
                          <SelectItem value="city">City Scene</SelectItem>
                          <SelectItem value="nature">Natural Setting</SelectItem>
                          <SelectItem value="abstract">Abstract Pattern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-2 block">Images per Character: {generationSettings.imagesPerCharacter}</Label>
                      <Slider
                        value={[generationSettings.imagesPerCharacter]}
                        onValueChange={([value]) => 
                          setGenerationSettings(prev => ({ ...prev, imagesPerCharacter: value }))
                        }
                        min={1}
                        max={6}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-2 block">Quality: {generationSettings.quality} steps</Label>
                      <Slider
                        value={[generationSettings.quality]}
                        onValueChange={([value]) => 
                          setGenerationSettings(prev => ({ ...prev, quality: value }))
                        }
                        min={10}
                        max={50}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Cost Estimate</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Characters:</span>
                      <span className="text-white">{selectedCharacters.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Images each:</span>
                      <span className="text-white">{generationSettings.imagesPerCharacter}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total images:</span>
                      <span className="text-white">{totalImages}</span>
                    </div>
                    <hr className="border-slate-600" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Credits needed:</span>
                      <span className="text-amber-400">{estimatedCredits}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleGeneratePack}
                    disabled={generatePackMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 mt-4"
                  >
                    {generatePackMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-magic mr-2"></i>
                    )}
                    Generate Character Pack
                  </Button>

                  <Button 
                    onClick={() => setViewState('selection')}
                    variant="outline"
                    className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Selection
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Generation Progress */}
        {viewState === 'generating' && currentPackId && (
          <GenerationProgress
            packId={currentPackId}
            characters={selectedCharacters}
            onComplete={handleGenerationComplete}
          />
        )}

        {/* Results Gallery */}
        {viewState === 'results' && currentPackId && (
          <ResultsGallery
            packId={currentPackId}
            onGenerateNew={handleGenerateNew}
          />
        )}

        {/* User Gallery */}
        {viewState === 'gallery' && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">Your Character Packs</h2>
                <p className="text-slate-400 mt-2">Browse and manage your generated character collections</p>
              </div>
              <Button 
                onClick={() => setViewState('selection')}
                className="bg-primary hover:bg-primary/80"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create New Pack
              </Button>
            </div>

            {isLoadingPacks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-slate-600 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userPacks.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 text-center py-12">
                <CardContent>
                  <Image className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Character Packs Yet</h3>
                  <p className="text-slate-400 mb-6">Create your first AI-generated character pack to get started!</p>
                  <Button 
                    onClick={() => setViewState('selection')}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate First Pack
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPacks.map((pack: any) => (
                  <Card key={pack.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white truncate">{pack.name}</CardTitle>
                        <Badge 
                          variant={pack.status === 'completed' ? 'default' : pack.status === 'generating' ? 'secondary' : 'destructive'}
                          className="capitalize"
                        >
                          {pack.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400">
                        {pack.characters.length} characters • {pack.settings?.imagesPerCharacter || 4} images each
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {pack.characters.slice(0, 3).map((char: string) => (
                          <Badge key={char} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {char}
                          </Badge>
                        ))}
                        {pack.characters.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                            +{pack.characters.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(pack.createdAt))} ago</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{pack.status}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => {
                          setCurrentPackId(pack.id);
                          setViewState('results');
                        }}
                        variant="outline"
                        className="w-full border-slate-600 hover:bg-slate-700"
                        disabled={pack.status !== 'completed'}
                      >
                        {pack.status === 'completed' ? 'View Results' : 'Processing...'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110"
          onClick={() => {
            toast({
              title: "Help",
              description: "Select characters, customize options, then generate your pack!",
            });
          }}
        >
          <i className="fas fa-question text-xl"></i>
        </Button>
      </div>
    </div>
  );
}
