import { useRef, useState, useEffect, useCallback } from "react";
import { GripVertical } from "lucide-react";
import type {
  Artwork,
  PortfolioSettings,
  ElementLayout,
  ImageItem,
} from "../types";

interface PreviewPanelProps {
  artworks: Artwork[];
  settings: PortfolioSettings;
  onUpdateArtwork?: (id: string, partial: Partial<Artwork>) => void;
  forceScale?: number;
  className?: string;
}

function getFontFamily(font: string) {
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
}

function getFontSize(size: string) {
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
}
interface ResizableImageProps {
  img: ImageItem;
  artworkId: string;
  onResize: (width: number, height: number) => void;
  isOnlyChild: boolean;
}

function ResizableImage({ img, onResize }: ResizableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const el = containerRef.current;
      if (!el) return;

      const pageEl = el.closest(".preview-page") as HTMLElement;
      const pageRect = pageEl?.getBoundingClientRect();
      const currentScale = pageRect ? pageRect.width / 794 : 1;

      const rect = el.getBoundingClientRect();
      const startWidth = rect.width;
      const startHeight = rect.height;
      const startX = e.clientX;
      const aspectRatio = startWidth / startHeight;

      const handleMouseMove = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;

        // Calculate new dimensions proportionally locking the aspect ratio
        const w = Math.max(
          100,
          Math.min(794 - 120, (startWidth + deltaX) / currentScale),
        );
        const h = w / aspectRatio;

        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
      };

      const handleMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        const deltaX = ev.clientX - startX;
        const w = Math.max(
          100,
          Math.min(794 - 120, (startWidth + deltaX) / currentScale),
        );
        const h = w / aspectRatio;

        onResize(Math.round(w), Math.round(h));
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onResize],
  );

  const style: React.CSSProperties = {
    width: img.width ? `${img.width}px` : "100%",
    height: img.height ? `${img.height}px` : "auto",
    maxHeight: img.height ? undefined : "480px",
  };

  return (
    <div
      ref={containerRef}
      className="group/img relative rounded border border-neutral-200 overflow-visible flex items-center justify-center bg-stone-50 select-none"
      style={style}
    >
      <img
        src={img.url}
        alt="Artwork Preview"
        style={{
          width: img.width ? "100%" : "auto",
          height: img.height ? "100%" : "auto",
          maxWidth: "100%",
          maxHeight: img.height ? undefined : "480px",
        }}
        className="object-contain block rounded pointer-events-none"
      />

      {/* Proportional Corner Resize Handle */}
      <div
        className="absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-nwse-resize bg-neutral-900 border border-white rounded-tl-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-30 shadow-md"
        onMouseDown={(e) => handleResizeStart(e)}
        title="Resize Proportionally"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          className="pointer-events-none"
        >
          <line x1="8" y1="0" x2="0" y2="8" />
          <line x1="8" y1="3" x2="3" y2="8" />
          <line x1="8" y1="6" x2="6" y2="8" />
        </svg>
      </div>
    </div>
  );
}
/* ── Draggable element wrapper ────────────────────── */
interface DraggableBlockProps {
  layout?: ElementLayout;
  onLayoutChange: (layout: ElementLayout) => void;
  children: React.ReactNode;
  className?: string;
}

function DraggableBlock({
  layout,
  onLayoutChange,
  children,
  className = "",
}: DraggableBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pageEl = blockRef.current?.closest(".preview-page") as HTMLElement;
      if (!pageEl) return;

      const pageRect = pageEl.getBoundingClientRect();
      const blockRect = blockRef.current!.getBoundingClientRect();

      dragOffset.current = {
        x: e.clientX - blockRect.left,
        y: e.clientY - blockRect.top,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        setIsDragging(true);
        const relX = ev.clientX - pageRect.left - dragOffset.current.x;
        const relY = ev.clientY - pageRect.top - dragOffset.current.y;

        const xPct = Math.max(0, Math.min(80, (relX / pageRect.width) * 100));
        const yPct = Math.max(0, Math.min(90, (relY / pageRect.height) * 100));

        if (blockRef.current) {
          blockRef.current.style.left = `${xPct}%`;
          blockRef.current.style.top = `${yPct}%`;
        }
      };

      const handleMouseUp = (ev: MouseEvent) => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        const relX = ev.clientX - pageRect.left - dragOffset.current.x;
        const relY = ev.clientY - pageRect.top - dragOffset.current.y;

        const xPct = Math.max(0, Math.min(80, (relX / pageRect.width) * 100));
        const yPct = Math.max(0, Math.min(90, (relY / pageRect.height) * 100));

        onLayoutChange({
          x: xPct,
          y: yPct,
          w: layout?.w ?? 100,
          h: layout?.h,
        });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [layout, onLayoutChange],
  );

  const posStyle: React.CSSProperties = layout
    ? {
        position: "absolute",
        left: `${layout.x}%`,
        top: `${layout.y}%`,
      }
    : { position: "relative" };

  return (
    <div
      ref={blockRef}
      className={`transition-all duration-200 rounded p-1 -m-1 group/block hover:outline hover:outline-dashed hover:outline-sienna/30 ${
        isDragging
          ? "outline-2 outline-sienna shadow-xl z-10 cursor-grabbing"
          : ""
      } ${className}`}
      style={posStyle}
    >
      <div
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-7 flex items-center justify-center text-muted-foreground cursor-grab opacity-0 group-hover/block:opacity-100 transition-opacity duration-200 rounded bg-surface-card border border-border-warm active:cursor-grabbing active:opacity-100 active:bg-background"
        onMouseDown={handleMouseDown}
        title="Drag to reposition"
      >
        <GripVertical size={14} />
      </div>
      {children}
    </div>
  );
}

/* ── Main Preview Panel ─────────────────────────── */
export function PreviewPanel({
  artworks,
  settings,
  onUpdateArtwork,
  forceScale,
  className = "",
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(forceScale ?? 0.35);

  // Dynamically compute scale based on container width
  useEffect(() => {
    if (forceScale !== undefined) {
      setScale(forceScale);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // A4 page at 96dpi ≈ 794px
        const newScale = Math.min((width - 24) / 794, 0.6);
        setScale(Math.max(newScale, 0.2));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [forceScale]);

  /* ── Inline edit handlers ─────────────────────── */
  const handleCaptionBlur = useCallback(
    (artwork: Artwork, imgId: string, field: string, value: string) => {
      if (!onUpdateArtwork) return;
      const updatedImages = artwork.images.map((img) =>
        img.id === imgId
          ? { ...img, caption: { ...img.caption, [field]: value } }
          : img,
      );
      onUpdateArtwork(artwork.id, { images: updatedImages });
    },
    [onUpdateArtwork],
  );

  const handleBiographyBlur = useCallback(
    (artwork: Artwork, value: string) => {
      if (!onUpdateArtwork) return;
      onUpdateArtwork(artwork.id, { biography: value });
    },
    [onUpdateArtwork],
  );

  if (artworks.length === 0) {
    return (
      <div
        className="flex flex-col h-full bg-linear-to-br from-[#f5f5f5] to-[#fafafa] p-3 overflow-hidden items-center justify-center"
        ref={containerRef}
      >
        <div className="text-center text-muted-foreground">
          <p className="m-0 font-body text-sm">No artworks yet.</p>
          <p className="text-xs mt-2">Add images to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full overflow-hidden ${forceScale ? "" : "bg-linear-to-br from-[#f5f5f5] to-[#fafafa] p-3"} ${className}`}
      ref={containerRef}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col items-center gap-2 py-1">
          {artworks.map((artwork, index) => (
            <div key={artwork.id} className="w-full flex flex-col items-center">
              <div
                className="preview-page bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: "794px",
                  marginBottom: `${-(1 - scale) * 1123 + 12}px`,
                }}
              >
                <div className="p-[60px] min-h-[1123px] font-body text-foreground relative">
                  {/* Images & Captions Stack */}
                  <div className="flex flex-col gap-10 mb-6 items-center w-full">
                    {artwork.images.map((img) => (
                      <div
                        key={img.id}
                        className="flex flex-col items-center gap-3 w-full"
                      >
                        <ResizableImage
                          img={img}
                          artworkId={artwork.id}
                          isOnlyChild={artwork.images.length === 1}
                          onResize={(width, height) => {
                            if (onUpdateArtwork) {
                              const updatedImages = artwork.images.map((i) =>
                                i.id === img.id ? { ...i, width, height } : i,
                              );
                              onUpdateArtwork(artwork.id, {
                                images: updatedImages,
                              });
                            }
                          }}
                        />

                        {/* Image-Specific Caption - Draggable */}
                        <DraggableBlock
                          layout={
                            img.captionLayout || {
                              x: 10,
                              y: 6,
                              w: 100,
                              h: undefined,
                            }
                          }
                          onLayoutChange={(layout) => {
                            if (onUpdateArtwork) {
                              const updatedImages = artwork.images.map((i) =>
                                i.id === img.id
                                  ? { ...i, captionLayout: layout }
                                  : i,
                              );
                              onUpdateArtwork(artwork.id, {
                                images: updatedImages,
                              });
                            }
                          }}
                          className="caption-draggable"
                        >
                          <div
                            className="text-[15px] leading-relaxed wrap-break-words"
                            style={{
                              fontFamily: getFontFamily(img.captionStyle.font),
                              fontSize: getFontSize(img.captionStyle.size),
                              color: img.captionStyle.color,
                              textAlign: img.captionStyle.alignment as any,
                              maxWidth: "600px",
                              whiteSpace: "normal",
                            }}
                          >
                            <span
                              className="outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] inline-block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleCaptionBlur(
                                  artwork,
                                  img.id,
                                  "artistName",
                                  e.currentTarget.textContent || "",
                                )
                              }
                              data-placeholder="Artist Name"
                            >
                              {img.caption.artistName}
                            </span>
                            {(img.caption.artistName || true) && (
                              <span>, </span>
                            )}
                            <em>
                              <span
                                className="outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] inline-block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) =>
                                  handleCaptionBlur(
                                    artwork,
                                    img.id,
                                    "title",
                                    e.currentTarget.textContent || "",
                                  )
                                }
                                data-placeholder="Title"
                              >
                                {img.caption.title}
                              </span>
                            </em>
                            {(img.caption.title || true) && <span>, </span>}
                            <span
                              className="outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] inline-block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleCaptionBlur(
                                  artwork,
                                  img.id,
                                  "dimensions",
                                  e.currentTarget.textContent || "",
                                )
                              }
                              data-placeholder="Dimensions"
                            >
                              {img.caption.dimensions}
                            </span>
                            {(img.caption.dimensions || true) && (
                              <span>, </span>
                            )}
                            <span
                              className="outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] inline-block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleCaptionBlur(
                                  artwork,
                                  img.id,
                                  "medium",
                                  e.currentTarget.textContent || "",
                                )
                              }
                              data-placeholder="Medium"
                            >
                              {img.caption.medium}
                            </span>
                            {(img.caption.medium || true) && <span>, </span>}
                            <span
                              className="outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] inline-block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleCaptionBlur(
                                  artwork,
                                  img.id,
                                  "year",
                                  e.currentTarget.textContent || "",
                                )
                              }
                              data-placeholder="Year"
                            >
                              {img.caption.year}
                            </span>
                            <div className="mt-1">
                              <span
                                className="outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] inline-block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) =>
                                  handleCaptionBlur(
                                    artwork,
                                    img.id,
                                    "customLine",
                                    e.currentTarget.textContent || "",
                                  )
                                }
                                data-placeholder="Custom Line (Optional)"
                              >
                                {img.caption.customLine || ""}
                              </span>
                            </div>
                          </div>
                        </DraggableBlock>
                      </div>
                    ))}
                  </div>

                  {/* Draggable Biography */}
                  {settings.showBioAfterEachPhoto && (
                    <DraggableBlock
                      layout={artwork.bioLayout}
                      onLayoutChange={(layout) =>
                        onUpdateArtwork?.(artwork.id, { bioLayout: layout })
                      }
                      className="bio-draggable"
                    >
                      <hr className="border-none border-t border-border-warm my-5" />
                      <p
                        className="text-[13px] text-muted-foreground leading-relaxed m-0 wrap-break-words min-h-[1em] outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text min-w-[20px] block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleBiographyBlur(
                            artwork,
                            e.currentTarget.textContent || "",
                          )
                        }
                        data-placeholder="Write your biography here..."
                      >
                        {artwork.biography}
                      </p>
                    </DraggableBlock>
                  )}
                </div>
              </div>

              {index < artworks.length - 1 && (
                <div className="h-[2px] w-3/5 bg-linear-to-r from-transparent via-border-warm to-transparent my-1 mx-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
