import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Mail, Phone, Globe, MapPin, User, ChevronDown } from "lucide-react";
import type { PortfolioSettings } from "@/types";

interface HeaderEditorProps {
  settings: PortfolioSettings;
  onUpdate: (partial: Partial<PortfolioSettings>) => void;
}

const FONT_OPTIONS = [
  { value: "cormorant", label: "Cormorant Garamond" },
  { value: "eb-garamond", label: "EB Garamond" },
  { value: "playfair", label: "Playfair Display" },
  { value: "lora", label: "Lora" },
  { value: "cinzel", label: "Cinzel" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "inter", label: "Inter" },
  { value: "montserrat", label: "Montserrat" },
  { value: "outfit", label: "Outfit" },
  { value: "roboto", label: "Roboto" },
  { value: "mono", label: "Monospace" },
];

const SIZE_OPTIONS = [
  { value: "sm" as const, label: "Small" },
  { value: "md" as const, label: "Medium" },
  { value: "lg" as const, label: "Large" },
];

const COLOR_SWATCHES = ["#1C1917", "#A0522D", "#B8860B", "#475569", "#FAF7F2"];

const inputCls =
  "bg-background border-border-warm text-foreground hover:border-sienna transition-all duration-200 focus-visible:ring-sienna/10 focus-visible:border-sienna h-9 px-3 py-2 pl-8 text-sm";

export function HeaderEditor({ settings, onUpdate }: HeaderEditorProps) {
  const show = settings.showPageHeader ?? false;
  const font = settings.headerFont ?? "cormorant";
  const size = settings.headerSize ?? "md";
  const alignment = settings.headerAlignment ?? "left";
  const color = settings.headerColor ?? "#1C1917";

  return (
    <div className="flex flex-col gap-5">
      {/* Section heading + Show/Hide toggle */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-foreground m-0">
          Page Header
        </h3>
        <div className="flex items-center gap-1 bg-surface-card border border-border-warm rounded-lg p-[3px]">
          <button
            type="button"
            onClick={() => onUpdate({ showPageHeader: true })}
            className={`px-3 py-1 rounded-md text-[12px] font-medium font-body transition-all duration-200 cursor-pointer ${show
                ? "bg-sienna text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Show
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ showPageHeader: false })}
            className={`px-3 py-1 rounded-md text-[12px] font-medium font-body transition-all duration-200 cursor-pointer ${!show
                ? "bg-sienna text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Hide
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground m-0 -mt-3">
        Appears at the top of each page.
      </p>

      {/* Contact fields */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="h-artistName" className="text-xs">Artist Name</Label>
          <div className="relative">
            <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input id="h-artistName" value={settings.headerArtistName ?? ""} onChange={(e) => onUpdate({ headerArtistName: e.target.value })} placeholder="Your full name" className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="h-email" className="text-xs">Email</Label>
          <div className="relative">
            <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input id="h-email" type="email" value={settings.headerEmail ?? ""} onChange={(e) => onUpdate({ headerEmail: e.target.value })} placeholder="your@email.com" className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="h-phone" className="text-xs">Phone</Label>
          <div className="relative">
            <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input id="h-phone" type="tel" value={settings.headerPhone ?? ""} onChange={(e) => onUpdate({ headerPhone: e.target.value })} placeholder="+91 98765 43210" className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="h-website" className="text-xs">Website</Label>
          <div className="relative">
            <Globe size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input id="h-website" value={settings.headerWebsite ?? ""} onChange={(e) => onUpdate({ headerWebsite: e.target.value })} placeholder="www.yoursite.com" className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="h-location" className="text-xs">Location</Label>
          <div className="relative">
            <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input id="h-location" value={settings.headerLocation ?? ""} onChange={(e) => onUpdate({ headerLocation: e.target.value })} placeholder="City, Country" className={inputCls} />
          </div>
        </div>
      </div>

      <hr className="border-t border-border-warm my-0 w-full" />

      {/* Styling section */}
      <div className="flex flex-col gap-1.5">
        <h4 className="font-body text-[13px] font-semibold text-muted-foreground m-0 uppercase tracking-[0.5px]">
          Header Styling
        </h4>
      </div>

      {/* Font */}
      <div className="flex flex-col gap-2">
        <Label>Font</Label>
        <div className="relative">
          <select
            value={font}
            onChange={(e) => onUpdate({ headerFont: e.target.value })}
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

      {/* Size */}
      <div className="flex flex-col gap-2">
        <Label>Size</Label>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`px-3 py-2 border rounded-md text-[13px] font-body cursor-pointer transition-all duration-200 ${size === opt.value
                  ? "bg-sienna text-white border-sienna"
                  : "bg-background text-foreground border-border-warm hover:border-sienna"
                }`}
              onClick={() => onUpdate({ headerSize: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div className="flex flex-col gap-2">
        <Label>Alignment</Label>
        <ToggleGroup
          value={alignment}
          onValueChange={(value) => {
            if (value) onUpdate({ headerAlignment: value as "left" | "center" | "right" });
          }}
          type="single"
          variant="outline"
          spacing={0}
          className="flex w-fit flex-row items-center rounded-lg"
        >
          <ToggleGroupItem value="left" aria-label="Align left" className="cursor-pointer">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center" className="cursor-pointer">Center</ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right" className="cursor-pointer">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap items-center">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-9 h-9 rounded-md border-2 border-transparent cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                }`}
              style={{ backgroundColor: c }}
              onClick={() => onUpdate({ headerColor: c })}
              title={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => onUpdate({ headerColor: e.target.value })}
            className="w-9 h-9 border-2 border-border-warm rounded-md cursor-pointer bg-transparent p-0 overflow-hidden"
            title="Custom color"
          />
        </div>
      </div>


    </div>
  );
}
