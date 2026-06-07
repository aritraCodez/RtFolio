import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportToPDF } from "../lib/pdfExport";
import type { Artwork, PortfolioSettings } from "../types";

interface ExportButtonProps {
  artworks: Artwork[];
  settings: PortfolioSettings;
}

export function ExportButton({ artworks, settings }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (artworks.length === 0) {
      alert("Please add at least one artwork before exporting.");
      return;
    }

    setIsLoading(true);
    try {
      await exportToPDF(artworks, settings);
    } catch (error: any) {
      console.error("PDF export error:", error);
      alert(`Failed to export PDF: ${error?.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading || artworks.length === 0}
      className="w-full bg-sienna hover:bg-sienna-light hover:shadow-md text-white font-body font-medium h-10 px-5 rounded-md flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download size={16} />
          Download PDF
        </>
      )}
    </Button>
  );
}
