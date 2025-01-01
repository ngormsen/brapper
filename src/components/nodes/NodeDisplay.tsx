import React from 'react';
import { Link, Node, NodeDisplayConfig } from '../../types/domain';

interface NodeDisplayProps extends NodeDisplayConfig {
    node: Node;
    links: Link[];
    setTooltipText: (text: string) => void;
}

export const NodeDisplay: React.FC<NodeDisplayProps> = ({
    node,
    links,
    maxLength = 35,
    colorClass,
    isDeleteMode = false,
    isHovered = false,
    setTooltipText
}) => {
    const firstLine = node.text.split('\n')[0];
    const displayText = firstLine.length > maxLength ? `${firstLine.slice(0, maxLength)}...` : firstLine;
    const baseColorClass = colorClass || 'bg-white';

    return (
        <div
            onMouseEnter={() => setTooltipText(node.text)}
            onMouseLeave={() => setTooltipText('')}
            className={`
                ${baseColorClass} 
                px-4 py-2 
                rounded-lg 
                w-full
                shadow-sm 
                ${isHovered ? 'shadow-lg scale-105' : 'hover:shadow-md'} 
                transition-all 
                group 
                relative
                border
                ${isDeleteMode ? 'hover:border-red-500 hover:text-red-500' : ''}
                ${isHovered ? 'border-gray-400' : ''}
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
        </div>
    );
}; 