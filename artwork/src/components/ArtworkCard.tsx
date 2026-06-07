import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Artwork } from "../types";

interface ArtworkCardProps {
  artwork: Artwork;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ArtworkCard({
  artwork,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}: ArtworkCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 mb-2 border rounded-lg cursor-pointer transition-all duration-200
        ${isSelected
          ? "border-sienna bg-linear-to-br from-parchment to-surface-card shadow-md"
          : "border-border-warm bg-surface-card hover:border-sienna/40 hover:shadow-sm"
        }
        ${isDragging ? "opacity-50 shadow-lg" : "opacity-100"}
      `}
      onClick={onSelect}
      draggable
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <GripVertical size={16} className="text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
        <img
          src={artwork.images[0]?.url}

          className="w-15 h-15 object-cover rounded-md border border-border-warm shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-medium text-foreground m-0 truncate">
        
          </p>
          <p className="font-body text-xs text-muted-foreground m-0 truncate">
            {artwork.images[0]?.caption.artistName}
            {artwork.images[0]?.caption.customLine && ` • ${artwork.images[0]?.caption.customLine}`}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 p-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
