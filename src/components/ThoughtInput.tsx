import React from 'react';
import { Thought } from '../types';

type ThoughtInputProps = {
  thoughtCandidate: Thought | null;
  setThoughtCandidate: React.Dispatch<React.SetStateAction<Thought | null>>;
  onAddThought: () => void;
};

const ThoughtInput: React.FC<ThoughtInputProps> = ({
  thoughtCandidate,
  setThoughtCandidate,
  onAddThought,
}) => {
  return (
    <div className="flex items-center justify-center mt-8">
      <input
        type="text"
        value={thoughtCandidate?.name || ''}
        onChange={(e) =>
          setThoughtCandidate({
            ...thoughtCandidate,
            name: e.target.value,
          })
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAddThought();
          }
        }}
        className="border-2 border-black rounded-lg px-8 py-4 focus:outline-none focus:border-blue-500"
        placeholder="Enter thought name"
      />
      <button
        className="bg-blue-500 text-white mx-2 px-8 py-4 rounded-md"
        onClick={onAddThought}
      >
        Add
      </button>
    </div>
  );
};

export default ThoughtInput; 