import React, { KeyboardEvent, useState } from 'react';
import type { NodeInputProps } from './types';
export const BulkNodeInput: React.FC<NodeInputProps> = ({ onAddNode }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        const nodes = input
            .split('\n')
            .map(text => text.trim())
            .filter(text => text.length > 0);

        nodes.forEach(onAddNode);
        setInput('');
    };

    return (
        <>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleSubmit}
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