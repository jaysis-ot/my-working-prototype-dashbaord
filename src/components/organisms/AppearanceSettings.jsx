import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Laptop, Droplets, Type, ToggleLeft, ToggleRight, TextQuote } from 'lucide-react';
import Input from '../atoms/Input';
import ColorPreview from '../molecules/ColorPreview';

// --- Reusable Molecules (Internal to this component) ---

const SettingsSection = ({ title, description, children }) => (
  <div className="dashboard-card p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
      <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{description}</p>
    </div>
    <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
      {children}
    </div>
  </div>
);

SettingsSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const ThemeOption = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 p-4 rounded-lg border-2 transition-all duration-200
      flex flex-col items-center justify-center space-y-2
      ${isActive
        ? 'bg-primary-100 dark:bg-primary-500/20 border-primary-500 text-primary-600 dark:text-primary-200'
        : 'bg-secondary-50 dark:bg-secondary-700/50 border-transparent hover:border-primary-300 dark:hover:border-primary-500 text-secondary-700 dark:text-secondary-200'
      }
    `}
    aria-pressed={isActive}
  >
    <Icon size={24} className={isActive ? 'text-primary-600 dark:text-primary-300' : 'text-secondary-600 dark:text-secondary-300'} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

ThemeOption.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

// --- Main Organism Component ---

const PREDEFINED_SCHEMES = [
  { name: 'Default', colors: { primary: '#0073e6', secondary: '#627d98' } },
  { name: 'Trust-Centric', colors: { primary: '#6d28d9', secondary: '#486581' } },
  { name: 'Forest Green', colors: { primary: '#10b981', secondary: '#334e68' } },
  { name: 'Blaze Orange', colors: { primary: '#f97316', secondary: '#4a5568' } },
  { name: 'Crimson Red', colors: { primary: '#dc2626', secondary: '#374151' } },
];

const FONT_SIZES = [
  { name: 'Small', value: 'sm', class: 'font-size-sm' },
  { name: 'Normal', value: 'md', class: 'font-size-md' },
  { name: 'Large', value: 'lg', class: 'font-size-lg' },
];


/**
 * AppearanceSettings Organism Component
 * 
 * This organism provides users with controls to configure the visual appearance
 * of the dashboard. It integrates with the ThemeContext for real-time theme
 * changes and allows customization of brand colors, UI density, and animations.
 */
const AppearanceSettings = ({ settings, updateSetting }) => {
  const { theme, setTheme, themes } = useTheme();
  
  const brandColors = settings.brandColors || { primary: '#0073e6', secondary: '#627d98' };
  const dashboardSettings = settings.dashboard || { density: 'comfortable', animations: true, fontSize: 'md' };

  /**
   * FIX: Apply brand colors in real-time by injecting a style tag.
   * This overrides Tailwind's default colors at runtime.
   */
  useEffect(() => {
    const styleId = 'custom-brand-colors';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const primaryColor = brandColors.primary;
    const secondaryColor = brandColors.secondary;
    styleElement.innerHTML = `
      :root { 
        --color-primary: ${primaryColor}; 
        --color-secondary: ${secondaryColor};
      }
      .bg-primary-100 { background-color: ${primaryColor}1A !important; } /* 10% opacity */
      .bg-primary-600, .bg-primary-500 { background-color: ${primaryColor} !important; }
      .text-primary-600, .text-primary-700 { color: ${primaryColor} !important; }
      .border-primary-500 { border-color: ${primaryColor} !important; }
      .ring-primary-500 { --tw-ring-color: ${primaryColor} !important; }
      .sidebar-item-active { background-color: ${primaryColor} !important; }
      .dark .dark\\:bg-primary-500\\/20 { background-color: ${primaryColor}33 !important; } /* 20% opacity */
      .dark .dark\\:text-primary-200 { color: ${primaryColor} !important; opacity: 0.8; }
      .dark .dark\\:text-primary-300 { color: ${primaryColor} !important; opacity: 0.9; }

      /* -------- Secondary Color Overrides -------- */
      .bg-secondary-100 { background-color: ${secondaryColor}1A !important; } /* 10% opacity */
      .bg-secondary-600, .bg-secondary-500 { background-color: ${secondaryColor} !important; }
      .text-secondary-600, .text-secondary-700 { color: ${secondaryColor} !important; }
      .border-secondary-500 { border-color: ${secondaryColor} !important; }
      .ring-secondary-500 { --tw-ring-color: ${secondaryColor} !important; }
      .dark .dark\\:bg-secondary-500\\/20 { background-color: ${secondaryColor}33 !important; } /* 20% opacity */
      .dark .dark\\:text-secondary-200 { color: ${secondaryColor} !important; opacity: 0.8; }
    `;
  }, [brandColors]);

  /**
   * FIX: Apply density and font size settings by adding a class to the body/html.
   */
  useEffect(() => {
    const root = document.documentElement;
    // Clean up previous classes
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    root.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    
    // Add the current classes
    if (dashboardSettings.density) {
      root.classList.add(`density-${dashboardSettings.density}`);
    }
    if (dashboardSettings.fontSize) {
      root.classList.add(`font-size-${dashboardSettings.fontSize}`);
    }
  }, [dashboardSettings.density, dashboardSettings.fontSize]);

  const handleColorChange = useCallback((colorField, value) => {
    updateSetting('brandColors', { ...brandColors, [colorField]: value });
  }, [brandColors, updateSetting]);
  
  const applyScheme = useCallback((scheme) => {
    updateSetting('brandColors', scheme.colors);
  }, [updateSetting]);

  const handleDensityChange = useCallback((newDensity) => {
    updateSetting('dashboard', { ...dashboardSettings, density: newDensity });
  }, [dashboardSettings, updateSetting]);

  const handleFontSizeChange = useCallback((newSize) => {
    updateSetting('dashboard', { ...dashboardSettings, fontSize: newSize });
  }, [dashboardSettings, updateSetting]);

  const handleAnimationToggle = useCallback(() => {
    updateSetting('dashboard', { ...dashboardSettings, animations: !dashboardSettings.animations });
  }, [dashboardSettings, updateSetting]);

  return (
    <div className="space-y-6">
      {/* --- Theme Selection --- */}
      <SettingsSection
        title="Theme"
        description="Choose how the Cyber Trust Sensor dashboard looks. 'System' will match your OS preference."
      >
        <div className="flex items-center gap-4">
          <ThemeOption
            icon={Sun}
            label="Light"
            isActive={theme === themes.LIGHT}
            onClick={() => setTheme(themes.LIGHT)}
          />
          <ThemeOption
            icon={Moon}
            label="Dark"
            isActive={theme === themes.DARK}
            onClick={() => setTheme(themes.DARK)}
          />
          <ThemeOption
            icon={Laptop}
            label="System"
            isActive={theme === themes.SYSTEM}
            onClick={() => setTheme(themes.SYSTEM)}
          />
        </div>
      </SettingsSection>

      {/* --- Predefined Color Schemes --- */}
      <SettingsSection
        title="Color Scheme"
        description="Select a predefined color palette for the dashboard."
      >
        <div className="flex flex-wrap gap-4">
          {PREDEFINED_SCHEMES.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => applyScheme(scheme)}
              className="flex items-center gap-3 p-2 rounded-lg border-2 transition-all bg-white dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-600"
              style={{ borderColor: scheme.colors.primary === brandColors.primary ? scheme.colors.primary : 'transparent' }}
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800" style={{ backgroundColor: scheme.colors.primary }}></div>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800" style={{ backgroundColor: scheme.colors.secondary }}></div>
              </div>
              <span className="text-sm font-medium">{scheme.name}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* --- Custom Brand Colors --- */}
      <SettingsSection
        title="Custom Brand Colors"
        description="Fine-tune the primary and secondary colors to match your organization's branding."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={brandColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-12 h-12 rounded-md border-none cursor-pointer p-0 bg-transparent"
              style={{ backgroundColor: brandColors.primary }}
              aria-label="Primary brand color picker"
            />
            <Input
              label="Primary Color"
              value={brandColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              leadingIcon={Droplets}
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={brandColors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-12 h-12 rounded-md border-none cursor-pointer p-0 bg-transparent"
              style={{ backgroundColor: brandColors.secondary }}
              aria-label="Secondary brand color picker"
            />
            <Input
              label="Secondary Color"
              value={brandColors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              leadingIcon={Droplets}
            />
          </div>
        </div>
      </SettingsSection>

      {/* --- Color Preview --- */}
      <SettingsSection
        title="Color Preview"
        description="See how your brand colors are applied across the interface."
      >
        <ColorPreview brandColors={brandColors} />
      </SettingsSection>

      {/* --- Interface Options --- */}
      <SettingsSection
        title="Interface Options"
        description="Adjust information density, font size, and visual effects to your preference."
      >
        <div className="space-y-6">
          {/* Dashboard Density */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Dashboard Density
            </label>
            <div className="flex">
              <button 
                onClick={() => handleDensityChange('compact')} 
                className={`px-4 py-2 rounded-l-md text-sm transition-colors ${
                  dashboardSettings.density === 'compact' 
                    ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white z-10' 
                    : 'bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 border border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-600'
                }`}
              >
                Compact
              </button>
              <button 
                onClick={() => handleDensityChange('comfortable')} 
                className={`px-4 py-2 text-sm transition-colors -ml-px ${
                  dashboardSettings.density === 'comfortable' 
                    ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white z-10' 
                    : 'bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 border border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-600'
                }`}
              >
                Comfortable
              </button>
              <button 
                onClick={() => handleDensityChange('spacious')} 
                className={`px-4 py-2 rounded-r-md text-sm transition-colors -ml-px ${
                  dashboardSettings.density === 'spacious' 
                    ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white z-10' 
                    : 'bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 border border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-600'
                }`}
              >
                Spacious
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Font Size
            </label>
            <div className="flex items-center gap-4">
              <TextQuote size={20} className="text-secondary-400 dark:text-secondary-500" />
              <div className="w-full flex items-center gap-2">
                {FONT_SIZES.map((size, index) => (
                  <React.Fragment key={size.value}>
                    <button
                      onClick={() => handleFontSizeChange(size.value)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        dashboardSettings.fontSize === size.value
                          ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white scale-110'
                          : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-200 hover:bg-primary-200 dark:hover:bg-primary-700'
                      }`}
                      aria-label={`Set font size to ${size.name}`}
                    >
                      <span className="text-xs font-bold">{size.name.charAt(0)}</span>
                    </button>
                    {index < FONT_SIZES.length - 1 && <div className="flex-1 h-0.5 bg-secondary-200 dark:bg-secondary-600"></div>}
                  </React.Fragment>
                ))}
              </div>
              <span className="w-20 text-center font-medium text-secondary-800 dark:text-secondary-200">
                {FONT_SIZES.find(s => s.value === dashboardSettings.fontSize)?.name}
              </span>
            </div>
          </div>

          {/* Interface Animations */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Interface Animations
            </label>
            <button
              onClick={handleAnimationToggle}
              className="flex items-center gap-2 text-secondary-700 dark:text-secondary-300"
              aria-checked={dashboardSettings.animations}
              role="switch"
            >
              {dashboardSettings.animations ? (
                <ToggleRight size={32} className="text-primary-600 dark:text-primary-400" />
              ) : (
                <ToggleLeft size={32} className="text-secondary-400 dark:text-secondary-500" />
              )}
              <span className="font-medium text-secondary-800 dark:text-secondary-200">
                {dashboardSettings.animations ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

AppearanceSettings.propTypes = {
  /**
   * The current settings object for the appearance tab.
   */
  settings: PropTypes.object,
  /**
   * Function to update a setting value.
   */
  updateSetting: PropTypes.func,
};

AppearanceSettings.defaultProps = {
  settings: {
    brandColors: { primary: '#0073e6', secondary: '#627d98' },
    dashboard: { density: 'comfortable', animations: true, fontSize: 'md' },
  },
  updateSetting: () => {},
};

export default AppearanceSettings;
