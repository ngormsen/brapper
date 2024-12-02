import { useState, useCallback, useEffect } from 'react';
import { Node, Link, GraphData } from '../types/graph';
import { ColorNumber } from '../components/ColorLegend';
import { colors } from '../components/ColorLegend';

export const useGraphData = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);

    useEffect(() => {
        console.log('nodes', nodes);
        console.log('links', links);
    }, [nodes, links]);

    const addNode = (text: string, type: Node['type']) => {
        const newNode: Node = {
            id: crypto.randomUUID(),
            text,
            type,
        };
        setNodes(prev => [...prev, newNode]);
    };

    const createLinkId = (node1Id: string, node2Id: string): string => {
        return [node1Id, node2Id].sort().join('-');
    };

    const linkExists = (node1Id: string, node2Id: string): boolean => {
        const linkId = createLinkId(node1Id, node2Id);
        return links.some(link => createLinkId(link.sourceId, link.targetId) === linkId);
    };

    const removeColorLinks = (nodeId: string, color: ColorNumber) => {
        setLinks(prev => prev.filter(link => {
            const isColorLink = nodes.some(node => 
                (node.id === link.sourceId || node.id === link.targetId) &&
                node.color === color
            );
            const involvesNode = link.sourceId === nodeId || link.targetId === nodeId;
            return !(isColorLink && involvesNode);
        }));
    };

    const createColorLinks = (nodeId: string, color: ColorNumber) => {
        const sameColorNodes = nodes.filter(n => 
            n.id !== nodeId && 
            n.color === color
        );

        const newLinks = sameColorNodes.map(targetNode => ({
            id: crypto.randomUUID(),
            sourceId: nodeId,
            targetId: targetNode.id,
            type: 'relates' as const
        })).filter(newLink => !linkExists(newLink.sourceId, newLink.targetId));

        setLinks(prev => [...prev, ...newLinks]);
    };

    const updateNodeColor = (nodeId: string, selectedColor: ColorNumber) => {
        setNodes(prev => {
            const node = prev.find(n => n.id === nodeId);
            const oldColor = node?.color;

            const newNodes = prev.map(node =>
                node.id === nodeId ? { ...node, color: selectedColor } : node
            );

            setTimeout(() => {
                if (oldColor !== undefined && oldColor !== selectedColor) {
                    removeColorLinks(nodeId, oldColor);
                }

                if (selectedColor !== 6) {
                    createColorLinks(nodeId, selectedColor);
                }
            }, 0);

            return newNodes;
        });
    };

    const getGraphData = useCallback((): GraphData => {
        return {
            nodes: nodes.map(node => ({
                id: node.id,
                text: node.text,
                color: node.color
            })),
            links: links.map(link => ({
                source: link.sourceId,
                target: link.targetId,
                type: link.type
            }))
        };
    }, [nodes, links]);

    return {
        nodes,
        links,
        addNode,
        updateNodeColor,
        getGraphData
    };
}; 