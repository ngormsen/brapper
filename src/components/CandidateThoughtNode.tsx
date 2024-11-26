import React, { useState } from 'react';

type CandidateThoughtNodeProps = {
  text: string;
  content?: string;
  onClick: () => void;
  backgroundColor?: string;
  isColorMode?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
};

const CandidateThoughtNode: React.FC<CandidateThoughtNodeProps> = ({
  text,
  content,
  onClick,
  backgroundColor = 'white',
  isColorMode = false,
  isSelectMode = false,
  isSelected = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`flex items-center rounded-lg relative ${
        isSelected ? 'border-4 border-red-500' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all relative"
        style={{
          backgroundColor,
          color: backgroundColor ? '#000000' : 'inherit',
          cursor: isSelectMode ? 'pointer' : isColorMode ? 'crosshair' : 'pointer',
        }}
      >
        <div className="whitespace-pre-wrap break-words">
          {text.length > 100 ? `${text.substring(0, 97)}...` : text}
          {content && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
        {content && isHovering && (
          <div className="absolute left-0 top-full mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 overflow-y-auto max-h-72">
            <p className="text-sm text-gray-700">{content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateThoughtNode; 