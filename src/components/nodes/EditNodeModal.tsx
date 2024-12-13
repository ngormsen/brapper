import React, { useEffect, useState } from 'react';

interface EditNodeModalProps {
    isOpen: boolean;
    nodeText: string;
    onClose: () => void;
    onSave: (newText: string) => void;
}

export const EditNodeModal: React.FC<EditNodeModalProps> = ({
    isOpen,
    nodeText,
    onClose,
    onSave,
}) => {
    const [text, setText] = useState(nodeText);

    useEffect(() => {
        setText(nodeText);
    }, [nodeText]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                onSave(text);
                onClose();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, text, onSave, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 h-full w-full max-w-screen-xl max-h-[500px]">
                <h2 className="text-xl font-semibold mb-4">Edit Node</h2>
                <textarea
                    autoFocus
                    className="w-full p-2 border rounded-lg mb-4 h-full max-h-[350px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(text);
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}; 