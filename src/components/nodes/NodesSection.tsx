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
}

export const NodesSection: React.FC<NodesSectionProps> = ({
    nodes,
    links,
    selectedColor,
    setSelectedColor,
    onNodeClick,
    onAddNode,
}) => {
    return (
        <div className="md:w-1/2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
                <ColorLegend
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Nodes</h2>
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
                                className="cursor-pointer"
                            >
                                <NodeDisplay
                                    node={node}
                                    links={links.filter(link => 
                                        link.sourceId === node.id || link.targetId === node.id
                                    )}
                                    colorClass={node.color ? colors[node.color].classes : undefined}
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