interface SelectionControlsProps {
  isSelectMode: boolean;
  onSelectModeToggle: () => void;
  onRefactor: () => void;
  onAddToParent: () => void;
  onAddToNewParent: () => void;
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  isSelectMode,
  onSelectModeToggle,
  onRefactor,
  onAddToParent,
  onAddToNewParent,
}) => {
  return (
    <div className="flex flex-row space-x-4 self-start mx-4">
      <div className="relative">
        <p className="absolute top-3 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">S</p>
        <button
          id="selectButton"
          onClick={onSelectModeToggle}
          className="bg-purple-500 text-white px-4 py-2 mr-4 rounded-md hover:bg-purple-600"
        >
          {isSelectMode ? 'Exit Select Mode' : 'Select'}
        </button>
      </div>

      {isSelectMode && (
        <>
          <div className="relative">
            <p className="absolute -top-1 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">Q</p>
            <button
              id="refactorButton"
              onClick={onRefactor}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Refactor
            </button>
          </div>
          <div className="relative">
            <p className="absolute -top-1 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">W</p>
            <button
              id="addToParentButton"
              onClick={onAddToParent}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Add to Parent
            </button>
          </div>
          <div className="relative">
            <p className="absolute -top-1 -left-1 text-sm bg-gray-700 text-white px-1 rounded-md">E</p>
            <button
              id="addToNewParentButton"
              onClick={onAddToNewParent}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add to New Parent
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectionControls; 