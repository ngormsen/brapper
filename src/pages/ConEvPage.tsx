import React, { useEffect, useState } from 'react';
import { ColorNumber } from '../components/ColorLegend';
import { GraphView } from '../components/graph/GraphView';
import { NodesSection } from '../components/nodes/NodesSection';
import { useGraphData } from '../hooks/useGraphData';
import { Node, Link } from '../types/graph';

const ConEvPage: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<ColorNumber | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const { 
        nodes, 
        links, 
        sessionNodes, 
        sessionLinks, 
        setSessionNodes, 
        setSessionLinks, 
        addNode, 
        updateNodeColor, 
        getGraphData,
        deleteNode,
        deleteLink
    } = useGraphData();

    // Memoize the graph data
    const graphData = React.useMemo(() => getGraphData(), [nodes, links]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const num = parseInt(event.key) as ColorNumber;
            if (num >= 1 && num <= 9) {
                setSelectedColor(prev => prev === num ? null : num as ColorNumber);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleNodeClick = (nodeId: string) => {
        if (isDeleteMode) {
            deleteNode(nodeId);
        } else if (selectedColor !== null) {
            updateNodeColor(nodeId, selectedColor);
        }
    };

    const handleNodeAdd = (text: string) => {
        addNode(text);
    };

    const handleSessionReset = () => {
        setSessionNodes([]);
        setSessionLinks([]);
    };

    const handleGraphNodeClick = (node: Node) => {
        console.log('Graph node clicked:', node);
        if (isDeleteMode) {
            deleteNode(node.id);
            return;
        }

        // Check if node already exists in sessionNodes
        if (!sessionNodes.some(n => n.id === node.id)) {
            setSessionNodes(prev => [...prev, node]);
        }
    };

    const handleLinkClick = (link: Link) => {
        if (isDeleteMode) {
            deleteLink(link.id);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">ConEv Page</h1>
                <button
                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        isDeleteMode 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    {isDeleteMode ? 'Exit Delete Mode' : 'Delete Mode'}
                </button>
            </div>

            <div className="md:flex md:gap-4">
                <GraphView 
                    graphData={graphData} 
                    onNodeClick={handleGraphNodeClick}
                    onLinkClick={handleLinkClick}
                />

                <NodesSection
                    nodes={sessionNodes}
                    links={links}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    onNodeClick={handleNodeClick}
                    onAddNode={handleNodeAdd}
                    onReset={handleSessionReset}
                    isDeleteMode={isDeleteMode}
                />
            </div>
        </div>
    );
};

export default ConEvPage; 