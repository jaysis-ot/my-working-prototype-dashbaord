import React from 'react';
import { Shield, Lock, Archive } from 'lucide-react';

const ComplianceTab = ({ settings, updateSetting }) => {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Regulatory & Audit Readiness</h3>
            <p className="text-sm text-red-700 mt-1">Configure your platform to meet regulatory requirements and maintain audit trails with immutable evidence chains.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Active Compliance Frameworks</h3>
          <div className="space-y-3">
            {['iso27001', 'sox', 'nist', 'gdpr', 'hipaa', 'pci-dss'].map(framework => (
              <label key={framework} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.frameworks.includes(framework)}
                  onChange={(e) => {
                    const frameworks = settings.compliance.frameworks;
                    if (e.target.checked) {
                      updateSetting('compliance', 'frameworks', [...frameworks, framework]);
                    } else {
                      updateSetting('compliance', 'frameworks', frameworks.filter(f => f !== framework));
                    }
                  }}
                  className="rounded"
                />
                <span className="uppercase font-mono text-sm">{framework.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <strong>Framework Impact:</strong> Selected frameworks automatically configure audit retention, access controls, and reporting templates to meet compliance requirements.
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Access Controls
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.access.mfa}
                  onChange={(e) => updateSetting('compliance', 'access.mfa', e.target.checked)}
                  className="rounded"
                />
                <span>Require Multi-Factor Authentication</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.access.rbac}
                  onChange={(e) => updateSetting('compliance', 'access.rbac', e.target.checked)}
                  className="rounded"
                />
                <span>Role-Based Access Control</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
              <select 
                value={settings.compliance.access.sessionTimeout}
                onChange={(e) => updateSetting('compliance', 'access.sessionTimeout', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="30">30 minutes (High security)</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours (Standard)</option>
                <option value="1440">24 hours</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Zero Trust Principle:</strong> All access is verified, authenticated, and continuously validated regardless of location or user credentials.
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Audit & Data Management
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Audit Log Retention</label>
                <select 
                  value={settings.compliance.auditLog.retention}
                  onChange={(e) => updateSetting('compliance', 'auditLog.retention', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="3-years">3 Years</option>
                  <option value="7-years">7 Years (SOX)</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Data Residency</label>
                <select 
                  value={settings.compliance.dataResidency}
                  onChange={(e) => updateSetting('compliance', 'dataResidency', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="us-east">US East</option>
                  <option value="us-west">US West</option>
                  <option value="eu-west">EU West</option>
                  <option value="apac">Asia Pacific</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.auditLog.immutable}
                  onChange={(e) => updateSetting('compliance', 'auditLog.immutable', e.target.checked)}
                  className="rounded"
                />
                <span>Immutable audit logs (tamper-proof)</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.encryption.transit}
                  onChange={(e) => updateSetting('compliance', 'encryption.transit', e.target.checked)}
                  className="rounded"
                />
                <span>Encryption in transit (TLS 1.3)</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.compliance.encryption.rest}
                  onChange={(e) => updateSetting('compliance', 'encryption.rest', e.target.checked)}
                  className="rounded"
                />
                <span>Encryption at rest (AES-256)</span>
              </label>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <strong>Chain of Custody:</strong> All audit logs include cryptographic signatures and timestamps to ensure legal admissibility and prevent tampering.
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Compliance Reporting</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate SOX Report
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Export Audit Trail
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              Reports are automatically formatted for regulatory submission and include all required evidence chains and attestations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTab;