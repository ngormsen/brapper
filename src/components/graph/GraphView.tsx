import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../../types/graph';

interface GraphViewProps {
    graphData: GraphData;
}

export const GraphView: React.FC<GraphViewProps> = ({ graphData }) => {
    const graphContainerRef = useRef<HTMLDivElement | null>(null);
    const [graphWidth, setGraphWidth] = useState(400);

    useEffect(() => {
        console.log('graphData', graphData);
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
        <div ref={graphContainerRef} className="bg-white rounded-lg shadow p-4 mb-4 md:mb-0 md:w-1/2">
            <ForceGraph2D
                graphData={graphData}
                nodeLabel={(node) => (node as any).text}
                nodeColor={(node) => (node as any).color || '#999'}
                linkColor={() => '#999'}
                width={graphWidth}
                height={600}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = (node as any).text;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    
                    // Measure text width
                    const textWidth = ctx.measureText(label).width;
                    const padding = 4 / globalScale;
                    
                    // Ensure colorId is correctly accessed
                    const nodeColorId = (node as any).color;
                    const { bg, border } = nodeColorId && nodeColorId !== 6 ? colors[nodeColorId] : { bg: 'white', border: 'black' };
                    
                    // Save the current context state
                    ctx.save();
                    
                    // Draw background
                    ctx.fillStyle = bg;
                    ctx.strokeStyle = border;
                    ctx.lineWidth = 1 / globalScale;
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
                    
                    // Draw text in black
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000000';
                    ctx.fillText(label, node.x as number, node.y as number);
                    
                    // Restore the context to its original state
                    ctx.restore();
                }}
            />
        </div>
    );
}; 