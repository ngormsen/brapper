import React from 'react';

interface Node {
    id: string;
    text: string;
    type: 'concept' | 'evidence' | 'question';
}

interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'supports' | 'contradicts' | 'relates';
}

interface NodeDisplayProps {
    node: Node;
    links: Link[];
    maxLength?: number;
}

const typeColors = {
    concept: 'bg-blue-100 border-blue-300',
    evidence: 'bg-green-100 border-green-300',
    question: 'bg-yellow-100 border-yellow-300'
};

export const NodeDisplay: React.FC<NodeDisplayProps> = ({ node, links, maxLength = 50 }) => {
    const isLongText = node.text.length > maxLength;
    const displayText = isLongText ? `${node.text.slice(0, maxLength)}...` : node.text;
    const colorClass = typeColors[node.type];

    return (
        <div className={`${colorClass} px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow group relative border`}>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">{node.type}</span>
                <span className="inline-block max-w-[300px] truncate">{displayText}</span>
                {links.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                        {`${links.length} connection${links.length === 1 ? '' : 's'}`}
                    </div>
                )}
            </div>
            {isLongText && (
                <div className="absolute left-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-[300px] break-words">
                    {node.text}
                </div>
            )}
        </div>
    );
}; 