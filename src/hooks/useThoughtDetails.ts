import { useEffect, useState } from 'react';
import { getThoughtDetails, ROOT_THOUGHT_ID } from '../Client';
import { Thought } from '../types';

function useThoughtDetails(thoughtId: string) {
  const [parent, setParent] = useState<Thought | null>(null);
  const [children, setChildren] = useState<Thought[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    getThoughtDetails(thoughtId)
      .then((thought) => {
        setParent({
          id: thought.activeThought.id,
          name: thought.activeThought.name,
        });
        setChildren(thought.children);
      })
      .catch(() => {
        setErrorMessage('Failed to fetch thought details');
      });
  }, [thoughtId]);

  return { parent, children, errorMessage };
}

export default useThoughtDetails; 