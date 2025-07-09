
import { useState, useRef, useEffect } from 'react';
import { cardClassificationService, CardClassificationRule } from '@/services/cardClassificationService';
import { useAuth } from '@/contexts/AuthContext';

interface UseSmartCardInputProps {
  value: string;
}

export const useSmartCardInput = ({ value }: UseSmartCardInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [existingRule, setExistingRule] = useState<CardClassificationRule | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useSmartCardInput: value changed to:', value);
    
    if (value.length > 0 && user) {
      // Get suggestions from common templates
      const suggestions = cardClassificationService.getSuggestions(value);
      setSuggestions(suggestions);
      setIsOpen(true);
      
      // Check for exact match to show the green checkmark indicator
      const checkExistingRule = async () => {
        try {
          const exact = await cardClassificationService.getExactMatch(value);
          setExistingRule(exact);
          console.log('useSmartCardInput: existingRule set to:', exact);
        } catch (error) {
          console.error('Error checking existing rule:', error);
          setExistingRule(null);
        }
      };
      
      checkExistingRule();
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setExistingRule(null);
    }
  }, [value, user]);

  const handleSuggestionClick = async (suggestion: string, onChange: (value: string) => void) => {
    console.log('useSmartCardInput: handleSuggestionClick called with:', suggestion);
    
    // Close the dropdown immediately
    setIsOpen(false);
    
    // Update the input value through the parent component
    console.log('useSmartCardInput: calling onChange with:', suggestion);
    onChange(suggestion);
    
    // Check if this suggestion has an existing rule for the indicator
    if (user) {
      try {
        const rule = await cardClassificationService.getExactMatch(suggestion);
        setExistingRule(rule);
      } catch (error) {
        console.error('Error checking rule for suggestion:', error);
        setExistingRule(null);
      }
    }
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
