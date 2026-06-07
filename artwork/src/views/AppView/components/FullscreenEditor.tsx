import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { PreviewPanel } from "./PreviewPanel";
import type { Artwork, PortfolioSettings } from "@/types";

interface FullscreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  settings: PortfolioSettings;
  onUpdateArtwork: (id: string, partial: Partial<Artwork>) => void;
}

export function FullscreenEditor({
  isOpen,
  onClose,
  artworks,
  settings,
  onUpdateArtwork,
}: FullscreenEditorProps) {
  const [zoomScale, setZoomScale] = useState(1.0);

  // Reset zoom scale to 100% when the editor opens
  useEffect(() => {
    if (isOpen) {
      setZoomScale(1.0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2a2a2a] z-2000 flex flex-col animate-fade-in">
      {/* Top PDF-like Toolbar */}
      <div className="bg-[#1e1e1e] text-white border-b border-neutral-800 px-6 py-3 flex items-center justify-between z-50 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-semibold text-white m-0">Interactive A4 Page Editor</h1>
          <span className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 rounded-full font-body">
            Full-Scale Editing & Dragging
          </span>
        </div>

        {/* Zoom Controls */}
        <div id="tour-zoom-controls" className="flex items-center gap-2 bg-[#2d2d2d] px-2 py-1 rounded-md border border-neutral-700">
          <button
            onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
            className="w-7 h-7 flex items-center justify-center hover:bg-neutral-700 rounded text-neutral-300 font-bold transition-colors cursor-pointer text-sm"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-xs font-mono font-medium px-2 min-w-12.5 text-center text-neutral-300 select-none">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
            className="w-7 h-7 flex items-center justify-center hover:bg-neutral-700 rounded text-neutral-300 font-bold transition-colors cursor-pointer text-sm"
            title="Zoom In"
          >
            +
          </button>
          <div className="w-px h-4 bg-neutral-700 mx-1" />
          <button
            onClick={() => setZoomScale(1.0)}
            className="text-xs px-2 py-1 hover:bg-neutral-700 rounded text-neutral-300 font-medium transition-colors cursor-pointer"
            title="Reset Zoom to 100%"
          >
            100%
          </button>
        </div>

        <Button
          id="tour-close-fullscreen"
          onClick={onClose}
          className="bg-neutral-800 hover:bg-neutral-700 text-white font-body font-medium h-9 px-4 rounded-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <X size={16} />
          Close
        </Button>
      </div>

      {/* Viewport container */}
      <div className="flex-1 overflow-auto p-12 bg-[#2a2a2a] flex justify-center items-start">
        <div className="w-full max-w-5xl flex justify-center">
          <PreviewPanel
            artworks={artworks}
            settings={settings}
            onUpdateArtwork={onUpdateArtwork}
            forceScale={zoomScale}
            cropHandleId="tour-crop-handle"
          />
        </div>
      </div>
    </div>
  );
}
