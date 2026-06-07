import { useRef, useState, useEffect, useCallback } from "react";
import { GripVertical, Download, Loader2 } from "lucide-react";
import { exportToPDF } from "../lib/pdfExport";
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
    case "cormorant": return "'Cormorant Garamond', serif";
    case "eb-garamond": return "'EB Garamond', serif";
    case "playfair": return "'Playfair Display', serif";
    case "lora": return "'Lora', serif";
    case "cinzel": return "'Cinzel', serif";
    case "dm-sans": return "'DM Sans', sans-serif";
    case "inter": return "'Inter', sans-serif";
    case "montserrat": return "'Montserrat', sans-serif";
    case "outfit": return "'Outfit', sans-serif";
    case "roboto": return "'Roboto', sans-serif";
    case "mono": return "monospace";
    default: return "'Cormorant Garamond', serif";
  }
}

function getFontSize(size: string) {
  switch (size) {
    case "sm": return "13px";
    case "md": return "15px";
    case "lg": return "18px";
    default: return "15px";
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
        const w = Math.max(100, Math.min(794 - 120, (startWidth + deltaX) / currentScale));
        const h = w / aspectRatio;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
      };

      const handleMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        const deltaX = ev.clientX - startX;
        const w = Math.max(100, Math.min(794 - 120, (startWidth + deltaX) / currentScale));
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
      <div
        className="absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-nwse-resize bg-neutral-900 border border-white rounded-tl-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-30 shadow-md"
        onMouseDown={(e) => handleResizeStart(e)}
        title="Resize Proportionally"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" className="pointer-events-none">
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
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;

    setHeight(block.getBoundingClientRect().height);

    const observer = new ResizeObserver(() => {
      setHeight(block.getBoundingClientRect().height);
    });

    observer.observe(block);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const block = blockRef.current;
      if (!block) return;

      // The positioning reference container is the block's parent element
      const contentEl = block.parentElement as HTMLElement;
      if (!contentEl) return;

      // Get the scale of the preview page
      const pageEl = block.closest(".preview-page") as HTMLElement;
      const pageRect = pageEl?.getBoundingClientRect();
      const currentScale = pageRect ? pageRect.width / 794 : 1;

      const contentRect = contentEl.getBoundingClientRect();
      const blockRect = block.getBoundingClientRect();

      const startX = e.clientX;
      const startY = e.clientY;
      let hasMoved = false;

      // Offset from top-left of block to mouse position (in screen coords)
      dragOffset.current = {
        x: e.clientX - blockRect.left,
        y: e.clientY - blockRect.top,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 4) return;

        hasMoved = true;
        setIsDragging(true);

        // Mouse position relative to parent container, adjusted for scale
        const relX = (ev.clientX - contentRect.left - dragOffset.current.x) / currentScale;
        const relY = (ev.clientY - contentRect.top - dragOffset.current.y) / currentScale;

        // Content width is the width of the parent container
        const contentW = contentRect.width / currentScale;

        // Height reference: If parent is page-content (biography), use 1003. Otherwise, use the image height.
        const isPageContent = contentEl.classList.contains("page-content");
        const imageEl = contentEl.firstElementChild as HTMLElement;
        const contentH = isPageContent
          ? 1003
          : (imageEl ? imageEl.getBoundingClientRect().height / currentScale : contentRect.height / currentScale);

        const xPct = Math.max(0, Math.min(85, (relX / contentW) * 100));
        const yPct = isPageContent
          ? Math.max(0, Math.min(90, (relY / contentH) * 100))
          : (relY / contentH) * 100;

        if (block) {
          block.style.left = `${xPct}%`;
          block.style.top = `${yPct}%`;
        }
      };

      const handleMouseUp = (ev: MouseEvent) => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        if (!hasMoved) {
          return;
        }

        const relX = (ev.clientX - contentRect.left - dragOffset.current.x) / currentScale;
        const relY = (ev.clientY - contentRect.top - dragOffset.current.y) / currentScale;

        const contentW = contentRect.width / currentScale;

        const isPageContent = contentEl.classList.contains("page-content");
        const imageEl = contentEl.firstElementChild as HTMLElement;
        const contentH = isPageContent
          ? 1003
          : (imageEl ? imageEl.getBoundingClientRect().height / currentScale : contentRect.height / currentScale);

        const xPct = Math.max(0, Math.min(85, (relX / contentW) * 100));
        const yPct = isPageContent
          ? Math.max(0, Math.min(90, (relY / contentH) * 100))
          : (relY / contentH) * 100;

        onLayoutChange({ x: xPct, y: yPct, w: layout?.w ?? 100, h: layout?.h });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [layout, onLayoutChange],
  );

  // When layout exists: position absolutely within the parent container
  // width stretches from x% to right edge so text-align works
  const posStyle: React.CSSProperties = layout
    ? {
      position: "absolute",
      left: `${layout.x}%`,
      top: `${layout.y}%`,
      width: `${100 - layout.x}%`,
      minWidth: "200px",
      zIndex: 10,
    }
    : {
      position: "relative",
      width: "100%",
      zIndex: 10,
    };

  return (
    <>
      {layout && (
        <div
          className={`invisible pointer-events-none select-none ${className}`}
          style={{ height: height ? `${height}px` : "auto" }}
        />
      )}
      <div
        ref={blockRef}
        className={`transition-shadow duration-200 rounded p-1 -m-1 group/block hover:outline hover:outline-dashed hover:outline-sienna/30 ${isDragging ? "outline-2 outline-sienna shadow-xl z-20 cursor-grabbing" : ""
          } ${className}`}
        style={posStyle}
      >
        {/* Drag handle */}
        <div
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-7 flex items-center justify-center text-muted-foreground cursor-grab opacity-0 group-hover/block:opacity-100 transition-opacity duration-200 rounded bg-surface-card border border-border-warm active:cursor-grabbing active:opacity-100 active:bg-background z-30"
          onMouseDown={handleMouseDown}
          title="Drag to reposition"
        >
          <GripVertical size={14} />
        </div>
        {children}
      </div>
    </>
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
        const newScale = Math.min((width - 24) / 794, 0.6);
        setScale(Math.max(newScale, 0.2));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [forceScale]);

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
  );  const handleBiographyBlur = useCallback(
    (artwork: Artwork, value: string) => {
      if (!onUpdateArtwork) return;
      onUpdateArtwork(artwork.id, { biography: value });
    },
    [onUpdateArtwork],
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await exportToPDF(artworks, settings, containerRef.current || undefined);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
                {/*
                  page-content: position:relative so absolute-positioned DraggableBlocks
                  are constrained within this div, not the outer scaled wrapper.
                  min-h set to A4 content height (1123 - 120px padding = 1003px).
                */}
                <div
                  className="page-content p-[60px] min-h-[1123px] font-body text-foreground relative"
                >
                  {/* Images & Captions Stack — flex column for default flow */}
                  <div className="flex flex-col gap-10 mb-6 items-center w-full">
                    {artwork.images.map((img) => {
                      const hasArtist = !!img.caption.artistName?.trim();
                      const hasTitle = !!img.caption.title?.trim();
                      const hasDimensions = !!img.caption.dimensions?.trim();
                      const hasMedium = !!img.caption.medium?.trim();
                      const hasYear = !!img.caption.year?.trim();
                      const allEmpty = !hasArtist && !hasTitle && !hasDimensions && !hasMedium && !hasYear;

                      const showArtist = hasArtist || allEmpty;
                      const showTitle = hasTitle || allEmpty;
                      const showDimensions = hasDimensions || allEmpty;
                      const showMedium = hasMedium || allEmpty;
                      const showYear = hasYear || allEmpty;

                      return (
                        <div
                          key={img.id}
                          className="relative flex flex-col gap-3 w-full"
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
                                onUpdateArtwork(artwork.id, { images: updatedImages });
                              }
                            }}
                          />

                          {/*
                            Caption DraggableBlock:
                            - No layout initially → stays in normal flow below image
                            - Once dragged → layout saved → renders as position:absolute
                              anywhere on the page, both X and Y
                            - width stretches to right edge so text-align works correctly
                          */}
                          <DraggableBlock
                            layout={img.captionLayout}
                            onLayoutChange={(newLayout) => {
                              if (onUpdateArtwork) {
                                const updatedImages = artwork.images.map((i) =>
                                  i.id === img.id ? { ...i, captionLayout: newLayout } : i,
                                );
                                onUpdateArtwork(artwork.id, { images: updatedImages });
                              }
                            }}
                            className="caption-draggable"
                          >
                            <div
                              style={{
                                fontFamily: getFontFamily(img.captionStyle.font),
                                fontSize: getFontSize(img.captionStyle.size),
                                color: img.captionStyle.color,
                                textAlign: img.captionStyle.alignment as React.CSSProperties["textAlign"],
                                width: "100%",
                                minWidth: "280px",
                                display: "block",
                                lineHeight: "1.6",
                                whiteSpace: "normal",
                              }}
                            >
                              {/* All spans are inline (default) — they obey parent text-align */}
                              {showArtist && (
                                <span
                                  className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-[2px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleCaptionBlur(artwork, img.id, "artistName", e.currentTarget.textContent || "")}
                                  data-placeholder="Artist Name"
                                >
                                  {img.caption.artistName}
                                </span>
                              )}

                              {((hasArtist && (hasTitle || hasDimensions || hasMedium || hasYear)) || allEmpty) && (
                                <span>, </span>
                              )}

                              {showTitle && (
                                <em>
                                  <span
                                    className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-[2px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:not-italic"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleCaptionBlur(artwork, img.id, "title", e.currentTarget.textContent || "")}
                                    data-placeholder="Area"
                                  >
                                    {img.caption.title}
                                  </span>
                                </em>
                              )}

                              {((hasTitle && (hasDimensions || hasMedium || hasYear)) || allEmpty) && (
                                <span>, </span>
                              )}

                              {showDimensions && (
                                <span
                                  className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-[2px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleCaptionBlur(artwork, img.id, "dimensions", e.currentTarget.textContent || "")}
                                  data-placeholder="Dimensions"
                                >
                                  {img.caption.dimensions}
                                </span>
                              )}

                              {((hasDimensions && (hasMedium || hasYear)) || allEmpty) && (
                                <span>, </span>
                              )}

                              {showMedium && (
                                <span
                                  className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-[2px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleCaptionBlur(artwork, img.id, "medium", e.currentTarget.textContent || "")}
                                  data-placeholder="Medium"
                                >
                                  {img.caption.medium}
                                </span>
                              )}

                              {((hasMedium && hasYear) || allEmpty) && (
                                <span>, </span>
                              )}

                              {showYear && (
                                <span
                                  className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-[2px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleCaptionBlur(artwork, img.id, "year", e.currentTarget.textContent || "")}
                                  data-placeholder="Year"
                                >
                                  {img.caption.year}
                                </span>
                              )}

                              {/* Custom line on its own line */}
                              <div
                                className="mt-1"
                                style={{ textAlign: img.captionStyle.alignment as React.CSSProperties["textAlign"] }}
                              >
                                <span
                                  className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-[2px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleCaptionBlur(artwork, img.id, "customLine", e.currentTarget.textContent || "")}
                                  data-placeholder="Custom Line (Optional)"
                                >
                                  {img.caption.customLine || ""}
                                </span>
                              </div>
                            </div>
                          </DraggableBlock>
                        </div>
                      );
                    })}
                  </div>

                  {/* Biography — draggable anywhere on the page */}
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
                        className="text-[13px] text-muted-foreground leading-relaxed m-0 wrap-break-words min-h-[1em] outline-none rounded-[2px] px-[2px] mx-[-2px] transition-all duration-200 cursor-text block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleBiographyBlur(artwork, e.currentTarget.textContent || "")}
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