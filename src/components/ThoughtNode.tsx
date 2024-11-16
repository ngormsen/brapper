import React from 'react';
import { ThoughtRelation } from '../Client';
import { Thought } from '../types';

type ThoughtNodeProps = {
  thought: Thought;
  onNavigate: (thought: Thought) => void;
  onAddChild: (thought: Thought) => void;
  onAddJump: (thought: Thought) => void;
};

const ThoughtNode: React.FC<ThoughtNodeProps> = ({ thought, onNavigate, onAddChild, onAddJump }) => {
  return (
    <div className="flex items-center rounded-lg">
      <div className="relative">
        {/* Left button */}
        <button
          className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 w-4 h-4 bg-blue-200 rounded-md flex items-center justify-center hover:bg-blue-300"
          onClick={(e) => {
            e.stopPropagation();
            onAddJump(thought);
          }}
        >
          +
        </button>

        {/* Main box */}
        <div
          className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 transition-colors"
          onClick={() => onNavigate(thought)}
          style={{
            backgroundColor: thought.backgroundColor || 'transparent',
            color: thought.backgroundColor ? '#000000' : 'inherit',
          }}
        >
          {thought.name}
        </div>

        {/* Bottom button */}
        <button
          className="absolute bottom-0 left-1/2 translate-y-4 -translate-x-1/2 w-4 h-4 bg-blue-200 rounded-md flex items-center justify-center hover:bg-blue-300"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(thought);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ThoughtNode;