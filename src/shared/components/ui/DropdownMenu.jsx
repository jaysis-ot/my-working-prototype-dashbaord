// src/components/ui/DropdownMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import Portal from './Portal';

const DropdownMenu = ({ 
  trigger, 
  children, 
  isOpen, 
  onOpenChange,
  placement = 'bottom-start',
  offset = { x: 0, y: 8 } 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = rect.left + scrollX;
    let y = rect.bottom + scrollY + offset.y;

    if (placement.includes('top')) {
      y = rect.top + scrollY - offset.y;
    }
    if (placement.includes('right')) {
      x = rect.right + scrollX - offset.x;
    }
    if (placement.includes('center')) {
      x = rect.left + scrollX + rect.width / 2;
    }

    setPosition({ x: x + offset.x, y });
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isOpen, placement]);

  return (
    <>
      <div ref={triggerRef} onClick={() => onOpenChange(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <Portal 
          isOpen={isOpen} 
          onClose={() => onOpenChange(false)}
          className="justify-start items-start"
        >
          <div
            style={{
              position: 'absolute',
              left: position.x,
              top: position.y,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              padding: '0.5rem',
              minWidth: '12rem',
              zIndex: 10000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  );
};

const DropdownMenuItem = ({ children, onClick, className = '', ...props }) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors text-left ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

export { DropdownMenu, DropdownMenuItem };