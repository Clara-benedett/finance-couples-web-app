
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";

interface SmartCardDropdownProps {
  isOpen: boolean;
  suggestions: string[];
  value: string;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onSuggestionClick: (suggestion: string) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

const SmartCardDropdown = ({
  isOpen,
  suggestions,
  value,
  dropdownRef,
  onSuggestionClick,
  onMouseDown
}: SmartCardDropdownProps) => {

  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  return (
    <Card 
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 shadow-lg border bg-white"
      onMouseDown={onMouseDown}
    >
      <CardContent className="p-2 max-h-60 overflow-y-auto">
        {/* Common Cards Section */}
        {suggestions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">
              Common Card Names
            </div>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-2 text-left"
                onClick={() => onSuggestionClick(suggestion)}
                type="button"
              >
                <div className="flex items-center gap-2 w-full">
                  <Sparkles className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium">{suggestion}</div>
                    <div className="text-xs text-gray-500">
                      Common card
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Add Custom Card Option */}
        {value && !suggestions.includes(value) && (
          <div className="border-t pt-2 mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-2 text-left"
              onClick={() => onSuggestionClick(value)}
              type="button"
            >
              <div className="flex items-center gap-2 w-full">
                <Plus className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">Add "{value}"</div>
                  <div className="text-xs text-gray-500">
                    Create new card
                  </div>
                </div>
              </div>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartCardDropdown;
