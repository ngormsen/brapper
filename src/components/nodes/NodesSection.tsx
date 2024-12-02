import React from 'react';
import { Node, Link } from '../../types/graph';
import { NodeDisplay } from './NodeDisplay';
import { SingleNodeInput } from './SingleNodeInput';
import { BulkNodeInput } from './BulkNodeInput';
import ColorLegend, { ColorNumber, colors } from '../ColorLegend';

interface NodesSectionProps {
    nodes: Node[];
    links: Link[];
    selectedColor: ColorNumber | null;
    setSelectedColor: (color: ColorNumber | null) => void;
    onNodeClick: (nodeId: string) => void;
    onAddNode: (text: string) => void;
    onClear: () => void;
    isDeleteMode: boolean;
}

export const NodesSection: React.FC<NodesSectionProps> = ({
    nodes,
    links,
    selectedColor,
    setSelectedColor,
    onNodeClick,
    onAddNode,
    onClear,
    isDeleteMode,
}) => {
    return (
        <div className="md:w-1/2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
                <ColorLegend
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                />
            </div>

            <div className={`bg-white rounded-lg shadow p-6 ${isDeleteMode ? 'border-red-500 border-4' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Nodes</h2>
                    <button
                        onClick={onClear}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 rounded transition-colors"
                    >
                        Clear
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {nodes
                        .sort((a, b) => {
                            // Sort by color, handling undefined colors
                            const colorA = a.color || 0;
                            const colorB = b.color || 0;
                            return colorB - colorA;
                        })
                        .map((node) => (
                            <div
                                key={node.id}
                                onClick={() => onNodeClick(node.id)}
                                className={`cursor-pointer ${
                                    isDeleteMode ? 'hover:opacity-50' : ''
                                }`}
                            >
                                <NodeDisplay
                                    node={node}
                                    links={links.filter(link => 
                                        link.sourceId === node.id || link.targetId === node.id
                                    )}
                                    colorClass={node.color ? colors[node.color].classes : undefined}
                                    isDeleteMode={isDeleteMode}
                                />
                            </div>
                        ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <SingleNodeInput onAddNode={onAddNode} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <BulkNodeInput onAddNode={onAddNode} />
            </div>
        </div>
    );
}; 