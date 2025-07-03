import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { useSmartCardInput } from "@/hooks/useSmartCardInput";
import SmartCardDropdown from "./SmartCardDropdown";
import SmartCardStatus from "./SmartCardStatus";

interface SmartCardInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SmartCardInput = ({ 
  value, 
  onChange, 
  placeholder = "e.g., Chase Sapphire, AMEX Gold, BILT Card"
}: SmartCardInputProps) => {
  const { categoryNames } = useCategoryNames();
  
  const {
    isOpen,
    suggestions,
    existingRule,
    inputRef,
    dropdownRef,
    handleSuggestionClick,
    handleInputBlur,
    handleInputFocus,
    handleDropdownMouseDown
  } = useSmartCardInput({ value });

  const getCategoryDisplay = (classification: string) => {
    switch (classification) {
      case 'person1': return categoryNames.person1;
      case 'person2': return categoryNames.person2;
      case 'shared': return categoryNames.shared;
      default: return classification;
    }
  };

  const onSuggestionClick = (suggestion: string) => {
    handleSuggestionClick(suggestion, onChange);
  };

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
      <SmartCardDropdown
        isOpen={isOpen}
        suggestions={suggestions}
        value={value}
        dropdownRef={dropdownRef}
        onSuggestionClick={onSuggestionClick}
        onMouseDown={handleDropdownMouseDown}
      />

      {/* Status Message */}
      <SmartCardStatus value={value} existingRule={existingRule} />
    </div>
  );
};

export default SmartCardInput;
