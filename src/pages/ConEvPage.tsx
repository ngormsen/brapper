import React, { useEffect, useState } from 'react';
import { BulkNodeInput } from '../components/nodes/BulkNodeInput';
import { NodeDisplay } from '../components/nodes/NodeDisplay';
import { SingleNodeInput } from '../components/nodes/SingleNodeInput';

interface Node {
    id: string;
    text: string;
    type: 'concept' | 'evidence' | 'question';
    color?: number;  // 1-9 for colors
}

interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'supports' | 'contradicts' | 'relates';
}

const colors = {
    1: { classes: 'bg-pink-100 border-pink-300', name: 'Pink' },
    2: { classes: 'bg-blue-100 border-blue-300', name: 'Blue' },
    3: { classes: 'bg-green-100 border-green-300', name: 'Green' },
    4: { classes: 'bg-yellow-100 border-yellow-300', name: 'Yellow' },
    5: { classes: 'bg-purple-100 border-purple-300', name: 'Purple' },
    6: { classes: 'bg-white border-gray-300', name: 'None' },
    7: { classes: 'bg-orange-100 border-orange-300', name: 'Orange' },
    8: { classes: 'bg-teal-100 border-teal-300', name: 'Teal' },
    9: { classes: 'bg-gray-100 border-gray-300', name: 'Indigo' },
} as const;

type ColorNumber = keyof typeof colors;

const ConEvPage: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [selectedColor, setSelectedColor] = useState<number | null>(null);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const num = parseInt(event.key);
            if (num >= 1 && num <= 9) {
                setSelectedColor(prev => prev === num ? null : num);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

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

    const handleNodeClick = (nodeId: string) => {
        if (selectedColor !== null) {
            setNodes(prev => prev.map(node =>
                node.id === nodeId ? { ...node, color: selectedColor } : node
            ));
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ConEv Page</h1>

            {/* Color Legend */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-lg font-semibold mb-2">Color Legend (Press 1-9)</h2>
                <div className="flex flex-wrap gap-2">
                    {(Object.entries(colors) as Array<[string, { classes: string, name: string }]>).map(([numStr, color]) => {
                        const num = Number(numStr) as ColorNumber;
                        return (
                            <div
                                key={num}
                                className={`${color.classes} px-3 py-2 rounded border cursor-pointer ${
                                    selectedColor === num ? 'ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => setSelectedColor(prev => prev === num ? null : num)}
                            >
                                {num}: {color.name}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white mt-4 rounded-lg shadow p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Nodes</h2>
                <div className="flex flex-wrap gap-2">
                    {nodes.map((node) => (
                        <div
                            key={node.id}
                            onClick={() => handleNodeClick(node.id)}
                            className="cursor-pointer"
                        >
                            <NodeDisplay
                                node={node}
                                links={links.filter(link => link.sourceId === node.id || link.targetId === node.id)}
                                colorClass={node.color ? colors[node.color].classes : undefined}
                            />
                        </div>
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