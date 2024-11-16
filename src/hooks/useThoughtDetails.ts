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
        setChildren(thought.children);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch thought details');
      });
  }, [currentThoughtId, refreshKey]);

  return { parent, children, errorMessage };
}

export default useThoughtDetails; 