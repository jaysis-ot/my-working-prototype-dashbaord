import React from 'react';
import { Palette, Paintbrush, Activity, Globe } from 'lucide-react';

const AppearanceTab = ({ settings, updateSetting }) => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Palette className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-indigo-900">Interface & Branding</h3>
            <p className="text-sm text-indigo-700 mt-1">Customize your platform's appearance to match your organization's identity and user preferences.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            Theme & Colors
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select 
                value={settings.appearance.theme}
                onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">Follow System</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={settings.appearance.brandColors.primary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.primary', e.target.value)}
                    className="w-12 h-10 border rounded"
                  />
                  <input 
                    type="text"
                    value={settings.appearance.brandColors.primary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.primary', e.target.value)}
                    className="flex-1 p-2 border rounded font-mono text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={settings.appearance.brandColors.secondary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.secondary', e.target.value)}
                    className="w-12 h-10 border rounded"
                  />
                  <input 
                    type="text"
                    value={settings.appearance.brandColors.secondary}
                    onChange={(e) => updateSetting('appearance', 'brandColors.secondary', e.target.value)}
                    className="flex-1 p-2 border rounded font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Dashboard Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Information Density</label>
              <select 
                value={settings.appearance.dashboard.density}
                onChange={(e) => updateSetting('appearance', 'dashboard.density', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="compact">Compact (More data)</option>
                <option value="comfortable">Comfortable (Balanced)</option>
                <option value="spacious">Spacious (Easier reading)</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.appearance.dashboard.animations}
                onChange={(e) => updateSetting('appearance', 'dashboard.animations', e.target.checked)}
                className="rounded"
              />
              <span>Enable smooth animations</span>
            </label>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Reports & Export
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Template</label>
              <select 
                value={settings.appearance.reports.template}
                onChange={(e) => updateSetting('appearance', 'reports.template', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="minimal">Minimal</option>
                <option value="professional">Professional (Recommended)</option>
                <option value="detailed">Detailed</option>
                <option value="executive">Executive Summary</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.appearance.reports.watermark}
                onChange={(e) => updateSetting('appearance', 'reports.watermark', e.target.checked)}
                className="rounded"
              />
              <span>Include organizational watermark</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;