import React, { useState, useEffect } from 'react';
import { Thought } from '../types';
import { searchThoughts } from '../Client';

type ThoughtInputProps = {
  thoughtCandidate: Thought | null;
  setThoughtCandidate: React.Dispatch<React.SetStateAction<Thought | null>>;
  onAddThought: () => void;
  onSearchResultSelect: (thoughtId: string) => void;
  selectedSearchThoughtId: string | null;
  setSelectedSearchThoughtId: React.Dispatch<React.SetStateAction<string | null>>;
};

const ThoughtInput: React.FC<ThoughtInputProps> = ({
  thoughtCandidate,
  setThoughtCandidate,
  onAddThought,
  onSearchResultSelect,
  selectedSearchThoughtId,
  setSelectedSearchThoughtId,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [searchResults, setSearchResults] = useState<Thought[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  const handleAction = () => {
    setIsActive(true);
    onAddThought();
    setTimeout(() => setIsActive(false), 100);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAction();
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedSearchThoughtId(null);
    setThoughtCandidate({
      ...thoughtCandidate,
      name: value,
    });

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = window.setTimeout(() => {
      if (value.trim() !== '') {
        searchThoughts(value)
          .then((results) => {
            setSearchResults(results.map((result: any) => result.sourceThought));
            setShowDropdown(true);
          })
          .catch((error) => {
            console.error('Search failed:', error);
            setSearchResults([]);
            setShowDropdown(false);
          });
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    setDebounceTimeout(timeout);
  };

  const handleSearchResultClick = (thought: Thought) => {
    setThoughtCandidate(thought);
    onSearchResultSelect(thought.id);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 relative w-full max-w-md">
      <div className="flex items-center w-full">
        <input
          id="thoughtInput"
          type="text"
          value={thoughtCandidate?.name || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`border-2 border-black rounded-lg px-8 py-4 focus:outline-none focus:border-blue-500 w-full ${selectedSearchThoughtId ? 'border-purple-500' : ''}`}
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
      {showDropdown && searchResults.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border-2 border-black rounded-lg mt-1 max-h-60 overflow-y-auto z-10">
          {searchResults.map((thought) => (
            <li
              key={thought.id}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSearchResultClick(thought)}
            >
              {thought.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThoughtInput; 