import React, { useState, KeyboardEvent } from 'react';
import type { NodeInputProps } from './types';

export const SingleNodeInput: React.FC<NodeInputProps> = ({ onAddNode }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (input.trim()) {
      onAddNode(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleSubmit}
        placeholder="Add a single node"
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Node
      </button>
    </div>
  );
}; 