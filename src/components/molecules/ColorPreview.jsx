import React from 'react';
import PropTypes from 'prop-types';
import { Bell, Check, ChevronRight, Plus, Star } from 'lucide-react';

/**
 * ColorPreview Component
 * 
 * Provides a visual preview of how primary and secondary colors are applied
 * throughout the UI in both light and dark modes. This helps users understand
 * the impact of their color choices before applying them.
 */
const ColorPreview = ({ brandColors }) => {
  const { primary, secondary } = brandColors;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Light Mode Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-white p-4 border-b border-secondary-200">
          <h3 className="font-medium text-secondary-900">Light Mode Preview</h3>
        </div>
        <div className="bg-background-light p-4 space-y-6">
          {/* Buttons Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600">Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: primary }}
              >
                Primary Button
              </button>
              <button 
                className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: secondary }}
              >
                Secondary Button
              </button>
              <button 
                className="px-3 py-1.5 rounded-md text-sm font-medium border"
                style={{ color: primary, borderColor: primary }}
              >
                Outline Button
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded text-sm" style={{ color: primary }}>
                <Plus size={14} />
                <span>Text Button</span>
              </button>
            </div>
          </div>

          {/* Text & Headings */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600">Text & Headings</h4>
            <h2 className="text-lg font-semibold" style={{ color: primary }}>Primary Heading</h2>
            <h3 className="text-md font-medium" style={{ color: secondary }}>Secondary Heading</h3>
            <p className="text-sm text-secondary-700">Normal body text with <a href="#" style={{ color: primary }}>primary links</a> and <span style={{ color: secondary }}>secondary text</span>.</p>
          </div>

          {/* Cards & Borders */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600">Cards & Borders</h4>
            <div className="flex gap-3 flex-wrap">
              <div className="w-32 h-24 rounded-md shadow-sm flex items-center justify-center bg-white" 
                style={{ borderLeft: `4px solid ${primary}` }}>
                Primary Border
              </div>
              <div className="w-32 h-24 rounded-md shadow-sm flex items-center justify-center bg-white" 
                style={{ borderLeft: `4px solid ${secondary}` }}>
                Secondary Border
              </div>
              <div className="w-32 h-24 rounded-md shadow-sm flex items-center justify-center bg-white border border-secondary-200" 
                style={{ boxShadow: `0 4px 6px -1px ${primary}20` }}>
                Primary Shadow
              </div>
            </div>
          </div>

          {/* Badges & Indicators */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600">Badges & Indicators</h4>
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" 
                style={{ backgroundColor: `${primary}20`, color: primary }}>
                Primary Badge
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" 
                style={{ backgroundColor: `${secondary}20`, color: secondary }}>
                Secondary Badge
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: primary }}>
                <Check size={12} />
                Primary Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: secondary }}>
                <Bell size={12} />
                Secondary Status
              </span>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600">Form Elements</h4>
            <div className="flex gap-3 flex-wrap">
              <div className="w-full max-w-xs">
                <label className="block text-xs font-medium text-secondary-700 mb-1">Input Field</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
                  placeholder="Primary focus ring"
                  style={{ outlineColor: primary }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-secondary-300"
                  style={{ accentColor: primary }}
                />
                <label className="text-sm text-secondary-700">Checkbox</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  className="h-4 w-4 border-secondary-300"
                  style={{ accentColor: secondary }}
                />
                <label className="text-sm text-secondary-700">Radio</label>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600">Navigation</h4>
            <div className="flex flex-col">
              <div className="flex items-center justify-between py-2 border-b border-secondary-100">
                <span className="text-sm font-medium" style={{ color: primary }}>Active Item</span>
                <ChevronRight size={16} style={{ color: primary }} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-secondary-100">
                <span className="text-sm text-secondary-700">Normal Item</span>
                <ChevronRight size={16} className="text-secondary-400" />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: secondary }}>Secondary Item</span>
                <ChevronRight size={16} style={{ color: secondary }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dark Mode Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-secondary-800 p-4 border-b border-secondary-700">
          <h3 className="font-medium text-white">Dark Mode Preview</h3>
        </div>
        <div className="bg-background-dark p-4 space-y-6">
          {/* Buttons Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-400">Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: primary }}
              >
                Primary Button
              </button>
              <button 
                className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: secondary }}
              >
                Secondary Button
              </button>
              <button 
                className="px-3 py-1.5 rounded-md text-sm font-medium border"
                style={{ color: `${primary}DD`, borderColor: `${primary}50` }}
              >
                Outline Button
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded text-sm" style={{ color: `${primary}DD` }}>
                <Plus size={14} />
                <span>Text Button</span>
              </button>
            </div>
          </div>

          {/* Text & Headings */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-400">Text & Headings</h4>
            <h2 className="text-lg font-semibold" style={{ color: `${primary}DD` }}>Primary Heading</h2>
            <h3 className="text-md font-medium" style={{ color: `${secondary}DD` }}>Secondary Heading</h3>
            <p className="text-sm text-secondary-300">Normal body text with <a href="#" style={{ color: `${primary}DD` }}>primary links</a> and <span style={{ color: `${secondary}DD` }}>secondary text</span>.</p>
          </div>

          {/* Cards & Borders */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-400">Cards & Borders</h4>
            <div className="flex gap-3 flex-wrap">
              <div className="w-32 h-24 rounded-md shadow-sm flex items-center justify-center bg-secondary-800 text-secondary-200" 
                style={{ borderLeft: `4px solid ${primary}` }}>
                Primary Border
              </div>
              <div className="w-32 h-24 rounded-md shadow-sm flex items-center justify-center bg-secondary-800 text-secondary-200" 
                style={{ borderLeft: `4px solid ${secondary}` }}>
                Secondary Border
              </div>
              <div className="w-32 h-24 rounded-md shadow-sm flex items-center justify-center bg-secondary-800 text-secondary-200 border border-secondary-700" 
                style={{ boxShadow: `0 4px 6px -1px ${primary}40` }}>
                Primary Shadow
              </div>
            </div>
          </div>

          {/* Badges & Indicators */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-400">Badges & Indicators</h4>
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" 
                style={{ backgroundColor: `${primary}30`, color: `${primary}DD` }}>
                Primary Badge
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" 
                style={{ backgroundColor: `${secondary}30`, color: `${secondary}DD` }}>
                Secondary Badge
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: `${primary}DD` }}>
                <Check size={12} />
                Primary Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: `${secondary}DD` }}>
                <Star size={12} />
                Secondary Status
              </span>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-400">Form Elements</h4>
            <div className="flex gap-3 flex-wrap">
              <div className="w-full max-w-xs">
                <label className="block text-xs font-medium text-secondary-400 mb-1">Input Field</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-secondary-600 bg-secondary-700 text-secondary-200 rounded-md text-sm"
                  placeholder="Primary focus ring"
                  style={{ outlineColor: primary }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-secondary-600 bg-secondary-700"
                  style={{ accentColor: primary }}
                />
                <label className="text-sm text-secondary-300">Checkbox</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  className="h-4 w-4 border-secondary-600 bg-secondary-700"
                  style={{ accentColor: secondary }}
                />
                <label className="text-sm text-secondary-300">Radio</label>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-400">Navigation</h4>
            <div className="flex flex-col">
              <div className="flex items-center justify-between py-2 border-b border-secondary-700">
                <span className="text-sm font-medium" style={{ color: `${primary}DD` }}>Active Item</span>
                <ChevronRight size={16} style={{ color: `${primary}DD` }} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-secondary-700">
                <span className="text-sm text-secondary-300">Normal Item</span>
                <ChevronRight size={16} className="text-secondary-500" />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: `${secondary}DD` }}>Secondary Item</span>
                <ChevronRight size={16} style={{ color: `${secondary}DD` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="md:col-span-2 bg-white dark:bg-secondary-800 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
        <h3 className="font-medium text-secondary-900 dark:text-white mb-2">Color Usage Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Primary Color</h4>
            <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1 list-disc pl-5">
              <li>Main action buttons</li>
              <li>Important headings and links</li>
              <li>Active navigation items</li>
              <li>Focus states and highlights</li>
              <li>Progress indicators</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Secondary Color</h4>
            <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1 list-disc pl-5">
              <li>Secondary buttons and actions</li>
              <li>Subheadings and supporting text</li>
              <li>Complementary UI elements</li>
              <li>Alternative indicators</li>
              <li>Accent elements and decorations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

ColorPreview.propTypes = {
  /**
   * The current brand colors object with primary and secondary colors
   */
  brandColors: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired
  }).isRequired
};

export default ColorPreview;
