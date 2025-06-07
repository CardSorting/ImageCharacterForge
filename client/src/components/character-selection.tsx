import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { characters, getCharactersByCategory, type Character } from "@/lib/character-data";

interface CharacterSelectionProps {
  selectedCharacters: string[];
  onCharacterToggle: (characterId: string) => void;
  onStartGeneration: () => void;
}

export default function CharacterSelection({ 
  selectedCharacters, 
  onCharacterToggle, 
  onStartGeneration 
}: CharacterSelectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'anime' | 'games' | 'movies'>('all');

  const getDisplayCharacters = () => {
    if (activeCategory === 'all') return characters;
    return getCharactersByCategory(activeCategory);
  };

  const getCategoryColor = (category: Character['category']) => {
    switch (category) {
      case 'anime': return 'bg-red-500';
      case 'games': return 'bg-blue-500';
      case 'movies': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedCharactersList = characters.filter(char => 
    selectedCharacters.includes(char.id)
  );

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Choose Your Characters</h2>
          <p className="text-slate-400">Select popular characters to generate custom variations and create character packs</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-700 rounded-lg p-1">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className={activeCategory === 'all' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}
            >
              All
            </Button>
            <Button
              variant={activeCategory === 'anime' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('anime')}
              className={activeCategory === 'anime' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}
            >
              Anime
            </Button>
            <Button
              variant={activeCategory === 'games' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('games')}
              className={activeCategory === 'games' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}
            >
              Games
            </Button>
            <Button
              variant={activeCategory === 'movies' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('movies')}
              className={activeCategory === 'movies' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}
            >
              Movies
            </Button>
          </div>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {getDisplayCharacters().map((character) => {
          const isSelected = selectedCharacters.includes(character.id);
          
          return (
            <Card 
              key={character.id}
              className={`bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer group border-2 ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/30'
              }`}
              onClick={() => onCharacterToggle(character.id)}
            >
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <img 
                    src={character.imageUrl} 
                    alt={`${character.name} character reference`} 
                    className="w-full h-24 object-cover rounded-lg" 
                  />
                  <Badge 
                    className={`absolute top-2 right-2 ${getCategoryColor(character.category)} text-white text-xs`}
                  >
                    {character.category === 'games' ? 'Game' : character.category === 'movies' ? 'Movie' : 'Anime'}
                  </Badge>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all"></div>
                </div>
                <h3 className="font-semibold text-white text-sm">{character.name}</h3>
                <p className="text-xs text-slate-400">{character.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-emerald-400">Popular</span>
                  <i className={`fas ${isSelected ? 'fa-check text-primary' : 'fa-plus text-slate-400 opacity-0 group-hover:opacity-100'} transition-opacity`}></i>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Characters Bar */}
      {selectedCharacters.length > 0 && (
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold text-white">Selected Characters</h3>
                <Badge className="bg-primary text-white">
                  {selectedCharacters.length}
                </Badge>
              </div>
              <Button 
                onClick={onStartGeneration}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              >
                Start Generation <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </div>
            <div className="flex items-center space-x-3 mt-4 flex-wrap gap-2">
              {selectedCharactersList.map((character) => (
                <div 
                  key={character.id}
                  className="flex items-center space-x-2 bg-slate-700 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm text-white">{character.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCharacterToggle(character.id);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
