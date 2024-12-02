import React, { useEffect, useState } from 'react';
import { ColorNumber } from '../components/ColorLegend';
import { GraphView } from '../components/graph/GraphView';
import { NodesSection } from '../components/nodes/NodesSection';
import { useGraphData } from '../hooks/useGraphData';

const ConEvPage: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<ColorNumber | null>(null);
    const { nodes, links, sessionNodes, sessionLinks, addNode, updateNodeColor, getGraphData } = useGraphData();

    // Memoize the graph data
    const graphData = React.useMemo(() => getGraphData(), [nodes, links, sessionNodes, sessionLinks]);

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
        if (selectedColor !== null) {
            updateNodeColor(nodeId, selectedColor);
        }
    };

    const handleNodeAdd = (text: string) => {
        addNode(text);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ConEv Page</h1>

            <div className="md:flex md:gap-4">
                <GraphView graphData={graphData} />
                
                <NodesSection
                    nodes={sessionNodes}
                    links={sessionLinks}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    onNodeClick={handleNodeClick}
                    onAddNode={handleNodeAdd}
                />
            </div>
        </div>
    );
};

export default ConEvPage; 