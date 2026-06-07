import { useCallback, useState } from "react";
import { Cloud } from "lucide-react";
import { useArtworks } from "@/hooks/useArtworks";

export function UploadZone() {
  const { addArtwork } = useArtworks();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length > 0) {
        addArtwork(files);
      }
    },
    [addArtwork],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.currentTarget.files || []);
      if (files.length > 0) {
        addArtwork(files);
      }
      e.currentTarget.value = "";
    },
    [addArtwork],
  );

  return (
    <div
      className={`w-full max-w-lg border-2 border-dashed border-border-warm rounded-xl py-10 px-5 text-center bg-linear-to-br from-background to-surface-card transition-all duration-300 cursor-pointer hover:border-sienna ${
        isDragging
          ? "border-sienna bg-sienna/5 shadow-[0_0_12px_rgba(160,82,45,0.1)]"
          : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Cloud className="text-sienna mb-3 mx-auto" size={40} />
      <h3 className="font-display text-xl font-medium text-foreground m-0 mb-2">Drop your artworks here</h3>
      <p className="text-muted-foreground my-2 text-sm">or</p>
      <label className="inline-block px-6 py-2.5 bg-sienna hover:bg-sienna-light text-white font-body font-medium text-sm rounded-md cursor-pointer transition-colors duration-200 mt-2 active:scale-[0.98]">
        Click to browse
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
      </label>
      <p className="text-xs text-muted-foreground/70 mt-3 m-0">You can select multiple images at once</p>
    </div>
  );
}
