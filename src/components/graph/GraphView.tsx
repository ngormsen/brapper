import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../../types/graph';
import { Node, Link } from '../../types/graph';

interface GraphViewProps {
    graphData: GraphData;
    onNodeClick: (node: Node) => void;
    onLinkClick: (link: Link) => void;
    isDeleteMode: boolean;
    isConnectMode: boolean;
}

export const GraphView: React.FC<GraphViewProps> = ({ graphData, onNodeClick, onLinkClick, isDeleteMode, isConnectMode }) => {
    const graphContainerRef = useRef<HTMLDivElement | null>(null);
    const [graphWidth, setGraphWidth] = useState(400);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    useEffect(() => {
        const updateWidth = () => {
            if (graphContainerRef.current) {
                const parentWidth = graphContainerRef.current.parentElement?.offsetWidth || 800;
                const isMediumScreen = window.innerWidth >= 768;
                setGraphWidth(isMediumScreen ? parentWidth / 2 - 32 : parentWidth - 32);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [graphData]);

    // Define the color mapping
    const colors = {
        1: { bg: 'rgba(255, 182, 193, 0.2)', border: 'rgba(255, 105, 180, 1)' }, // Pink
        2: { bg: 'rgba(173, 216, 230, 0.2)', border: 'rgba(0, 0, 255, 1)' }, // Blue
        3: { bg: 'rgba(144, 238, 144, 0.2)', border: 'rgba(0, 128, 0, 1)' }, // Green
        4: { bg: 'rgba(255, 255, 224, 0.2)', border: 'rgba(255, 255, 0, 1)' }, // Yellow
        5: { bg: 'rgba(216, 191, 216, 0.2)', border: 'rgba(128, 0, 128, 1)' }, // Purple
        6: { bg: 'rgba(255, 255, 255, 0.2)', border: 'rgba(169, 169, 169, 1)' }, // White
        7: { bg: 'rgba(255, 165, 0, 0.2)', border: 'rgba(255, 140, 0, 1)' }, // Orange
        8: { bg: 'rgba(175, 238, 238, 0.2)', border: 'rgba(0, 128, 128, 1)' }, // Teal
        9: { bg: 'rgba(211, 211, 211, 0.2)', border: 'rgba(75, 0, 130, 1)' }, // Indigo
    } as const;

    return (
        <div ref={graphContainerRef} className={`bg-white rounded-lg shadow p-4 mb-4 md:mb-0 md:w-1/2 ${isDeleteMode ? 'border-red-500 border-4' : ''} ${isConnectMode ? 'border-blue-500 border-4' : ''}`}>
            <ForceGraph2D
                graphData={graphData}
                nodeLabel={(node) => (node as any).text}
                nodeColor={(node) => (node as any).color || '#999'}
                linkColor={(link) => {
                    return (link as any).id === hoveredLink ? '#666' : '#ddd';
                }}
                linkWidth={(link) => {
                    return (link as any).id === hoveredLink ? 2 : 1;
                }}
                width={graphWidth}
                height={600}
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
                    const label = (node as any).text;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    
                    const textWidth = ctx.measureText(label).width;
                    const padding = 4 / globalScale;
                    
                    const nodeColorId = (node as any).color;
                    const { bg, border } = nodeColorId && nodeColorId !== 6 ? colors[nodeColorId] : { bg: 'white', border: 'black' };
                    
                    ctx.save();
                    
                    // Add scale effect and shadow for hovered node
                    const isHovered = (node as any).id === hoveredNode;
                    const scale = isHovered ? 1.1 : 1;
                    
                    if (isHovered) {
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                        ctx.shadowBlur = 5;
                        ctx.shadowOffsetX = 2;
                        ctx.shadowOffsetY = 2;
                    }
                    
                    // Apply scale transformation
                    ctx.translate(node.x as number, node.y as number);
                    ctx.scale(scale, scale);
                    ctx.translate(-(node.x as number), -(node.y as number));
                    
                    // Draw background
                    ctx.fillStyle = bg;
                    ctx.strokeStyle = border;
                    ctx.lineWidth = (isHovered ? 2 : 1) / globalScale;
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
                    ctx.fillStyle = '#000000';
                    ctx.fillText(label, node.x as number, node.y as number);
                    
                    ctx.restore();
                }}
            />
        </div>
    );
}; 