import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import type { Artwork, PortfolioSettings } from "../types";

/**
 * Recursively copies computed styles from source DOM elements onto cloned elements.
 * This guarantees the cloned elements look exactly like their live versions,
 * regardless of parent container style inheritance or cascade rules.
 */
function inlineComputedStyles(source: Element, target: HTMLElement) {
  if (!(source instanceof HTMLElement)) return;

  const computed = getComputedStyle(source);
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i];
    const val = computed.getPropertyValue(prop);
    try {
      target.style.setProperty(prop, val);
    } catch {
      // skip properties that can't be set inline
    }
  }
  target.removeAttribute("class");

  // Recurse into children
  const srcChildren = source.children;
  const tgtChildren = target.children;
  for (let i = 0; i < Math.min(srcChildren.length, tgtChildren.length); i++) {
    inlineComputedStyles(srcChildren[i], tgtChildren[i] as HTMLElement);
  }
}

/* ─── PDF Export ─────────────────────────────────────────── */

export async function exportToPDF(
  _artworks: Artwork[],
  settings: PortfolioSettings,
  container?: HTMLElement,
): Promise<void> {
  try {
    const A4_WIDTH = 210;

    // Select pages only from the target container if specified (prevents exporting both sidebar and fullscreen pages)
    const livePages = container
      ? container.querySelectorAll<HTMLElement>(".preview-page")
      : document.querySelectorAll<HTMLElement>(".preview-page");

    if (livePages.length === 0) {
      throw new Error("No preview pages found in the DOM to export.");
    }

    // Pre-calculate dimensions for all pages based on their live computed layout sizes
    const pageDims = Array.from(livePages).map((el) => {
      const w = el.offsetWidth || 794;
      const h = el.offsetHeight || 1123;
      return {
        widthPx: w,
        heightPx: h,
        widthMm: A4_WIDTH,
        heightMm: (h / w) * A4_WIDTH,
      };
    });

    // Initialize jsPDF with the first page's aspect ratio and dimensions
    const firstPage = pageDims[0];
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [firstPage.widthMm, firstPage.heightMm],
    });

    const stagingEl = document.createElement("div");
    stagingEl.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      z-index: -1;
      pointer-events: none;
      opacity: 0;
    `;
    document.body.appendChild(stagingEl);

    try {
      for (let i = 0; i < livePages.length; i++) {
        const clone = livePages[i].cloneNode(true) as HTMLElement;
        const dims = pageDims[i];

        // ── Mark elements before inlineComputedStyles strips class attributes ──
        clone.querySelectorAll<HTMLElement>(".caption-draggable").forEach((el) => {
          el.setAttribute("data-caption-block", "true");
        });
        clone.querySelectorAll<HTMLElement>(".custom-line-draggable").forEach((el) => {
          el.setAttribute("data-custom-line-block", "true");
        });
        clone.querySelectorAll<HTMLElement>(".page-content").forEach((el) => {
          el.setAttribute("data-page-content", "true");
        });

        // Inline computed styles FIRST on the full unmodified clone.
        // This ensures child indices match the live source exactly (no structure mismatch).
        inlineComputedStyles(livePages[i], clone);

        // ── Cleanup AFTER inlineComputedStyles using data/title attributes ──

        // Step 1: Remove editing UI elements
        clone.querySelectorAll<HTMLElement>("[data-pdf-ignore='true']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Drag to reposition']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Resize Proportionally']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Drag to resize text size']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Drag up/down to cut page height manually']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Reset page height to default']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Delete/Hide caption']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[title='Delete/Hide custom line']").forEach((el) => el.remove());
        clone.querySelectorAll<HTMLElement>("[contenteditable]").forEach((el) => {
          el.removeAttribute("contenteditable");
        });

        // Step 2: For each caption block, rebuild commas around only the filled fields
        clone.querySelectorAll<HTMLElement>("[data-caption-block]").forEach((captionBlock) => {
          const textContainer = captionBlock.querySelector<HTMLElement>("div");
          if (!textContainer) return;

          const dataElements: HTMLElement[] = [];
          Array.from(textContainer.children).forEach((child) => {
            const el = child as HTMLElement;
            const text = el.textContent?.trim() ?? "";

            // Skip the custom line div (mt-1) or inner custom line block
            if (el.tagName === "DIV" && el.classList.contains("mt-1")) return;
            if (el.hasAttribute("data-custom-line-block")) return;

            // Remove empty elements and comma-only spans from the DOM
            if (text === "," || text === "") {
              el.remove();
              return;
            }

            dataElements.push(el);
          });

          // Insert commas only between non-empty elements
          dataElements.forEach((el, index) => {
            if (index < dataElements.length - 1) {
              const comma = document.createElement("span");
              comma.textContent = ", ";
              el.after(comma);
            }
          });
        });

        // Step 3: Remove empty placeholder elements
        clone.querySelectorAll<HTMLElement>("[data-placeholder]").forEach((el) => {
          if (!el.textContent?.trim()) el.remove();
        });

        // Step 4: Remove entirely empty caption blocks
        clone.querySelectorAll<HTMLElement>("[data-caption-block]").forEach((el) => {
          if (!el.textContent?.replace(/[\s,]/g, "")) el.remove();
        });

        // Step 4b: Remove entirely empty custom line blocks
        clone.querySelectorAll<HTMLElement>("[data-custom-line-block]").forEach((el) => {
          if (!el.textContent?.trim()) {
            const wrapper = el.closest(".mt-1");
            if (wrapper) {
              wrapper.remove();
            } else {
              el.remove();
            }
          }
        });

        // Reset positioning styles for 1:1 scale using the actual layout dimensions
        clone.style.transform = "none";
        clone.style.transformOrigin = "top left";
        clone.style.marginBottom = "0";
        clone.style.width = `${dims.widthPx}px`;
        clone.style.minHeight = `${dims.heightPx}px`;
        clone.style.overflow = "visible";
        clone.style.borderRadius = "0";
        clone.style.boxShadow = "none";
        clone.style.background = "#FFFFFF";

        stagingEl.appendChild(clone);

        try {
          // html2canvas-pro natively supports oklch() color function and modern CSS
          const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#FFFFFF",
            width: dims.widthPx,
            height: dims.heightPx,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          if (i > 0) {
            pdf.addPage([dims.widthMm, dims.heightMm]);
          }

          pdf.addImage(imgData, "JPEG", 0, 0, dims.widthMm, dims.heightMm);
        } finally {
          stagingEl.removeChild(clone);
        }
      }
    } finally {
      document.body.removeChild(stagingEl);
    }

    pdf.save(`${settings.portfolioTitle || "portfolio"}.pdf`);
  } catch (error: any) {
    console.error("Internal PDF export error:", error);
    alert(`Internal export error:\n${error?.message || error}\n\nStack:\n${error?.stack}`);
    throw error;
  }
}
