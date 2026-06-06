import { useContext } from "react";
import { ArtworksContext } from "./ArtworksContext";
import type { ArtworkContextType } from "../types";

export function useArtworks(): ArtworkContextType {
  const context = useContext(ArtworksContext);
  if (!context) {
    throw new Error("useArtworks must be used within ArtworksProvider");
  }
  return context;
}
