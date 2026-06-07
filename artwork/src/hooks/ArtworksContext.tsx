import React, { createContext, useState, useCallback, useEffect } from "react";
import type { Artwork, PortfolioSettings, ArtworkContextType, ImageItem } from "../types";
import { clearDB, getArtworks, saveAllArtworks, getSettings, saveSettings } from "../lib/indexdb";

export const ArtworksContext = createContext<ArtworkContextType | undefined>(
  undefined,
);

const DEFAULT_SETTINGS: PortfolioSettings = {
  portfolioTitle: "My Portfolio",
  artistGlobalBio: "",
  pageLayout: "single",
  showBioAfterEachPhoto: false,
  headerFont: "cormorant",
  headerSize: "md",
  headerAlignment: "left",
  headerColor: "#1C1917",
  headerHighlightColor: "",
  headerBold: false,
  headerItalic: false,
  headerUnderline: false,
};

function createImageItem(file: File): ImageItem {
  return {
    id: Math.random().toString(36).substr(2, 9),
    file,
    url: URL.createObjectURL(file),
    caption: {
      artistName: "",
      area: "",
      dimensions: "",
      medium: "",
      year: "",
      customLine: "",
    },
    captionStyle: {
      font: "cormorant",
      color: "#1C1917",
      alignment: "left",
      size: "md",
      highlightColor: "",
      bold: false,
      italic: false,
      underline: false,
    },
  };
}

export function ArtworksProvider({ children }: { children: React.ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [settings, setSettings] = useState<PortfolioSettings>(DEFAULT_SETTINGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore session from IndexedDB or clear on new session
  useEffect(() => {
    async function init() {
      try {
        const isSessionActive = sessionStorage.getItem("rtfolio_session_active");
        if (!isSessionActive) {
          // Fresh tab session: clean slate
          await clearDB();
          sessionStorage.setItem("rtfolio_session_active", "true");
          setIsLoaded(true);
        } else {
          // Existing session: restore persisted artworks and settings
          const dbArtworks = await getArtworks();
          const dbSettings = await getSettings();
          
          if (dbArtworks && dbArtworks.length > 0) {
            // Recreate active Blob URLs for the stored Files
            const processedArtworks = dbArtworks.map((artwork) => ({
              ...artwork,
              images: artwork.images.map((img) => ({
                ...img,
                url: URL.createObjectURL(img.file),
              })),
            }));
            setArtworks(processedArtworks);
            setSelectedId(processedArtworks[0].id);
          }
          
          if (dbSettings) {
            setSettings(dbSettings);
          }
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to restore IndexedDB session data:", err);
        setIsLoaded(true);
      }
    }
    init();
  }, []);

  // Sync state changes to IndexedDB
  useEffect(() => {
    if (!isLoaded) return;
    saveAllArtworks(artworks).catch((err) =>
      console.error("Failed to save artworks to database:", err)
    );
  }, [artworks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveSettings(settings).catch((err) =>
      console.error("Failed to save settings to database:", err)
    );
  }, [settings, isLoaded]);

  const addArtwork = useCallback(
    (files: File[]) => {
      const id = Math.random().toString(36).substr(2, 9);
      const images = files.map(createImageItem);
      const newArtwork: Artwork = {
        id,
        images,
        biography: "",
        order: artworks.length,
      };
      setArtworks((prev) => [...prev, newArtwork]);
      setSelectedId(id);
    },
    [artworks.length],
  );

  const removeArtwork = useCallback(
    (id: string) => {
      setArtworks((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        return filtered.map((a, idx) => ({ ...a, order: idx }));
      });
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId],
  );

  const updateArtwork = useCallback((id: string, partial: Partial<Artwork>) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...partial } : a)),
    );
  }, []);

  const reorderArtworks = useCallback((from: number, to: number) => {
    setArtworks((prev) => {
      const newArr = [...prev];
      const [item] = newArr.splice(from, 1);
      newArr.splice(to, 0, item);
      return newArr.map((a, idx) => ({ ...a, order: idx }));
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<PortfolioSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const addImagesToArtwork = useCallback((artworkId: string, files: File[]) => {
    const newImages = files.map(createImageItem);
    setArtworks((prev) =>
      prev.map((a) =>
        a.id === artworkId
          ? { ...a, images: [...a.images, ...newImages] }
          : a,
      ),
    );
  }, []);

  const removeImageFromArtwork = useCallback((artworkId: string, imageId: string) => {
    setArtworks((prev) =>
      prev.map((a) => {
        if (a.id !== artworkId) return a;
        const filtered = a.images.filter((img) => img.id !== imageId);
        return { ...a, images: filtered };
      }),
    );
  }, []);

  const reorderImagesInArtwork = useCallback((artworkId: string, fromIndex: number, toIndex: number) => {
    setArtworks((prev) =>
      prev.map((a) => {
        if (a.id !== artworkId) return a;
        const newImages = [...a.images];
        const [item] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, item);
        return { ...a, images: newImages };
      }),
    );
  }, []);

  return (
    <ArtworksContext.Provider
      value={{
        artworks,
        settings,
        selectedId,
        setSelectedId,
        addArtwork,
        removeArtwork,
        updateArtwork,
        reorderArtworks,
        updateSettings,
        addImagesToArtwork,
        removeImageFromArtwork,
        reorderImagesInArtwork,
      }}
    >
      {children}
    </ArtworksContext.Provider>
  );
}
