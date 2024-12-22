import React, { useEffect, useState, useCallback } from 'react';
import { ColorNumber, colors } from '../components/ColorLegend';
import { GraphView } from '../components/graph/GraphView';
import { EditNodeModal } from '../components/nodes/EditNodeModal';
import { NodesSection } from '../components/nodes/NodesSection';
import { useGraphData } from '../hooks/useGraphData';
import { Link, Node } from '../types/graph';

const ConEvPage: React.FC = () => {
    //Modes
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isConnectMode, setIsConnectMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [isContextMode, setIsContextMode] = useState(false);

    //Nodes
    const [firstSelectedNode, setFirstSelectedNode] = useState<Node | null>(null);
    const [editingNode, setEditingNode] = useState<Node | null>(null);

    const [selectedColor, setSelectedColor] = useState<ColorNumber | null>(null);
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
        getSessionGraphData,
        deleteNode,
        deleteLink,
        createLinkBetweenNodes,
        updateNodeText,
    } = useGraphData();

    const graphData = React.useMemo(() => {
        if (isContextMode) {
            return getSessionGraphData();
        }
        return getGraphData();
    }, [isContextMode, getGraphData, getSessionGraphData]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Ignore if target is an input or textarea
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            const num = parseInt(event.key) as ColorNumber;
            if (num >= 1 && num <= 9) {
                setSelectedColor(prev => prev === num ? null : num as ColorNumber);
            }

            if (event.key.toLowerCase() === 'd') {
                setIsDeleteMode(prev => !prev);
                setIsEditMode(false);
                setIsConnectMode(false);
                setFirstSelectedNode(null);
            }

            if (event.key.toLowerCase() === 'e') {
                setIsDeleteMode(false);
                setIsConnectMode(false);
                setFirstSelectedNode(null);
                setIsEditMode(prev => !prev);
            }

            if (event.key.toLowerCase() === 'c') {
                setIsDeleteMode(false);
                setIsEditMode(false);
                if (isConnectMode) {
                    if (firstSelectedNode) {
                        setFirstSelectedNode(null);
                    } else {
                        setIsConnectMode(false);
                    }
                } else {
                    setIsConnectMode(true);
                    setFirstSelectedNode(null);
                }
            }

            if (event.key.toLowerCase() === 'r') {
                document.getElementById('refresh-button')?.click();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isConnectMode, firstSelectedNode]);

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
            }
        } else if (selectedColor !== null) {
            updateNodeColor(nodeId, selectedColor);
        } else if (isEditMode) {
            setEditingNode(node);
        }
    };

    const handleNodeAdd = async (text: string) => {
        const newNode = await addNode(text);
        if (newNode && isConnectMode && firstSelectedNode) {
            createLinkBetweenNodes(firstSelectedNode.id, newNode.id);
        }
    };

    const handleSessionClear = () => {
        setSessionNodes([]);
        setSessionLinks([]);
    };

    const handleOldNodeClick = (nodeId: string) => {
        // Check if node already exists in sessionNodes
        if (!sessionNodes.some(n => n.id === nodeId)) {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
                setSessionNodes(prev => [...prev, {...node, color: undefined}]);
            }
        }
    };

    const handleGraphNodeClick = useCallback((node: Node) => {
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
            }
            return;
        } else if (isEditMode) {
            setEditingNode(node);
            return;
        }

        // Check if node already exists in sessionNodes
        if (!sessionNodes.some(n => n.id === node.id)) {
            setSessionNodes(prev => [...prev, node]);
        }
    }, [isDeleteMode, isConnectMode, isEditMode, firstSelectedNode, sessionNodes, nodes, createLinkBetweenNodes, deleteNode]);

    const handleLinkClick = useCallback((link: Link) => {
        if (isDeleteMode) {
            deleteLink(link.id);
        }
    }, [isDeleteMode, deleteLink]);

    const handleConnectModeToggle = () => {
        setIsConnectMode(prev => !prev);
        setIsDeleteMode(false);
        if (!isConnectMode && !firstSelectedNode) {
            setFirstSelectedNode(null);
        }
        if (!isConnectMode) {
            setFirstSelectedNode(null);
        }
    };

    return (
        <div className="p-6">

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    {firstSelectedNode && isConnectMode && (
                        <span className="text-blue-600">
                            Connecting from: {firstSelectedNode.text}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsContextMode(!isContextMode)}
                        className={`px-4 py-2 rounded-lg transition-colors ${isContextMode
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {isContextMode ? 'Exit Context Mode' : 'Context Mode'}
                    </button>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-2 rounded-lg transition-colors ${isEditMode
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
                    </button>
                    <button
                        onClick={handleConnectModeToggle}
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
                    isEditMode={isEditMode}
                />

                <NodesSection
                    sessionNodes={sessionNodes}
                    nodes={nodes}
                    links={links}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    onNodeClick={handleNodeClick}
                    onOldNodeClick={handleOldNodeClick}
                    onAddNode={handleNodeAdd}
                    onClear={handleSessionClear}
                    isDeleteMode={isDeleteMode}
                    isConnectMode={isConnectMode}
                    isEditMode={isEditMode}
                />
            </div>

            <EditNodeModal
                isOpen={editingNode !== null}
                nodeText={editingNode?.text || ''}
                onClose={() => setEditingNode(null)}
                onSave={(newText) => {
                    if (editingNode) {
                        updateNodeText(editingNode.id, newText);
                    }
                }}
            />
        </div>
    );
};

export default ConEvPage; 