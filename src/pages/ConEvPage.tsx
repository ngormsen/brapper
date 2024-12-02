import React, { useState } from 'react';
import { SingleNodeInput } from '../components/nodes/SingleNodeInput';
import { BulkNodeInput } from '../components/nodes/BulkNodeInput';
import { NodeDisplay } from '../components/nodes/NodeDisplay';

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

const ConEvPage: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);

    const addNode = (text: string, type: Node['type']) => {
        const newNode: Node = {
            id: crypto.randomUUID(),
            text,
            type,
        };
        setNodes(prev => [...prev, newNode]);
    };

    const handleSingleNodeAdd = (text: string) => addNode(text, 'concept');
    const handleBulkNodeAdd = (text: string) => addNode(text, 'concept');

    const addLink = (sourceId: string, targetId: string, type: Link['type']) => {
        const newLink: Link = {
            id: crypto.randomUUID(),
            sourceId,
            targetId,
            type,
        };
        setLinks(prev => [...prev, newLink]);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ConEv Page</h1>
            <div className="bg-white mt-4 rounded-lg shadow p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Nodes</h2>
                <div className="flex flex-wrap gap-2">
                    {nodes.map((node) => (
                        <NodeDisplay 
                            key={node.id} 
                            node={node}
                            links={links.filter(link => link.sourceId === node.id || link.targetId === node.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white mt-4 rounded-lg shadow p-6 mb-4">
                <SingleNodeInput onAddNode={handleSingleNodeAdd} />
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <BulkNodeInput onAddNode={handleBulkNodeAdd} />
            </div>
        </div>
    );
};

export default ConEvPage; 