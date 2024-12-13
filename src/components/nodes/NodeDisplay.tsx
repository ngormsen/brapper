import React from 'react';
import type { Link, Node } from '../../types/graph';

interface NodeDisplayProps {
    node: Node;
    links: Link[];
    maxLength?: number;
    colorClass?: string;
    isDeleteMode?: boolean;
}

export const NodeDisplay: React.FC<NodeDisplayProps> = ({
    node,
    links,
    maxLength = 35,
    colorClass,
    isDeleteMode = false
}) => {
    const firstLine = node.text.split('\n')[0];
    const displayText = firstLine.length > maxLength ? `${firstLine.slice(0, maxLength)}...` : firstLine;
    const baseColorClass = colorClass || 'bg-white';

    return (
        <div
            className={`
                ${baseColorClass} 
                px-4 py-2 
                rounded-lg 
                w-full
                shadow-sm 
                hover:shadow-md 
                transition-all 
                group 
                relative 
                border
                ${isDeleteMode ? 'hover:border-red-500 hover:text-red-500' : ''}
            `}
        >
            <div className="flex flex-col">
                <span className="inline-block max-w-[300px] truncate">{displayText}</span>
                {links.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                        {`${links.length} connection${links.length === 1 ? '' : 's'}`}
                    </div>
                )}
            </div>
            {node.text.length > maxLength && (
                <div className="fixed transform -translate-x-1/2 left-[30%] mt-2 p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-[9999] w-[500px] break-words shadow-lg pointer-events-none group-hover:pointer-events-auto max-h-[80vh] overflow-y-auto">
                    <div className="whitespace-pre-wrap">
                        {node.text}
                    </div>
                </div>
            )}
        </div>
    );
}; 