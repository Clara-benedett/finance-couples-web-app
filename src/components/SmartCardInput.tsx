
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Plus, CreditCard, Sparkles } from "lucide-react";
import { cardClassificationEngine, CardClassificationRule } from "@/utils/cardClassificationRules";
import { getCategoryNames } from "@/utils/categoryNames";

interface SmartCardInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onExistingRuleSelected?: (rule: CardClassificationRule) => void;
}

const SmartCardInput = ({ 
  value, 
  onChange, 
  placeholder = "e.g., Chase Sapphire, AMEX Gold, BILT Card",
  onExistingRuleSelected
}: SmartCardInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [existingRule, setExistingRule] = useState<CardClassificationRule | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryNames = getCategoryNames();

  useEffect(() => {
    if (value.length > 0) {
      const suggestions = cardClassificationEngine.getSuggestions(value);
      setSuggestions(suggestions);
      setIsOpen(true);
      
      // Check for exact match
      const exact = cardClassificationEngine.getExactMatch(value);
      setExistingRule(exact);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setExistingRule(null);
    }
  }, [value]);

  const handleSuggestionClick = (suggestion: string) => {
    console.log('Suggestion clicked:', suggestion);
    onChange(suggestion);
    setIsOpen(false);
    
    // Check if this suggestion has an existing rule
    const rule = cardClassificationEngine.getExactMatch(suggestion);
    if (rule && onExistingRuleSelected) {
      console.log('Existing rule found:', rule);
      onExistingRuleSelected(rule);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Only close if we're not clicking on the dropdown
    if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
      setTimeout(() => setIsOpen(false), 150);
    }
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      setIsOpen(true);
    }
  };

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

  return (
    <div className="relative space-y-1">
      <Label htmlFor="smart-card-input">Card/Account Name</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="smart-card-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        
        {/* Existing Rule Indicator */}
        {existingRule && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-green-600">
            <Check className="w-3 h-3" />
            <span>→ {getCategoryDisplay(existingRule.classification)}</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <Card 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 shadow-lg border"
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
                    <Button
                      key={`existing-${index}`}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 text-left"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSuggestionClick(suggestion);
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium">{suggestion}</div>
                          {rule && (
                            <div className="text-xs text-green-600">
                              Auto-classified as {getCategoryDisplay(rule.classification)}
                            </div>
                          )}
                        </div>
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </Button>
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
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleSuggestionClick(suggestion);
                    }}
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
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSuggestionClick(value);
                  }}
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
      )}

      {/* Status Message */}
      {value && (
        <div className="text-xs">
          {existingRule ? (
            <span className="text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Using existing rule: {getCategoryDisplay(existingRule.classification)}
            </span>
          ) : (
            <span className="text-blue-600 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              New card rule will be created
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartCardInput;
