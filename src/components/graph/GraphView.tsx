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
    }, []);

    return (
        <div ref={graphContainerRef} className="bg-white rounded-lg shadow p-4 mb-4 md:mb-0 md:w-1/2">
            <ForceGraph2D
                graphData={graphData}
                nodeLabel={node => (node as any).text}
                nodeColor={node => (node as any).color || '#999'}
                linkColor={() => '#999'}
                width={graphWidth}
                height={600}
            />
        </div>
    );
}; 