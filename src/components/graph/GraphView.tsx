import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { graphDatabase } from '../../services/graphDatabase';
import { ColorConfig, Link, Node } from '../../types/domain';
import { ForceGraphData, ForceGraphLink, ForceGraphNode } from '../../types/forceGraph';

interface GraphViewProps {
    graphData: ForceGraphData;
    onNodeClick: (node: Node) => void;
    onLinkClick: (link: Link) => void;
    isDeleteMode: boolean;
    isConnectMode: boolean;
    isSelectMode: boolean;
    onNodesSelected?: (nodes: Node[]) => void;
    hoveredNode: string | null;
    setHoveredNode: (nodeId: string | null) => void;
    isBackupMode: boolean;
    selectedNodes: ForceGraphNode[];
    setSelectedNodes: (nodes: ForceGraphNode[]) => void;
}

const GraphViewComponent: React.FC<GraphViewProps> = ({
    graphData,
    onNodeClick,
    onLinkClick,
    isDeleteMode,
    isConnectMode,
    isSelectMode,
    onNodesSelected,
    hoveredNode,
    setHoveredNode,
    isBackupMode,
    selectedNodes,
    setSelectedNodes
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fgRef = useRef<ForceGraphMethods>();

    const [graphWidth, setGraphWidth] = useState(400);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [data, setData] = useState<ForceGraphData>({ nodes: [], links: [] });

    const [selecting, setSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
    const [isCmdPressed, setIsCmdPressed] = useState(false);
    const [filterSelected, setFilterSelected] = useState(false);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.parentElement?.offsetWidth || 800;
                const isMediumScreen = window.innerWidth >= 768;
                setGraphWidth(isMediumScreen ? parentWidth - 16 : parentWidth - 16);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        // Preserve existing node positions and sort nodes by update date
        const existingNodes = new Map<string, ForceGraphNode>();
        data.nodes.forEach((node) => {
            existingNodes.set(node.id, node);
        });

        const today = new Date();
        let updatedNodes = graphData.nodes
            .map((node) => {
                const existingNode = existingNodes.get(node.id);
                return {
                    ...node,
                    x: existingNode?.x,
                    y: existingNode?.y,
                    vx: existingNode?.vx,
                    vy: existingNode?.vy,
                } as ForceGraphNode;
            })
            .sort((a, b) => {
                const aUpdatedToday = new Date(a.updated_at).toDateString() === today.toDateString();
                const bUpdatedToday = new Date(b.updated_at).toDateString() === today.toDateString();
                return aUpdatedToday === bUpdatedToday ? 0 : aUpdatedToday ? 1 : -1;
            });

        let updatedLinks = graphData.links as ForceGraphLink[];

        if (selectedNodes.length > 0 && filterSelected) {
            // Filter nodes
            updatedNodes = updatedNodes.filter(node =>
                selectedNodes.some(selectedNode => selectedNode.id === node.id)
            );

            // Create a map of node IDs to nodes
            const nodeIdToNodeMap = new Map<string, ForceGraphNode>();
            updatedNodes.forEach(node => {
                nodeIdToNodeMap.set(node.id, node);
            });

            // Filter and update links
            updatedLinks = updatedLinks
                .filter(link =>
                    nodeIdToNodeMap.has(
                        typeof link.source === 'string'
                            ? link.source
                            : (link.source as ForceGraphNode).id
                    ) &&
                    nodeIdToNodeMap.has(
                        typeof link.target === 'string'
                            ? link.target
                            : (link.target as ForceGraphNode).id
                    )
                )
                .map(link => ({
                    ...link,
                    source: nodeIdToNodeMap.get(
                        typeof link.source === 'string'
                            ? link.source
                            : (link.source as ForceGraphNode).id
                    ) as ForceGraphNode,
                    target: nodeIdToNodeMap.get(
                        typeof link.target === 'string'
                            ? link.target
                            : (link.target as ForceGraphNode).id
                    ) as ForceGraphNode,
                }));
        }

        setData({ nodes: updatedNodes, links: updatedLinks });
    }, [graphData, filterSelected]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey) setIsCmdPressed(true);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.metaKey) setIsCmdPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.button === 0) { // Left click only
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                setSelecting(true);
                setSelectionBox({
                    startX: event.clientX - rect.left,
                    startY: event.clientY - rect.top,
                    endX: event.clientX - rect.left,
                    endY: event.clientY - rect.top
                });
            }
        }
    }, []);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (selecting) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                setSelectionBox(prev => ({
                    ...prev,
                    endX: event.clientX - rect.left,
                    endY: event.clientY - rect.top
                }));
            }
        }
    };

    const handleMouseUp = () => {
        if (selecting) {
            setSelecting(false);
            // Find nodes within selection box
            const minX = Math.min(selectionBox.startX, selectionBox.endX);
            const maxX = Math.max(selectionBox.startX, selectionBox.endX);
            const minY = Math.min(selectionBox.startY, selectionBox.endY);
            const maxY = Math.max(selectionBox.startY, selectionBox.endY);

            const selectedNodes = data.nodes.filter(node => {
                const screenCoords = fgRef.current?.graph2ScreenCoords(
                    (node as any).x as number,
                    (node as any).y as number
                );
                if (screenCoords) {
                    return (
                        screenCoords.x >= minX &&
                        screenCoords.x <= maxX &&
                        screenCoords.y >= minY &&
                        screenCoords.y <= maxY
                    );
                }
                return false;
            });

            // setSelectedNodes(selectedNodes);
            if (onNodesSelected) {
                onNodesSelected(selectedNodes);
            }
        }
    };

    const updateNodePositions = async () => {
        const updatedNodes = await graphDatabase.updateNodes(data.nodes, isBackupMode);
        console.log(updatedNodes);
    };

    // 2) Type your colors object with that interface:
    const colors: Record<number, ColorConfig> = {
        1: { bg: 'rgba(255, 182, 193, 0.2)', border: 'rgba(255, 105, 180, 1)' },
        2: { bg: 'rgba(173, 216, 230, 0.2)', border: 'rgba(0, 0, 255, 1)' },
        3: { bg: 'rgba(144, 238, 144, 0.2)', border: 'rgba(0, 128, 0, 1)' },
        4: { bg: 'rgba(255, 255, 224, 0.2)', border: 'rgba(255, 255, 0, 1)' },
        5: { bg: 'rgba(216, 191, 216, 0.2)', border: 'rgba(128, 0, 128, 1)' },
        6: { bg: 'rgba(255, 255, 255, 0.2)', border: 'rgba(169, 169, 169, 1)' },
        7: { bg: 'rgba(255, 165, 0, 0.2)', border: 'rgba(255, 140, 0, 1)' },
        8: { bg: 'rgba(175, 238, 238, 0.2)', border: 'rgba(0, 128, 128, 1)' },
        9: { bg: 'rgba(211, 211, 211, 0.2)', border: 'rgba(75, 0, 130, 1)' },
    };

    const getNodeOpacity = (updated_at: string | Date) => {
        const today = new Date();
        const updateDate = new Date(updated_at);
        const daysDiff = Math.floor((today.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 0) return 1;
        if (daysDiff <= 1) return 0.7;  // 30% reduction
        if (daysDiff <= 3) return 0.6;  // 50% reduction
        if (daysDiff <= 5) return 0.5;  // 70% reduction
        if (daysDiff <= 7) return 0.4;  // 85% reduction
        if (daysDiff <= 14) return 0.3; // 80% reduction
        return 0.25;                    // 85% reduction
    };

    const releaseNodePositions = () => {
        setData(prevData => {
            // Create a map of node IDs to updated node objects
            const nodeIdToNodeMap = new Map<string, Node>();
            const nodes = prevData.nodes.map(node => {
                const updatedNode = { ...node };
                // Remove fx and fy to release the node
                delete updatedNode.fx;
                delete updatedNode.fy;
                nodeIdToNodeMap.set(updatedNode.id, updatedNode);
                return updatedNode;
            });

            // Update links to point to updated nodes
            const links = prevData.links.map(link => ({
                ...link,
                source: nodeIdToNodeMap.get(
                    typeof link.source === 'string'
                        ? link.source
                        : (link.source as Node).id
                ) as Node,
                target: nodeIdToNodeMap.get(
                    typeof link.target === 'string'
                        ? link.target
                        : (link.target as Node).id
                ) as Node,
            }));

            return { nodes, links };
        });
    };

    // Build a set of node IDs connected to hoveredNode:
    const connectedNodeIds = useMemo(() => {
        if (!hoveredNode) return new Set<string>();
        const result = new Set<string>();
        data.links.forEach(link => {
            const sourceId = typeof link.source === 'string'
                ? link.source
                : (link.source as Node)?.id;
            const targetId = typeof link.target === 'string'
                ? link.target
                : (link.target as Node)?.id;
            if (sourceId === hoveredNode) {
                result.add(targetId);
            } else if (targetId === hoveredNode) {
                result.add(sourceId);
            }
        });
        return result;
    }, [data.links, hoveredNode]);

    const getNodeBorderColor = (node: Node, isSelected: boolean, opacity: number) => {
        const today = new Date();
        const updateDate = new Date(node.updated_at);
        const isUpdatedToday =
            updateDate.getDate() === today.getDate() &&
            updateDate.getMonth() === today.getMonth() &&
            updateDate.getFullYear() === today.getFullYear();

        // Red border if updated today
        if (isUpdatedToday) {
            return `rgba(255, 0, 0, ${opacity})`;
        }

        // Otherwise use original logic
        return isSelected
            ? 'rgba(59, 130, 246, 1)' // Tailwind blue-500
            : colors[node.color]?.border.replace('1)', `${opacity})`) || `rgba(0, 0, 0, ${opacity})`;
    };

    return (
        <div className="relative bg-white max-h-fit rounded-lg shadow p-4 mb-4 md:mb-0 md:w-1/2">
            <div className="absolute -top-8 flex flex-row gap-2 m-2">
                <button
                    className="bg-slate-200 rounded-lg p-2 hover:bg-slate-400"
                    onClick={() => setSelectedNodes([])}
                >
                    Clear selected
                </button>
                <button
                    className="bg-slate-200 rounded-lg p-2 hover:bg-slate-400"
                    onClick={() => setFilterSelected(!filterSelected)}
                >
                    Filter selected
                </button>
                <button
                    className="bg-slate-200 rounded-lg p-2 hover:bg-slate-400"
                    onClick={() => updateNodePositions()}
                >
                    Set positions
                </button>
                <button
                    className="bg-slate-200 rounded-lg p-2 hover:bg-slate-400"
                    onClick={releaseNodePositions}
                >
                    Release nodes
                </button>
            </div>

            <div
                ref={containerRef}
                className={`relative w-full
                ${isDeleteMode ? 'border-red-500 border-4' : ''} 
                ${isConnectMode ? 'border-blue-500 border-4' : ''} 
                ${isSelectMode ? 'border-green-500 border-4' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <ForceGraph2D
                    ref={fgRef}
                    graphData={data}
                    nodeLabel={(node) => (node as any).text}
                    nodeColor={(node) => (node as any).color || '#999'}
                    linkColor={(link) => {
                        // If we're hovering this link, highlight it:
                        if ((link as any).id === hoveredLink) {
                            return '#666';
                        }

                        // Otherwise, highlight if connected to hoveredNode:
                        const sourceId =
                            typeof link.source === 'string'
                                ? link.source
                                : (link.source as Node)?.id;
                        const targetId =
                            typeof link.target === 'string'
                                ? link.target
                                : (link.target as Node)?.id;
                        if (hoveredNode && (sourceId === hoveredNode || targetId === hoveredNode)) {
                            return '#666'; // same highlight color
                        }

                        // Default link color
                        return '#ddd';
                    }}
                    linkWidth={(link) => {
                        // If hovered link, make it thicker:
                        if ((link as any).id === hoveredLink) {
                            return 2;
                        }
                        // If it's connected to hovered node, also make it thicker:
                        const sourceId =
                            typeof link.source === 'string'
                                ? link.source
                                : (link.source as Node)?.id;
                        const targetId =
                            typeof link.target === 'string'
                                ? link.target
                                : (link.target as Node)?.id;
                        if (hoveredNode && (sourceId === hoveredNode || targetId === hoveredNode)) {
                            return 2;
                        }
                        // Default width
                        return 1;
                    }}
                    width={graphWidth}
                    height={600}
                    enablePanInteraction={!isCmdPressed}
                    enableZoomInteraction={!isCmdPressed}
                    onNodeClick={(node) => onNodeClick(node as Node)}
                    onLinkClick={(link) => {
                        const linkData: Link = {
                            id: (link as any).id,
                            sourceId: (link as any).source,
                            targetId: (link as any).target
                        };
                        onLinkClick(linkData);
                    }}
                    onNodeHover={(node) => setHoveredNode(node ? (node as any).id : null)}
                    onLinkHover={(link) => {
                        const linkId = link ? (link as any).id : null;
                        setHoveredLink(linkId);
                    }}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        // Node text
                        const firstLine = (node as any).text.split('\n')[0];
                        const maxLength = 15;
                        const label = firstLine.length > maxLength
                            ? `${firstLine.slice(0, maxLength)}...`
                            : firstLine;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;

                        // Text + padding
                        const textWidth = ctx.measureText(label).width;
                        const padding = 4 / globalScale;
                        const width = textWidth + padding * 2;
                        const height = fontSize + padding * 2;

                        // Store dimensions for pointer-area painting
                        (node as any).__bckgDimensions = [width, height];

                        const nodeColorId = (node as any).color;
                        // 3) Use the same shape for your fallback:
                        const colorObj =
                            nodeColorId && nodeColorId !== 6
                                ? colors[nodeColorId]
                                : { bg: 'white', border: 'black' };

                        // Fade older nodes
                        const opacity = getNodeOpacity((node as any).updated_at);

                        ctx.save();

                        // Determine if hovered or connected-to-hovered
                        const isHovered = (node as any).id === hoveredNode;
                        const isConnected = connectedNodeIds.has((node as any).id);
                        const scale = isHovered || isConnected ? 1.1 : 1;

                        // If hovered, add a light drop shadow
                        if (isHovered) {
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                            ctx.shadowBlur = 5;
                            ctx.shadowOffsetX = 2;
                            ctx.shadowOffsetY = 2;
                        }

                        // Apply scale transform so the node grows slightly
                        ctx.translate(node.x as number, node.y as number);
                        ctx.scale(scale, scale);
                        ctx.translate(-(node.x as number), -(node.y as number));

                        // Check if selected (for border color)
                        const isSelected =
                            !filterSelected &&
                            selectedNodes.some(n => n.id === (node as any).id);

                        // Draw background + border
                        ctx.fillStyle = colorObj.bg.replace('0.2', `${opacity * 0.2}`);
                        ctx.strokeStyle = getNodeBorderColor(node as Node, isSelected, opacity);
                        ctx.lineWidth = (isHovered || isSelected || isConnected ? 2 : 1) / globalScale;
                        ctx.beginPath();
                        ctx.roundRect(
                            (node.x as number) - textWidth / 2 - padding,
                            (node.y as number) - fontSize / 2 - padding,
                            textWidth + padding * 2,
                            fontSize + padding * 2,
                            3 / globalScale
                        );
                        ctx.fill();
                        ctx.stroke();

                        // Draw text
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                        ctx.fillText(label, node.x as number, node.y as number);

                        ctx.restore();
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const bckgDimensions = (node as any).__bckgDimensions;
                        if (bckgDimensions) {
                            ctx.fillStyle = color;
                            ctx.fillRect(
                                (node.x as number) - bckgDimensions[0] / 2,
                                (node.y as number) - bckgDimensions[1] / 2,
                                bckgDimensions[0],
                                bckgDimensions[1]
                            );
                        }
                    }}
                    onRenderFramePost={(ctx) => {
                        // Draw selection box if selecting
                        if (selecting) {
                            ctx.save();
                            ctx.strokeStyle = 'rgba(0, 124, 255, 0.8)';
                            ctx.fillStyle = 'rgba(0, 124, 255, 0.1)';
                            ctx.lineWidth = 1;

                            const start = fgRef.current?.screen2GraphCoords(
                                selectionBox.startX,
                                selectionBox.startY
                            );
                            const end = fgRef.current?.screen2GraphCoords(
                                selectionBox.endX,
                                selectionBox.endY
                            );

                            if (start && end) {
                                const x = Math.min(start.x, end.x);
                                const y = Math.min(start.y, end.y);
                                const width = Math.abs(end.x - start.x);
                                const height = Math.abs(end.y - start.y);

                                ctx.beginPath();
                                ctx.rect(x, y, width, height);
                                ctx.fill();
                                ctx.stroke();
                            }

                            ctx.restore();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default GraphViewComponent; 