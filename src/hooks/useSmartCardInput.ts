
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
  const isClickingDropdown = useRef(false);

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

  const handleSuggestionClick = (suggestion: string, onChange: (value: string) => void) => {
    console.log('Suggestion clicked:', suggestion);
    
    // Prevent blur from interfering
    isClickingDropdown.current = true;
    
    // Update the input value
    onChange(suggestion);
    
    // Close the dropdown
    setIsOpen(false);
    
    // Check if this suggestion has an existing rule and notify parent
    const rule = cardClassificationEngine.getExactMatch(suggestion);
    if (rule && onExistingRuleSelected) {
      console.log('Existing rule found:', rule);
      setTimeout(() => {
        onExistingRuleSelected(rule);
      }, 10);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isClickingDropdown.current = false;
    }, 100);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if we're clicking within the dropdown
    if (isClickingDropdown.current) {
      return;
    }
    
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!dropdownRef.current?.contains(relatedTarget)) {
      setTimeout(() => setIsOpen(false), 150);
    }
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      setIsOpen(true);
    }
  };

  const handleDropdownMouseDown = () => {
    isClickingDropdown.current = true;
  };

  const handleDropdownMouseUp = () => {
    setTimeout(() => {
      isClickingDropdown.current = false;
    }, 100);
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
    handleDropdownMouseDown,
    handleDropdownMouseUp
  };
};
