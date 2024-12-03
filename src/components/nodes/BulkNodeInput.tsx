import React, { KeyboardEvent, useState } from 'react';
import type { NodeInputProps } from './types';

export const BulkNodeInput: React.FC<NodeInputProps> = ({ onAddNode }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.MouseEvent) => {
        const nodes = input
            .split('---')
            .map(text => text.trim())
            .map(text => text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')) // Remove control characters
            .filter(text => text.length > 0)

        nodes.forEach(onAddNode);
        setInput('');
    };

    return (
        <>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add multiple nodes (one per line)"
                className="w-full h-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                Add Nodes
            </button>
        </>
    );
}; 