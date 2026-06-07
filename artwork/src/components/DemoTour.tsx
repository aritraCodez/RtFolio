import React, { useMemo, useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { X } from "lucide-react";
import { useArtworks } from "../hooks/useArtworks";

interface TourStep {
  title: string;
  content: string;
  targetId?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "🎨 Welcome to RtFolio!",
    content: "RtFolio helps you build publication-quality A4 artist portfolios. Let's take a quick 1-minute interactive tour of the main features!",
    placement: "center"
  },
  {
    title: "📂 Organize Your Artworks",
    content: "This sidebar displays all your project pages. You can click 'Add New Artwork' to create a new page, or drag and drop projects to change their order.",
    targetId: "tour-sidebar",
    placement: "right"
  },
  {
    title: "🖼️ Manage Project Images",
    content: "Upload multiple photos for a single project here. Drag the thumbnails to change their display order, or click the X to delete an image.",
    targetId: "tour-images",
    placement: "bottom"
  },
  {
    title: "✍️ Customize Captions & Styles",
    content: "Type your captions and global biography directly. Customize fonts, sizes, colors, alignments, and background highlights to fit your branding.",
    targetId: "tour-caption-editor",
    placement: "right"
  },
  {
    title: "👁️ Real-Time Live Preview",
    content: "See exactly how your A4 pages look in real-time. Hover over elements in the preview to reveal drag handles, allowing you to position captions and images anywhere on the page!",
    targetId: "tour-preview",
    placement: "left"
  },
  {
    title: "🔍 Full-Screen Button",
    content: "Click this Maximize icon at the top of the Preview panel to open the Full-Scale Editor modal.",
    targetId: "tour-fullscreen",
    placement: "left"
  },
  {
    title: "🔍 Full-Scale A4 Editor",
    content: "This is the Full-Scale Editor. Here you can zoom in and out to edit and position elements in a distraction-free, full-scale environment.",
    targetId: "tour-zoom-controls",
    placement: "bottom"
  },
  {
    title: "✂️ Page Cropping",
    content: "Hover over the bottom border of any A4 page in the preview to reveal the crop handle. Click and drag it up or down to crop or extend the page height custom!",
    targetId: "tour-crop-handle",
    placement: "top"
  },
  {
    title: "❌ Close Fullscreen Editor",
    content: "Click this Close button to exit the fullscreen editor and return to the main dashboard layout.",
    targetId: "tour-close-fullscreen",
    placement: "bottom"
  },
  {
    title: "📥 Export Publication-Ready PDFs",
    content: "Once you are happy with the layout, click the Export PDF button to download a high-resolution, print-ready document. All editing handles and indicators are automatically hidden in the final PDF!",
    targetId: "tour-export",
    placement: "bottom"
  },
  {
    title: "🚀 You are Ready!",
    content: "That's it! You're ready to create beautiful portfolios. Go ahead and upload your first artwork to get started!",
    placement: "center"
  }
];

interface DemoTourProps {
  isActive: boolean;
  onClose: () => void;
  onTriggerFullscreen?: (open: boolean) => void;
}

export function DemoTour({ isActive, onClose, onTriggerFullscreen }: DemoTourProps) {
  const { artworks, addArtwork, updateArtwork } = useArtworks();
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowClass, setArrowClass] = useState<string>("");
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize tour step when active
  useEffect(() => {
    if (isActive) {
      setTourStep(0);
      if (artworks.length === 0) {
        const mockFile1 = new File([""], "abstract_painting_1.jpg", { type: "image/jpeg" });
        const mockFile2 = new File([""], "abstract_painting_2.jpg", { type: "image/jpeg" });
        addArtwork([mockFile1, mockFile2]);
      }
    } else {
      setTourStep(null);
    }
  }, [isActive, artworks.length, addArtwork]);

  // Trigger fullscreen modal on steps 7, 8, and 9
  useEffect(() => {
    if (isActive && tourStep !== null) {
      if (tourStep === 6 || tourStep === 7 || tourStep === 8) {
        onTriggerFullscreen?.(true);
      } else {
        onTriggerFullscreen?.(false);
      }
    } else {
      onTriggerFullscreen?.(false);
    }
  }, [isActive, tourStep, onTriggerFullscreen]);

  // Load sample content for the demo artwork
  useEffect(() => {
    if (isActive && tourStep !== null && artworks.length > 0) {
      const sampleArtwork = artworks[0];
      if (
        sampleArtwork.images.length === 2 &&
        sampleArtwork.images[0].file.name === "abstract_painting_1.jpg" &&
        !sampleArtwork.images[0].url.startsWith("https://")
      ) {
        const updatedImages = [
          {
            ...sampleArtwork.images[0],
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
            caption: {
              artistName: "Partho Chatterjee",
              area: "Delhi",
              dimensions: "40\" x 40\"",
              medium: "Mixed Media on Canvas",
              year: "2026",
              customLine: "Featured",
            }
          },
          {
            ...sampleArtwork.images[1],
            url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
            caption: {
              artistName: "Partho Chatterjee",
              area: "Delhi",
              dimensions: "40\" x 40\"",
              medium: "Oil on Linen",
              year: "2026",
              customLine: "Private Collection, Milan",
            }
          }
        ];
        updateArtwork(sampleArtwork.id, {
          images: updatedImages,
          biography: "Basically I used Mixed media on rice paper pasted on canvas. After making my surface ground I used pigment colour like imported earth colour with some acrylic colour (for binder). After color layer, I used imported charcoal pencil, ink, gold foil for texture and special effect."
        });
      }
    }
  }, [isActive, tourStep, artworks, updateArtwork]);

  const updateTooltipPosition = useCallback(() => {
    if (tourStep === null || tourStep < 0 || tourStep >= TOUR_STEPS.length) return;
    const step = TOUR_STEPS[tourStep];

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const minPadding = 16;
    const gap = 12;
    const tooltipWidth = 320;
    const measuredHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 220;

    if (!step.targetId) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2100,
      });
      setArrowClass("");
      setArrowStyle({});
      return;
    }

    const el = document.getElementById(step.targetId);
    if (!el) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2100,
      });
      setArrowClass("");
      setArrowStyle({});
      return;
    }

    const rect = el.getBoundingClientRect();
    
    // Determine placement with fallback flipping if it goes offscreen
    let placement = step.placement || "bottom";

    if (placement === "left") {
      const leftSpace = rect.left - gap;
      if (leftSpace < tooltipWidth + minPadding) {
        const rightSpace = viewportW - rect.right - gap;
        if (rightSpace >= tooltipWidth + minPadding) {
          placement = "right";
        } else {
          placement = "bottom";
        }
      }
    } else if (placement === "right") {
      const rightSpace = viewportW - rect.right - gap;
      if (rightSpace < tooltipWidth + minPadding) {
        const leftSpace = rect.left - gap;
        if (leftSpace >= tooltipWidth + minPadding) {
          placement = "left";
        } else {
          placement = "bottom";
        }
      }
    }

    // Secondary vertical space check after potential horizontal flips
    if (placement === "top") {
      const topSpace = rect.top - gap;
      if (topSpace < measuredHeight + minPadding) {
        const bottomSpace = viewportH - rect.bottom - gap;
        if (bottomSpace >= measuredHeight + minPadding) {
          placement = "bottom";
        }
      }
    } else if (placement === "bottom") {
      const bottomSpace = viewportH - rect.bottom - gap;
      if (bottomSpace < measuredHeight + minPadding) {
        const topSpace = rect.top - gap;
        if (topSpace >= measuredHeight + minPadding) {
          placement = "top";
        }
      }
    }

    // Calculate raw position of the tooltip box
    let boxLeft = 0;
    let boxTop = 0;

    if (placement === "bottom") {
      boxLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      boxTop = rect.bottom + gap;
    } else if (placement === "top") {
      boxLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      boxTop = rect.top - gap - measuredHeight;
    } else if (placement === "left") {
      boxLeft = rect.left - gap - tooltipWidth;
      boxTop = rect.top + rect.height / 2 - measuredHeight / 2;
    } else if (placement === "right") {
      boxLeft = rect.right + gap;
      boxTop = rect.top + rect.height / 2 - measuredHeight / 2;
    }

    // Clamp tooltip position inside viewport
    const clampedLeft = Math.max(minPadding, Math.min(boxLeft, viewportW - tooltipWidth - minPadding));
    const clampedTop = Math.max(minPadding, Math.min(boxTop, viewportH - measuredHeight - minPadding));

    // Dynamic arrow positioning to point exactly at target center
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    let arrowClassStr = "";
    let arrowStyleObj: React.CSSProperties = {};

    if (placement === "bottom") {
      arrowClassStr = "absolute -top-1.5 w-3 h-3 bg-white border-t border-l border-stone-200/80 rotate-45";
      const arrowLeft = targetCenterX - clampedLeft;
      const clampedArrowLeft = Math.max(16, Math.min(arrowLeft, tooltipWidth - 16));
      arrowStyleObj = { left: `${clampedArrowLeft}px` };
    } else if (placement === "top") {
      arrowClassStr = "absolute -bottom-1.5 w-3 h-3 bg-white border-b border-r border-stone-200/80 rotate-45";
      const arrowLeft = targetCenterX - clampedLeft;
      const clampedArrowLeft = Math.max(16, Math.min(arrowLeft, tooltipWidth - 16));
      arrowStyleObj = { left: `${clampedArrowLeft}px` };
    } else if (placement === "left") {
      arrowClassStr = "absolute -right-1.5 w-3 h-3 bg-white border-t border-r border-stone-200/80 rotate-45";
      const arrowTop = targetCenterY - clampedTop;
      const clampedArrowTop = Math.max(16, Math.min(arrowTop, measuredHeight - 16));
      arrowStyleObj = { top: `${clampedArrowTop}px` };
    } else if (placement === "right") {
      arrowClassStr = "absolute -left-1.5 w-3 h-3 bg-white border-b border-l border-stone-200/80 rotate-45";
      const arrowTop = targetCenterY - clampedTop;
      const clampedArrowTop = Math.max(16, Math.min(arrowTop, measuredHeight - 16));
      arrowStyleObj = { top: `${clampedArrowTop}px` };
    }

    setTooltipStyle({
      position: "fixed",
      top: `${clampedTop}px`,
      left: `${clampedLeft}px`,
      width: `${tooltipWidth}px`,
      zIndex: 2100,
    });
    setArrowClass(arrowClassStr);
    setArrowStyle(arrowStyleObj);
  }, [tourStep]);

  useLayoutEffect(() => {
    if (tourStep !== null) {
      updateTooltipPosition();
      window.addEventListener("resize", updateTooltipPosition);
      window.addEventListener("scroll", updateTooltipPosition, true);
      return () => {
        window.removeEventListener("resize", updateTooltipPosition);
        window.removeEventListener("scroll", updateTooltipPosition, true);
      };
    }
  }, [tourStep, updateTooltipPosition]);

  useEffect(() => {
    if (tourStep === null) return;
    const step = TOUR_STEPS[tourStep];
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const timer = setTimeout(updateTooltipPosition, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [tourStep, updateTooltipPosition]);

  // Global click interception to close the tour if clicking outside,
  // but allow full click/drag interactions inside the target spotlight element
  useEffect(() => {
    if (tourStep === null) return;
    
    const handleGlobalClick = (e: MouseEvent) => {
      const step = TOUR_STEPS[tourStep];
      const tooltipEl = tooltipRef.current;

      // Allow clicks inside the tooltip card itself (Next, Back, Skip, Close buttons)
      if (tooltipEl && tooltipEl.contains(e.target as Node)) {
        return;
      }

      // Allow clicks inside the target element
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el && el.contains(e.target as Node)) {
          return;
        }
      }

      // Otherwise, close the tour
      onClose();
    };

    window.addEventListener("mousedown", handleGlobalClick, true);
    return () => {
      window.removeEventListener("mousedown", handleGlobalClick, true);
    };
  }, [tourStep, onClose]);

  const spotlightStyle = useMemo<React.CSSProperties>(() => {
    if (tourStep === null || tourStep < 0 || tourStep >= TOUR_STEPS.length) return { display: "none" };
    const step = TOUR_STEPS[tourStep];
    if (!step.targetId) return { display: "none" };

    const el = document.getElementById(step.targetId);
    if (!el) return { display: "none" };

    const rect = el.getBoundingClientRect();
    const padding = 8;
    return {
      position: "fixed",
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
      borderRadius: "12px",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
      pointerEvents: "none",
      zIndex: 2050,
      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    };
  }, [tourStep]);

  if (tourStep === null) return null;

  return (
    <>
      {/* Spotlight Click Blocker (visually darkens screen but allows interactions to pass through to the spotlight area) */}
      <div
        className="fixed inset-0 bg-black/45 z-2040 animate-tooltip-fade pointer-events-none"
      />

      {/* Spotlight highlight overlay */}
      {TOUR_STEPS[tourStep].targetId && document.getElementById(TOUR_STEPS[tourStep].targetId!) && (
        <div style={spotlightStyle} />
      )}

      {/* Floating Tooltip Card */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="w-80 bg-white border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-2xl p-5 z-2100 flex flex-col gap-4 animate-tooltip-fade text-stone-800"
      >
        {arrowClass && <div className={arrowClass} style={arrowStyle} />}

        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold font-body select-none">
            Step {tourStep + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            title="Skip tour"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <h4 className="font-display text-base font-bold text-sienna m-0">
            {TOUR_STEPS[tourStep].title}
          </h4>
          <p className="font-body text-[13px] leading-relaxed text-stone-600 m-0">
            {TOUR_STEPS[tourStep].content}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-stone-100">
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors cursor-pointer"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center gap-2">
            {tourStep > 0 && (
              <button
                onClick={() => setTourStep((prev) => prev! - 1)}
                className="px-2.5 py-1.5 rounded-md border border-stone-200 hover:bg-stone-50 font-body text-xs font-medium text-stone-600 cursor-pointer transition-all active:scale-95"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (tourStep === TOUR_STEPS.length - 1) {
                  onClose();
                } else {
                  setTourStep((prev) => prev! + 1);
                }
              }}
              className="px-3.5 py-1.5 rounded-md bg-sienna hover:bg-sienna-dark text-white font-body text-xs font-semibold cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              {tourStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
