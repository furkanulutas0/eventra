import { cn } from "@/lib/utils";

interface TimeSlotStatusProps {
  type: "1:1" | "group";
  isTaken: boolean;
  isSelected: boolean;
}

export function TimeSlotStatus({ type, isTaken, isSelected }: TimeSlotStatusProps) {
  if (type === "1:1") {
    return (
      <div
        className={cn(
          "inline-flex items-center px-2 py-1 rounded text-xs",
          isTaken && "bg-gray-100 text-gray-500",
          isSelected && "bg-primary/10 text-primary"
        )}
      >
        {isTaken ? "Taken" : isSelected ? "Selected" : "Available"}
      </div>
    );
  }

  return null;
} 