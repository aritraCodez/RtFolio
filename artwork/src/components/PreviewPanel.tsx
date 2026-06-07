import { useRef, useState, useEffect, useCallback } from "react";
import { GripVertical, Mail, Phone, Globe, MapPin, X, Undo2, Scissors } from "lucide-react";
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

function getFontSize(size: string, customSize?: number) {
  if (customSize) return `${customSize}px`;
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
    width: img.width ? `${img.width}px` : "fit-content",
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
        className="block rounded pointer-events-none"
      />
      <div
        className="absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-nwse-resize bg-neutral-900 border border-white rounded-tl-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-30 shadow-md"
        onMouseDown={(e) => handleResizeStart(e)}
        title="Resize Proportionally"
        data-pdf-ignore="true"
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

/* ── Scaled Page wrapper for A4 sizing & dynamic margin ───────────────── */
interface ScaledPageProps {
  scale: number;
  children: React.ReactNode;
}

function ScaledPage({ scale, children }: ScaledPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(1123);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    setHeight(el.offsetHeight);

    const observer = new ResizeObserver(() => {
      setHeight(el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pageRef}
      className="preview-page bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        width: "794px",
        marginBottom: `${-(1 - scale) * height + 12}px`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Draggable element wrapper ────────────────────── */
interface DraggableBlockProps {
  layout?: ElementLayout;
  onLayoutChange: (layout: ElementLayout) => void;
  children: React.ReactNode;
  className?: string;
  noPlaceholder?: boolean;
  width?: string;
  minWidth?: string;
  onDelete?: () => void;
  deleteTitle?: string;
  onResizeText?: (newSize: number) => void;
  startFontSize?: number;
  trimPageHeight?: boolean;
}

function DraggableBlock({
  layout,
  onLayoutChange,
  children,
  className = "",
  noPlaceholder = false,
  width,
  minWidth,
  onDelete,
  deleteTitle,
  onResizeText,
  startFontSize,
  trimPageHeight = false,
}: DraggableBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;

    setHeight(block.offsetHeight);

    const observer = new ResizeObserver(() => {
      setHeight(block.offsetHeight);
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

      // Find the nearest ancestor with class 'relative' that is not a draggable block itself,
      // falling back to block.parentElement if not found.
      let contentEl = block.parentElement as HTMLElement;
      let cursor: HTMLElement | null = block.parentElement;
      while (cursor) {
        if (
          cursor.classList.contains("relative") &&
          !cursor.classList.contains("caption-draggable") &&
          !cursor.classList.contains("custom-line-draggable") &&
          !cursor.classList.contains("image-draggable") &&
          !cursor.classList.contains("bio-draggable")
        ) {
          contentEl = cursor;
          break;
        }
        cursor = cursor.parentElement;
      }
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
        let contentH = contentRect.height / currentScale;
        if (isPageContent) {
          contentH = 1003;
        } else {
          const imgEl = contentEl.querySelector("img");
          if (imgEl) {
            contentH = imgEl.getBoundingClientRect().height / currentScale;
          }
        }

        const blockW = block.offsetWidth || 0;
        const maxXPct = Math.max(0, 100 - (blockW / contentW) * 100);
        const xPct = Math.max(0, Math.min(maxXPct, (relX / contentW) * 100));
        const yPct = isPageContent
          ? Math.max(0, Math.min(90, (relY / contentH) * 100))
          : (relY / contentH) * 100;

        if (block) {
          block.style.left = `${xPct}%`;
          if (isPageContent && trimPageHeight) {
            block.style.top = `${(yPct / 100) * 1003}px`;
          } else {
            block.style.top = `${yPct}%`;
          }
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
        let contentH = contentRect.height / currentScale;
        if (isPageContent) {
          contentH = 1003;
        } else {
          const imgEl = contentEl.querySelector("img");
          if (imgEl) {
            contentH = imgEl.getBoundingClientRect().height / currentScale;
          }
        }

        const blockW = block.offsetWidth || 0;
        const maxXPct = Math.max(0, 100 - (blockW / contentW) * 100);
        const xPct = Math.max(0, Math.min(maxXPct, (relX / contentW) * 100));
        const yPct = isPageContent
          ? Math.max(0, Math.min(90, (relY / contentH) * 100))
          : (relY / contentH) * 100;

        onLayoutChange({ x: xPct, y: yPct, w: layout?.w ?? 100, h: layout?.h });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [layout, onLayoutChange, trimPageHeight],
  );

  const handleTextResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startSize = startFontSize ?? 15;
      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseMove = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;
        const deltaY = ev.clientY - startY;
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
        const newSize = Math.max(8, Math.min(80, Math.round(startSize + delta / 6)));
        if (onResizeText) {
          onResizeText(newSize);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [startFontSize, onResizeText],
  );

  // When layout exists or dragging: position absolutely within the parent container
  const posStyle: React.CSSProperties = (layout || isDragging)
    ? {
      position: "absolute",
      left: layout ? `${layout.x}%` : "0%",
      top: layout
        ? (className.includes("bio-draggable") && trimPageHeight
          ? `${(layout.y / 100) * 1003}px`
          : `${layout.y}%`)
        : "0%",
      width: width ?? `${100 - (layout?.x ?? 0)}%`,
      minWidth: minWidth ?? "200px",
      zIndex: 10,
    }
    : {
      position: "relative",
      width: width ?? "100%",
      minWidth: minWidth ?? "200px",
      marginLeft: (width === "fit-content" || width === "auto" || (width && width !== "100%")) ? "auto" : undefined,
      marginRight: (width === "fit-content" || width === "auto" || (width && width !== "100%")) ? "auto" : undefined,
      zIndex: 10,
    };

  return (
    <>
      {(layout || isDragging) && !noPlaceholder && (
        <div
          className={`invisible pointer-events-none select-none draggable-placeholder ${className}`}
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
          data-pdf-ignore="true"
        >
          <GripVertical size={14} />
        </div>
        {/* Delete / Hide handle */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-7 flex items-center justify-center text-muted-foreground hover:text-red-650 opacity-0 group-hover/block:opacity-100 transition-opacity duration-200 rounded bg-surface-card border border-border-warm cursor-pointer z-30 active:scale-95"
            title={deleteTitle ?? "Delete/Hide caption"}
            data-pdf-ignore="true"
          >
            <X size={12} />
          </button>
        )}
        {onResizeText && (
          <div
            className="absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-nwse-resize bg-neutral-900 border border-white rounded-tl-sm flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity z-30 shadow-md active:scale-95"
            onMouseDown={(e) => handleTextResizeStart(e)}
            title="Drag to resize text size"
            data-pdf-ignore="true"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" className="pointer-events-none">
              <line x1="8" y1="0" x2="0" y2="8" />
              <line x1="8" y1="3" x2="3" y2="8" />
              <line x1="8" y1="6" x2="6" y2="8" />
            </svg>
          </div>
        )}
        {children}
      </div>
    </>
  );
}

/* ── Artwork Page containing dynamic height logic and styling ── */
interface ArtworkPageProps {
  artwork: Artwork;
  settings: PortfolioSettings;
  scale: number;
  onUpdateArtwork?: (id: string, partial: Partial<Artwork>) => void;
}

function ArtworkPage({
  artwork,
  settings,
  scale,
  onUpdateArtwork,
}: ArtworkPageProps) {
  const pageContentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(1123);
  const [livePageHeight, setLivePageHeight] = useState<number | null>(null);

  const handleCaptionBlur = useCallback(
    (art: Artwork, imgId: string, field: string, value: string) => {
      if (!onUpdateArtwork) return;
      const updatedImages = art.images.map((img) =>
        img.id === imgId
          ? { ...img, caption: { ...img.caption, [field]: value } }
          : img,
      );
      onUpdateArtwork(art.id, { images: updatedImages });
    },
    [onUpdateArtwork],
  );

  const handleBiographyBlur = useCallback(
    (art: Artwork, value: string) => {
      if (!onUpdateArtwork) return;
      onUpdateArtwork(art.id, { biography: value });
    },
    [onUpdateArtwork],
  );

  const handleCropStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pageEl = pageContentRef.current;
      if (!pageEl) return;

      const pageContainer = pageEl.closest(".preview-page") as HTMLElement;
      const pageRect = pageContainer?.getBoundingClientRect();
      const currentScale = pageRect ? pageRect.width / 794 : 1;

      const startHeight = pageEl.offsetHeight;
      const startY = e.clientY;

      const handleMouseMove = (ev: MouseEvent) => {
        const deltaY = ev.clientY - startY;
        const newH = startHeight + deltaY / currentScale;
        setLivePageHeight(Math.max(300, Math.round(newH)));
      };

      const handleMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        const deltaY = ev.clientY - startY;
        const newH = startHeight + deltaY / currentScale;
        onUpdateArtwork?.(artwork.id, { customPageHeight: Math.max(300, Math.round(newH)) });
        setLivePageHeight(null);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [artwork.id, onUpdateArtwork, setLivePageHeight],
  );

  useEffect(() => {
    if (!settings.trimPageHeight) {
      setContentHeight(1123);
      return;
    }

    const pageContent = pageContentRef.current;
    if (!pageContent) return;

    const calculateHeight = () => {
      const parentRect = pageContent.getBoundingClientRect();
      if (parentRect.height === 0) return;

      const elements = pageContent.getElementsByTagName("*");
      let maxBottom = 0;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;

        // Skip placeholders
        if (
          el.classList.contains("draggable-placeholder") ||
          el.closest(".draggable-placeholder")
        ) {
          continue;
        }

        // Skip absolute drag handles, delete buttons, resize handles or hover controls
        if (
          el.classList.contains("cursor-grab") ||
          el.tagName === "BUTTON" ||
          el.tagName === "SVG" ||
          el.closest("button") ||
          el.closest(".cursor-grab")
        ) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const bottom = (rect.bottom - parentRect.top) / scale;
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
      }

      // Add 60px padding at the bottom (matches p-15)
      const newHeight = Math.max(300, Math.round(maxBottom + 60));
      setContentHeight(newHeight);
    };

    // Run initially
    calculateHeight();

    // Observe changes to descendants
    const observer = new MutationObserver(() => {
      calculateHeight();
      const descendants = pageContent.getElementsByTagName("*");
      for (let i = 0; i < descendants.length; i++) {
        resizeObserver.observe(descendants[i]);
      }
    });
    observer.observe(pageContent, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const resizeObserver = new ResizeObserver(calculateHeight);
    resizeObserver.observe(pageContent);
    const descendants = pageContent.getElementsByTagName("*");
    for (let i = 0; i < descendants.length; i++) {
      resizeObserver.observe(descendants[i]);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [artwork, settings.trimPageHeight, scale]);

  const activeHeight = livePageHeight !== null
    ? livePageHeight
    : (artwork.customPageHeight !== undefined
      ? artwork.customPageHeight
      : (settings.trimPageHeight ? contentHeight : 1123));

  const customHeightStyle = livePageHeight !== null
    ? { height: `${livePageHeight}px`, minHeight: "auto" }
    : (artwork.customPageHeight !== undefined
      ? { height: `${artwork.customPageHeight}px`, minHeight: "auto" }
      : (settings.trimPageHeight
        ? { height: `${contentHeight}px`, minHeight: "auto" }
        : { height: "auto", minHeight: "1123px" }));

  return (
    <div
      ref={pageContentRef}
      className="page-content p-15 font-body text-foreground relative"
      style={{
        ...customHeightStyle,
        boxSizing: "border-box",
      }}
    >
      {/* ── Page Header (résumé-style contact info) ── */}
      {settings.showPageHeader && (() => {
        const hFont = settings.headerFont ?? "cormorant";
        const hColor = settings.headerColor ?? "#1C1917";
        const hAlign = settings.headerAlignment ?? "left";
        const hSize = settings.headerSize ?? "md";
        const nameSizePx = hSize === "sm" ? "18px" : hSize === "lg" ? "28px" : "22px";
        const detailSizePx = hSize === "sm" ? "9px" : hSize === "lg" ? "13px" : "11px";
        const justifyMap = { left: "flex-start", center: "center", right: "flex-end" } as const;
        return (
          <div
            className="mb-8 pb-5 border-b border-stone-200"
            style={{
              textAlign: hAlign,
              backgroundColor: settings.headerHighlightColor || "transparent",
              fontWeight: settings.headerBold ? "bold" : "normal",
              fontStyle: settings.headerItalic ? "italic" : "normal",
              textDecoration: settings.headerUnderline ? "underline" : "none",
              padding: settings.headerHighlightColor ? "12px 16px" : undefined,
              paddingBottom: settings.headerHighlightColor ? "12px" : "20px",
              borderRadius: settings.headerHighlightColor ? "6px" : "0",
            }}
          >
            {settings.headerArtistName && (
              <h2
                className="m-0 mb-2 leading-tight"
                style={{
                  fontFamily: getFontFamily(hFont),
                  fontSize: nameSizePx,
                  color: hColor,
                  fontWeight: settings.headerBold ? "bold" : "600",
                }}
              >
                {settings.headerArtistName}
              </h2>
            )}
            <div
              className="flex flex-wrap gap-x-5 gap-y-1.5 font-body"
              style={{
                fontSize: detailSizePx,
                color: hColor,
                opacity: 0.72,
                justifyContent: justifyMap[hAlign],
              }}
            >
              {settings.headerEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail size={parseInt(detailSizePx) - 1} className="shrink-0" style={{ color: hColor }} />
                  {settings.headerEmail}
                </span>
              )}
              {settings.headerPhone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={parseInt(detailSizePx) - 1} className="shrink-0" style={{ color: hColor }} />
                  {settings.headerPhone}
                </span>
              )}
              {settings.headerWebsite && (
                <span className="flex items-center gap-1.5">
                  <Globe size={parseInt(detailSizePx) - 1} className="shrink-0" style={{ color: hColor }} />
                  {settings.headerWebsite}
                </span>
              )}
              {settings.headerLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={parseInt(detailSizePx) - 1} className="shrink-0" style={{ color: hColor }} />
                  {settings.headerLocation}
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Images & Captions Stack — flex column for default flow */}
      <div className="flex flex-col gap-10 mb-6 items-center w-full">
        {artwork.images.map((img) => {
          const hasArtist = !!img.caption.artistName?.trim();
          const hasArea = !!img.caption.area?.trim();
          const hasDimensions = !!img.caption.dimensions?.trim();
          const hasMedium = !!img.caption.medium?.trim();
          const hasYear = !!img.caption.year?.trim();
          const allEmpty = !hasArtist && !hasArea && !hasDimensions && !hasMedium && !hasYear;

          const showArtist = hasArtist || allEmpty;
          const showArea = hasArea || allEmpty;
          const showDimensions = hasDimensions || allEmpty;
          const showMedium = hasMedium || allEmpty;
          const showYear = hasYear || allEmpty;

          const captionPosition = img.captionPosition ?? "footer";
          const showCaption = !img.hideCaption;

          const captionBlock = (
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
              width="fit-content"
              minWidth="unset"
              onResizeText={(newSize) => {
                if (onUpdateArtwork) {
                  const updatedImages = artwork.images.map((i) =>
                    i.id === img.id
                      ? {
                          ...i,
                          captionStyle: {
                            ...i.captionStyle,
                            customSize: newSize,
                          },
                        }
                      : i
                  );
                  onUpdateArtwork(artwork.id, { images: updatedImages });
                }
              }}
              startFontSize={img.captionStyle.customSize ?? (img.captionStyle.size === "sm" ? 13 : img.captionStyle.size === "lg" ? 18 : 15)}
              onDelete={() => {
                if (onUpdateArtwork) {
                  const updatedImages = artwork.images.map((i) =>
                    i.id === img.id ? { ...i, hideCaption: true } : i,
                  );
                  onUpdateArtwork(artwork.id, { images: updatedImages });
                }
              }}
              trimPageHeight={settings.trimPageHeight}
              noPlaceholder={false}
            >
              <div
                style={{
                  fontFamily: getFontFamily(img.captionStyle.font),
                  fontSize: getFontSize(img.captionStyle.size, img.captionStyle.customSize),
                  color: img.captionStyle.color,
                  backgroundColor: img.captionStyle.highlightColor || "transparent",
                  fontWeight: img.captionStyle.bold ? "bold" : "normal",
                  fontStyle: img.captionStyle.italic ? "italic" : "normal",
                  textDecoration: img.captionStyle.underline ? "underline" : "none",
                  textAlign: img.captionStyle.alignment as React.CSSProperties["textAlign"],
                  width: "100%",
                  minWidth: "unset",
                  display: "block",
                  lineHeight: "1.6",
                  whiteSpace: "normal",
                  padding: img.captionStyle.highlightColor ? "4px 8px" : "0",
                  borderRadius: img.captionStyle.highlightColor ? "4px" : "0",
                }}
              >
                {showArtist && (
                  <span
                    className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-xs empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleCaptionBlur(artwork, img.id, "artistName", e.currentTarget.textContent || "")}
                    data-placeholder="Artist Name"
                  >
                    {img.caption.artistName}
                  </span>
                )}

                {((hasArtist && (hasArea || hasDimensions || hasMedium || hasYear)) || allEmpty) && (
                  <span>, </span>
                )}

                {showArea && (
                  <em>
                    <span
                      className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-xs empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:not-italic"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleCaptionBlur(artwork, img.id, "area", e.currentTarget.textContent || "")}
                      data-placeholder="Area"
                    >
                      {img.caption.area}
                    </span>
                  </em>
                )}

                {((hasArea && (hasDimensions || hasMedium || hasYear)) || allEmpty) && (
                  <span>, </span>
                )}

                {showDimensions && (
                  <span
                    className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-xs empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
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
                    className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-xs empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
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
                    className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-xs empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleCaptionBlur(artwork, img.id, "year", e.currentTarget.textContent || "")}
                    data-placeholder="Year"
                  >
                    {img.caption.year}
                  </span>
                )}
              </div>
            </DraggableBlock>
          );

          const showCustomLine = !img.hideCustomLine;

          const customLineBlock = (
            <div
              className="mt-1 w-full"
              style={{ textAlign: (img.customLineStyle ?? img.captionStyle).alignment as React.CSSProperties["textAlign"] }}
            >
              <DraggableBlock
                layout={img.customLineLayout}
                onLayoutChange={(newLayout) => {
                  if (onUpdateArtwork) {
                    const updatedImages = artwork.images.map((i) =>
                      i.id === img.id ? { ...i, customLineLayout: newLayout } : i
                    );
                    onUpdateArtwork(artwork.id, { images: updatedImages });
                  }
                }}
                noPlaceholder
                className="custom-line-draggable"
                width="fit-content"
                minWidth="unset"
                deleteTitle="Delete/Hide custom line"
                onResizeText={(newSize) => {
                  if (onUpdateArtwork) {
                    const updatedImages = artwork.images.map((i) => {
                      if (i.id === img.id) {
                        const style = i.customLineStyle ?? i.captionStyle;
                        return {
                          ...i,
                          customLineStyle: {
                            ...style,
                            customSize: newSize,
                          },
                        };
                      }
                      return i;
                    });
                    onUpdateArtwork(artwork.id, { images: updatedImages });
                  }
                }}
                startFontSize={(img.customLineStyle ?? img.captionStyle).customSize ?? ((img.customLineStyle ?? img.captionStyle).size === "sm" ? 13 : (img.customLineStyle ?? img.captionStyle).size === "lg" ? 18 : 15)}
                onDelete={() => {
                  if (onUpdateArtwork) {
                    const updatedImages = artwork.images.map((i) =>
                      i.id === img.id ? { ...i, hideCustomLine: true } : i,
                    );
                    onUpdateArtwork(artwork.id, { images: updatedImages });
                  }
                }}
                trimPageHeight={settings.trimPageHeight}
              >
                <span
                  className="outline-none cursor-text transition-colors duration-200 hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-1 focus:ring-sienna/20 rounded-xs empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:italic"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCaptionBlur(artwork, img.id, "customLine", e.currentTarget.textContent || "")}
                  data-placeholder="Custom Line (Optional)"
                  style={{
                    fontFamily: getFontFamily((img.customLineStyle ?? img.captionStyle).font),
                    fontSize: getFontSize((img.customLineStyle ?? img.captionStyle).size, (img.customLineStyle ?? img.captionStyle).customSize),
                    color: (img.customLineStyle ?? img.captionStyle).color,
                    backgroundColor: (img.customLineStyle ?? img.captionStyle).highlightColor || "transparent",
                    fontWeight: (img.customLineStyle ?? img.captionStyle).bold ? "bold" : "normal",
                    fontStyle: (img.customLineStyle ?? img.captionStyle).italic ? "italic" : "normal",
                    textDecoration: (img.customLineStyle ?? img.captionStyle).underline ? "underline" : "none",
                    padding: (img.customLineStyle ?? img.captionStyle).highlightColor ? "2px 6px" : "0",
                    borderRadius: (img.customLineStyle ?? img.captionStyle).highlightColor ? "3px" : "0",
                    display: "inline-block",
                  }}
                >
                  {img.caption.customLine || ""}
                </span>
              </DraggableBlock>
            </div>
          );

          return (
            <div
              key={img.id}
              className="relative flex flex-col gap-3 w-full"
            >
              {captionPosition === "header" && showCaption && (
                <>
                  {captionBlock}
                  {showCustomLine && customLineBlock}
                </>
              )}
              <DraggableBlock
                layout={img.imageLayout}
                onLayoutChange={(newLayout) => {
                  if (onUpdateArtwork) {
                    const updatedImages = artwork.images.map((i) =>
                      i.id === img.id ? { ...i, imageLayout: newLayout } : i,
                    );
                    onUpdateArtwork(artwork.id, { images: updatedImages });
                  }
                }}
                className="image-draggable"
                width={img.width ? `${img.width}px` : "fit-content"}
                minWidth="unset"
                trimPageHeight={settings.trimPageHeight}
                noPlaceholder={false}
              >
                <ResizableImage
                  img={img}
                  artworkId={artwork.id}
                  isOnlyChild={artwork.images.length === 1}
                  onResize={(w, h) => {
                    if (onUpdateArtwork) {
                      const updatedImages = artwork.images.map((i) =>
                        i.id === img.id ? { ...i, width: w, height: h } : i,
                      );
                      onUpdateArtwork(artwork.id, { images: updatedImages });
                    }
                  }}
                />
              </DraggableBlock>
              {captionPosition === "footer" && showCaption && (
                <>
                  {captionBlock}
                  {showCustomLine && customLineBlock}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Biography — draggable anywhere on the page */}
      {settings.showBioAfterEachPhoto && (
        <DraggableBlock
          layout={artwork.bioLayout}
          onLayoutChange={(lay) =>
            onUpdateArtwork?.(artwork.id, { bioLayout: lay })
          }
          className="bio-draggable"
          trimPageHeight={settings.trimPageHeight}
          noPlaceholder={settings.trimPageHeight}
        >
          <hr className="border-none border-t border-border-warm my-5" />
          <p
            className="text-[13px] text-muted-foreground leading-relaxed m-0 wrap-break-words min-h-[1em] outline-none rounded-xs px-0.5 mx-0.5 transition-all duration-200 cursor-text block hover:bg-sienna/5 focus:bg-sienna/10 focus:ring-2 focus:ring-sienna/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:italic"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBiographyBlur(artwork, e.currentTarget.textContent || "")}
            data-placeholder="Write your biography here..."
          >
            {artwork.biography}
          </p>
        </DraggableBlock>
      )}

      {/* Dynamic Crop Handle */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center z-45 group/crop select-none transition-all duration-200 ${
          livePageHeight !== null 
            ? "bg-stone-500/10" 
            : "hover:bg-stone-500/5"
        }`}
        onMouseDown={handleCropStart}
        title="Drag up/down to cut page height manually"
        data-pdf-ignore="true"
      >
        {/* Horizontal Visual Guide Line */}
        <div 
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] transition-all duration-200 ${
            livePageHeight !== null 
              ? "bg-sienna scale-y-110 shadow-xs" 
              : "bg-neutral-300 border-t border-dashed border-neutral-400 group-hover/crop:bg-sienna group-hover/crop:border-none"
          }`}
        />

        {/* Central Floating Crop Pill */}
        <div 
          className={`px-3 py-1 rounded-full border bg-white shadow-md flex items-center gap-2 text-[10px] font-medium tracking-wide transition-all duration-200 pointer-events-none z-50 ${
            livePageHeight !== null 
              ? "scale-105 border-sienna text-sienna" 
              : "border-stone-200 text-stone-600 group-hover/crop:border-sienna group-hover/crop:text-sienna group-hover/crop:scale-105"
          }`}
        >
          <Scissors size={10} className={livePageHeight !== null ? "animate-pulse" : ""} />
          <span>PAGE HEIGHT:</span>
          <span className="font-mono font-semibold">{activeHeight}px</span>
        </div>

        {/* Left/Right Edge Crop Accent Marks */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover/crop:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-1.5 h-3 border-l-2 border-t-2 border-sienna" />
          <div className="w-1.5 h-3 border-r-2 border-b-2 border-sienna rotate-180" />
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover/crop:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-1.5 h-3 border-l-2 border-t-2 border-sienna rotate-90" />
          <div className="w-1.5 h-3 border-r-2 border-b-2 border-sienna -rotate-90" />
        </div>
      </div>

      {/* Reset Trim Button */}
      {artwork.customPageHeight !== undefined && (
        <button
          onClick={() => onUpdateArtwork?.(artwork.id, { customPageHeight: undefined })}
          className="absolute bottom-6 right-4 bg-white/95 text-stone-700 hover:text-sienna border border-border-warm rounded-md px-2.5 py-1 text-xs hover:bg-stone-50 cursor-pointer shadow-sm z-40 flex items-center gap-1 transition-all"
          title="Reset page height to default"
          data-pdf-ignore="true"
        >
          <Undo2 size={12} />
          Reset Trim
        </button>
      )}
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
              <ScaledPage scale={scale}>
                <ArtworkPage
                  artwork={artwork}
                  settings={settings}
                  scale={scale}
                  onUpdateArtwork={onUpdateArtwork}
                />
              </ScaledPage>

              {index < artworks.length - 1 && (
                <div className="h-0.5 w-3/5 bg-linear-to-r from-transparent via-border-warm to-transparent my-1 mx-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}