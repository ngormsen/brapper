import React, { useState, useEffect } from 'react';
import {
  AccessType,
  createLink,
  createThought,
  deleteThought,
  getThoughtByExactName,
  ThoughtKind,
  ThoughtRelation,
  updateThoughtColor,
} from './Client';
import ThoughtInput from './components/ThoughtInput';
import ThoughtNode from './components/ThoughtNode';
import { useNavigationStack } from './hooks/useNavigationStack';
import useThoughtDetails from './hooks/useThoughtDetails';
import { ColorTypeIds, Thought } from './types';

function App() {
  const { currentThoughtId, navigate, goBack, canGoBack } = useNavigationStack();
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    parent,
    children,
    errorMessage,
    setParent,
    setChildren,
  } = useThoughtDetails(currentThoughtId, refreshKey);
  const [thoughtCandidate, setThoughtCandidate] = useState<Thought | null>(null);

  const [localErrorMessage, setLocalErrorMessage] = useState<string>('');

  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

  const [isBackActive, setIsBackActive] = useState(false);
  const [isRefreshActive, setIsRefreshActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5', '6'].includes(event.key)) {
        const colorIndex = parseInt(event.key) - 1;
        setSelectedColorIndex((prevIndex) =>
          prevIndex === colorIndex ? null : colorIndex
        );
      } else if (event.key.toLowerCase() === 's') {
        setIsSelectMode((prev) => !prev);
        setSelectedNodes(new Set());
      } else if (event.key.toLowerCase() === 'r') {
        setIsRefreshActive(true);
        handleRefetch();
        setTimeout(() => setIsRefreshActive(false), 100);
      } else if (event.key.toLowerCase() === 'b') {
        if (canGoBack) {
          setIsBackActive(true);
          goBack();
          setTimeout(() => setIsBackActive(false), 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canGoBack]); // Include canGoBack in dependencies

  const navigateToThought = (thought: Thought) => {
    navigate(thought.id);
  };

  const handleAddThought = (thought: Thought, thoughtRelation: ThoughtRelation) => {
    if (!thoughtCandidate || !thought) {
      return;
    }

    getThoughtByExactName(thoughtCandidate.name)
      .then((existingThought) => {
        if (existingThought) {
          // If thought exists, create link
          return createLink({
            thoughtIdA: thought.id,
            thoughtIdB: existingThought.id,
            relation: thoughtRelation,
          }).then(() => existingThought);
        } else {
          // If thought doesn't exist, create new thought
          return createThought({
            name: thoughtCandidate.name,
            sourceThoughtId: thought.id,
            kind: ThoughtKind.Normal,
            relation: thoughtRelation,
            acType: AccessType.Private,
          });
        }
      })
      .then((newThought) => {
        setThoughtCandidate(null);
        // Update local state to include the new thought
        setChildren((prevChildren) => [
          ...prevChildren,
          { name: thoughtCandidate.name, id: newThought.id },
        ]);
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

  function getColorByIndex(index: number): {
    backgroundColor: string;
    name: string;
    typeId: string;
  } {
    const colors = [
      { backgroundColor: '#FFB3B3', name: 'Red', typeId: ColorTypeIds.Red }, // Soft pastel red
      { backgroundColor: '#B8E6B8', name: 'Green', typeId: ColorTypeIds.Green }, // Soft pastel green
      { backgroundColor: '#B3D9FF', name: 'Blue', typeId: ColorTypeIds.Blue }, // Soft pastel blue
      { backgroundColor: '#FFE6B3', name: 'Yellow', typeId: ColorTypeIds.Yellow }, // Soft pastel yellow
      { backgroundColor: '#E6B3FF', name: 'Purple', typeId: ColorTypeIds.Purple }, // Soft pastel purple
      { backgroundColor: '#FFFFFF', name: 'White', typeId: ColorTypeIds.White }, // White
    ];
    return (
      colors[index] || { backgroundColor: '#E0E0E0', name: 'Unknown', typeId: '' }
    ); // Fallback light gray
  }

  const handleThoughtClick = async (thought: Thought) => {
    if (isSelectMode) {
      // Handle selection logic
      setSelectedNodes((prevSelected) => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(thought.id)) {
          newSelected.delete(thought.id);
        } else {
          newSelected.add(thought.id);
        }
        return newSelected;
      });
    } else if (selectedColorIndex !== null) {
      const {
        backgroundColor: newColor,
        name: colorName,
        typeId: colorTypeId,
      } = getColorByIndex(selectedColorIndex);
      try {
        await updateThoughtColor({
          thoughtId: thought.id,
          backgroundColor: newColor,
        });

        // Update the thought's color in local state
        if (parent && thought.id === parent.id) {
          // Update parent color
          setParent({ ...parent, backgroundColor: newColor });
        } else {
          // Update child color
          setChildren((prevChildren) =>
            prevChildren.map((child) =>
              child.id === thought.id
                ? { ...child, backgroundColor: newColor }
                : child
            )
          );
        }

        if (colorTypeId) {
          // Create a link between the thought and the color type thought using the typeId from types.ts
          await createLink({
            thoughtIdA: thought.id,
            thoughtIdB: colorTypeId,
            relation: ThoughtRelation.Parent, // Use the appropriate relation
          });
        } else {
          console.warn(`Color type ID not found for color: ${colorName}`);
          setLocalErrorMessage(`Color type ID not found for color: ${colorName}`);
        }
      } catch (error) {
        console.error('Failed to update thought color:', error);
        setLocalErrorMessage(
          error instanceof Error ? error.message : 'Failed to update thought color'
        );
      }
    } else {
      navigateToThought(thought);
    }
  };

  // Function to handle refetching
  const handleRefetch = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleDeleteThought = async (thoughtId: string) => {
    try {
      await deleteThought(thoughtId);

      // Remove the deleted thought from local state
      setChildren((prevChildren) =>
        prevChildren.filter((child) => child.id !== thoughtId)
      );
    } catch (error) {
      console.error('Failed to delete thought:', error);
      setLocalErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete thought'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center relative">
        {/* Color Legend */}
        <div className="absolute top-4 left-4 grid grid-cols-3 gap-2 border-2 border-black rounded-lg p-2 bg-gray-200">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full cursor-pointer ${
                selectedColorIndex === index ? 'ring-2 ring-black' : ''
              }`}
              style={{ backgroundColor: getColorByIndex(index).backgroundColor }}
              onClick={() =>
                setSelectedColorIndex((prev) => (prev === index ? null : index))
              }
            ></div>
          ))}
        </div>

        {/* Back Button */}
        {canGoBack && (
          <button
            onClick={() => {
              setIsBackActive(true);
              goBack();
              setTimeout(() => setIsBackActive(false), 100);
            }}
            className={`absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-transform duration-100 ${
              isBackActive ? 'scale-95 bg-blue-600' : ''
            }`}
          >
            ← Back
          </button>
        )}

        {/* Refetch Button */}
        <button
          onClick={() => {
            setIsRefreshActive(true);
            handleRefetch();
            setTimeout(() => setIsRefreshActive(false), 100);
          }}
          className={`absolute top-16 right-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-transform duration-100 ${
            isRefreshActive ? 'scale-95 bg-green-600' : ''
          }`}
        >
          ↻ Refetch
        </button>

        <h1 className="text-4xl font-bold text-center">Hello World</h1>

        {/* Parent */}
        {parent && (
          <ThoughtNode
            thought={parent}
            onNavigate={handleThoughtClick}
            onAddChild={onAddChild}
            onAddJump={onAddJump}
            onDeleteThought={handleDeleteThought}
            isColorMode={selectedColorIndex !== null}
            isSelectMode={isSelectMode}
            isSelected={selectedNodes.has(parent.id)}
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
              onDeleteThought={handleDeleteThought}
              isColorMode={selectedColorIndex !== null}
              isSelectMode={isSelectMode}
              isSelected={selectedNodes.has(child.id)}
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

        {/* Select Button */}
        <button
          onClick={() => {
            setIsSelectMode((prev) => !prev);
            setSelectedNodes(new Set());
          }}
          className="absolute bottom-4 left-4 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
        >
          {isSelectMode ? 'Exit Select Mode' : 'Select'}
        </button>
      </div>
    </div>
  );
}

export default App;
