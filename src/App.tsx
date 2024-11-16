import React, { useState, useEffect } from 'react';
import {
  AccessType,
  createLink,
  createThought,
  getThoughtByExactName,
  getThoughtDetails,
  ROOT_THOUGHT_ID,
  ThoughtKind,
  ThoughtRelation,
  updateThoughtColor,
} from './Client';
import useThoughtDetails from './hooks/useThoughtDetails';
import ThoughtNode from './components/ThoughtNode';
import ThoughtInput from './components/ThoughtInput';
import { Thought } from './types';
import { useNavigationStack } from './hooks/useNavigationStack';

function App() {
  const { currentThoughtId, navigate, goBack, canGoBack } = useNavigationStack();
  const [refreshKey, setRefreshKey] = useState(0);
  const { parent, children, errorMessage } = useThoughtDetails(currentThoughtId, refreshKey);
  const [thoughtCandidate, setThoughtCandidate] = useState<Thought | null>(null);

  const [localErrorMessage, setLocalErrorMessage] = useState<string>('');

  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(event.key)) {
        setSelectedColorIndex(parseInt(event.key) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateToThought = (thought: Thought) => {
    navigate(thought.id);
  };

  const handleAddThought = (thought: Thought, thoughtRelation: ThoughtRelation) => {
    if (!thoughtCandidate) {
      return;
    }

    getThoughtByExactName(thoughtCandidate.name)
      .then((existingThought) => {
        return createLink({
          thoughtIdA: thought.id,
          thoughtIdB: existingThought.id,
          relation: thoughtRelation,
        }).then(() => existingThought);
      })
      .catch((error) => {
        if (error.message === 'Thought not found') {
          return createThought({
            name: thoughtCandidate.name,
            sourceThoughtId: thought.id,
            kind: ThoughtKind.Normal,
            relation: thoughtRelation,
            acType: AccessType.Private,
          });
        } else {
          throw new Error('An error occurred while creating the thought');
        }
      })
      .then((newThought) => {
        setThoughtCandidate(null);
        // Update local state to include the new thought
      })
      .catch((error) => {
        setLocalErrorMessage(error.message);
      });
  };

  const onAddChild = (thought: Thought) => {
    handleAddThought(thought, ThoughtRelation.Child);
  };

  const onAddJump = (thought: Thought) => {
    handleAddThought(thought, ThoughtRelation.Jump);
  };

  function getColorByIndex(index: number): string {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#800080'];
    return colors[index] || '#808080';
  }

  const handleThoughtClick = async (thought: Thought) => {
    if (selectedColorIndex !== null) {
      const newColor = getColorByIndex(selectedColorIndex);
      try {
        await updateThoughtColor({
          thoughtId: thought.id,
          backgroundColor: newColor,
        });

        // Increment refreshKey to re-fetch thought details
        setRefreshKey((prevKey) => prevKey + 1);
      } catch (error) {
        setLocalErrorMessage('Failed to update thought color');
      }
    } else {
      navigateToThought(thought);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center relative">
        {/* Color Legend */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full cursor-pointer ${
                selectedColorIndex === index ? 'ring-2 ring-black' : ''
              }`}
              style={{ backgroundColor: getColorByIndex(index) }}
              onClick={() => setSelectedColorIndex(index)}
            ></div>
          ))}
        </div>

        {/* Add Back Button */}
        {canGoBack && (
          <button
            onClick={() => goBack()}
            className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            ← Back
          </button>
        )}

        <h1 className="text-4xl font-bold text-center">Hello World</h1>

        {/* Parent */}
        {parent && (
          <ThoughtNode
            thought={parent}
            onNavigate={handleThoughtClick}
            onAddChild={onAddChild}
            onAddJump={onAddJump}
          />
        )}

        {/* Children */}
        <div className="flex-wrap flex items-center justify-center gap-8 mt-8 border-2 border-black rounded-lg p-8 m-1">
          {children.map((child) => (
            <ThoughtNode
              key={child.id}
              thought={child}
              onNavigate={handleThoughtClick}
              onAddChild={onAddChild}
              onAddJump={onAddJump}
            />
          ))}
        </div>

        {/* Thought Input */}
        <ThoughtInput
          thoughtCandidate={thoughtCandidate}
          setThoughtCandidate={setThoughtCandidate}
          onAddThought={() => handleAddThought(parent, ThoughtRelation.Child)}
        />

        {(errorMessage || localErrorMessage) && (
          <div className="text-red-500 text-center mt-8">
            {errorMessage || localErrorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
