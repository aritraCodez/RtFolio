import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { ChevronDown, Bold, Italic, Underline } from "lucide-react";
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
const HIGHLIGHT_SWATCHES = ["", "#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8", "#FED7AA"];

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
  const [styleTarget, setStyleTarget] = useState<"caption" | "customLine">("caption");

  const activeImage =
    artwork.images.find((img) => img.id === selectedImageId) ||
    artwork.images[0];

  const activeStyle = activeImage
    ? (styleTarget === "caption"
        ? activeImage.captionStyle
        : (activeImage.customLineStyle ?? activeImage.captionStyle))
    : {
        font: "cormorant",
        color: "#1C1917",
        alignment: "left" as const,
        size: "md" as const,
        highlightColor: "",
        bold: false,
        italic: false,
        underline: false,
      };

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

  const updateCaptionPosition = (position: "header" | "footer") => {
    const updatedImages = artwork.images.map((img) =>
      img.id === activeImage.id
        ? { ...img, captionPosition: position, captionLayout: undefined }
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
        customLineStyle: activeImage.customLineStyle ? { ...activeImage.customLineStyle } : undefined,
      }));
      onUpdate({ images: updatedImages });
    }
  };

  const updateStyle = (key: keyof CaptionStyle, value: any) => {
    const styleKey = styleTarget === "caption" ? "captionStyle" : "customLineStyle";
    const updatedImages = artwork.images.map((img) => {
      const currentStyle = img[styleKey] ?? img.captionStyle;
      return isGlobalStyle || img.id === activeImage.id
        ? { ...img, [styleKey]: { ...currentStyle, [key]: value } as CaptionStyle }
        : img;
    });
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

  const captionPosition = activeImage.captionPosition ?? "footer";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="font-display text-lg font-semibold text-foreground m-0">Caption & Metadata</h3>
          {activeImage.captionLayout && (
            <button
              type="button"
              onClick={() => {
                const updatedImages = artwork.images.map((img) =>
                  img.id === activeImage.id
                    ? { ...img, captionLayout: undefined }
                    : img
                );
                onUpdate({ images: updatedImages });
              }}
              className="text-[11px] text-sienna hover:underline font-medium cursor-pointer text-left w-fit mt-0.5"
            >
              Reset Caption Position
            </button>
          )}
        </div>
        {/* Caption Position toggle */}
        <div className="flex items-center gap-1 bg-surface-card border border-border-warm rounded-lg p-[3px]">
          <button
            type="button"
            onClick={() => updateCaptionPosition("header")}
            className={`px-3 py-1 rounded-md text-[12px] font-medium font-body transition-all duration-200 cursor-pointer ${
              captionPosition === "header"
                ? "bg-sienna text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Header
          </button>
          <button
            type="button"
            onClick={() => updateCaptionPosition("footer")}
            className={`px-3 py-1 rounded-md text-[12px] font-medium font-body transition-all duration-200 cursor-pointer ${
              captionPosition === "footer"
                ? "bg-sienna text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Footer
          </button>
        </div>
      </div>

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
        <div className="flex items-center justify-between">
          <Label htmlFor="customLine">Custom Line (Optional)</Label>
          {activeImage.customLineLayout && (
            <button
              type="button"
              onClick={() => {
                const updatedImages = artwork.images.map((img) =>
                  img.id === activeImage.id
                    ? { ...img, customLineLayout: undefined }
                    : img
                );
                onUpdate({ images: updatedImages });
              }}
              className="text-xs text-sienna hover:underline font-medium cursor-pointer"
            >
              Reset Position
            </button>
          )}
        </div>
        <Input
          id="customLine"
          value={activeImage.caption.customLine || ""}
          onChange={(e) => updateCaption("customLine", e.target.value)}
          placeholder="Additional info"
          className="bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-10 px-3 py-2"
        />
        {activeImage.customLineLayout && (
          <p className="text-[11px] text-muted-foreground m-0 -mt-1 italic">
            Custom line is positioned independently. Drag it to reposition.
          </p>
        )}
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
            backgroundColor: activeImage.captionStyle.highlightColor || "transparent",
            fontWeight: activeImage.captionStyle.bold ? "bold" : "normal",
            fontStyle: activeImage.captionStyle.italic ? "italic" : "normal",
            textDecoration: activeImage.captionStyle.underline ? "underline" : "none",
            textAlign: activeImage.captionStyle.alignment as any,
            padding: activeImage.captionStyle.highlightColor ? "4px 8px" : "0",
            borderRadius: activeImage.captionStyle.highlightColor ? "4px" : "0",
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
              <span
                style={{
                  fontFamily: getFontFamily((activeImage.customLineStyle ?? activeImage.captionStyle).font),
                  fontSize: getFontSize((activeImage.customLineStyle ?? activeImage.captionStyle).size),
                  color: (activeImage.customLineStyle ?? activeImage.captionStyle).color,
                  backgroundColor: (activeImage.customLineStyle ?? activeImage.captionStyle).highlightColor || "transparent",
                  fontWeight: (activeImage.customLineStyle ?? activeImage.captionStyle).bold ? "bold" : "normal",
                  fontStyle: (activeImage.customLineStyle ?? activeImage.captionStyle).italic ? "italic" : "normal",
                  textDecoration: (activeImage.customLineStyle ?? activeImage.captionStyle).underline ? "underline" : "none",
                  padding: (activeImage.customLineStyle ?? activeImage.captionStyle).highlightColor ? "2px 6px" : "0",
                  borderRadius: (activeImage.customLineStyle ?? activeImage.captionStyle).highlightColor ? "3px" : "0",
                  display: "inline-block",
                  marginTop: "4px",
                }}
              >
                {activeImage.caption.customLine}
              </span>
            </>
          )}
        </p>
      </div>

      <hr className="border-t border-border-warm my-0 w-full" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-body text-[13px] font-semibold text-muted-foreground m-0 uppercase tracking-[0.5px]">Caption Styling</h4>
          <div className="flex items-center gap-1 bg-surface-card border border-border-warm rounded-lg p-[3px]">
            <button
              type="button"
              onClick={() => setStyleTarget("caption")}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium font-body transition-all duration-200 cursor-pointer ${
                styleTarget === "caption"
                  ? "bg-sienna text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Main
            </button>
            <button
              type="button"
              onClick={() => setStyleTarget("customLine")}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium font-body transition-all duration-200 cursor-pointer ${
                styleTarget === "customLine"
                  ? "bg-sienna text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Line
            </button>
          </div>
        </div>
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
            value={activeStyle.font}
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
              className={`px-3 py-2 border rounded-md text-[13px] font-body cursor-pointer transition-all duration-200 ${
                activeStyle.size === opt.value
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
          value={activeStyle.alignment}
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
        <Label>Text Formatting</Label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`w-10 h-10 border rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 ${
              activeStyle.bold
                ? "bg-sienna text-white border-sienna shadow-sm"
                : "bg-background text-foreground border-border-warm hover:border-sienna"
            }`}
            onClick={() => updateStyle("bold", !activeStyle.bold)}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={`w-10 h-10 border rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 ${
              activeStyle.italic
                ? "bg-sienna text-white border-sienna shadow-sm"
                : "bg-background text-foreground border-border-warm hover:border-sienna"
            }`}
            onClick={() => updateStyle("italic", !activeStyle.italic)}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={`w-10 h-10 border rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 ${
              activeStyle.underline
                ? "bg-sienna text-white border-sienna shadow-sm"
                : "bg-background text-foreground border-border-warm hover:border-sienna"
            }`}
            onClick={() => updateStyle("underline", !activeStyle.underline)}
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap items-center">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-9 h-9 rounded-md border-2 border-transparent cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${
                activeStyle.color === color
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
            value={activeStyle.color}
            onChange={(e) => updateStyle("color", e.target.value)}
            className="w-9 h-9 border-2 border-border-warm rounded-md cursor-pointer bg-transparent p-0 overflow-hidden"
            title="Custom color"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Highlight Color</Label>
        <div className="flex gap-2 flex-wrap items-center">
          {HIGHLIGHT_SWATCHES.map((color) => (
            <button
              key={color || "none"}
              type="button"
              className={`w-9 h-9 rounded-md border border-neutral-200 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 flex items-center justify-center relative overflow-hidden ${
                (activeStyle.highlightColor || "") === color
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : ""
              }`}
              style={{ backgroundColor: color || "transparent" }}
              onClick={() => updateStyle("highlightColor", color)}
              title={color ? `Highlight ${color}` : "No Highlight"}
            >
              {!color && (
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">None</span>
              )}
            </button>
          ))}
          <input
            type="color"
            value={activeStyle.highlightColor || "#FEF08A"}
            onChange={(e) => updateStyle("highlightColor", e.target.value)}
            className="w-9 h-9 border-2 border-border-warm rounded-md cursor-pointer bg-transparent p-0 overflow-hidden"
            title="Custom highlight color"
          />
        </div>
      </div>
    </div>
  );
}
