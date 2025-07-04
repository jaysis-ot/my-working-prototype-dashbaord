import React from 'react';
import { Archive, Clock, Shield, Database, Download, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

const DataBackupTab = ({ settings, updateSetting }) => {
  const getRetentionDescription = (retention) => {
    switch(retention) {
      case '1-year': return 'Standard business retention';
      case '3-years': return 'Extended business records';
      case '7-years': return 'SOX compliant, financial records';
      case 'indefinite': return 'Permanent archival, critical evidence';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Archive className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Evidence Preservation & Recovery</h3>
            <p className="text-sm text-amber-700 mt-1">Ensure your risk evidence and trust artifacts are preserved with audit-grade integrity and rapid recovery capabilities.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Backup Schedule
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select 
                value={settings.dataBackup.schedule}
                onChange={(e) => updateSetting('dataBackup', 'schedule', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="hourly">Hourly (Critical systems)</option>
                <option value="daily">Daily (Recommended)</option>
                <option value="weekly">Weekly</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {settings.dataBackup.schedule === 'hourly' && 'Maximum 1-hour data loss window'}
                {settings.dataBackup.schedule === 'daily' && 'Balanced protection and storage efficiency'}
                {settings.dataBackup.schedule === 'weekly' && 'Minimal storage overhead, higher risk'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Retention Period</label>
              <select 
                value={settings.dataBackup.retention}
                onChange={(e) => updateSetting('dataBackup', 'retention', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="1-year">1 Year</option>
                <option value="3-years">3 Years</option>
                <option value="7-years">7 Years (SOX Compliant)</option>
                <option value="indefinite">Indefinite</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {getRetentionDescription(settings.dataBackup.retention)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Next backup scheduled: Today at 2:00 AM UTC</span>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security & Integrity
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Encryption Standard</label>
                <select 
                  value={settings.dataBackup.encryption}
                  onChange={(e) => updateSetting('dataBackup', 'encryption', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="aes-256">AES-256 (Recommended)</option>
                  <option value="aes-128">AES-128</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Verification Frequency</label>
                <select 
                  value={settings.dataBackup.verification}
                  onChange={(e) => updateSetting('dataBackup', 'verification', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly (Recommended)</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Integrity Promise:</strong> All backup files include cryptographic hashes (SHA-256) and chain-of-custody metadata to ensure admissible evidence standards. Digital signatures verify authenticity and detect tampering.
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Encryption: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Checksums: Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Access Controls: Enforced</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Storage & Recovery
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Storage Location</label>
              <select 
                value={settings.dataBackup.storage}
                onChange={(e) => updateSetting('dataBackup', 'storage', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="aws-s3">AWS S3 (Multi-region)</option>
                <option value="azure-blob">Azure Blob Storage</option>
                <option value="gcp-storage">Google Cloud Storage</option>
                <option value="on-premise">On-Premise Storage</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <div className="text-sm font-medium">Recovery Time Objective (RTO)</div>
                <div className="text-lg font-bold text-blue-600">&lt; 4 hours</div>
                <div className="text-xs text-gray-500">Time to restore operations</div>
              </div>
              
              <div className="p-3 border rounded">
                <div className="text-sm font-medium">Recovery Point Objective (RPO)</div>
                <div className="text-lg font-bold text-green-600">&lt; 1 hour</div>
                <div className="text-xs text-gray-500">Maximum data loss window</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Test Recovery
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View Backup Log
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Download Archive
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Backup Health Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Last Backup</span>
              </div>
              <span className="text-sm text-green-700">2 hours ago - Success</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Last Verification</span>
              </div>
              <span className="text-sm text-green-700">1 day ago - All files verified</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Storage Usage</span>
              </div>
              <span className="text-sm text-blue-700">847 GB / 2 TB (42% used)</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Disaster Recovery Planning</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Your current configuration provides enterprise-grade backup protection. For critical operations, consider implementing:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                <li>• Cross-region replication for geographic redundancy</li>
                <li>• Hot standby systems for immediate failover</li>
                <li>• Regular disaster recovery testing and documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataBackupTab;