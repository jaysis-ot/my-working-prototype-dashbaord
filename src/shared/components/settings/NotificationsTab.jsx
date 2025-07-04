import React, { useState } from 'react';
import { Bell, Mail, Slack, AlertTriangle, Users, Clock, Zap, CheckCircle } from 'lucide-react';

const NotificationsTab = ({ settings, updateSetting }) => {
  const [testNotification, setTestNotification] = useState(false);

  const sendTestNotification = async () => {
    setTestNotification(true);
    // Simulate sending test notification
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestNotification(false);
  };

  const getFrequencyDescription = (frequency) => {
    switch(frequency) {
      case 'immediate': return 'Real-time alerts for immediate action';
      case 'hourly': return 'Batched updates every hour';
      case 'daily': return 'Single daily summary at 8:00 AM';
      default: return '';
    }
  };

  const getThresholdDescription = (threshold) => {
    switch(threshold) {
      case 'low': return 'All risk changes, including minor updates';
      case 'medium': return 'Significant changes affecting trust scores';
      case 'high': return 'Critical issues requiring immediate attention';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Risk Event Notifications</h3>
            <p className="text-sm text-blue-700 mt-1">Configure how your team receives alerts about risk changes, threshold breaches, and evidence updates. Notifications are designed to provide actionable intelligence without alert fatigue.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.notifications.email.enabled}
                onChange={(e) => updateSetting('notifications', 'email.enabled', e.target.checked)}
                className="rounded"
              />
              <span>Enable email notifications</span>
            </label>
            
            {settings.notifications.email.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Alert Threshold</label>
                    <select 
                      value={settings.notifications.email.threshold}
                      onChange={(e) => updateSetting('notifications', 'email.threshold', e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low - All changes</option>
                      <option value="medium">Medium - Significant changes</option>
                      <option value="high">High - Critical only</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      {getThresholdDescription(settings.notifications.email.threshold)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <select 
                      value={settings.notifications.email.frequency}
                      onChange={(e) => updateSetting('notifications', 'email.frequency', e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly digest</option>
                      <option value="daily">Daily summary</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      {getFrequencyDescription(settings.notifications.email.frequency)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Smart Filtering:</strong> Our AI prioritizes notifications based on your role, recent activity, and business impact to reduce noise while ensuring critical information reaches you.
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Slack className="w-4 h-4" />
            Slack Integration
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.notifications.slack.enabled}
                onChange={(e) => updateSetting('notifications', 'slack.enabled', e.target.checked)}
                className="rounded"
              />
              <span>Send notifications to Slack</span>
            </label>
            
            {settings.notifications.slack.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Webhook URL</label>
                    <input 
                      type="url"
                      value={settings.notifications.slack.webhook}
                      onChange={(e) => updateSetting('notifications', 'slack.webhook', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Channel</label>
                    <input 
                      type="text"
                      value={settings.notifications.slack.channel}
                      onChange={(e) => updateSetting('notifications', 'slack.channel', e.target.value)}
                      placeholder="#risk-alerts"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <strong>Rich Notifications:</strong> Slack alerts include interactive buttons for quick actions like acknowledging risks, requesting details, or escalating to team members.
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team & Role-Based Routing
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {['Security Team', 'IT Operations', 'Compliance'].map(team => (
                <div key={team} className="border rounded p-3">
                  <div className="font-medium text-sm mb-2">{team}</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Critical alerts</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={team === 'Security Team'} className="rounded" />
                      <span>Security events</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={team === 'Compliance'} className="rounded" />
                      <span>Audit updates</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-600">
              Notifications are automatically routed based on user roles, team assignments, and the type of risk event. Each team member receives only relevant alerts for their responsibilities.
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Escalation Rules
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.notifications.escalation.enabled}
                onChange={(e) => updateSetting('notifications', 'escalation.enabled', e.target.checked)}
                className="rounded"
              />
              <span>Enable automatic escalation for unacknowledged critical alerts</span>
            </label>
            
            {settings.notifications.escalation.enabled && (
              <>
                <div className="bg-amber-50 p-4 rounded border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Escalation Timeline
                  </h4>
                  <div className="space-y-2 text-sm text-amber-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span><strong>0 minutes:</strong> Initial alert sent to assigned team member</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span><strong>15 minutes:</strong> Escalate to team lead if unacknowledged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span><strong>30 minutes:</strong> Notify department manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span><strong>60 minutes:</strong> Executive notification and incident creation</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Hours</label>
                    <select className="w-full p-2 border rounded">
                      <option>9:00 AM - 5:00 PM</option>
                      <option>24/7 Coverage</option>
                      <option>Custom Schedule</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Zone</label>
                    <select className="w-full p-2 border rounded">
                      <option>UTC</option>
                      <option>US/Eastern</option>
                      <option>US/Pacific</option>
                      <option>Europe/London</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Notification Testing
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={sendTestNotification}
                disabled={testNotification}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {testNotification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Send Test Alert
                  </>
                )}
              </button>
              
              <div className="text-sm text-gray-600">
                Test your notification configuration with a sample critical alert
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Last 24 Hours</span>
                </div>
                <div>47 notifications sent</div>
                <div className="text-xs text-gray-500">99.8% delivery rate</div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Avg Response Time</span>
                </div>
                <div>4.2 minutes</div>
                <div className="text-xs text-gray-500">From alert to acknowledgment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;