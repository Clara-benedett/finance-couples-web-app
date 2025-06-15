
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
  const isSettingValueRef = useRef(false);
  const lastSetValueRef = useRef<string>('');

  useEffect(() => {
    // Don't trigger suggestions when we're programmatically setting a value
    if (isSettingValueRef.current && value === lastSetValueRef.current) {
      return;
    }

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
    console.log('handleSuggestionClick called with:', suggestion);
    
    // Set flag and remember what value we're setting
    isSettingValueRef.current = true;
    lastSetValueRef.current = suggestion;
    
    // Close the dropdown
    setIsOpen(false);
    
    // Update the input value
    onChange(suggestion);
    
    // Check if this suggestion has an existing rule and notify parent
    const rule = cardClassificationEngine.getExactMatch(suggestion);
    if (rule && onExistingRuleSelected) {
      console.log('Existing rule found for suggestion:', rule);
      onExistingRuleSelected(rule);
    }

    // Update existing rule state
    setExistingRule(rule);
    
    // Reset the flag after the next tick to allow normal behavior to resume
    setTimeout(() => {
      isSettingValueRef.current = false;
      lastSetValueRef.current = '';
    }, 50);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Only close if focus is moving outside the dropdown container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!dropdownRef.current?.contains(relatedTarget)) {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (value.length > 0 && !isSettingValueRef.current) {
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
