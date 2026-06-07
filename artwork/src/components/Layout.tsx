import { useMemo, useState, useCallback, useRef } from "react";
import { Settings as SettingsIcon, Plus, X, ImagePlus, Maximize2,ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useArtworks } from "../hooks/useArtworks";
import { UploadZone } from "./UploadZone";
import { ArtworkCard } from "./ArtworkCard";
import { CaptionEditor } from "./CaptionEditor";
import { PreviewPanel } from "./PreviewPanel";
import { ExportButton } from "./ExportButton";
import { PrivacyPolicy } from "./PrivacyPolicy";
import logoUrl from "../assets/vite.svg";
import { useLocation, useNavigate } from "react-router-dom";


export function Layout() {
  const {
    artworks,
    settings,
    selectedId,
    setSelectedId,
    addArtwork,
    removeArtwork,
    updateArtwork,
    reorderArtworks,
    addImagesToArtwork,
    removeImageFromArtwork,
    reorderImagesInArtwork,
  } = useArtworks();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedImgIndex, setDraggedImgIndex] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);
  const addImagesRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname === "/privacy" ? "privacy" : "editor";

  const selectedArtwork = useMemo(
    () => artworks.find((a) => a.id === selectedId),
    [artworks, selectedId],
  );

  const activeImageId = useMemo(() => {
    if (!selectedArtwork) return null;
    if (selectedImageId && selectedArtwork.images.some((img) => img.id === selectedImageId)) {
      return selectedImageId;
    }
    return selectedArtwork.images[0]?.id || null;
  }, [selectedArtwork, selectedImageId]);

  const sortedArtworks = useMemo(
    () => [...artworks].sort((a, b) => a.order - b.order),
    [artworks],
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderArtworks(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImgIndex !== null && draggedImgIndex !== index && selectedArtwork) {
      reorderImagesInArtwork(selectedArtwork.id, draggedImgIndex, index);
      setDraggedImgIndex(index);
    }
  };

  const handleAddImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedArtwork) return;
      const files = Array.from(e.currentTarget.files || []);
      if (files.length > 0) {
        addImagesToArtwork(selectedArtwork.id, files);
      }
      e.currentTarget.value = "";
    },
    [selectedArtwork, addImagesToArtwork],
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-border-warm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="RtFolio logo" className="w-8 h-8 object-contain shrink-0" />
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-[28px] font-semibold m-0 text-sienna">RtFolio</h1>
            <p className="text-xs text-muted-foreground m-0 uppercase tracking-[0.5px]">Artist Portfolio Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentView === "privacy" && (
            <button
              onClick={() => {
                navigate("/");
              }}
              className="text-xs text-muted-foreground hover:text-sienna cursor-pointer transition-colors duration-200 select-none mr-2 font-medium flex items-center gap-1"
            ><ArrowLeft size={14} />
              Back to Portfolio Editor
            </button>
          )}
          {currentView === "editor" && (
            <ExportButton artworks={selectedArtwork ? [selectedArtwork] : sortedArtworks} settings={settings} />
          )}
        </div>
      </header>

      {/* Main Content */}
      {currentView === "privacy" ? (
        <PrivacyPolicy />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr_340px] gap-0 flex-1 overflow-hidden">
        {/* Left Sidebar - Artwork List */}
        <aside className="hidden md:flex flex-col bg-surface-card border-r border-border-warm overflow-hidden">
          <h2 className="font-display text-base font-semibold p-4 m-0 border-b border-border-warm text-foreground">Artworks</h2>
          <ScrollArea className="flex-1">
            {artworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground">
                <p className="text-[13px] m-0">No artworks yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/80">Upload one to begin</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0 p-3">
                {sortedArtworks.map((artwork, index) => (
                  <div
                    key={artwork.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <ArtworkCard
                      artwork={artwork}
                      isSelected={selectedId === artwork.id}
                      isDragging={draggedIndex === index}
                      onSelect={() => setSelectedId(artwork.id)}
                      onDelete={() => removeArtwork(artwork.id)}
                    />
                  </div>
                ))}

                {/* Add New Artwork Card Placeholder */}
                <div
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || []);
                      if (files.length > 0) {
                        addArtwork(files);
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center gap-3 p-3 border border-dashed border-border-warm hover:border-sienna hover:bg-sienna/5 rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.99] select-none"
                  title="Add simultaneously another project"
                >
                  <div className="w-15 h-15 flex items-center justify-center border border-dashed border-border-warm rounded-md bg-stone-50/50 text-muted-foreground shrink-0">
                    <Plus size={20} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-display text-sm font-medium text-foreground m-0">
                      Add New Artwork
                    </p>
                    <p className="font-body text-xs text-muted-foreground/80 m-0">
                      Upload photos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Sidebar Footer for Privacy Policy */}
          <div className="p-4 border-t border-border-warm bg-stone-50/50 shrink-0">
            <button
              onClick={() => {
                navigate(currentView === "editor" ? "/privacy" : "/");
              }}
              className="text-xs text-muted-foreground hover:text-sienna cursor-pointer transition-colors duration-200 select-none font-medium flex items-center gap-1.5"
            >
              <SettingsIcon size={12} className="text-muted-foreground/60 animate-none hover:rotate-45 transition-transform duration-200" />
              Privacy Policy
            </button>
          </div>
        </aside>

        {/* Center Editor Panel */}
        <main className="flex flex-col bg-background overflow-hidden">
          {!selectedArtwork ? (
            <div className="flex items-center justify-center flex-1 p-10">
              <UploadZone />
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Image Gallery */}
              <div className="p-5 md:px-6 bg-white border-b border-border-warm shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-semibold m-0 text-foreground">
                    Images ({selectedArtwork.images.length})
                  </h3>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-border-warm rounded-md font-body text-[13px] text-foreground cursor-pointer transition-all duration-200 hover:bg-background hover:border-sienna hover:text-sienna active:scale-[0.98]"
                    onClick={() => addImagesRef.current?.click()}
                  >
                    <ImagePlus size={16} />
                    Add More
                  </button>
                  <input
                    ref={addImagesRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddImages}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
                  {selectedArtwork.images.map((img, idx) => {
                    const isSelected = img.id === activeImageId;
                    return (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => setDraggedImgIndex(idx)}
                        onDragOver={(e) => handleImageDragOver(e, idx)}
                        onDragEnd={() => setDraggedImgIndex(null)}
                        onClick={() => setSelectedImageId(img.id)}
                        className={`group relative rounded-lg overflow-hidden border-2 aspect-square cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-sienna ring-2 ring-sienna/25 scale-[1.02] shadow-md"
                            : draggedImgIndex === idx
                            ? "opacity-45 border-dashed border-sienna scale-95"
                            : "border-border-warm hover:border-sienna-light"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="Artwork"
                          className="w-full h-full object-cover block pointer-events-none"
                        />
                        {selectedArtwork.images.length > 1 && (
                          <button
                            className="absolute top-1 right-1 w-5.5 h-5.5 flex items-center justify-center bg-black/65 text-white border-none rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-650"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImageFromArtwork(selectedArtwork.id, img.id);
                            }}
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    className="flex items-center justify-center border-2 border-dashed border-border-warm rounded-lg aspect-square bg-transparent text-muted-foreground cursor-pointer transition-all duration-200 hover:border-sienna hover:text-sienna hover:bg-sienna/5"
                    onClick={() => addImagesRef.current?.click()}
                    title="Add more images"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-8">
                <CaptionEditor
                  artwork={selectedArtwork}
                  onUpdate={(partial) =>
                    updateArtwork(selectedArtwork.id, partial)
                  }
                  selectedImageId={activeImageId}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right Preview Panel */}
        <aside className="hidden lg:flex flex-col bg-background border-l border-border-warm overflow-hidden">
          <h2 className="font-display text-base font-semibold p-4 m-0 border-b border-border-warm text-foreground flex items-center justify-between">
            <span>Preview</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoomScale(1.0); // Default fullscreen zoom to 100%
                setIsFullscreen(true);
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 cursor-pointer"
              title="Fullscreen Edit Mode"
            >
              <Maximize2 size={16} />
            </Button>
          </h2>
          <PreviewPanel
            artworks={selectedArtwork ? [selectedArtwork] : sortedArtworks}
            settings={settings}
            onUpdateArtwork={updateArtwork}
          />
        </aside>
      </div>
      )}


      {/* Fullscreen A4 Editor Modal */}
      {isFullscreen && (
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
            <div className="flex items-center gap-2 bg-[#2d2d2d] px-2 py-1 rounded-md border border-neutral-700">
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
              onClick={() => setIsFullscreen(false)}
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
                artworks={selectedArtwork ? [selectedArtwork] : sortedArtworks}
                settings={settings}
                onUpdateArtwork={updateArtwork}
                forceScale={zoomScale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
