// src/components/ui/SkeletonGrid.jsx
export const SkeletonGrid = ({ columns = 6, rows = 1 }) => (
  <div className="animate-pulse">
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${columns} gap-4`}>
      {[...Array(columns * rows)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
      ))}
    </div>
  </div>
);

export { LoadingSpinner, StatCard };