import { useEffect, useState } from 'react';
import { AccessType, createLink, createThought, getThought, getThoughtByExactName, getThoughtDetails, ROOT_THOUGHT_ID, ThoughtKind, ThoughtRelation } from './Client';


type Thought = {
  id?: string;
  name: string;
  children?: Thought[];
}

function App() {
  const [parent, setParent] = useState<Thought>({
    id: ROOT_THOUGHT_ID,
    name: "API_Brain",
  });
  const [children, setChildren] = useState<Thought[]>([]);
  const [thoughtCandidate, setThoughtCandidate] = useState<Thought | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    getThoughtDetails(ROOT_THOUGHT_ID).then((thought) => {
      console.log(thought);
      setChildren(thought.children);
      setParent({
        id: thought.activeThought.id,
        name: thought.activeThought.name,
        children: [],
      });
    })
  }, [])


  const navigateToThought = (thought: Thought) => {
    console.log(thought);
    getThoughtDetails(thought.id).then((thought) => {
      console.log(thought);
      if (thought.children.length > 0) {
        setParent({
          id: thought.activeThought.id,
          name: thought.activeThought.name,
        });
        setChildren(thought.children);
      } else {
        setErrorMessage(`${thought.activeThought.name} has no children`);
      }
    })

  }

  const handleAddThought = (child: Thought, thoughtRelation: ThoughtRelation) => {
    console.log("Handle add child", child);
    if (!thoughtCandidate) {
      return;
    }
    getThoughtByExactName(thoughtCandidate.name).then((thought) => {
      createLink({
        thoughtIdA: child.id,
        thoughtIdB: thought.id,
        relation: thoughtRelation,
      });
      if (thoughtRelation === ThoughtRelation.Child) {
        setChildren([...children, {
          id: thought.id,
          name: thoughtCandidate.name,
          children: [],
        }]);
        setThoughtCandidate(null);
      }
    }).catch((error) => {
      console.error("Error creating thought", error);
      if (error.message === "Thought not found") {
        console.log("Creating thought");
        createThought({
          name: thoughtCandidate.name,
          sourceThoughtId: child.id,
          kind: ThoughtKind.Normal,
          relation: thoughtRelation,
          acType: AccessType.Private,
        }).then((thought) => {
          console.log("Thought created", thought);
          setThoughtCandidate({
            ...thoughtCandidate,
            id: thought.id,
          });
          console.log("Thought candidate updated", thought.id);
          if (thoughtRelation === ThoughtRelation.Child) {
            setChildren([...children, {
              id: thought.id,
              name: thoughtCandidate.name,
              children: [],
            }]);
            setThoughtCandidate(null);
          }
        });
      } else {
        setErrorMessage("An error occurred while creating the thought");
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center">Hello World</h1>
        {/* Parent */}
        <div className="flex items-center rounded-lg">
          <div className="relative">
            {/* Main box */}
            <div className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 "

            >
              {parent.name}
            </div>

            {/* Bottom button */}
            <button className="absolute bottom-0 left-1/2 translate-y-4 -translate-x-1/2 w-4 h-4 bg-blue-200 rounded-md flex items-center justify-center hover:bg-blue-300"
              onClick={() => {
                handleAddThought(parent, ThoughtRelation.Child);
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex-wrap flex items-center justify-center gap-8 mt-8 border-2 border-black rounded-lg p-8 m-1">
          {children.map((child, index) => (
            <div key={child.id} className="flex items-center rounded-lg">
              <div className="relative">
                {/* Left button */}
                <button className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 w-4 h-4 bg-blue-200 rounded-md flex items-center justify-center hover:bg-blue-300"
                  onClick={() => {
                    handleAddThought(child, ThoughtRelation.Jump);
                  }}
                >
                  +
                </button>

                {/* Main box */}
                <div className="border-2 border-black rounded-lg px-8 py-4 hover:bg-gray-200 "
                  onClick={() => {
                    navigateToThought(child);
                  }}
                >
                  {child.name}
                </div>

                {/* Bottom button */}
                <button className="absolute bottom-0 left-1/2 translate-y-4 -translate-x-1/2 w-4 h-4 bg-blue-200 rounded-md flex items-center justify-center hover:bg-blue-300"
                  onClick={() => {
                    handleAddThought(child, ThoughtRelation.Child);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* Thought candidate */}
        <div className="flex items-center justify-center mt-8">
          <input
            type="text"
            value={thoughtCandidate?.name || ""}
            onChange={(e) => setThoughtCandidate({
              ...thoughtCandidate,
              name: e.target.value
            })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddThought(parent, ThoughtRelation.Child);
              }
            }}
            className="border-2 border-black rounded-lg px-8 py-4 focus:outline-none focus:border-blue-500"
            placeholder="Enter thought name"
          />
          <button
            className="bg-blue-500 text-white mx-2 px-8 py-4 rounded-md"
            onClick={() => {
              handleAddThought(parent, ThoughtRelation.Child);
            }}
          >Add</button>

        </div>


        {errorMessage && <div className="text-red-500 text-center mt-8">{errorMessage}</div>}

      </div>
    </div >
  );
}

export default App;
