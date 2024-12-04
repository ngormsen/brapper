import React, { useState } from 'react';
import { Link, Node } from '../../types/graph';
import { NodeDisplay } from './NodeDisplay';
import { NodeCandidate } from '../../out/db_model';

interface CandidateNodesSectionProps {
    candidateNodes: NodeCandidate[];
    nodes: Node[];
    links: Link[];
    isDeleteMode: boolean;
    onCandidateNodeClick: (nodeId: string) => void;
    onNodeClick: (nodeId: string) => void;
}

export const CandidateNodesSection: React.FC<CandidateNodesSectionProps> = ({
    candidateNodes,
    nodes,
    links,
    isDeleteMode,
    onCandidateNodeClick,
    onNodeClick
}) => {
    const [view, setView] = useState<'candidates' | 'oldNodes' | 'fewestLinks'>('candidates');

    return (
        <div className={`bg-white rounded-lg shadow p-6 ${isDeleteMode ? 'border-red-500 border-4' : ''}`}>
            <div className="flex gap-2 items-center mb-4">
                <h2 className="text-xl font-semibold">Candidate Nodes</h2>
                <button className={`text-sm text-gray-500 hover:text-gray-700 ${view === 'candidates' ? 'font-bold' : ''}`} onClick={() => setView('candidates')}>Candidates</button>
                <button className={`text-sm text-gray-500 hover:text-gray-700 ${view === 'oldNodes' ? 'font-bold' : ''}`} onClick={() => setView('oldNodes')}>Old Nodes</button>
                <button className={`text-sm text-gray-500 hover:text-gray-700 ${view === 'fewestLinks' ? 'font-bold' : ''}`} onClick={() => setView('fewestLinks')}>Fewest Links</button>
            </div>
            <div className="flex flex-wrap gap-2 overflow-y-auto max-h-48">
                {view === 'candidates' && candidateNodes.map((node) => (
                    <div
                        key={node.id}
                        onClick={() => onCandidateNodeClick(node.id)}
                        className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''}`}
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
                {view === 'oldNodes' && nodes.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()).map((node) => (
                    <div
                        key={node.id}
                        onClick={() => onNodeClick(node.id)}
                        className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''}`}
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
                {view === 'fewestLinks' && nodes.sort((a, b) => links.filter(link => link.sourceId === a.id || link.targetId === a.id).length - links.filter(link => link.sourceId === b.id || link.targetId === b.id).length).map((node) => (
                    <div
                        key={node.id}
                        onClick={() => onNodeClick(node.id)}
                        className={`cursor-pointer ${isDeleteMode ? 'hover:opacity-50' : ''}`}
                    >
                        <NodeDisplay node={node} links={links.filter(link => link.sourceId === node.id || link.targetId === node.id)} isDeleteMode={isDeleteMode} />
                    </div>
                ))}
            </div>
        </div>
    );
}; 