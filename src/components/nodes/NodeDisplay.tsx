import React from 'react';
import type { Node, Link } from '../../types/graph';

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
    maxLength = 50, 
    colorClass,
    isDeleteMode = false
}) => {
    const isLongText = node.text.length > maxLength;
    const displayText = isLongText ? `${node.text.slice(0, maxLength)}...` : node.text;
    const baseColorClass = colorClass || 'bg-white';

    return (
        <div 
            className={`
                ${baseColorClass} 
                px-4 py-2 
                rounded-lg 
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
            {isLongText && (
                <div className="absolute left-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-[300px] break-words">
                    {node.text}
                </div>
            )}
        </div>
    );
}; 