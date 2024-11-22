import React, { useCallback, useEffect } from 'react';
import { SearchResult, searchThoughts } from '../Client';
import { debounce } from 'lodash';

interface SearchInputProps {
  onSearchResultClick: (thoughtId: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearchResultClick }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  // Create a memoized debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchThoughts(query, 5, true);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setError(error instanceof Error ? error.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setError('');
    debouncedSearch(query);
  };

  // Handle escape key to clear search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleResultClick = (thoughtId: string) => {
    onSearchResultClick(thoughtId);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <p className="absolute -top-1 -left-2 text-sm bg-gray-700 text-white px-1 rounded-md z-10">F</p>
      <input
        id="searchInput"
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search thoughts..."
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
      />
      {isSearching && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result.sourceThought.id)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              style={{
                backgroundColor: result.sourceThought.backgroundColor || 'transparent',
              }}
            >
              {result.name}
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="absolute w-full mt-1 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchInput; 