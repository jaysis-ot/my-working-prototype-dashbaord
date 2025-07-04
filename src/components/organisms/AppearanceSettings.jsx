import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Laptop, Droplets, Type, ToggleLeft, ToggleRight } from 'lucide-react';
import Input from '../atoms/Input';

/**
 * SettingsSection Molecule
 * A wrapper for a single settings group to ensure consistent layout and styling.
 */
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

/**
 * ThemeOption Molecule
 * A clickable option for theme selection.
 */
const ThemeOption = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 p-4 rounded-lg border-2 transition-all duration-200
      flex flex-col items-center justify-center space-y-2
      ${isActive
        ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500 text-primary-600 dark:text-primary-200'
        : 'bg-secondary-50 dark:bg-secondary-700/50 border-transparent hover:border-primary-300 dark:hover:border-primary-500'
      }
    `}
    aria-pressed={isActive}
  >
    <Icon size={24} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

ThemeOption.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * AppearanceSettings Organism Component
 * 
 * This organism provides users with controls to configure the visual appearance
 * of the dashboard. It integrates with the ThemeContext for real-time theme
 * changes and allows customization of brand colors, UI density, and animations.
 */
const AppearanceSettings = ({ settings, updateSetting }) => {
  const { theme, setTheme, themes } = useTheme();

  // Local state for immediate feedback on color pickers
  const [brandColors, setBrandColors] = useState(
    settings.brandColors || { primary: '#0073e6', secondary: '#627d98' }
  );

  const handleColorChange = useCallback((colorField, value) => {
    const newColors = { ...brandColors, [colorField]: value };
    setBrandColors(newColors);
    // This would update the main settings state in a real implementation
    // updateSetting('appearance.brandColors', newColors);
  }, [brandColors]);

  // Placeholder for density and animations state
  const dashboardSettings = settings.dashboard || { density: 'comfortable', animations: true };

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

      {/* --- Brand Colors --- */}
      <SettingsSection
        title="Brand Colors"
        description="Customize the primary and secondary colors to match your organization's branding."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={brandColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-12 h-12 rounded-md border-none cursor-pointer p-1 bg-transparent"
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
              className="w-12 h-12 rounded-md border-none cursor-pointer p-1 bg-transparent"
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

      {/* --- Dashboard Density & Animations --- */}
      <SettingsSection
        title="Interface Options"
        description="Adjust the information density and visual effects to your preference."
      >
        <div className="space-y-6">
          {/* Dashboard Density */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Dashboard Density
            </label>
            <div className="flex">
              <button
                className={`px-4 py-2 rounded-l-md text-sm transition-colors ${
                  dashboardSettings.density === 'comfortable'
                    ? 'bg-primary-600 text-white z-10'
                    : 'bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600'
                }`}
              >
                Comfortable
              </button>
              <button
                className={`px-4 py-2 rounded-r-md text-sm transition-colors -ml-px ${
                  dashboardSettings.density === 'compact'
                    ? 'bg-primary-600 text-white z-10'
                    : 'bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
          {/* Interface Animations */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Interface Animations
            </label>
            <button
              className="flex items-center gap-2 text-secondary-700 dark:text-secondary-300"
              aria-checked={dashboardSettings.animations}
              role="switch"
            >
              {dashboardSettings.animations ? (
                <ToggleRight size={32} className="text-primary-600" />
              ) : (
                <ToggleLeft size={32} className="text-secondary-400" />
              )}
              <span className="font-medium">
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
    dashboard: { density: 'comfortable', animations: true },
  },
  updateSetting: () => {},
};

export default AppearanceSettings;
