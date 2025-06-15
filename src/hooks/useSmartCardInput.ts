
import { useState, useRef, useEffect } from 'react';
import { cardClassificationEngine, CardClassificationRule } from "@/utils/cardClassificationRules";

interface UseSmartCardInputProps {
  value: string;
  onExistingRuleSelected?: (rule: CardClassificationRule) => void;
}

export const useSmartCardInput = ({ value, onExistingRuleSelected }: UseSmartCardInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [existingRule, setExistingRule] = useState<CardClassificationRule | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('useSmartCardInput: value changed to:', value);
    
    if (value.length > 0) {
      const suggestions = cardClassificationEngine.getSuggestions(value);
      setSuggestions(suggestions);
      setIsOpen(true);
      
      // Check for exact match
      const exact = cardClassificationEngine.getExactMatch(value);
      setExistingRule(exact);
      console.log('useSmartCardInput: existingRule set to:', exact);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setExistingRule(null);
    }
  }, [value]);

  const handleSuggestionClick = (suggestion: string, onChange: (value: string) => void) => {
    console.log('useSmartCardInput: handleSuggestionClick called with:', suggestion);
    console.log('useSmartCardInput: current value before onChange:', value);
    
    // Close the dropdown immediately
    setIsOpen(false);
    
    // Update the input value through the parent component
    console.log('useSmartCardInput: calling onChange with:', suggestion);
    onChange(suggestion);
    
    // Check if this suggestion has an existing rule and notify parent
    const rule = cardClassificationEngine.getExactMatch(suggestion);
    if (rule && onExistingRuleSelected) {
      console.log('useSmartCardInput: Existing rule found for suggestion:', rule);
      onExistingRuleSelected(rule);
    }

    // Update existing rule state
    setExistingRule(rule);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Only close if focus is moving outside the dropdown container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!dropdownRef.current?.contains(relatedTarget)) {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      setIsOpen(true);
    }
  };

  const handleDropdownMouseDown = (e: React.MouseEvent) => {
    // Prevent the input from losing focus when clicking in dropdown
    e.preventDefault();
  };

  return {
    isOpen,
    suggestions,
    existingRule,
    inputRef,
    dropdownRef,
    handleSuggestionClick,
    handleInputBlur,
    handleInputFocus,
    handleDropdownMouseDown
  };
};
