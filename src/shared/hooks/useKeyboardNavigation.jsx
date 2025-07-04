// src/hooks/useKeyboardNavigation.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useKeyboardNavigation = (items, onSelect, options = {}) => {
  const {
    enableArrowKeys = true,
    enableEnterKey = true,
    enableEscapeKey = true,
    enableTabKey = false,
    loop = true,
    disabled = false
  } = options;

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);

  const selectNext = useCallback(() => {
    if (!items.length) return;
    
    setSelectedIndex(prev => {
      if (prev === -1) return 0;
      if (prev >= items.length - 1) return loop ? 0 : prev;
      return prev + 1;
    });
  }, [items.length, loop]);

  const selectPrevious = useCallback(() => {
    if (!items.length) return;
    
    setSelectedIndex(prev => {
      if (prev === -1) return items.length - 1;
      if (prev <= 0) return loop ? items.length - 1 : 0;
      return prev - 1;
    });
  }, [items.length, loop]);

  const selectItem = useCallback((index) => {
    if (index >= 0 && index < items.length) {
      setSelectedIndex(index);
      if (onSelect && items[index]) {
        onSelect(items[index], index);
      }
    }
  }, [items, onSelect]);

  const reset = useCallback(() => {
    setSelectedIndex(-1);
    setIsActive(false);
  }, []);

  const activate = useCallback(() => {
    setIsActive(true);
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (disabled || !isActive) return;

    const handleKeyDown = (e) => {
      const { key, metaKey, ctrlKey, shiftKey, altKey } = e;
      
      // Don't interfere with modifier key combinations
      if (metaKey || ctrlKey || altKey) return;

      switch (key) {
        case 'ArrowDown':
          if (enableArrowKeys) {
            e.preventDefault();
            selectNext();
          }
          break;
          
        case 'ArrowUp':
          if (enableArrowKeys) {
            e.preventDefault();
            selectPrevious();
          }
          break;
          
        case 'Enter':
          if (enableEnterKey && selectedIndex >= 0) {
            e.preventDefault();
            selectItem(selectedIndex);
          }
          break;
          
        case 'Escape':
          if (enableEscapeKey) {
            e.preventDefault();
            reset();
          }
          break;
          
        case 'Tab':
          if (enableTabKey) {
            if (shiftKey) {
              e.preventDefault();
              selectPrevious();
            } else {
              e.preventDefault();
              selectNext();
            }
          }
          break;
          
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          setSelectedIndex(items.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    disabled,
    isActive,
    selectedIndex,
    items.length,
    enableArrowKeys,
    enableEnterKey,
    enableEscapeKey,
    enableTabKey,
    selectNext,
    selectPrevious,
    selectItem,
    reset
  ]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const selectedElement = containerRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);

  return {
    selectedIndex,
    isActive,
    containerRef,
    selectNext,
    selectPrevious,
    selectItem,
    reset,
    activate,
    setSelectedIndex
  };
};