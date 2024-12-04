import React, { useState, useEffect } from 'react';
import { Node, Link } from '../../types/graph';
import { NodeDisplay } from './NodeDisplay';
import { SingleNodeInput } from './SingleNodeInput';
import { BulkNodeInput } from './BulkNodeInput';
import ColorLegend, { ColorNumber, colors } from '../ColorLegend';
import { NodeCandidate } from '../../out/db_model';
import { nodeCandidateDatabase } from '../../services/graphDatabase';

interface NodesSectionProps {
    nodes: Node[];
    links: Link[];
    selectedColor: ColorNumber | null;
    setSelectedColor: (color: ColorNumber | null) => void;
    onNodeClick: (nodeId: string) => void;
    onAddNode: (text: string) => void;
    onClear: () => void;
    isDeleteMode: boolean;
    isConnectMode: boolean;
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
    isConnectMode,
}) => {
    const [sortedNodes, setSortedNodes] = useState(nodes);
    const [candidateNodes, setCandidateNodes] = useState<NodeCandidate[]>([]);

    useEffect(() => {
        setSortedNodes(nodes);
    }, [nodes]);

    useEffect(() => {
        const loadCandidateNodes = async () => {
            const candidateNodes = await nodeCandidateDatabase.getAllNodeCandidates();
            setCandidateNodes(candidateNodes);
        };
        loadCandidateNodes();
    }, []);


    const onAddCandidateNode = async (text: string) => {
        const newCandidateNode = await nodeCandidateDatabase.createNodeCandidate({ text });

        if (newCandidateNode) {
            setCandidateNodes(prev => [...prev, newCandidateNode]);
        }
    };

    const onCandidateNodeClick = async (nodeId: string) => {
        if (isDeleteMode) {
            await nodeCandidateDatabase.deleteNodeCandidate(nodeId);
            setCandidateNodes(prev => prev.filter(node => node.id !== nodeId));
            return;
        }

        const candidateNode = candidateNodes.find(node => node.id === nodeId);

        if (candidateNode) {
            onAddNode(candidateNode.text);
            await nodeCandidateDatabase.deleteNodeCandidate(candidateNode.id);
            setCandidateNodes(prev => prev.filter(node => node.id !== candidateNode.id));
        }
    };


    const sortByColor = (nodes: Node[]) => {
        return [...nodes].sort((a, b) => {
            const colorA = a.color || 0;
            const colorB = b.color || 0;
            return colorB - colorA;
        });
    };

    const onRefresh = () => {
        setSortedNodes(sortByColor(nodes));
    };

    return (
        <div className="md:w-1/2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
                <ColorLegend
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                />
            </div>

            <div className={`bg-white rounded-lg shadow p-6 ${isDeleteMode ? 'border-red-500 border-4' :
                isConnectMode ? 'border-blue-500 border-4' : ''
                }`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Nodes</h2>
                    <div className="flex gap-2">
                        <button
                            id="refresh-button"
                            onClick={onRefresh}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded transition-colors active:bg-blue-200"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={onClear}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 rounded transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {sortedNodes.map((node) => (
                        <div
                            key={node.id}
                            onClick={() => onNodeClick(node.id)}
                            className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''
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
            {candidateNodes.length > 0 && (
                <div className={`bg-white rounded-lg shadow p-6 ${isDeleteMode ? 'border-red-500 border-4' : ''
                    }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Candidate Nodes</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {candidateNodes.map((node) => (
                            <div
                                key={node.id}
                                onClick={() => onCandidateNodeClick(node.id)}
                                className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''
                                    }`}
                            >
                                <NodeDisplay
                                    node={node}
                                    links={links.filter(link =>
                                        link.sourceId === node.id || link.targetId === node.id
                                    )}
                                    isDeleteMode={isDeleteMode}
                                />
                            </div>
                        ))}

                    </div>
                </div>
            )}
            <div className="bg-white rounded-lg shadow p-6">
                <SingleNodeInput onAddNode={onAddCandidateNode} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <BulkNodeInput onAddNode={onAddNode} />
            </div>
        </div>
    );
}; 