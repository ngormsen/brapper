import React, { useState } from 'react';
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
  const [isActive, setIsActive] = useState(false);

  const handleAction = () => {
    setIsActive(true);
    onAddThought();
    setTimeout(() => setIsActive(false), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAction();
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

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
        onKeyDown={handleKeyDown}
        className="border-2 border-black rounded-lg px-8 py-4 focus:outline-none focus:border-blue-500"
        placeholder="Enter thought name"
      />
      <button
        className={`bg-blue-500 text-white mx-2 px-8 py-4 rounded-md 
          transition-transform duration-100
          ${isActive ? 'scale-95 bg-blue-600' : ''}`}
        onClick={handleAction}
      >
        Add
      </button>
    </div>
  );
};

export default ThoughtInput; 