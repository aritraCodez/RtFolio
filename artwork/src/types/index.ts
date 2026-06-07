export interface CaptionStyle {
  font: string;
  color: string;
  alignment: "left" | "center" | "right";
  size: "sm" | "md" | "lg";
  customSize?: number;
  highlightColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface Caption {
  artistName: string;
  area: string;
  dimensions: string;
  medium: string;
  year: string;
  customLine?: string;
}

export interface ElementLayout {
  x: number; // percentage of A4 width (0 - 100)
  y: number; // percentage of A4 height (0 - 100)
  w: number; // width percentage (0 - 100)
  h?: number; // height percentage (0 - 100)
}

export interface ImageItem {
  id: string;
  file: File;
  url: string;
  width?: number;
  height?: number;
  caption: Caption;
  captionStyle: CaptionStyle;
  customLineStyle?: CaptionStyle;
  captionPosition?: "header" | "footer";
  captionLayout?: ElementLayout;
  customLineLayout?: ElementLayout;
  imageLayout?: ElementLayout;
  hideCaption?: boolean;
  hideCustomLine?: boolean;
}

export interface Artwork {
  id: string;
  images: ImageItem[];
  biography: string;
  order: number;
  imageLayout?: ElementLayout;
  bioLayout?: ElementLayout;
  customPageHeight?: number;
}

export interface PortfolioSettings {
  portfolioTitle: string;
  artistGlobalBio: string;
  pageLayout: "single" | "grid-2";
  showBioAfterEachPhoto: boolean;
  coverImage?: string;
  // Page header / contact info
  headerArtistName?: string;
  headerEmail?: string;
  headerPhone?: string;
  headerWebsite?: string;
  headerLocation?: string;
  showPageHeader?: boolean;
  // Header styling
  headerFont?: string;
  headerSize?: "sm" | "md" | "lg";
  headerAlignment?: "left" | "center" | "right";
  headerColor?: string;
  headerHighlightColor?: string;
  headerBold?: boolean;
  headerItalic?: boolean;
  headerUnderline?: boolean;
}

export interface ArtworkContextType {
  artworks: Artwork[];
  settings: PortfolioSettings;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  addArtwork: (files: File[]) => void;
  removeArtwork: (id: string) => void;
  updateArtwork: (id: string, partial: Partial<Artwork>) => void;
  reorderArtworks: (from: number, to: number) => void;
  updateSettings: (partial: Partial<PortfolioSettings>) => void;
  addImagesToArtwork: (artworkId: string, files: File[]) => void;
  removeImageFromArtwork: (artworkId: string, imageId: string) => void;
  reorderImagesInArtwork: (
    artworkId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
}
