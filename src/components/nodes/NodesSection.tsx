import React, { useEffect, useState } from 'react';
import { NodeCandidate } from '../../out/db_model';
import { nodeCandidateDatabase } from '../../services/graphDatabase';
import { Link, Node } from '../../types/domain';
import ColorLegend, { ColorNumber, colors } from '../ColorLegend';
import { BulkNodeInput } from './BulkNodeInput';
import { CandidateNodesSection } from './CandidateNodesSection';
import { EditNodeModal } from './EditNodeModal';
import { NodeDisplay } from './NodeDisplay';
import { SingleNodeInput } from './SingleNodeInput';
import { LongTextDisplay } from './LongTextDisplay';

interface NodesSectionProps {
    sessionNodes: Node[];
    nodes: Node[];
    links: Link[];
    selectedColor: ColorNumber | null;
    setSelectedColor: (color: ColorNumber | null) => void;
    onNodeClick: (nodeId: string) => void;
    onOldNodeClick: (nodeId: string) => void;
    onAddNode: (text: string) => void;
    onClear: () => void;
    isDeleteMode: boolean;
    isConnectMode: boolean;
    isSelectMode: boolean;
    hoveredNode: string | null;
    setHoveredNode: (nodeId: string | null) => void;
}

export const NodesSection: React.FC<NodesSectionProps> = ({
    sessionNodes,
    nodes,
    links,
    selectedColor,
    setSelectedColor,
    onNodeClick,
    onOldNodeClick,
    onAddNode,
    onClear,
    isDeleteMode,
    isConnectMode,
    isSelectMode,
    hoveredNode,
    setHoveredNode,
}) => {
    const [sortedNodes, setSortedNodes] = useState(sessionNodes);
    const [candidateNodes, setCandidateNodes] = useState<NodeCandidate[]>([]);
    const [isEditingModalVisible, setIsEditingModalVisible] = useState(false);
    const [editingCandidateNode, setEditingCandidateNode] = useState<NodeCandidate | null>(null);
    const [tooltipText, setTooltipText] = useState('');

    useEffect(() => {
        setSortedNodes(sortByColor(sessionNodes));
    }, [sessionNodes]);

    useEffect(() => {
        const loadCandidateNodes = async () => {
            const candidateNodes = await nodeCandidateDatabase.getAllNodeCandidates();
            setCandidateNodes(candidateNodes);
        };
        loadCandidateNodes();
    }, []);


    const onAddCandidateNode = async (text: string) => {
        if (isConnectMode) {
            onAddNode(text);
            return;
        }


        const newCandidateNode = await nodeCandidateDatabase.createNodeCandidate({ text });

        if (newCandidateNode) {
            setCandidateNodes(prev => [...prev, newCandidateNode]);
        }
    };

    const onUpdateCandidateNode = async (nodeId: string, newText: string) => {
        await nodeCandidateDatabase.updateNodeCandidate({ id: nodeId, text: newText });
        setCandidateNodes(prev => prev.map(node => node.id === nodeId ? { ...node, text: newText } : node));
    };

    const onCandidateNodeClick = async (nodeId: string) => {
        if (isDeleteMode) {
            await nodeCandidateDatabase.deleteNodeCandidate(nodeId);
            setCandidateNodes(prev => prev.filter(node => node.id !== nodeId));
            return;
        }

        const candidateNode = candidateNodes.find(node => node.id === nodeId);

        if (isSelectMode) {
            setIsEditingModalVisible(true);
            setEditingCandidateNode(candidateNode);
            return;
        }

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
        setSortedNodes(sortByColor(sessionNodes));
    };

    return (
        <div className="md:w-1/2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
                <ColorLegend
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                />
            </div>

            <div className={`bg-white rounded-lg shadow p-6 
            ${isDeleteMode ? 'border-red-500 border-4' :
                    isConnectMode ? 'border-blue-500 border-4' :
                        isSelectMode ? 'border-green-500 border-4' : ''
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
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''}`}
                        >
                            <NodeDisplay
                                node={node}
                                text={node.text}
                                links={links.filter(link =>
                                    link.sourceId === node.id || link.targetId === node.id
                                )}
                                colorClass={node.color ? colors[node.color].classes : undefined}
                                isDeleteMode={isDeleteMode}
                                isHovered={hoveredNode === node.id}
                                setTooltipText={setTooltipText}
                            />
                        </div>
                    ))}

                </div>
            </div>
            {(tooltipText.split('\n')[0].length > 10 || tooltipText.split('\n').length > 1) && (
                <LongTextDisplay
                    textToDisplay={tooltipText}
                />
            )}

            {candidateNodes.length > 0 && (
                <CandidateNodesSection
                    candidateNodes={candidateNodes}
                    nodes={nodes}
                    links={links}
                    isDeleteMode={isDeleteMode}
                    onCandidateNodeClick={onCandidateNodeClick}
                    onNodeClick={onOldNodeClick}
                    hoveredNode={hoveredNode}
                    setHoveredNode={setHoveredNode}
                    setTooltipText={setTooltipText}
                />
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <SingleNodeInput onAddNode={onAddCandidateNode} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <BulkNodeInput onAddNode={onAddCandidateNode} />
            </div>

            <EditNodeModal
                isOpen={isEditingModalVisible}
                nodeText={editingCandidateNode?.text || ''}
                onClose={() => setIsEditingModalVisible(false)}
                onSave={(newText) => {
                    if (editingCandidateNode) {
                        console.log(newText);
                        onUpdateCandidateNode(editingCandidateNode.id, newText);
                    }
                }}
            />

        </div>
    );
}; 