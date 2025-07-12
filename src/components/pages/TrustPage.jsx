import React from 'react';
import {
  Shield,
  Target,
  Clock,
  Briefcase,
  Users,
  Network,
  HelpCircle,
  FileText,
  Wrench,
  Activity,
  CheckSquare,
  BarChart,
  Scale,
  BrainCircuit,
  Info
} from 'lucide-react';

/**
 * Utility map for safe Tailwind classes per color
 */
const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-600 dark:text-gray-400',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-600 dark:text-pink-400',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  }
};

/**
 * InfoCard component for reusable info blocks
 */
const InfoCard = ({ icon: Icon, title, children, color = 'blue' }) => {
  const styles = colorClasses[color] || colorClasses.blue;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4 h-full shadow-sm">
      <div className={`p-2 rounded-lg ${styles.bg}`}>
        <Icon className={`h-6 w-6 ${styles.text}`} />
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">{children}</div>
      </div>
    </div>
  );
};

/**
 * TrustPage - Trust Score overview and calculation transparency
 */
const TrustPage = () => {
  const trustData = {
    overallScore: 78.5,
    scoreDelta: -1.2,
  };

  return (
    <div className="fade-in h-full flex flex-col">
      <div className="space-y-6 p-1">
        {/* Placeholder Notification */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md" role="alert">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-3" />
            <div>
              <p className="font-bold">Placeholder Page</p>
              <p className="text-sm">This is a static placeholder for the Trust Page. The data displayed is for demonstration purposes only and is not live.</p>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              Cybersecurity Trust Score
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
              This page provides a transparent overview of how your organization's Trust Score is calculated...
            </p>
          </div>
        </div>

        {/* Score + Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
            <p className="font-semibold">Overall Trust Score</p>
            <p className="text-6xl font-bold my-2">{trustData.overallScore.toFixed(1)}</p>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${trustData.scoreDelta < 0 ? 'bg-red-500/50' : 'bg-green-500/50'}`}>
              {trustData.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(trustData.scoreDelta).toFixed(1)}
              <span className="ml-2">Last 30 days</span>
            </div>
            <p className="text-xs opacity-80 mt-4">Score from 0 to 100 representing cybersecurity trustworthiness.</p>
          </div>
          
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Core Calculation: 6 Key Factors</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The score is a composite of six fundamental factors providing a realistic security posture view.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard icon={BarChart} title="Weighted Evidence" color="blue">
                <p>More recent evidence carries more weight.</p>
              </InfoCard>
              <InfoCard icon={Briefcase} title="Business Context" color="purple">
                <p>Criticality of systems and business risk.</p>
              </InfoCard>
              <InfoCard icon={Target} title="Adversarial Adaptation" color="red">
                <p>How effectively you adapt to new threats.</p>
              </InfoCard>
              <InfoCard icon={Network} title="Attack Surface" color="orange">
                <p>Size and complexity of your footprint.</p>
              </InfoCard>
              <InfoCard icon={Users} title="Systemic Risk" color="yellow">
                <p>Risks from partners and vendors.</p>
              </InfoCard>
              <InfoCard icon={HelpCircle} title="Uncertainty" color="gray">
                <p>Accounts for data gaps and estimation.</p>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Evidence */}
        <div>
          <h2 className="text-2xl font-bold mb-4">What We Measure: 4 Pillars of Evidence</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
            "Weighted Evidence" is the foundation of your score. These 4 pillars are key to evaluating your security reality.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard icon={FileText} title="Intent" color="blue">
              <ul className="list-disc pl-5 text-xs">
                <li>Policies & Standards</li>
              </ul>
            </InfoCard>
            <InfoCard icon={Wrench} title="Implementation" color="green">
              <ul className="list-disc pl-5 text-xs">
                <li>Firewall Rules</li>
              </ul>
            </InfoCard>
            <InfoCard icon={Activity} title="Behavioral" color="yellow">
              <ul className="list-disc pl-5 text-xs">
                <li>Network Logs</li>
              </ul>
            </InfoCard>
            <InfoCard icon={CheckSquare} title="Validation" color="red">
              <ul className="list-disc pl-5 text-xs">
                <li>Pen Tests & Scans</li>
              </ul>
            </InfoCard>
          </div>
        </div>

        {/* Deep Dive */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Deep Dive: Modeling Techniques</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
            Our model incorporates adaptive, temporal, and human factors to remain current and trustworthy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard icon={Clock} title="Memory Kernel" color="indigo">
              <p>Evidence decays over time, but cycles are weighted in.</p>
            </InfoCard>
            <InfoCard icon={BrainCircuit} title="Human Element" color="pink">
              <p>Includes training, culture, and insider threat analysis.</p>
            </InfoCard>
            <InfoCard icon={Scale} title="Model Integrity" color="teal">
              <p>Statistical validation and sensitivity checks.</p>
            </InfoCard>
            <InfoCard icon={Target} title="Adversarial Adaptation" color="red">
              <p>Dynamic modeling of threat evolution.</p>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustPage;