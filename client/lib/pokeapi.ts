import type { PokemonRow } from "@/types/pokemon";

const API = "https://pokeapi.co/api/v2";

type ListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
};

type PokemonResponse = {
  id: number;
  name: string;
  sprites: { front_default: string | null };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
};

function statValue(p: PokemonResponse, statName: string) {
  return p.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0;
}

export async function fetchPokemonListPage(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`List fetch failed: ${res.status}`);
  return (await res.json()) as ListResponse;
}

export async function fetchPokemon(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Pokemon fetch failed: ${res.status}`);
  return (await res.json()) as PokemonResponse;
}

export function normalizePokemon(p: PokemonResponse): PokemonRow {
  const types = p.types.map((t) => t.type.name);
  return {
    id: p.id,
    sprite: p.sprites.front_default ?? "",
    name: p.name,
    types: types.length === 2 ? `${types[0]} / ${types[1]}` : (types[0] ?? ""),
    hp: statValue(p, "hp"),
    attack: statValue(p, "attack"),
    defense: statValue(p, "defense"),
    specialAttack: statValue(p, "special-attack"),
    specialDefense: statValue(p, "special-defense"),
    speed: statValue(p, "speed"),
    ability: p.abilities?.[0]?.ability?.name ?? "",
  };
}

export function getListUrl(offset: number, limit = 100) {
  return `${API}/pokemon?offset=${offset}&limit=${limit}`;
}