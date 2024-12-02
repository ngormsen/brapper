import React, { useState } from 'react';
import { SingleNodeInput } from '../components/nodes/SingleNodeInput';
import { BulkNodeInput } from '../components/nodes/BulkNodeInput';
import { NodeDisplay } from '../components/nodes/NodeDisplay';

const ConEvPage: React.FC = () => {
    const [nodes, setNodes] = useState<string[]>([]);

    const addNode = (text: string) => {
        setNodes(prev => [...prev, text]);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ConEv Page</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Nodes</h2>
                <div className="flex flex-wrap gap-2">
                    {nodes.map((node, index) => (
                        <NodeDisplay key={index} text={node} />
                    ))}
                </div>
            </div>

            <div className="bg-white mt-4 rounded-lg shadow p-6 mb-4">
                <SingleNodeInput onAddNode={addNode} />
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <BulkNodeInput onAddNode={addNode} />
            </div>

        </div>
    );
};

export default ConEvPage; 