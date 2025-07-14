import React, { useEffect } from 'react';

/**
 * TrustDashboard Component
 * 
 * A comprehensive dashboard displaying the organization's cybersecurity trust score
 * with detailed breakdowns of contributing factors, evidence foundation, and
 * recommended actions to improve security posture.
 */
const TrustDashboard = () => {
  // Add interactive functionality after component mounts
  useEffect(() => {
    // Simulate factor card clicks
    document.querySelectorAll('.factor-card').forEach(card => {
      card.addEventListener('click', () => {
        alert('Detailed factor analysis would open here');
      });
    });

    // Simulate pillar card clicks
    document.querySelectorAll('.pillar-card').forEach(card => {
      card.addEventListener('click', () => {
        alert('Evidence pillar details would open here');
      });
    });

    // Simulate live score updates
    const scoreInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        const scoreElement = document.querySelector('.score-value');
        if (scoreElement) {
          const currentScore = parseFloat(scoreElement.textContent);
          const change = (Math.random() - 0.5) * 0.4;
          const newScore = Math.max(0, Math.min(100, currentScore + change));
          scoreElement.textContent = newScore.toFixed(1);
        }
      }
    }, 5000);

    // Cleanup event listeners on unmount
    return () => {
      clearInterval(scoreInterval);
      document.querySelectorAll('.factor-card, .pillar-card').forEach(card => {
        card.replaceWith(card.cloneNode(true));
      });
    };
  }, []);

  return (
    <>
      <style jsx>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            transform: translate(50%, -50%);
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .page-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .page-subtitle {
            font-size: 1.125rem;
            opacity: 0.9;
            margin-bottom: 1.5rem;
        }
        .trust-overview {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 3rem;
            align-items: center;
        }
        .trust-score-main {
            text-align: center;
        }
        .score-circle {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 0 auto 1rem;
        }
        .score-value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3.5rem;
            font-weight: 700;
            color: white;
        }
        .score-change {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 1rem;
            opacity: 0.9;
        }
        .score-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        .trust-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
        }
        .metric-card {
            background: rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .metric-label {
            font-size: 0.875rem;
            opacity: 0.9;
        }
        .main-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0f172a;
        }
        .factors-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .factor-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .factor-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-color: #3b82f6;
        }
        .factor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .factor-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }
        .factor-icon.evidence { background: #3b82f6; }
        .factor-icon.context { background: #8b5cf6; }
        .factor-icon.surface { background: #f59e0b; }
        .factor-icon.systemic { background: #eab308; }
        .factor-icon.adaptation { background: #ef4444; }
        .factor-icon.uncertainty { background: #64748b; }
        .factor-score {
            font-size: 1.75rem;
            font-weight: 700;
        }
        .score-excellent { color: #059669; }
        .score-good { color: #d97706; }
        .score-fair { color: #dc2626; }
        .factor-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #0f172a;
        }
        .factor-description {
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 1rem;
        }
        .factor-trend {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }
        .trend-up { color: #059669; }
        .trend-down { color: #dc2626; }
        .trend-stable { color: #64748b; }
        .evidence-pillars {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .pillar-card {
            background: linear-gradient(145deg, #ffffff, #f1f5f9);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .pillar-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        .pillar-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 1.25rem;
        }
        .pillar-icon.intent { background: linear-gradient(135deg, #667eea, #764ba2); }
        .pillar-icon.implementation { background: linear-gradient(135deg, #ffecd2, #fcb69f); }
        .pillar-icon.behavioral { background: linear-gradient(135deg, #a8edea, #fed6e3); }
        .pillar-icon.validation { background: linear-gradient(135deg, #d299c2, #fef9d7); }
        .pillar-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #0f172a;
        }
        .pillar-score {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .pillar-count {
            font-size: 0.875rem;
            color: #64748b;
        }
        .insights-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        .modeling-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }
        .model-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
        }
        .model-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            color: white;
            font-weight: 600;
        }
        .model-icon.memory { background: #3b82f6; }
        .model-icon.human { background: #ec4899; }
        .model-icon.integrity { background: #10b981; }
        .model-icon.adaptive { background: #f59e0b; }
        .model-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #0f172a;
        }
        .model-description {
            font-size: 0.875rem;
            color: #64748b;
        }
        .action-items {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        .action-list {
            list-style: none;
        }
        .action-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 0.75rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
        }
        .action-item:hover {
            background: #f1f5f9;
            border-color: #3b82f6;
        }
        .action-priority {
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
        }
        .priority-high { background: #ef4444; }
        .priority-medium { background: #f59e0b; }
        .priority-low { background: #10b981; }
        .action-text {
            flex: 1;
            font-weight: 500;
        }
        .action-impact {
            font-size: 0.875rem;
            color: #64748b;
            background: #e2e8f0;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
        }
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn-primary {
            background: #3b82f6;
            color: white;
        }
        .btn-secondary {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
        }
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        @media (max-width: 1024px) {
            .main-grid {
                grid-template-columns: 1fr;
            }
            
            .trust-overview {
                grid-template-columns: 1fr;
                gap: 2rem;
                text-align: center;
            }
            
            .factors-grid {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 768px) {
            .evidence-pillars {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .modeling-grid {
                grid-template-columns: 1fr;
            }
            
            .trust-metrics {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <div className="header-content">
            <h1 className="page-title">Cybersecurity Trust Score</h1>
            <p className="page-subtitle">Real-time confidence measurement based on evidence-driven security posture assessment</p>
            
            <div className="trust-overview">
              <div className="trust-score-main">
                <div className="score-circle">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
                    <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="8" 
                            strokeDasharray="565" strokeDashoffset="122" 
                            strokeLinecap="round" transform="rotate(-90 100 100)"/>
                  </svg>
                  <div className="score-value">78.5</div>
                </div>
                <div className="score-change">
                  <span className="score-trend trend-down">
                    ↓ 1.2 points
                  </span>
                  <span>Last 30 days</span>
                </div>
              </div>
              
              <div className="trust-metrics">
                <div className="metric-card">
                  <div className="metric-value">87%</div>
                  <div className="metric-label">Evidence Coverage</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">1,247</div>
                  <div className="metric-label">Active Artifacts</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">94%</div>
                  <div className="metric-label">Model Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="main-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Trust Factors Analysis</h3>
              <button className="btn btn-secondary">View Details</button>
            </div>
            
            <div className="factors-grid">
              <div className="factor-card">
                <div className="factor-header">
                  <div className="factor-icon evidence">WE</div>
                  <div className="factor-score score-excellent">85</div>
                </div>
                <h4 className="factor-title">Weighted Evidence</h4>
                <p className="factor-description">Strong evidence collection with good recency across most domains</p>
                <div className="factor-trend trend-up">
                  ↑ +2.3 points • Fresh behavioral evidence
                </div>
              </div>
              
              <div className="factor-card">
                <div className="factor-header">
                  <div className="factor-icon context">BC</div>
                  <div className="factor-score score-good">72</div>
                </div>
                <h4 className="factor-title">Business Context</h4>
                <p className="factor-description">Critical systems protected, some gaps in vendor risk coverage</p>
                <div className="factor-trend trend-stable">
                  → Stable • Review supplier assessments
                </div>
              </div>
              
              <div className="factor-card">
                <div className="factor-header">
                  <div className="factor-icon surface">AS</div>
                  <div className="factor-score score-fair">68</div>
                </div>
                <h4 className="factor-title">Attack Surface</h4>
                <p className="factor-description">Moderate complexity footprint with recent cloud expansion</p>
                <div className="factor-trend trend-down">
                  ↓ -1.8 points • New cloud services added
                </div>
              </div>
              
              <div className="factor-card">
                <div className="factor-header">
                  <div className="factor-icon systemic">SR</div>
                  <div className="factor-score score-good">79</div>
                </div>
                <h4 className="factor-title">Systemic Risk</h4>
                <p className="factor-description">Well-managed partner relationships and supply chain oversight</p>
                <div className="factor-trend trend-up">
                  ↑ +1.1 points • Improved vendor monitoring
                </div>
              </div>
              
              <div className="factor-card">
                <div className="factor-header">
                  <div className="factor-icon adaptation">AA</div>
                  <div className="factor-score score-good">74</div>
                </div>
                <h4 className="factor-title">Adversarial Adaptation</h4>
                <p className="factor-description">Good threat intelligence integration and response capabilities</p>
                <div className="factor-trend trend-stable">
                  → Stable • Maintain current practices
                </div>
              </div>
              
              <div className="factor-card">
                <div className="factor-header">
                  <div className="factor-icon uncertainty">UC</div>
                  <div className="factor-score score-fair">82</div>
                </div>
                <h4 className="factor-title">Uncertainty Management</h4>
                <p className="factor-description">Limited data gaps with reasonable estimation methods</p>
                <div className="factor-trend trend-up">
                  ↑ +0.7 points • Better evidence automation
                </div>
              </div>
            </div>
          </div>
          
          <div className="action-items">
            <div className="card-header">
              <h3 className="card-title">Recommended Actions</h3>
              <button className="btn btn-primary">View All</button>
            </div>
            
            <ul className="action-list">
              <li className="action-item">
                <div className="action-priority priority-high"></div>
                <div className="action-text">Update penetration testing (127 days overdue)</div>
                <div className="action-impact">+3.2 pts</div>
              </li>
              <li className="action-item">
                <div className="action-priority priority-medium"></div>
                <div className="action-text">Complete cloud security assessment for new services</div>
                <div className="action-impact">+2.1 pts</div>
              </li>
              <li className="action-item">
                <div className="action-priority priority-medium"></div>
                <div className="action-text">Refresh incident response plan documentation</div>
                <div className="action-impact">+1.8 pts</div>
              </li>
              <li className="action-item">
                <div className="action-priority priority-low"></div>
                <div className="action-text">Enhance vendor risk monitoring automation</div>
                <div className="action-impact">+1.2 pts</div>
              </li>
              <li className="action-item">
                <div className="action-priority priority-low"></div>
                <div className="action-text">Update employee security training completion tracking</div>
                <div className="action-impact">+0.9 pts</div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="insights-section">
          <div className="card">
            <h3 className="card-title">Evidence Foundation</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your trust score is built on four pillars of evidence, each contributing to your overall confidence level.</p>
            
            <div className="evidence-pillars">
              <div className="pillar-card">
                <div className="pillar-icon intent">I</div>
                <h4 className="pillar-title">Intent</h4>
                <div className="pillar-score score-good">73</div>
                <div className="pillar-count">243 policies & procedures</div>
              </div>
              
              <div className="pillar-card">
                <div className="pillar-icon implementation">M</div>
                <h4 className="pillar-title">Implementation</h4>
                <div className="pillar-score score-excellent">84</div>
                <div className="pillar-count">418 configurations & controls</div>
              </div>
              
              <div className="pillar-card">
                <div className="pillar-icon behavioral">B</div>
                <h4 className="pillar-title">Behavioral</h4>
                <div className="pillar-score score-excellent">89</div>
                <div className="pillar-count">392 logs & monitoring feeds</div>
              </div>
              
              <div className="pillar-card">
                <div className="pillar-icon validation">V</div>
                <h4 className="pillar-title">Validation</h4>
                <div className="pillar-score score-fair">67</div>
                <div className="pillar-count">194 audits & assessments</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="card-title">Advanced Modeling</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Our model incorporates adaptive, temporal, and human factors to maintain accuracy and relevance.</p>
            
            <div className="modeling-grid">
              <div className="model-card">
                <div className="model-icon memory">MK</div>
                <h4 className="model-title">Memory Kernel</h4>
                <p className="model-description">Evidence decays over time, but cycles are weighted to reflect ongoing validation</p>
              </div>
              
              <div className="model-card">
                <div className="model-icon human">HE</div>
                <h4 className="model-title">Human Element</h4>
                <p className="model-description">Training effectiveness, culture indicators, and insider threat analysis integrated</p>
              </div>
              
              <div className="model-card">
                <div className="model-icon integrity">MI</div>
                <h4 className="model-title">Model Integrity</h4>
                <p className="model-description">Statistical validation with continuous sensitivity analysis and bias detection</p>
              </div>
              
              <div className="model-card">
                <div className="model-icon adaptive">AA</div>
                <h4 className="model-title">Adaptive Learning</h4>
                <p className="model-description">Dynamic threat landscape modeling with real-time intelligence integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrustDashboard;
