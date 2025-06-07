export interface Character {
  id: string;
  name: string;
  category: 'anime' | 'games' | 'movies';
  description: string;
  imageUrl: string;
  basePrompt: string;
}

export const characters: Character[] = [
  // Anime Characters
  {
    id: 'naruto',
    name: 'Naruto',
    category: 'anime',
    description: 'Ninja Hero with orange outfit',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'orange ninja outfit, spiky blonde hair, determined expression, dynamic action pose'
  },
  {
    id: 'goku',
    name: 'Goku',
    category: 'anime',
    description: 'Saiyan Warrior with spiky hair',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'spiky black hair, orange martial arts gi, muscular build, energy aura, fighting stance'
  },
  {
    id: 'luffy',
    name: 'Luffy',
    category: 'anime',
    description: 'Pirate Captain with straw hat',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'straw hat, red vest, cheerful smile, rubber powers, pirate captain pose'
  },
  {
    id: 'sasuke',
    name: 'Sasuke',
    category: 'anime',
    description: 'Rival Ninja with dark clothing',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'dark ninja outfit, black hair, serious expression, lightning chakra effects'
  },
  {
    id: 'todoroki',
    name: 'Todoroki',
    category: 'anime',
    description: 'Ice Fire Hero with split hair',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'split red and white hair, dual-colored eyes, ice and fire powers'
  },
  {
    id: 'tanjiro',
    name: 'Tanjiro',
    category: 'anime',
    description: 'Demon Slayer with checkered pattern',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'checkered haori, gentle expression, katana sword, demon slayer'
  },
  
  // Game Characters
  {
    id: 'mario',
    name: 'Mario',
    category: 'games',
    description: 'Super Plumber with red cap',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'red cap with M logo, blue overalls, mustache, cheerful jumping pose'
  },
  {
    id: 'link',
    name: 'Link',
    category: 'games',
    description: 'Hyrule Hero in green tunic',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'green tunic, pointed ears, master sword, hylian shield, heroic stance'
  },
  {
    id: 'masterchief',
    name: 'Master Chief',
    category: 'games',
    description: 'Spartan Soldier in green armor',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'green MJOLNIR armor, helmet visor, military stance, futuristic weapons'
  },
  {
    id: 'lara',
    name: 'Lara Croft',
    category: 'games',
    description: 'Tomb Raider with explorer outfit',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'explorer outfit, brown hair, twin pistols, adventure archaeologist'
  },
  {
    id: 'sonic',
    name: 'Sonic',
    category: 'games',
    description: 'Blue Speedster with red shoes',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'blue hedgehog, spiky quills, red sneakers, speed effects, running pose'
  },
  {
    id: 'kratos',
    name: 'Kratos',
    category: 'games',
    description: 'God of War with dual axes',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'bald head, red markings, muscular build, dual axes, warrior stance'
  },

  // Movie Characters
  {
    id: 'ironman',
    name: 'Iron Man',
    category: 'movies',
    description: 'Armored Avenger with arc reactor',
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'red and gold armor, arc reactor, repulsors, high-tech suit, flying pose'
  },
  {
    id: 'batman',
    name: 'Batman',
    category: 'movies',
    description: 'Dark Knight with cape and cowl',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'black cape, cowl mask, bat symbol, dark armor, brooding pose on rooftop'
  },
  {
    id: 'wonderwoman',
    name: 'Wonder Woman',
    category: 'movies',
    description: 'Amazon Warrior with golden tiara',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'golden tiara, red and blue outfit, lasso of truth, warrior stance'
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    category: 'movies',
    description: 'Wall Crawler with web pattern',
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    basePrompt: 'red and blue suit, web pattern, web-slinging pose, dynamic movement'
  }
];

export const getCharactersByCategory = (category: 'anime' | 'games' | 'movies') => {
  return characters.filter(char => char.category === category);
};

export const getCharacterById = (id: string) => {
  return characters.find(char => char.id === id);
};
