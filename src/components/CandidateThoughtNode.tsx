import React from 'react';

type CandidateThoughtNodeProps = {
  text: string;
  onClick: () => void;
  backgroundColor?: string;
  isColorMode?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
};

const CandidateThoughtNode: React.FC<CandidateThoughtNodeProps> = ({
  text,
  onClick,
  backgroundColor = 'white',
  isColorMode = false,
  isSelectMode = false,
  isSelected = false,
}) => {
  return (
    <div
      className={`flex items-center rounded-lg relative ${
        isSelected ? 'border-4 border-red-500' : ''
      }`}
      onClick={onClick}
    >
      <div
        className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all"
        style={{
          backgroundColor,
          color: backgroundColor ? '#000000' : 'inherit',
          cursor: isSelectMode ? 'pointer' : isColorMode ? 'crosshair' : 'pointer',
        }}
      >
        <div className="whitespace-pre-wrap break-words">
          {text.length > 100 ? `${text.substring(0, 97)}...` : text}
        </div>
      </div>
    </div>
  );
};

export default CandidateThoughtNode; 