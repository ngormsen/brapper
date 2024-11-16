import React from 'react';
import { ThoughtRelation, deleteThought } from '../Client';
import { Thought } from '../types';

type ThoughtNodeProps = {
  thought: Thought;
  onNavigate: (thought: Thought) => void;
  onAddChild: (thought: Thought) => void;
  onAddJump: (thought: Thought) => void;
  onDeleteThought: (thoughtId: string) => void;
};

const ThoughtNode: React.FC<ThoughtNodeProps> = ({
  thought,
  onNavigate,
  onAddChild,
  onAddJump,
  onDeleteThought,
}) => {
  return (
    <div className="flex items-center rounded-lg relative">
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

      <button
        className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 w-4 h-4 bg-blue-200 rounded-md flex items-center justify-center hover:bg-blue-300"
        onClick={(e) => {
          e.stopPropagation();
          onAddJump(thought);
        }}
      >
        +
      </button>

      <div
        className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all"
        onClick={() => onNavigate(thought)}
        style={{
          backgroundColor: thought.backgroundColor || 'transparent',
          color: thought.backgroundColor ? '#000000' : 'inherit',
        }}
      >
        {thought.name}
      </div>

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
  );
};

export default ThoughtNode;