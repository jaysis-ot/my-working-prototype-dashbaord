// src/components/ui/Portal.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ 
  children, 
  isOpen = true, 
  onClose = () => {}, 
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  animationDuration = 250 
}) => {
  const portalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  const handleClose = useCallback((reason = 'backdrop') => {
    if (!closeOnBackdrop && reason === 'backdrop') return;
    if (!closeOnEscape && reason === 'escape') return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setShouldRender(false);
      setIsAnimating(false);
      onClose();
    }, animationDuration);
  }, [closeOnBackdrop, closeOnEscape, onClose, animationDuration]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      handleClose('escape');
    }
  }, [handleClose]);

  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      handleClose('backdrop');
    }
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender) return;

    // Create portal container
    const portalContainer = document.createElement('div');
    portalContainer.className = `portal-root ${className}`;
    portalContainer.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      opacity: ${isAnimating ? 0 : 1};
      transition: opacity ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Add to body
    document.body.appendChild(portalContainer);
    portalRef.current = portalContainer;

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);

    // Focus management
    const activeElement = document.activeElement;
    const firstFocusable = portalContainer.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      
      if (portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
      
      // Restore focus
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus();
      }
    };
  }, [shouldRender, isAnimating, className, animationDuration, handleKeyDown]);

  if (!shouldRender || !portalRef.current) return null;

  return createPortal(
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'hidden',
          transform: isAnimating ? 'scale(0.95) translateY(1rem)' : 'scale(1) translateY(0)',
          transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity: isAnimating ? 0 : 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalRef.current
  );
};

export default Portal;