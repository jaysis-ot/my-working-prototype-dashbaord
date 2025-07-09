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
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

/**
 * A reusable card component for displaying a key concept on the Trust page.
 * This is an internal component to keep the main page component clean.
 */
const InfoCard = ({ icon: Icon, title, children, color = 'primary' }) => (
  <div className="bg-white dark:bg-secondary-800/50 p-4 rounded-lg border border-secondary-200/50 dark:border-secondary-700/50 flex items-start gap-4 h-full">
    <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
      <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div>
      <h3 className="text-md font-semibold text-secondary-900 dark:text-white mb-1">{title}</h3>
      <div className="text-sm text-secondary-600 dark:text-secondary-300 space-y-2">
        {children}
      </div>
    </div>
  </div>
);

/**
 * TrustPage Component - STATIC PLACEHOLDER
 * 
 * Provides a static, user-friendly overview of the Cybersecurity Trust Scoring framework.
 * This version uses hardcoded data to ensure it loads reliably while debugging other issues.
 * It translates the complex mathematical model into understandable concepts for stakeholders.
 */
const TrustPage = () => {
  // Hardcoded mock data to ensure the page always renders
  const trustData = {
    overallScore: 78.5,
    scoreDelta: -1.2,
  };

  return (
    <div className="fade-in space-y-6 p-1">
      {/* Placeholder Notification */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
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
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary-600" />
            Cybersecurity Trust Score
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-2 max-w-3xl">
            This page provides a transparent overview of how your organization's Trust Score is calculated. Our model is a dynamic, multi-faceted framework designed to provide a realistic and actionable measure of cybersecurity trustworthiness.
          </p>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 dashboard-card bg-gradient-to-br from-primary-600 to-blue-600 text-white p-6 flex flex-col items-center justify-center text-center">
          <p className="font-semibold">Overall Trust Score</p>
          <p className="text-6xl font-bold my-2">{trustData.overallScore.toFixed(1)}</p>
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${trustData.scoreDelta < 0 ? 'bg-red-500/50' : 'bg-green-500/50'}`}>
            {trustData.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(trustData.scoreDelta).toFixed(1)}
            <span className="ml-2">Last 30 days</span>
          </div>
          <p className="text-xs opacity-80 mt-4">A score from 0 to 100 representing the overall trustworthiness of your cybersecurity posture.</p>
        </div>
        <div className="lg:col-span-2 dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4">Core Calculation: The 6 Key Factors</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
            Your Trust Score is not a single metric, but a composite derived from six fundamental factors, each providing a unique perspective on your security posture.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={BarChart} title="Weighted Evidence" color="blue"><p>The foundation of the score, based on all collected security data. More recent evidence carries more weight.</p></InfoCard>
            <InfoCard icon={Briefcase} title="Business Context" color="purple"><p>Adjusts the score based on the criticality of your systems and data to the business mission.</p></InfoCard>
            <InfoCard icon={Target} title="Adversarial Adaptation" color="red"><p>Models how effectively your defenses adapt to the constantly evolving threat landscape.</p></InfoCard>
            <InfoCard icon={Network} title="Attack Surface" color="orange"><p>Accounts for the size and complexity of your digital footprint. A larger surface is harder to defend.</p></InfoCard>
            <InfoCard icon={Users} title="Systemic Risk" color="yellow"><p>Considers risks inherited from interconnected third-party vendors and partners.</p></InfoCard>
            <InfoCard icon={HelpCircle} title="Uncertainty" color="gray"><p>A built-in margin for error, acknowledging that no security measurement can be 100% perfect.</p></InfoCard>
          </div>
        </div>
      </div>

      {/* What We Measure Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">What We Measure: The Four Pillars of Evidence</h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-4xl">
          The "Weighted Evidence" factor is the most significant part of your score. It is built upon four distinct pillars of evidence that provide a holistic view of your security program.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard icon={FileText} title="Intent" color="blue">
            <p>This pillar measures your stated security goals and policies.</p>
            <ul className="list-disc pl-5 mt-2 text-xs">
              <li>Security Policies & Standards</li>
              <li>Governance Documentation</li>
              <li>Stated Risk Appetite</li>
            </ul>
          </InfoCard>
          <InfoCard icon={Wrench} title="Implementation" color="green">
            <p>This measures how well your intentions are translated into actual security controls.</p>
            <ul className="list-disc pl-5 mt-2 text-xs">
              <li>Firewall Configurations</li>
              <li>Access Control Lists (ACLs)</li>
              <li>Endpoint Protection Deployment</li>
            </ul>
          </InfoCard>
          <InfoCard icon={Activity} title="Behavioral" color="yellow">
            <p>This pillar analyzes real-time activity to see how your controls perform in practice.</p>
            <ul className="list-disc pl-5 mt-2 text-xs">
              <li>Network Traffic Logs</li>
              <li>Authentication Events</li>
              <li>System Alerts & Events</li>
            </ul>
          </InfoCard>
          <InfoCard icon={CheckSquare} title="Validation" color="red">
            <p>This provides independent verification that your controls are effective.</p>
            <ul className="list-disc pl-5 mt-2 text-xs">
              <li>Penetration Test Results</li>
              <li>Vulnerability Scans</li>
              <li>Third-Party Audits</li>
            </ul>
          </InfoCard>
        </div>
      </div>

      {/* Deep Dive Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Deep Dive: How Key Factors Are Modeled</h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-4xl">
          Our framework uses advanced modeling to ensure the score is dynamic and realistic. Here’s a glimpse into the logic behind some of the key factors.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard icon={Clock} title="The Weight of Time (Memory Kernel)" color="indigo">
            <p>The model gives more importance to recent events but never completely forgets the past. This is achieved through an "evidence half-life" system, where the influence of older data gradually decays. It also recognizes cyclical business activities like quarterly audits or annual policy reviews, giving them appropriate weight when they occur.</p>
          </InfoCard>
          <InfoCard icon={BrainCircuit} title="The Human Element" color="pink">
            <p>The model recognizes that security is not just about technology. It incorporates the human factor by assessing the effectiveness of security training, the level of employee awareness, and the potential for insider threats. A strong security culture positively influences the score.</p>
          </InfoCard>
          <InfoCard icon={Scale} title="Model Integrity & Validation" color="teal">
            <p>To ensure the Trust Score is itself trustworthy, the framework is built for rigorous academic and empirical validation. It includes mechanisms for quantifying uncertainty, performing sensitivity analysis on its parameters, and undergoing statistical tests to confirm its accuracy and reliability against real-world data.</p>
          </InfoCard>
           <InfoCard icon={Target} title="Adversarial Adaptation" color="red">
            <p>A static defense is a losing defense. This model component acknowledges that attackers constantly adapt. It assesses how agile your security program is and adjusts the score based on your ability to keep pace with emerging threats and adversarial tactics, preventing a false sense of security.</p>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default TrustPage;
