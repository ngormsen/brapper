import React from 'react';
import type { NodeDisplayProps } from './types';

export const NodeDisplay: React.FC<NodeDisplayProps> = ({ text, maxLength = 50 }) => {
  const isLongText = text.length > maxLength;
  const displayText = isLongText ? `${text.slice(0, maxLength)}...` : text;

  return (
    <div className="bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow group relative">
      <span className="inline-block max-w-[300px] truncate">{displayText}</span>
      {isLongText && (
        <div className="absolute left-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-[300px] break-words">
          {text}
        </div>
      )}
    </div>
  );
}; 