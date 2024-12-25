import React, { useCallback, useEffect, useState } from 'react';
import { ColorNumber } from '../components/ColorLegend';
import { EditNodeModal } from '../components/nodes/EditNodeModal';
import { NodesSection } from '../components/nodes/NodesSection';
import { useGraphData } from '../hooks/useGraphData';
import { Link, Node } from '../types/domain';
import GraphView from '../components/graph/GraphView';

const MainPage: React.FC = () => {
    //Modes
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isConnectMode, setIsConnectMode] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [isContextMode, setIsContextMode] = useState(false);
    const [isBackupMode, setIsBackupMode] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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
    } = useGraphData(isBackupMode);

    const graphData = React.useMemo(() => {
        if (isContextMode) {
            return getSessionGraphData();
        }
        return getGraphData();
    }, [isContextMode, getGraphData, getSessionGraphData]);

    const handleNodesSelected = useCallback((nodes: Node[]) => {
        setSessionNodes(nodes);
    }, [setSessionNodes]);

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
                setIsSelectMode(false);
                setIsConnectMode(false);
                setFirstSelectedNode(null);
            }

            if (event.key.toLowerCase() === 's') {
                setIsDeleteMode(false);
                setIsConnectMode(false);
                setFirstSelectedNode(null);
                setIsSelectMode(prev => !prev);
            }

            if (event.key.toLowerCase() === 'c') {
                setIsDeleteMode(false);
                setIsSelectMode(false);
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
        } else if (isSelectMode) {
            // In select mode, toggle node in/out of session
            if (sessionNodes.some(n => n.id === nodeId)) {
                setSessionNodes(prev => prev.filter(n => n.id !== nodeId));
            } else {
                setSessionNodes(prev => [...prev, { ...node, color: undefined }]);
            }
        } else {
            // Default behavior: open edit modal
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
                setSessionNodes(prev => [...prev, { ...node, color: undefined }]);
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
        }

        if (isSelectMode) {
            // In select mode, add to session if not already there
            if (!sessionNodes.some(n => n.id === node.id)) {
                setSessionNodes(prev => [...prev, node]);
            }
        } else {
            // Default behavior: open edit modal
            setEditingNode(node);
        }
    }, [isDeleteMode, isConnectMode, isSelectMode, firstSelectedNode, sessionNodes, nodes, createLinkBetweenNodes, deleteNode]);

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
                        onClick={() => setIsBackupMode(!isBackupMode)}
                        className={`px-4 py-2 rounded-lg transition-colors ${isBackupMode
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {isBackupMode ? 'Using Backup' : 'Use Backup'}
                    </button>
                    <button
                        onClick={() => {
                            console.log("Random nodes");

                            // 1) Identify nodes with fewest links (up to 30).
                            const fewConnectedNodes = [...nodes]
                                .sort((a, b) =>
                                    links.filter(link => link.sourceId === a.id || link.targetId === a.id).length
                                    - links.filter(link => link.sourceId === b.id || link.targetId === b.id).length
                                )
                                .slice(0, 40);
                            console.log("fewConnectedNodes", fewConnectedNodes);
                            // 2) Find older nodes not in those “fewConnectedNodes,” sort ascending by updated date (oldest first).
                            const oldNodes = nodes
                                .filter(node => !fewConnectedNodes.some(n => n.id === node.id))
                                .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
                                .slice(0, 40);
                            console.log("oldNodes", oldNodes);

                            // 3) Get 4 random nodes from the entire “nodes” array.
                            const pickRandom = (arr: typeof nodes, count: number) => {
                                const shuffled = [...arr];
                                for (let i = shuffled.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                                }
                                return shuffled.slice(0, count);
                            };
                            const remainingNodes = nodes.filter(node =>
                                !fewConnectedNodes.some(n => n.id === node.id) &&
                                !oldNodes.some(n => n.id === node.id)
                            );
                            const randomNodesFromAll = pickRandom(remainingNodes, 4);

                            // 4) Combine results: 4 oldest, 6 fewConnectedNodes, and 4 random from all.
                            const finalNodes = [
                                ...pickRandom(oldNodes, 4),
                                ...pickRandom(fewConnectedNodes, 6),
                                ...pickRandom(randomNodesFromAll, 4)
                            ];

                            setSessionNodes(finalNodes.map(node => ({ ...node, color: undefined })));
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors bg-gray-200 hover:bg-gray-300 active:bg-gray-400`}
                    >
                        Randomize
                    </button>
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
                        onClick={() => setIsSelectMode(!isSelectMode)}
                        className={`px-4 py-2 rounded-lg transition-colors ${isSelectMode
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {isSelectMode ? 'Exit Select Mode' : 'Select Mode'}
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
                    isSelectMode={isSelectMode}
                    onNodesSelected={handleNodesSelected}
                    hoveredNode={hoveredNode}
                    setHoveredNode={setHoveredNode}
                    isBackupMode={isBackupMode}
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
                    isSelectMode={isSelectMode}
                    hoveredNode={hoveredNode}
                    setHoveredNode={setHoveredNode}
                />
            </div>

            <EditNodeModal
                isOpen={editingNode !== null}
                nodeText={editingNode?.text || ''}
                onClose={() => setEditingNode(null)}
                onSave={(newText) => {
                    if (editingNode) {
                        updateNodeText(editingNode.id, newText);
                        setEditingNode(null);
                    }
                }}
            />
        </div>
    );
};

export default MainPage; 