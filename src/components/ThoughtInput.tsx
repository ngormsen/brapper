import React, { useState, useEffect, useCallback } from 'react';
import { Thought } from '../types';
import { searchThoughts } from '../Client';
import { debounce } from 'lodash';

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
  const [isSearching, setIsSearching] = useState(false);

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

  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      if (value.trim() !== '') {
        setIsSearching(true);
        try {
          const results = await searchThoughts(value);
          setSearchResults(results.map((result: any) => result.sourceThought));
          setShowDropdown(true);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
          setShowDropdown(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedSearchThoughtId(null);
    setThoughtCandidate({
      ...thoughtCandidate,
      name: value,
    });
    debouncedSearch(value);
  };

  const handleSearchResultClick = (thought: Thought) => {
    setThoughtCandidate(thought);
    onSearchResultSelect(thought.id);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 relative w-full max-w-md">
      <div className="flex items-center w-full relative">
        <input
          id="thoughtInput"
          type="text"
          value={thoughtCandidate?.name || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`border-2 border-black rounded-lg px-8 py-4 focus:outline-none focus:border-blue-500 w-full ${selectedSearchThoughtId ? 'border-purple-500' : ''}`}
          placeholder="Enter thought name"
        />
        {isSearching && (
          <div className="absolute right-[100px] top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
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