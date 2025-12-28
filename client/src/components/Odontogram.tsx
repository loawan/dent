import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OdontogramProps {
  selectedTooth: number | null;
  onSelectTooth: (toothNumber: number) => void;
  treatedTeeth?: number[];
}

export function Odontogram({ selectedTooth, onSelectTooth, treatedTeeth = [] }: OdontogramProps) {
  const [dentitionType, setDentitionType] = useState<"permanent" | "primary" | "mixed">("permanent");

  // FDI notation: 
  // Permanent: 18-11, 21-28 (Upper); 48-41, 31-38 (Lower)
  // Primary: 55-51, 61-65 (Upper); 85-81, 71-75 (Lower)
  
  const permanentUpperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const permanentUpperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const permanentLowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];
  const permanentLowerRight = [48, 47, 46, 45, 44, 43, 42, 41];

  const primaryUpperRight = [55, 54, 53, 52, 51];
  const primaryUpperLeft = [61, 62, 63, 64, 65];
  const primaryLowerLeft = [71, 72, 73, 74, 75];
  const primaryLowerRight = [85, 84, 83, 82, 81];

  const renderQuadrant = (quadrant: "ur" | "ul" | "lr" | "ll") => {
    let permanent: number[] = [];
    let primary: number[] = [];
    let title = "";
    let isRight = false;

    switch (quadrant) {
      case "ur":
        permanent = permanentUpperRight;
        primary = primaryUpperRight;
        title = "Upper Right";
        isRight = true;
        break;
      case "ul":
        permanent = permanentUpperLeft;
        primary = primaryUpperLeft;
        title = "Upper Left";
        break;
      case "lr":
        permanent = permanentLowerRight;
        primary = primaryLowerRight;
        title = "Lower Right";
        isRight = true;
        break;
      case "ll":
        permanent = permanentLowerLeft;
        primary = primaryLowerLeft;
        title = "Lower Left";
        break;
    }

    return (
      <div className="space-y-4">
        <p className={clsx("text-[10px] uppercase tracking-wider text-muted-foreground font-bold", !isRight && "text-right")}>
          {title}
        </p>
        
        {/* Permanent Teeth Row */}
        {(dentitionType === "permanent" || dentitionType === "mixed") && (
          <div className="grid grid-cols-8 gap-1.5">
            {permanent.map((num) => (
              <Tooth 
                key={num} 
                number={num} 
                isSelected={selectedTooth === num}
                isTreated={treatedTeeth.includes(num)}
                onClick={() => onSelectTooth(num)} 
              />
            ))}
          </div>
        )}

        {/* Primary Teeth Row */}
        {(dentitionType === "primary" || dentitionType === "mixed") && (
          <div className="grid grid-cols-8 gap-1.5 mt-2">
            {isRight && dentitionType === "mixed" && Array(3).fill(null).map((_, i) => <div key={`empty-p-r-${i}`} className="w-8 h-10 md:w-10 md:h-12" />)}
            {primary.map((num) => (
              <Tooth 
                key={num} 
                number={num} 
                isSelected={selectedTooth === num}
                isTreated={treatedTeeth.includes(num)}
                onClick={() => onSelectTooth(num)} 
                isPrimary
              />
            ))}
            {!isRight && dentitionType === "mixed" && Array(3).fill(null).map((_, i) => <div key={`empty-p-l-${i}`} className="w-8 h-10 md:w-10 md:h-12" />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h3 className="font-display font-semibold text-lg">Odontogram (FDI)</h3>
        <Tabs value={dentitionType} onValueChange={(v: any) => setDentitionType(v)} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="permanent">Permanent</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="mixed">Mixed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 relative">
        {/* Center line vertical */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2 hidden md:block"></div>
        {/* Horizontal separator */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-border/50 -translate-y-1/2 hidden md:block"></div>
        
        {renderQuadrant("ur")}
        {renderQuadrant("ul")}
        {renderQuadrant("lr")}
        {renderQuadrant("ll")}
      </div>
      
      <div className="mt-12 pt-6 border-t flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-border bg-white"></div>
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-500"></div>
          <span>Treated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-lg border border-border bg-gray-50 flex items-center justify-center text-[8px] font-bold">P</div>
          <span>Primary Tooth</span>
        </div>
      </div>
    </div>
  );
}

function Tooth({ number, isSelected, isTreated, onClick, isPrimary }: { number: number; isSelected: boolean; isTreated: boolean; onClick: () => void; isPrimary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-8 h-10 md:w-10 md:h-12 rounded-lg border flex flex-col items-center justify-center transition-all duration-200 hover:border-primary/50 relative group",
        isSelected 
          ? "border-primary bg-primary/10 z-10" 
          : isTreated
            ? "border-green-500 bg-green-50 text-green-700"
            : isPrimary 
              ? "border-border bg-gray-50/50 text-muted-foreground"
              : "border-border bg-white text-muted-foreground"
      )}
    >
      <span className={clsx(
        "font-bold text-[9px] md:text-xs",
        isSelected ? "text-primary" : ""
      )}>{number}</span>
      
      <svg className={clsx("w-3 h-3 md:w-4 md:h-4 mt-0.5", isSelected ? "text-primary" : isTreated ? "text-green-500" : "text-gray-200")} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2h10c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" />
      </svg>

      {isPrimary && !isSelected && !isTreated && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-200 rounded-full text-[7px] flex items-center justify-center font-bold text-gray-500">P</span>
      )}
    </button>
  );
}
