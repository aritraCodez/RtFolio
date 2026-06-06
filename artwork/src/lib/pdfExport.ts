import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Artwork, PortfolioSettings } from "../types";

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
 
export async function exportToPDF(
  artworks: Artwork[],
  settings: PortfolioSettings,
): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");
  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;

  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i];

    // Create an off-screen render container
    const container = document.createElement("div");
    container.style.cssText = `
      width: 794px;
      background: #FAF7F2;
      padding: 60px;
      font-family: 'DM Sans', sans-serif;
      color: #1C1917;
      position: fixed;
      left: -9999px;
      top: -9999px;
    `;

    // Build vertical stack of images and their captions
    const contentHTML = artwork.images
      .map((img) => {
        const widthStyle = img.width ? `${img.width}px` : "100%";
        const heightStyle = img.height ? `${img.height}px` : "auto";
        const maxHeightStyle = img.height ? "none" : "480px";

        // Build the caption HTML for this image
        const captionHTML = `
          <strong>${img.caption.artistName}</strong>
          ${img.caption.artistName ? ", " : ""}
          <em>${img.caption.title}</em>
          ${img.caption.title ? ", " : ""}
          ${img.caption.dimensions}
          ${img.caption.dimensions ? ", " : ""}
          ${img.caption.medium}
          ${img.caption.medium ? ", " : ""}
          ${img.caption.year}
          ${img.caption.customLine ? `<br />${img.caption.customLine}` : ""}
        `;

        return `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 32px;">
            <div style="width: ${widthStyle}; height: ${heightStyle}; max-height: ${maxHeightStyle}; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <img src="${img.url}" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
            </div>
            <div style="
              font-family: ${getFontFamily(img.captionStyle.font)};
              font-size: ${getFontSize(img.captionStyle.size)};
              color: ${img.captionStyle.color};
              text-align: ${img.captionStyle.alignment};
              width: 100%;
              line-height: 1.6;
            ">
              ${captionHTML}
            </div>
          </div>
        `;
      })
      .join("");

    const biographyHTML =
      settings.showBioAfterEachPhoto && artwork.biography
        ? `
      <hr style="border:none;border-top:1px solid #D9CFC3;margin:20px 0;" />
      <p style="font-size:13px;color:#78716C;line-height:1.8;margin:0;">
        ${artwork.biography.replace(/\n/g, "<br />")}
      </p>
    `
        : "";

    container.innerHTML = `
      <div style="position:relative; min-height:1123px; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100%;">
          ${contentHTML}
        </div>
        ${biographyHTML}
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH, A4_HEIGHT);
    } finally {
      document.body.removeChild(container);
    }
  }

  pdf.save(`${settings.portfolioTitle || "portfolio"}.pdf`);
}
