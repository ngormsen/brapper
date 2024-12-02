import React, { useEffect, useState, useCallback } from 'react';
import { BulkNodeInput } from '../components/nodes/BulkNodeInput';
import { NodeDisplay } from '../components/nodes/NodeDisplay';
import { SingleNodeInput } from '../components/nodes/SingleNodeInput';
import ColorLegend, { ColorNumber, colors } from '../components/ColorLegend';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
    id: string;
    text: string;
    type: 'concept' | 'evidence' | 'question';
    color?: ColorNumber;
}

interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'supports' | 'contradicts' | 'relates';
}

// Graph data interface
interface GraphData {
    nodes: Array<{
        id: string;
        text: string;
        color?: string;
    }>;
    links: Array<{
        source: string;
        target: string;
        type: string;
    }>;
}

const ConEvPage: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [selectedColor, setSelectedColor] = useState<number | null>(null);

    // Convert nodes and links to graph data format
    const graphData = useCallback((): GraphData => {
        return {
            nodes: nodes.map(node => ({
                id: node.id,
                text: node.text,
                color: node.color ? colors[node.color].classes : undefined
            })),
            links: links.map(link => ({
                source: link.sourceId,
                target: link.targetId,
                type: link.type
            }))
        };
    }, [nodes, links]);

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
                node.id === nodeId ? { ...node, color: selectedColor as ColorNumber } : node
            ));
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ConEv Page</h1>

            {/* Main content area with responsive layout */}
            <div className="md:flex md:gap-4">
                {/* Force Graph */}
                <div className="bg-white rounded-lg shadow p-4 mb-4 md:mb-0 md:w-1/2">
                    <ForceGraph2D
                        graphData={graphData()}
                        nodeLabel={node => (node as any).text}
                        nodeColor={node => (node as any).color || '#999'}
                        linkColor={() => '#999'}
                        width={400}
                        height={600}
                    />
                </div>

                {/* Nodes and Input Section */}
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

                    <div className="bg-white rounded-lg shadow p-6">
                        <SingleNodeInput onAddNode={handleSingleNodeAdd} />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <BulkNodeInput onAddNode={handleBulkNodeAdd} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConEvPage; 