import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import type { Artwork, Caption, CaptionStyle } from "../types";

const FONT_OPTIONS = [
  { value: "cormorant" as const, label: "Cormorant Garamond" },
  { value: "eb-garamond" as const, label: "EB Garamond" },
  { value: "playfair" as const, label: "Playfair Display" },
  { value: "lora" as const, label: "Lora" },
  { value: "cinzel" as const, label: "Cinzel" },
  { value: "dm-sans" as const, label: "DM Sans" },
  { value: "inter" as const, label: "Inter" },
  { value: "montserrat" as const, label: "Montserrat" },
  { value: "outfit" as const, label: "Outfit" },
  { value: "roboto" as const, label: "Roboto" },
  { value: "mono" as const, label: "Monospace" },
];

const COLOR_SWATCHES = ["#1C1917", "#A0522D", "#B8860B", "#475569", "#FAF7F2"];

const SIZE_OPTIONS = [
  { value: "sm" as const, label: "Small" },
  { value: "md" as const, label: "Medium" },
  { value: "lg" as const, label: "Large" },
];

interface CaptionEditorProps {
  artwork: Artwork;
  onUpdate: (partial: Partial<Artwork>) => void;
  selectedImageId?: string | null;
}

export function CaptionEditor({
  artwork,
  onUpdate,
  selectedImageId,
}: CaptionEditorProps) {
  const [isGlobalStyle, setIsGlobalStyle] = useState(false);

  const activeImage =
    artwork.images.find((img) => img.id === selectedImageId) ||
    artwork.images[0];

  if (!activeImage) {
    return (
      <div className="flex flex-col gap-2 p-4 border border-dashed border-border-warm rounded-lg text-center text-muted-foreground">
        No images found for this artwork.
      </div>
    );
  }

  const updateCaption = (key: keyof Caption, value: string) => {
    const updatedImages = artwork.images.map((img) =>
      img.id === activeImage.id
        ? { ...img, caption: { ...img.caption, [key]: value } }
        : img
    );
    onUpdate({ images: updatedImages });
  };

  const handleGlobalToggle = (checked: boolean) => {
    setIsGlobalStyle(checked);
    if (checked && activeImage) {
      const updatedImages = artwork.images.map((img) => ({
        ...img,
        captionStyle: { ...activeImage.captionStyle },
      }));
      onUpdate({ images: updatedImages });
    }
  };

  const updateStyle = (key: keyof CaptionStyle, value: string) => {
    const updatedImages = artwork.images.map((img) =>
      isGlobalStyle || img.id === activeImage.id
        ? { ...img, captionStyle: { ...img.captionStyle, [key]: value } as CaptionStyle }
        : img
    );
    onUpdate({ images: updatedImages });
  };

  const getFontFamily = (font: string) => {
    switch (font) {
      case "cormorant":
        return "'Cormorant Garamond', serif";
      case "eb-garamond":
        return "'EB Garamond', serif";
      case "playfair":
        return "'Playfair Display', serif";
      case "lora":
        return "'Lora', serif";
      case "cinzel":
        return "'Cinzel', serif";
      case "dm-sans":
        return "'DM Sans', sans-serif";
      case "inter":
        return "'Inter', sans-serif";
      case "montserrat":
        return "'Montserrat', sans-serif";
      case "outfit":
        return "'Outfit', sans-serif";
      case "roboto":
        return "'Roboto', sans-serif";
      case "mono":
        return "monospace";
      default:
        return "'Cormorant Garamond', serif";
    }
  };

  const getFontSize = (size: string) => {
    switch (size) {
      case "sm":
        return "13px";
      case "md":
        return "15px";
      case "lg":
        return "18px";
      default:
        return "15px";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-display text-lg font-semibold text-foreground m-0">Caption & Metadata</h3>

      <div className="flex flex-col gap-2">
        <Label htmlFor="artistName">Artist Name</Label>
        <Input
          id="artistName"
          value={activeImage.caption.artistName}
          onChange={(e) => updateCaption("artistName", e.target.value)}
          placeholder="Your name"
          className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="area">Area</Label>
        <Input
          id="area"
          value={activeImage.caption.area}
          onChange={(e) => updateCaption("area", e.target.value)}
          placeholder="Inner Space"
          className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={activeImage.caption.dimensions}
            onChange={(e) => updateCaption("dimensions", e.target.value)}
            placeholder="e.g. 4' / 4'"
            className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={activeImage.caption.year}
            onChange={(e) => updateCaption("year", e.target.value)}
            placeholder="Art of the year (example: 2026)"
            className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="medium">Medium</Label>
        <Input
          id="medium"
          value={activeImage.caption.medium}
          onChange={(e) => updateCaption("medium", e.target.value)}
          placeholder="e.g. Mixed media on canvas"
          className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="customLine">Custom Line (Optional)</Label>
        <Input
          id="customLine"
          value={activeImage.caption.customLine || ""}
          onChange={(e) => updateCaption("customLine", e.target.value)}
          placeholder="Additional info"
          className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
        />
      </div>

      {/* Caption Preview */}
      <div className="p-4 bg-surface-card border border-border-warm rounded-lg">
        <p className="text-xs text-muted-foreground m-0 mb-2 uppercase tracking-[0.5px] font-semibold">Live Caption Preview</p>
        <p
          className="m-0 leading-relaxed wrap-break-words"
          style={{
            fontFamily: getFontFamily(activeImage.captionStyle.font),
            fontSize: getFontSize(activeImage.captionStyle.size),
            color: activeImage.captionStyle.color,
            textAlign: activeImage.captionStyle.alignment as any,
          }}
        >
          <strong>{activeImage.caption.artistName}</strong>
          {activeImage.caption.artistName && ", "}
          {activeImage.caption.dimensions}
          {activeImage.caption.dimensions && ", "}
          {activeImage.caption.medium}
          {activeImage.caption.medium && ", "}
          {activeImage.caption.year}
          {activeImage.caption.customLine && (
            <>
              <br />
              {activeImage.caption.customLine}
            </>
          )}
        </p>
      </div>

      <hr className="border-t border-border-warm my-0 w-full" />
      <div className="flex flex-col gap-1.5">
        <h4 className="font-body text-[13px] font-semibold text-muted-foreground m-0 uppercase tracking-[0.5px]">Caption Styling</h4>
        <div className="flex items-center gap-2 mt-0.5 py-0.5">
          <input
            type="checkbox"
            id="globalStyling"
            checked={isGlobalStyle}
            onChange={(e) => handleGlobalToggle(e.target.checked)}
            className="rounded border-border-warm text-sienna focus:ring-sienna/20 h-4 w-4 cursor-pointer accent-sienna"
          />
          <Label htmlFor="globalStyling" className="cursor-pointer text-xs text-muted-foreground select-none font-medium">
            Make style adjustments global (apply to all images for Font,Size,Alignment,Color)
          </Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Font</Label>
        <div className="relative">
          <select
            value={activeImage.captionStyle.font}
            onChange={(e) => updateStyle("font", e.target.value)}
            className="w-full h-10 border border-border-warm rounded-md bg-background text-foreground text-sm font-body px-3 py-2 pr-10 appearance-none cursor-pointer focus:outline-none focus:border-sienna focus:ring-2 focus:ring-sienna/10 transition-colors"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-sienna" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Size</Label>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`px-3 py-2 border rounded-md text-[13px] font-body cursor-pointer transition-all duration-200 ${activeImage.captionStyle.size === opt.value
                  ? "bg-sienna text-white border-sienna"
                  : "bg-background text-foreground border-border-warm hover:border-sienna"
                }`}
              onClick={() => updateStyle("size", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Alignment</Label>
        <ToggleGroup
          value={activeImage.captionStyle.alignment}
          onValueChange={(value) => {
            if (value) updateStyle("alignment", value);
          }}
          type="single"
          variant="outline"
          spacing={0}
          className="flex w-fit flex-row items-center rounded-lg"
        >
          <ToggleGroupItem value="left" aria-label="Align left" className="cursor-pointer">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center" className="cursor-pointer">
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right" className="cursor-pointer">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap items-center">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-9 h-9 rounded-md border-2 border-transparent cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${activeImage.captionStyle.color === color
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : ""
                }`}
              style={{ backgroundColor: color }}
              onClick={() => updateStyle("color", color)}
              title={color}
            />
          ))}
          <input
            type="color"
            value={activeImage.captionStyle.color}
            onChange={(e) => updateStyle("color", e.target.value)}
            className="w-9 h-9 border-2 border-border-warm rounded-md cursor-pointer bg-transparent p-0 overflow-hidden"
            title="Custom color"
          />
        </div>
      </div>
    </div>
  );
}
