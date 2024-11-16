import { useState, useEffect } from 'react';
import { getThoughtDetails } from '../Client';
import { Thought } from '../types';

function useThoughtDetails(currentThoughtId: string, refreshKey: number) {
  const [parent, setParent] = useState<Thought | null>(null);
  const [children, setChildren] = useState<Thought[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    getThoughtDetails(currentThoughtId)
      .then((thought) => {
        setParent({
          id: thought.activeThought.id,
          name: thought.activeThought.name,
        });
        const sortedChildren = [...thought.children].sort((a, b) => {
          if (!a.backgroundColor) return 1;
          if (!b.backgroundColor) return -1;
          return a.backgroundColor.localeCompare(b.backgroundColor);
        });
        setChildren(sortedChildren);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch thought details');
      });
  }, [currentThoughtId, refreshKey]);

  return { parent, children, errorMessage, setParent, setChildren };
}

export default useThoughtDetails; 