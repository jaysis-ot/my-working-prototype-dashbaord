import { useMemo } from 'react';

/**
 * Generates a static list of mock requirements if no data is provided.
 * This ensures that analytics components have sample data to display.
 * @returns {Array} An array of mock requirement objects.
 */
const generateMockRequirementsForAnalytics = () => {
    const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const categories = ['Access Control', 'Data Protection', 'Network Security', 'Incident Response'];
    const maturityLevels = [
        { level: 'Initial', score: 1 },
        { level: 'Developing', score: 2 },
        { level: 'Defined', score: 3 },
        { level: 'Managed', score: 4 },
        { level: 'Optimizing', score: 5 },
    ];

    return Array.from({ length: 50 }, (_, i) => ({
        id: `MOCK-${i + 1}`,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        category: categories[i % categories.length],
        businessValueScore: parseFloat((1 + Math.random() * 4).toFixed(1)),
        costEstimate: Math.floor(5000 + Math.random() * 95000),
        maturityLevel: maturityLevels[i % maturityLevels.length],
    }));
};

/**
 * Custom hook to process requirements data into structured analytics.
 *
 * This hook takes an array of requirements and performs several calculations
 * to generate data suitable for charts and statistical displays. It is memoized
 * for performance, re-calculating only when the source data changes.
 *
 * @param {Array<Object>} requirements - The array of requirement objects to analyze.
 * @returns {Object} An object containing various structured analytics datasets.
 */
export const useAnalytics = (requirements) => {
    return useMemo(() => {
        const data = requirements && requirements.length > 0 ? requirements : generateMockRequirementsForAnalytics();

        if (!data || data.length === 0) {
            return {
                statusData: [],
                maturityData: [],
                priorityData: [],
                businessValueData: [],
                categoryAnalysis: [],
                overallStats: {
                    totalRequirements: 0,
                    avgBusinessValue: 0,
                    avgMaturityScore: 0,
                    totalCost: 0,
                },
                improvementOpportunities: 0,
            };
        }

        // 1. Distributions (Status, Maturity, Priority)
        const statusCounts = {};
        const maturityCounts = {};
        const priorityCounts = {};

        data.forEach(req => {
            const status = req.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;

            const level = req.maturityLevel?.level || 'Unknown';
            maturityCounts[level] = (maturityCounts[level] || 0) + 1;

            const priority = req.priority || 'Unknown';
            priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
        });

        // 2. Business Value vs. Cost Analysis (for Scatter Plot)
        const businessValueData = data.map(req => ({
            id: req.id,
            businessValue: req.businessValueScore || 0,
            cost: (req.costEstimate || 0) / 1000, // Show cost in thousands
            category: req.category || 'Uncategorized',
        }));

        // 3. Category-based Analysis (for Radar Chart or Table)
        const categoryData = data.reduce((acc, req) => {
            const category = req.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    totalBusinessValue: 0,
                    totalMaturityScore: 0,
                    items: 0, // count items that have a score
                };
            }
            acc[category].count += 1;
            if (req.businessValueScore) {
                acc[category].totalBusinessValue += req.businessValueScore;
            }
            if (req.maturityLevel?.score) {
                acc[category].totalMaturityScore += req.maturityLevel.score;
                acc[category].items += 1;
            }
            return acc;
        }, {});

        const categoryAnalysis = Object.entries(categoryData).map(([name, stats]) => ({
            name,
            count: stats.count,
            avgBusinessValue: stats.count > 0 ? (stats.totalBusinessValue / stats.count) : 0,
            avgMaturityScore: stats.items > 0 ? (stats.totalMaturityScore / stats.items) : 0,
        }));

        // 4. Overall Statistics
        const totalRequirements = data.length;
        const totalCost = data.reduce((sum, req) => sum + (req.costEstimate || 0), 0);
        const totalBusinessValue = data.reduce((sum, req) => sum + (req.businessValueScore || 0), 0);
        const assessedForMaturity = data.filter(r => r.maturityLevel?.score);
        const totalMaturityScore = assessedForMaturity.reduce((sum, req) => sum + req.maturityLevel.score, 0);

        const overallStats = {
            totalRequirements,
            avgBusinessValue: totalRequirements > 0 ? (totalBusinessValue / totalRequirements) : 0,
            avgMaturityScore: assessedForMaturity.length > 0 ? (totalMaturityScore / assessedForMaturity.length) : 0,
            totalCost,
        };

        // 5. Improvement Opportunities (Low maturity ≤2 & High business value ≥4)
        const improvementOpportunities = data.filter(
            r => (r.maturityLevel?.score || 0) <= 2 && (r.businessValueScore || 0) >= 4
        ).length;

        return {
            statusData: Object.entries(statusCounts).map(([name, count]) => ({ name, count })),
            maturityData: Object.entries(maturityCounts).map(([name, count]) => ({ name, count })),
            priorityData: Object.entries(priorityCounts).map(([name, count]) => ({ name, count })),
            businessValueData,
            categoryAnalysis,
            overallStats,
            improvementOpportunities,
        };
    }, [requirements]);
};
