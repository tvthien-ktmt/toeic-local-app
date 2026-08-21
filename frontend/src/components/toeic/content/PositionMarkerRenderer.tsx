import React from 'react';

interface PositionMarkerProps {
  position: number;
}

/**
 * Renders sentence insertion position markers [1], [2], [3], [4] with distinct visual styling.
 */
export const PositionMarkerRenderer: React.FC<PositionMarkerProps> = ({ position }) => {
  return (
    <span
      className="inline-flex items-center justify-center mx-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-black bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-xs select-none"
      title={`Vị trí chèn câu [${position}]`}
    >
      [{position}]
    </span>
  );
};
