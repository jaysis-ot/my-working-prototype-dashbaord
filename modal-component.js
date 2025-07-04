// src/components/common/Modal.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Check, Info, AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/**
 * Universal Modal Component
 * 
 * A comprehensive, accessible modal system that integrates with the dashboard
 * state management and supports all modal types across the application.
 * 
 * Features:
 * - Full accessibility with ARIA attributes and focus management
 * - Responsive design with mobile-optimized layouts
 * - Multiple modal types (standard, confirmation, form, viewer)
 * - Theming integration with dark/light mode support
 * - Keyboard navigation (Escape to close, Tab trapping)
 * - Smooth animations and transitions
 * - Portal rendering for proper z-index stacking
 * - Backdrop click handling with optional prevention
 * - Loading states and error handling
 * - Size variants (small, medium, large, fullscreen)
 * - Header/footer customization
 */

// =============================================================================
// MODAL TYPES AND VARIANTS
// =============================================================================

export const MODAL_TYPES = {
  STANDARD: 'standard',
  CONFIRMATION: 'confirmation',
  FORM: 'form',
  VIEWER: 'viewer',
  ALERT: 'alert'
};

export const MODAL_SIZES = {
  SMALL: 'small',      // 400px
  MEDIUM: 'medium',    // 600px
  LARGE: 'large',      // 800px
  XLARGE: 'xlarge',    // 1000px
  FULLSCREEN: 'fullscreen'
};

export const ALERT_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// =============================================================================
// MODAL COMPONENT
// =============================================================================

const Modal = ({
  // Core props
  isOpen = false,
  onClose,
  title = '',
  children,
  
  // Modal configuration
  type = MODAL_TYPES.STANDARD,
  size = MODAL_SIZES.MEDIUM,
  alertType = ALERT_TYPES.INFO,
  
  // Behavior
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventScroll = true,
  showCloseButton = true,
  
  // Content
  header,
  footer,
  loading = false,
  error = null,
  
  // Confirmation modal specific
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  destructive = false,
  
  // Styling
  className = '',
  overlayClassName = '',
  contentClassName = '',
  
  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  
  // Advanced
  initialFocusRef,
  finalFocusRef,
  trapFocus = true,
  
  ...rest
}) => {
  const { getThemeClasses } = useTheme();
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);
  const isFirstRender = useRef(true);

  // =============================================================================
  // FOCUS MANAGEMENT
  // =============================================================================

  const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(modalRef.current.querySelectorAll(focusableSelector));
  }, []);

  const trapFocusInModal = useCallback((event) => {
    if (!trapFocus || !modalRef.current) return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }, [trapFocus, getFocusableElements]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && closeOnEscape && isOpen) {
      event.preventDefault();
      onClose?.();
    }
  }, [closeOnEscape, isOpen, onClose]);

  const handleBackdropClick = useCallback((event) => {
    if (event.target === overlayRef.current && closeOnBackdropClick) {
      onClose?.();
    }
  }, [closeOnBackdropClick, onClose]);

  const handleConfirmAction = useCallback(() => {
    onConfirm?.();
    if (type === MODAL_TYPES.CONFIRMATION) {
      onClose?.();
    }
  }, [onConfirm, onClose, type]);

  const handleCancelAction = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Handle modal opening/closing
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      
      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
      
      // Set initial focus
      setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      }, 100);
      
    } else {
      // Restore body scroll
      if (preventScroll) {
        document.body.style.overflow = '';
      }
      
      // Restore previous focus
      if (previousFocusRef.current && finalFocusRef?.current) {
        finalFocusRef.current.focus();
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    
    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, preventScroll, initialFocusRef, finalFocusRef, getFocusableElements]);

  // Add event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', trapFocusInModal);
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('keydown', trapFocusInModal);
      };
    }
  }, [isOpen, handleEscapeKey, trapFocusInModal]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getAlertIcon = () => {
    const iconClass = "w-6 h-6";
    switch (alertType) {
      case ALERT_TYPES.SUCCESS:
        return <Check className={`${iconClass} text-green-500`} />;
      case ALERT_TYPES.WARNING:
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case ALERT_TYPES.ERROR:
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case MODAL_SIZES.SMALL:
        return 'max-w-md';
      case MODAL_SIZES.MEDIUM:
        return 'max-w-2xl';
      case MODAL_SIZES.LARGE:
        return 'max-w-4xl';
      case MODAL_SIZES.XLARGE:
        return 'max-w-6xl';
      case MODAL_SIZES.FULLSCREEN:
        return 'max-w-full h-full m-0 rounded-none';
      default:
        return 'max-w-2xl';
    }
  };

  const renderHeader = () => {
    if (header) return header;
    
    if (!title && !showCloseButton) return null;
    
    return (
      <div className={`
        flex items-center justify-between p-6 border-b
        ${getThemeClasses('modal', 'header')}
      `}>
        <div className="flex items-center gap-3">
          {type === MODAL_TYPES.ALERT && getAlertIcon()}
          {title && (
            <h2 className={`
              text-xl font-semibold
              ${getThemeClasses('modal', 'title')}
            `}>
              {title}
            </h2>
          )}
        </div>
        
        {showCloseButton && (
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${getThemeClasses('modal', 'closeButton')}
            `}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className={getThemeClasses('modal', 'loadingText')}>Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-6 ${contentClassName}`}>
        {children}
      </div>
    );
  };

  const renderFooter = () => {
    if (footer) return footer;
    
    if (type === MODAL_TYPES.CONFIRMATION) {
      return (
        <div className={`
          flex justify-end gap-3 p-6 border-t
          ${getThemeClasses('modal', 'footer')}
        `}>
          <button
            onClick={handleCancelAction}
            className={`
              px-4 py-2 border rounded-lg font-medium transition-colors
              ${getThemeClasses('button', 'secondary')}
            `}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirmAction}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${destructive 
                ? getThemeClasses('button', 'destructive')
                : getThemeClasses('button', confirmVariant)
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      );
    }
    
    return null;
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black bg-opacity-50 backdrop-blur-sm
        ${size === MODAL_SIZES.FULLSCREEN ? 'p-0' : 'p-4'}
        ${overlayClassName}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
      {...rest}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl w-full
          transform transition-all duration-200 ease-out
          ${isFirstRender.current ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${getSizeClasses()}
          ${getThemeClasses('modal', 'container')}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </div>
    </div>
  );

  // Track first render for animation
  useEffect(() => {
    if (isOpen && isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [isOpen]);

  // Render using portal
  return createPortal(modalContent, document.body);
};

// =============================================================================
// SPECIALIZED MODAL COMPONENTS
// =============================================================================

/**
 * Confirmation Modal - For yes/no decisions
 */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  ...props
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={title}
    type={MODAL_TYPES.CONFIRMATION}
    size={MODAL_SIZES.SMALL}
    confirmText={confirmText}
    cancelText={cancelText}
    destructive={destructive}
    {...props}
  >
    {message && <p className="text-gray-700">{message}</p>}
  </Modal>
);

/**
 * Alert Modal - For notifications and alerts
 */
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  alertType = ALERT_TYPES.INFO,
  ...props
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    type={MODAL_TYPES.ALERT}
    size={MODAL_SIZES.SMALL}
    alertType={alertType}
    {...props}
  >
    {message && <p className="text-gray-700">{message}</p>}
  </Modal>
);

/**
 * Form Modal - For forms and data entry
 */
export const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={MODAL_TYPES.FORM}
      loading={loading}
      footer={
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg font-medium transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            form="modal-form"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : submitText}
          </button>
        </div>
      }
      {...props}
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

/**
 * Viewer Modal - For displaying detailed content
 */
export const ViewerModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = MODAL_SIZES.LARGE,
  ...props
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    type={MODAL_TYPES.VIEWER}
    size={size}
    {...props}
  >
    {children}
  </Modal>
);

// =============================================================================
// HOOKS FOR MODAL MANAGEMENT
// =============================================================================

/**
 * Hook for managing modal state
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  
  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
};

/**
 * Hook for confirmation modals with promise support
 */
export const useConfirmation = () => {
  const [state, setState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    resolve: null,
    destructive: false
  });

  const confirm = React.useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || '',
        destructive: options.destructive || false,
        resolve
      });
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false);
    setState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const ConfirmationComponent = React.useCallback(() => (
    <ConfirmationModal
      isOpen={state.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      destructive={state.destructive}
    />
  ), [state, handleCancel, handleConfirm]);

  return {
    confirm,
    ConfirmationModal: ConfirmationComponent
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default Modal;

export {
  MODAL_TYPES,
  MODAL_SIZES,
  ALERT_TYPES
};