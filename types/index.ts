export interface PokemonCardDef {
  value: string;
  label: string;
  name: string;
  id: number;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  isAdmin: boolean;
  vote: string | null;
}

export interface CurrentStory {
  name: string;
  revealed: boolean;
  votes: Record<string, string>;
}

export interface SavedStory {
  name: string;
  votes: Record<string, string>;
  average: string | null;
  savedAt: string;
}

export interface RoomState {
  id: string;
  name: string;
  createdAt: string;
  players: Player[];
  currentStory: CurrentStory | null;
  stories: SavedStory[];
}
