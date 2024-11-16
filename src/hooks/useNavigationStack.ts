import { useState, useCallback } from 'react';
import { ROOT_THOUGHT_ID } from '../Client';

export function useNavigationStack(initialThoughtId: string = ROOT_THOUGHT_ID) {
  const [stack, setStack] = useState<string[]>([initialThoughtId]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useCallback((thoughtId: string) => {
    setStack(prevStack => {
      // Remove any forward history when navigating to a new thought
      const newStack = prevStack.slice(0, currentIndex + 1);
      return [...newStack, thoughtId];
    });
    setCurrentIndex(prev => prev + 1);
    return thoughtId;
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return stack[currentIndex - 1];
    }
    return stack[currentIndex];
  }, [stack, currentIndex]);

  const canGoBack = currentIndex > 0;

  return {
    currentThoughtId: stack[currentIndex],
    navigate,
    goBack,
    canGoBack
  };
} 