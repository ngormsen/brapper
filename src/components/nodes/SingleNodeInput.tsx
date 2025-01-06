import fuzzysort from 'fuzzysort';
import React, { KeyboardEvent, useState } from 'react';
import type { Node } from '../../types/domain';

interface SingleNodeInputProps {
  onAddNode: (text: string) => void;
  onSelectExistingNode: (node: Node) => void;
  allNodes: Node[]; // The full list of nodes available for fuzzy search
}

export const SingleNodeInput: React.FC<SingleNodeInputProps> = ({
  onAddNode,
  onSelectExistingNode,
  allNodes
}) => {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<Node[]>([]);

  const handleSubmit = (e: KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (input.trim()) {
      // If you want to allow creating a new node on Enter
      onAddNode(input.trim());
      setInput('');
      setSearchResults([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Only search if 4 or more characters
    if (value.trim().length >= 3) {
      // Example using fuzzysort
      const results = fuzzysort.go(value, allNodes, { key: 'text', limit: 3 });
      const topMatches = results.map(r => r.obj);
      setSearchResults(topMatches);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (node: Node) => {
    onSelectExistingNode(node);
    setSearchResults([]);
    setInput('');
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
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

      {/* Dropdown for search results */}
      {searchResults.length > 0 && (
        <ul className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow-md z-10">
          {searchResults.map(resultNode => (
            <li
              key={resultNode.id}
              onClick={() => handleSearchResultClick(resultNode)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {resultNode.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 