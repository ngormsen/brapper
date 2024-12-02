import { useEffect, useState } from 'react';
import {
  AccessType,
  createLink,
  createThought,
  deleteThought,
  getLinkBetweenNodes,
  getThought,
  removeLink,
  ROOT_THOUGHT_ID,
  ThoughtKind,
  ThoughtRelation,
  updateThoughtColor
} from './Client';
import CandidateThoughtNode from './components/CandidateThoughtNode';
import SearchInput from './components/SearchInput';
import SelectionControls from './components/SelectionControls';
import ThoughtInput from './components/ThoughtInput';
import ThoughtNode from './components/ThoughtNode';
import { useNavigationStack } from './hooks/useNavigationStack';
import useThoughtDetails from './hooks/useThoughtDetails';
import { ColorTypeIds, Thought } from './types';

function MainPage() {
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

  const [textAreaValue, setTextAreaValue] = useState('');
  const [tiles, setTiles] = useState<Array<{ text: string; content?: string }>>([]);

  const [selectedSearchThoughtId, setSelectedSearchThoughtId] = useState<string | null>(null);

  const [tileColors, setTileColors] = useState<{ [key: string]: string }>({});

  const [selectedTiles, setSelectedTiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;

      // Handle Escape key regardless of active element
      if (event.key === 'Escape') {
        event.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        setSelectedSearchThoughtId(null);
        setSelectedColorIndex(null);
        return;
      }

      // Skip other shortcuts if we're in an input/textarea
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (['1', '2', '3', '4', '5', '6'].includes(event.key)) {
        const colorIndex = parseInt(event.key) - 1;
        setSelectedColorIndex((prevIndex) =>
          prevIndex === colorIndex ? null : colorIndex
        );
      } else if (event.key.toLowerCase() === 's') {
        document.getElementById('selectButton')?.click();
      } else if (event.key.toLowerCase() === 'r') {
        document.getElementById('refreshButton')?.click();
      } else if (event.key.toLowerCase() === 'b') {
        if (canGoBack) {
          document.getElementById('backButton')?.click();
        }
      } else if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        document.getElementById('thoughtInput')?.focus();
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        document.getElementById('searchInput')?.focus();
      } else if (event.key.toLowerCase() === 'q' && isSelectMode) {
        document.getElementById('refactorButton')?.click();
      } else if (event.key.toLowerCase() === 'w' && isSelectMode) {
        document.getElementById('addToParentButton')?.click();
      } else if (event.key.toLowerCase() === 'e' && isSelectMode) {
        document.getElementById('addToNewParentButton')?.click();
      } else if (event.key.toLowerCase() === 'n') {
        document.getElementById('rootNodeButton')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canGoBack]);

  const navigateToThought = (thought: Thought) => {
    navigate(thought.id);
  };

  const handleAddThought = async (
    thought: Thought,
    thoughtRelation: ThoughtRelation,
    customThoughtCandidate?: Thought
  ) => {
    const candidate = customThoughtCandidate || thoughtCandidate;
    if (!candidate || !thought) {
      return;
    }

    await createThought({
      name: candidate.name,
      sourceThoughtId: thought.id,
      kind: ThoughtKind.Normal,
      relation: thoughtRelation,
      acType: AccessType.Public,
      content: candidate.content,
    })
      .then((newThought) => {
        setThoughtCandidate(null);
        // Update local state to include the new thought
        setChildren((prevChildren) => [
          ...prevChildren,
          { name: candidate.name, id: newThought.id },
        ]);
      })
      .catch((error) => {
        setLocalErrorMessage(error.message);
      });

    // await searchThoughts(candidate.name, 1)
    //   .then((thoughts) => {
    //     if (thoughts.length > 0 && thoughts[0].sourceThought.name !== candidate.name) {
    //       // If thought exists, create link
    //       return createLink({
    //         thoughtIdA: thought.id,
    //         thoughtIdB: thoughts[0].sourceThought.id,
    //         relation: thoughtRelation,
    //       }).then(() => thoughts[0].sourceThought);
    //     } else {
    //       // If thought doesn't exist, create new thought
    //       return createThought({
    //         name: candidate.name,
    //         sourceThoughtId: thought.id,
    //         kind: ThoughtKind.Normal,
    //         relation: thoughtRelation,
    //         acType: AccessType.Public,
    //       });
    //     }
    //   })
    //   .then((newThought) => {
    //     setThoughtCandidate(null);
    //     // Update local state to include the new thought
    //     setChildren((prevChildren) => [
    //       ...prevChildren,
    //       { name: candidate.name, id: newThought.id },
    //     ]);
    //   })
    //   .catch((error) => {
    //     setLocalErrorMessage(error.message);
    //   });
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

  // Update the handleRefactor function
  const handleRefactor = async () => {
    if (!thoughtCandidate || selectedNodes.size === 0) {
      setLocalErrorMessage('Please enter a name and select nodes to refactor.');
      return;
    }

    try {
      // Create a new thought (node) with the name from the input field
      const newThought = await createThought({
        name: thoughtCandidate.name,
        kind: ThoughtKind.Normal,
        acType: AccessType.Public,
      });

      // Prepare promises for link operations
      const linkPromises: Promise<any>[] = [];

      // For each selected child node
      for (const childId of Array.from(selectedNodes)) {
        // Get the existing link between the current parent and the child
        const existingLink = await getLinkBetweenNodes(childId, currentThoughtId);
        if (existingLink) {
          // Remove the existing link
          linkPromises.push(removeLink(existingLink.id));
        }

        // Create a new parent link from the child to the new thought
        linkPromises.push(
          createLink({
            thoughtIdA: childId,
            thoughtIdB: newThought.id,
            relation: ThoughtRelation.Parent,
          })
        );
      }

      // Create a parent connection between the current parent and the new thought
      linkPromises.push(
        createLink({
          thoughtIdA: newThought.id,
          thoughtIdB: currentThoughtId,
          relation: ThoughtRelation.Parent,
        })
      );

      // Execute all link operations
      await Promise.all(linkPromises);

      // Clear the thought candidate and selected nodes
      setThoughtCandidate(null);
      setSelectedNodes(new Set());
      setIsSelectMode(false);

      // Refresh the data
      handleRefetch();
    } catch (error) {
      console.error('Refactor failed:', error);
      setLocalErrorMessage(
        error instanceof Error ? error.message : 'Failed to refactor thoughts'
      );
    }
  };

  const handleAddToParent = async () => {
    if (!thoughtCandidate || selectedNodes.size === 0) {
      setLocalErrorMessage('Please enter a parent name and select nodes to add.');
      return;
    }

    try {
      let parentId: string;

      // If we have a selected search result (existing thought)
      if (selectedSearchThoughtId) {
        parentId = selectedSearchThoughtId;
      } else {
        // Create a new thought as parent if none selected
        const newParent = await createThought({
          name: thoughtCandidate.name,
          kind: ThoughtKind.Normal,
          acType: AccessType.Public,
        });
        parentId = newParent.id;
      }

      // Create links between selected nodes and the parent
      const linkPromises = Array.from(selectedNodes).map(childId =>
        createLink({
          thoughtIdA: childId,
          thoughtIdB: parentId,
          relation: ThoughtRelation.Parent,
        })
      );

      await Promise.all(linkPromises);

      // Clear states
      setThoughtCandidate(null);
      setSelectedNodes(new Set());
      setIsSelectMode(false);
      setSelectedSearchThoughtId(null);

      // Refresh the data
      handleRefetch();
    } catch (error) {
      console.error('Add to parent failed:', error);
      setLocalErrorMessage(
        error instanceof Error ? error.message : 'Failed to add thoughts to parent'
      );
    }
  };

  const handleAddToNewParent = async () => {
    console.log('handleAddToNewParent');
    if (!thoughtCandidate || selectedNodes.size === 0) {
      setLocalErrorMessage('Please enter a parent name and select nodes to add.');
      return;
    }

    try {
      let parentId: string;

      // If we have a selected search result (existing thought)
      if (selectedSearchThoughtId) {
        parentId = selectedSearchThoughtId;
      } else {
        // Create a new thought as parent if none selected
        const newParent = await createThought({
          name: thoughtCandidate.name,
          kind: ThoughtKind.Normal,
          acType: AccessType.Public,
        });
        parentId = newParent.id;
      }

      // First, remove existing parent links and create new ones
      const linkOperations = await Promise.all(
        Array.from(selectedNodes).map(async (childId) => {
          // Get and remove existing link
          const existingLink = await getLinkBetweenNodes(childId, currentThoughtId);
          if (existingLink) {
            await removeLink(existingLink.id);
          }

          // Create new parent link
          return createLink({
            thoughtIdA: childId,
            thoughtIdB: parentId,
            relation: ThoughtRelation.Parent,
          });
        })
      );

      // Clear states
      setThoughtCandidate(null);
      setSelectedNodes(new Set());
      setIsSelectMode(false);
      setSelectedSearchThoughtId(null);

      // Update local state to remove the moved nodes
      setChildren((prevChildren) =>
        prevChildren.filter((child) => !selectedNodes.has(child.id))
      );

      // Refresh the data
      handleRefetch();
    } catch (error) {
      console.error('Add to new parent failed:', error);
      setLocalErrorMessage(
        error instanceof Error ? error.message : 'Failed to add thoughts to new parent'
      );
    }
  };

  const handleConvert = () => {
    if (!textAreaValue) {
      return;
    }
    const inputText = textAreaValue;
    const sections = inputText
      .split('---')
      .map((text) => text.trim())
      .filter((text) => text);

    const processedTiles = sections.map(section => {
      const lines = section.split('\n').filter(line => line.trim());
      return {
        text: lines[0],
        content: lines.length > 1 ? lines.slice(1).join('\n') : undefined
      };
    });

    setTiles(processedTiles);
  };

  const handleAddTileThought = (tileText: string, tileContent?: string) => {
    const newThoughtCandidate = { name: tileText, id: '', backgroundColor: undefined, content: tileContent };
    handleAddThought(parent, ThoughtRelation.Child, newThoughtCandidate);
    // Optionally remove the tile after adding
    setTiles((prevTiles) => prevTiles.filter((tile) => tile.text !== tileText));
  };

  const handleSearchResultClick = async (thoughtId: string) => {
    try {
      const thought = await getThought(thoughtId);
      if (thought) {
        navigate(thought.id);
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      setLocalErrorMessage(error instanceof Error ? error.message : 'Navigation failed');
    }
  };

  const handleTileClick = (tile: { text: string, content?: string }) => {
    if (isSelectMode) {
      setSelectedTiles(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(tile.text)) {
          newSelected.delete(tile.text);
        } else {
          newSelected.add(tile.text);
        }
        return newSelected;
      });
    } else if (selectedColorIndex !== null) {
      const { backgroundColor } = getColorByIndex(selectedColorIndex);
      setTileColors(prev => ({
        ...prev,
        [tile.text]: backgroundColor
      }));
    } else {
      handleAddTileThought(tile.text, tile.content);
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
              className={`w-8 h-8 rounded-full cursor-pointer ${selectedColorIndex === index ? 'ring-2 ring-black' : ''
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
          <div className="absolute top-4 right-4 ">
            <p className="absolute -top-1 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">B</p>
            <button
              id="backButton"
              onClick={() => {
                setIsBackActive(true);
                goBack();
                setTimeout(() => setIsBackActive(false), 100);
              }}
              className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-transform duration-100 ${isBackActive ? 'scale-95 bg-blue-600' : ''}`}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Refetch Button */}
        <div className="absolute top-16 right-4">
          <p className="absolute -top-1 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">R</p>
          <button
            id="refreshButton"
            onClick={() => {
              setIsRefreshActive(true);
              handleRefetch();
              setTimeout(() => setIsRefreshActive(false), 100);
            }}
            className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-transform duration-100 ${isRefreshActive ? 'scale-95 bg-green-600' : ''}`}
          >
            ↻
            Refetch
          </button>
        </div>
        {/* Search Input and Results */}
        <div className="absolute top-4 right-64 w-64">
          <SearchInput onSearchResultClick={handleSearchResultClick} />
        </div>

        {/* RootNode button */}
        <button
          id="rootNodeButton"
          onClick={() => {
            navigate(ROOT_THOUGHT_ID);
          }}
          className={`absolute top-4 right-32 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-transform duration-100`}
        >
          <p className="absolute -top-1 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">N</p>
          RootNode
        </button>


        <div className="mt-16"></div>

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
          onSearchResultSelect={(thoughtId: string) => {
            setSelectedSearchThoughtId(thoughtId);
            // You can perform additional actions with the selected thought ID here
          }}
          selectedSearchThoughtId={selectedSearchThoughtId}
          setSelectedSearchThoughtId={setSelectedSearchThoughtId}
        />


        {/* Tiles Display */}
        <div className="flex flex-wrap items-center justify-start gap-4 m-4">
          {tiles.map((tile, index) => (
            <CandidateThoughtNode
              key={index}
              text={tile.text}
              content={tile.content}
              onClick={() => handleTileClick(tile)}
              backgroundColor={tileColors[tile.text]}
              isColorMode={selectedColorIndex !== null}
              isSelectMode={isSelectMode}
              isSelected={selectedTiles.has(tile.text)}
            />
          ))}
        </div>

        <SelectionControls
          isSelectMode={isSelectMode}
          onSelectModeToggle={() => {
            setIsSelectMode((prev) => !prev);
            setSelectedNodes(new Set());
          }}
          onRefactor={handleRefactor}
          onAddToParent={handleAddToParent}
          onAddToNewParent={handleAddToNewParent}
        />

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          className="bg-blue-500 text-white px-4 py-2 my-4 rounded-md hover:bg-blue-600"
        >
          Convert
        </button>

        <textarea
          value={textAreaValue}
          onChange={(e) =>
            setTextAreaValue(e.target.value)
          }
          className="border-2 border-black rounded-lg w-1/2 h-1/2 px-3 py-4 mb-4 focus:outline-none focus:border-blue-500"></textarea>

        {(errorMessage || localErrorMessage) && (
          <div className="text-red-500 text-center mt-8">
            {errorMessage || localErrorMessage}
          </div>
        )}


      </div>
    </div >
  );
}

export default MainPage;
