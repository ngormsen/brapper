import React from 'react';
import { ThoughtRelation, deleteThought } from '../Client';
import { Thought } from '../types';

type ThoughtNodeProps = {
  thought: Thought;
  onNavigate: (thought: Thought) => void;
  onAddChild: (thought: Thought) => void;
  onAddJump: (thought: Thought) => void;
  onDeleteThought: (thoughtId: string) => void;
  isColorMode: boolean;
  isSelectMode: boolean;
  isSelected: boolean;
};

const ThoughtNode: React.FC<ThoughtNodeProps> = ({
  thought,
  onNavigate,
  onAddChild,
  onAddJump,
  onDeleteThought,
  isColorMode,
  isSelectMode,
  isSelected,
}) => {
  return (
    <div
      className={`flex items-center rounded-lg relative ${
        isSelected ? 'border-4 border-red-500' : ''
      }`}
    >
      <button
        className="absolute top-0 right-0 mt-1 mr-1 text-red-500 hover:text-red-700"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDeleteThought(thought.id);
        }}
      >
        ✕
      </button>

      <div
        className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all"
        onClick={() => onNavigate(thought)}
        style={{
          backgroundColor: thought.backgroundColor || 'transparent',
          color: thought.backgroundColor ? '#000000' : 'inherit',
          cursor: isSelectMode ? 'pointer' : isColorMode ? 'crosshair' : 'pointer',
        }}
      >
        {thought.name}
      </div>

    </div>
  );
};

export default ThoughtNode;