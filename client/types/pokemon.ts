export type BaseField =
  | "id"
  | "sprite"
  | "name"
  | "types"
  | "hp"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed"
  | "generation"
  | "ability";

export type ColumnDataType = "text" | "number" | "boolean";

export type ColumnDefModel = {
  key: string;          // property name in row objects
  label: string;        // header label
  type: ColumnDataType; // coercion + editor
  isBase?: boolean;
  sticky?: "left" | "right";
  width?: number;
};

export type PokemonRow = {
  id: number;
  sprite: string;
  name: string;
  types: string;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  generation?: number;
  ability?: string;

  // dynamic columns (runtime)
  [key: string]: unknown;
};