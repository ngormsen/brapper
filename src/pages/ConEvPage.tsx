import React, { useEffect, useState } from 'react';
import { ColorNumber } from '../components/ColorLegend';
import { GraphView } from '../components/graph/GraphView';
import { NodesSection } from '../components/nodes/NodesSection';
import { useGraphData } from '../hooks/useGraphData';
import { Node, Link } from '../types/graph';
import { graphDatabase } from '../services/graphDatabase';

const ConEvPage: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<ColorNumber | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isConnectMode, setIsConnectMode] = useState(false);
    const [firstSelectedNode, setFirstSelectedNode] = useState<Node | null>(null);
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
        deleteLink,
        createLinkBetweenNodes
    } = useGraphData();

    // Memoize the graph data
    const graphData = React.useMemo(() => getGraphData(), [nodes, links]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const num = parseInt(event.key) as ColorNumber;
            if (num >= 1 && num <= 9) {
                setSelectedColor(prev => prev === num ? null : num as ColorNumber);
            }

            if (event.key.toLowerCase() === 'd') {
                setIsDeleteMode(prev => !prev);
                setIsConnectMode(false);
                setFirstSelectedNode(null);
            }

            if (event.key.toLowerCase() === 'c') {
                setIsConnectMode(prev => !prev);
                setIsDeleteMode(false);
                setFirstSelectedNode(null);
            }

            if (event.key.toLowerCase() === 'r') {
                document.getElementById('refresh-button')?.click();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleNodeClick = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        if (isDeleteMode) {
            deleteNode(nodeId);
        } else if (isConnectMode) {
            if (!firstSelectedNode) {
                setFirstSelectedNode(node);
            } else if (firstSelectedNode.id !== nodeId) {
                createLinkBetweenNodes(firstSelectedNode.id, nodeId);
                setFirstSelectedNode(null);
            }
        } else if (selectedColor !== null) {
            updateNodeColor(nodeId, selectedColor);
        }
    };

    const handleNodeAdd = (text: string) => {
        addNode(text);
    };

    const handleSessionClear = () => {
        setSessionNodes([]);
        setSessionLinks([]);
    };

    const handleGraphNodeClick = (node: Node) => {
        console.log('Graph node clicked:', node);
        if (isDeleteMode) {
            deleteNode(node.id);
            return;
        }

        if (isConnectMode) {
            if (!firstSelectedNode) {
                setFirstSelectedNode(node);
            } else if (firstSelectedNode.id !== node.id) {
                console.log('Creating link from', firstSelectedNode.id, 'to', node.id);
                createLinkBetweenNodes(firstSelectedNode.id, node.id);
                setFirstSelectedNode(null);
            }
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
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">ConEv Page</h1>
                    {firstSelectedNode && isConnectMode && (
                        <span className="text-blue-600">
                            Connecting from: {firstSelectedNode.text}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setIsConnectMode(!isConnectMode);
                            setIsDeleteMode(false);
                            setFirstSelectedNode(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${isConnectMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {isConnectMode ? 'Exit Connect Mode' : 'Connect Mode'}
                    </button>
                    <button
                        onClick={() => {
                            setIsDeleteMode(!isDeleteMode);
                            setIsConnectMode(false);
                            setFirstSelectedNode(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${isDeleteMode
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {isDeleteMode ? 'Exit Delete Mode' : 'Delete Mode'}
                    </button>
                </div>
            </div>

            <div className="md:flex md:gap-4">
                <GraphView
                    graphData={graphData}
                    onNodeClick={handleGraphNodeClick}
                    onLinkClick={handleLinkClick}
                    isDeleteMode={isDeleteMode}
                    isConnectMode={isConnectMode}
                />

                <NodesSection
                    nodes={sessionNodes}
                    links={links}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    onNodeClick={handleNodeClick}
                    onAddNode={handleNodeAdd}
                    onClear={handleSessionClear}
                    isDeleteMode={isDeleteMode}
                    isConnectMode={isConnectMode}
                />
            </div>
        </div>
    );
};

export default ConEvPage; 