import React, { useEffect, useState } from 'react';
import { ColorNumber } from '../components/ColorLegend';
import { GraphView } from '../components/graph/GraphView';
import { NodesSection } from '../components/nodes/NodesSection';
import { useGraphData } from '../hooks/useGraphData';
import { Node } from '../types/graph';
const ConEvPage: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<ColorNumber | null>(null);
    const { nodes, links, sessionNodes, sessionLinks, setSessionNodes, setSessionLinks, addNode, updateNodeColor, getGraphData } = useGraphData();

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
        if (selectedColor !== null) {
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
        console.log(node);
        // Check if node already exists in sessionNodes
        if (!sessionNodes.some(n => n.id === node.id)) {
            setSessionNodes(prev => [...prev, node]);

            // // Optionally, also add any links connected to this node
            // const connectedLinks = links.filter(
            //     link => link.sourceId === node.id || link.targetId === node.id
            // );

            // setSessionLinks(prev => [
            //     ...prev,
            //     ...connectedLinks.filter(newLink =>
            //         !prev.some(existingLink => existingLink.id === newLink.id)
            //     )
            // ]);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ConEv Page</h1>

            <div className="md:flex md:gap-4">
                <GraphView graphData={graphData} onNodeClick={handleGraphNodeClick} />

                <NodesSection
                    nodes={sessionNodes}
                    links={links}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    onNodeClick={handleNodeClick}
                    onAddNode={handleNodeAdd}
                    onReset={handleSessionReset}
                />
            </div>
        </div>
    );
};

export default ConEvPage; 