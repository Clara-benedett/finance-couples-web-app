
import { useState, useEffect } from 'react';

const DEBUG_MODE_KEY = 'couply-debug-mode';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DEBUG_MODE_KEY);
    if (saved === 'true') {
      setIsDebugMode(true);
    }
  }, []);

  const toggleDebugMode = () => {
    const newMode = !isDebugMode;
    setIsDebugMode(newMode);
    localStorage.setItem(DEBUG_MODE_KEY, newMode.toString());
  };

  // Keyboard shortcut (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugMode]);

  return {
    isDebugMode,
    toggleDebugMode
  };
};
