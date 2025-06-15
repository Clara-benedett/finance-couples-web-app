import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Plus, CreditCard, Sparkles } from "lucide-react";
import { cardClassificationEngine } from "@/utils/cardClassificationRules";
import { getCategoryNames } from "@/utils/categoryNames";

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
  const categoryNames = getCategoryNames();

  const getCategoryDisplay = (classification: string) => {
    switch (classification) {
      case 'person1': return categoryNames.person1;
      case 'person2': return categoryNames.person2;
      case 'shared': return categoryNames.shared;
      default: return classification;
    }
  };

  const existingCards = cardClassificationEngine.getAllRules().map(rule => rule.cardName);
  const newSuggestions = suggestions.filter(s => !existingCards.includes(s));
  const existingSuggestions = suggestions.filter(s => existingCards.includes(s));

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
        {/* Existing Cards Section */}
        {existingSuggestions.length > 0 && (
          <div className="space-y-1 mb-3">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">
              Existing Cards
            </div>
            {existingSuggestions.map((suggestion, index) => {
              const rule = cardClassificationEngine.getExactMatch(suggestion);
              return (
                <div
                  key={`existing-${index}`}
                  className="w-full p-2 text-left hover:bg-gray-100 cursor-pointer rounded border"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-2 w-full pointer-events-none">
                    <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion}</div>
                      {rule && (
                        <div className="text-xs text-green-600">
                          Auto-classified as {getCategoryDisplay(rule.classification)}
                        </div>
                      )}
                    </div>
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Cards Section */}
        {newSuggestions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">
              {existingSuggestions.length > 0 ? 'Common Card Names' : 'Suggestions'}
            </div>
            {newSuggestions.map((suggestion, index) => (
              <Button
                key={`new-${index}`}
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
                      Add new card
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
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
