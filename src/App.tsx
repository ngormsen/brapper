import React, { useState } from 'react';
import {
  AccessType,
  createLink,
  createThought,
  getThoughtByExactName,
  ROOT_THOUGHT_ID,
  ThoughtKind,
  ThoughtRelation,
} from './Client';
import useThoughtDetails from './hooks/useThoughtDetails';
import ThoughtNode from './components/ThoughtNode';
import ThoughtInput from './components/ThoughtInput';
import { Thought } from './types';

function App() {
  const [currentThoughtId, setCurrentThoughtId] = useState(ROOT_THOUGHT_ID);
  const { parent, children, errorMessage } = useThoughtDetails(currentThoughtId);
  const [thoughtCandidate, setThoughtCandidate] = useState<Thought | null>(null);

  const [localErrorMessage, setLocalErrorMessage] = useState<string>('');

  const navigateToThought = (thought: Thought) => {
    setCurrentThoughtId(thought.id);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center">Hello World</h1>

        {/* Parent */}
        {parent && (
          <ThoughtNode
            thought={parent}
            onNavigate={navigateToThought}
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
              onNavigate={navigateToThought}
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
