// Recommended file structure:

src/
├── components/
│   ├── dashboard/
│   │   ├── RequirementsDashboard.jsx (main component)
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── views/
│   │       ├── OverviewView.jsx
│   │       ├── CapabilitiesView.jsx
│   │       ├── RequirementsView.jsx
│   │       ├── PCDView.jsx
│   │       ├── MaturityView.jsx
│   │       ├── BusinessValueView.jsx
│   │       └── AnalyticsView.jsx
│   ├── modals/
│   │   ├── EditRequirementModal.jsx
│   │   ├── NewCapabilityModal.jsx
│   │   ├── CSVUploadModal.jsx
│   │   └── PurgeConfirmationModal.jsx
│   ├── charts/
│   │   └── InteractiveChart.jsx
│   └── ui/
│       ├── StatCard.jsx
│       ├── MaturityIndicator.jsx
│       └── LoadingSpinner.jsx
├── hooks/
│   ├── useRequirementsData.js
│   ├── useCapabilitiesData.js
│   ├── usePCDData.js
│   ├── useAnalytics.js
│   └── useDashboardState.js
├── utils/
│   ├── csvUtils.js
│   ├── dataService.js
│   └── constants.js
├── contexts/
│   └── DashboardContext.jsx
└── types/
    └── index.js (TypeScript definitions if needed)
