import React, { useState } from 'react';
import { NodeCandidate } from '../../out/db_model';
import { Link, Node } from '../../types/domain';
import { NodeDisplay } from './NodeDisplay';

interface CandidateNodesSectionProps {
    candidateNodes: NodeCandidate[];
    nodes: Node[];
    links: Link[];
    isDeleteMode: boolean;
    onCandidateNodeClick: (nodeId: string) => void;
    onNodeClick: (nodeId: string) => void;
    hoveredNode: string | null;
    setHoveredNode: (nodeId: string | null) => void;
}

export const CandidateNodesSection: React.FC<CandidateNodesSectionProps> = ({
    candidateNodes,
    nodes,
    links,
    isDeleteMode,
    onCandidateNodeClick,
    onNodeClick,
    hoveredNode,
    setHoveredNode
}) => {
    const [view, setView] = useState<'candidates' | 'oldNodes' | 'fewestLinks'>('candidates');

    const renderNodeDisplay = (node: Node | NodeCandidate, onClick: (id: string) => void) => (
        <div
            key={node.id}
            onClick={() => onClick(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''}`}
        >
            <NodeDisplay
                node={node as Node}
                text={node.text}
                links={links.filter(link =>
                    link.sourceId === node.id || link.targetId === node.id
                )}
                isDeleteMode={isDeleteMode}
                isHovered={hoveredNode === node.id}
                setTooltipText={() => { }}
            />
        </div>
    );

    return (
        <div className={`bg-white rounded-lg shadow p-6 ${isDeleteMode ? 'border-red-500 border-4' : ''}`}>
            <div className="flex gap-2 items-center mb-4">
                <h2 className="text-xl font-semibold">Candidate Nodes</h2>
                <button
                    className={`text-sm text-gray-500 hover:text-gray-700 ${view === 'candidates' ? 'font-bold' : ''}`}
                    onClick={() => setView('candidates')}
                >
                    Candidates
                </button>
                <button
                    className={`text-sm text-gray-500 hover:text-gray-700 ${view === 'oldNodes' ? 'font-bold' : ''}`}
                    onClick={() => setView('oldNodes')}
                >
                    Old Nodes
                </button>
                <button
                    className={`text-sm text-gray-500 hover:text-gray-700 ${view === 'fewestLinks' ? 'font-bold' : ''}`}
                    onClick={() => setView('fewestLinks')}
                >
                    Fewest Links
                </button>
            </div>
            <div className="flex flex-wrap gap-2 overflow-y-auto max-h-48">
                {view === 'candidates' &&
                    candidateNodes
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(node => renderNodeDisplay(node, onCandidateNodeClick))
                }
                {view === 'oldNodes' &&
                    nodes
                        .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
                        .map(node => renderNodeDisplay(node, onNodeClick))
                }
                {view === 'fewestLinks' &&
                    nodes
                        .sort((a, b) =>
                            links.filter(link => link.sourceId === a.id || link.targetId === a.id).length -
                            links.filter(link => link.sourceId === b.id || link.targetId === b.id).length
                        )
                        .map(node => renderNodeDisplay(node, onNodeClick))
                }
            </div>
        </div>
    );
}; 