import { useCallback, useEffect, useState } from 'react';
import { ColorNumber } from '../components/ColorLegend';
import { graphDatabase } from '../services/graphDatabase';
import { GraphData, Link, Node } from '../types/graph';

export const useGraphData = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [sessionNodes, setSessionNodes] = useState<Node[]>([]);
    const [sessionLinks, setSessionLinks] = useState<Link[]>([]);

    useEffect(() => {
        const loadGraph = async () => {
            const { nodes: dbNodes, links: dbLinks } = await graphDatabase.getFullGraph();
            setNodes(dbNodes);
            setLinks(dbLinks);
        };
        loadGraph();
    }, []);

    const addNode = async (text: string) => {
        const newNode = await graphDatabase.createNode({ text });
        if (newNode) {
            setNodes(prev => [...prev, newNode]);
            setSessionNodes(prev => [...prev, newNode]);
        }
    };

    const createLinkId = (node1Id: string, node2Id: string): string => {
        return [node1Id, node2Id].sort().join('-');
    };

    const linkExists = (node1Id: string, node2Id: string): boolean => {
        const linkId = createLinkId(node1Id, node2Id);
        return links.some(link => createLinkId(link.sourceId, link.targetId) === linkId);
    };

    const removeColorLinks = async (nodeId: string, color: ColorNumber) => {
        const linksToRemove = sessionLinks.filter(link => {
            const isColorLink = nodes.some(node =>
                (node.id === link.sourceId || node.id === link.targetId) &&
                node.color === color
            );
            const involvesNode = link.sourceId === nodeId || link.targetId === nodeId;
            return isColorLink && involvesNode;
        });

        for (const link of linksToRemove) {
            await graphDatabase.deleteLink(link.id);
        }
        setLinks(prev => prev.filter(link => !linksToRemove.includes(link)));
        setSessionLinks(prev => prev.filter(link => !linksToRemove.includes(link)));
    };

    const createColorLinks = async (nodeId: string, color: ColorNumber) => {
        const sameColorNodes = sessionNodes.filter(n =>
            n.id !== nodeId &&
            n.color === color
        );

        const newLinks = [];
        for (const targetNode of sameColorNodes) {
            if (!linkExists(nodeId, targetNode.id)) {
                const newLink = await graphDatabase.createLink({
                    sourceId: nodeId,
                    targetId: targetNode.id,
                });
                if (newLink) {
                    newLinks.push(newLink);
                }
            }
        }

        setLinks(prev => [...prev, ...newLinks]);
        setSessionLinks(prev => [...prev, ...newLinks]);
    };

    const createLinkBetweenNodes = async (sourceId: string, targetId: string) => {
        const newLink = await graphDatabase.createLink({ sourceId, targetId });
        if (newLink) {
            setLinks(prev => [...prev, newLink]);
            setSessionLinks(prev => [...prev, newLink]);
        }
    };

    const updateNodeColor = async (nodeId: string, selectedColor: ColorNumber) => {
        const node = sessionNodes.find(n => n.id === nodeId);
        if (!node) return;

        const oldColor = node.color;
        const updatedNode = await graphDatabase.updateNode({ ...node, color: selectedColor });

        if (updatedNode) {
            setNodes(prev => prev.map(node =>
                node.id === nodeId ? updatedNode : node
            ));
            setSessionNodes(prev => prev.map(node =>
                node.id === nodeId ? updatedNode : node
            ));

            if (oldColor !== undefined && oldColor !== selectedColor) {
                await removeColorLinks(nodeId, oldColor);
            }

            if (selectedColor !== 6) {
                await createColorLinks(nodeId, selectedColor);
            }
        }
    };

    const getGraphData = useCallback((): GraphData => {
        return {
            nodes: nodes.map(node => ({
                id: node.id,
                text: node.text,
                color: node.color,
                updated_at: node.updated_at
            })),
            links: links.map(link => ({
                id: link.id,
                source: link.sourceId,
                target: link.targetId,
            }))
        };
    }, [nodes, links]);

    const deleteNode = async (nodeId: string) => {
        console.log('Deleting node:', nodeId);

        // Remove all links connected to this node
        const connectedLinks = links.filter(
            link => link.sourceId === nodeId || link.targetId === nodeId
        );

        for (const link of connectedLinks) {
            await graphDatabase.deleteLink(link.id);
        }

        await graphDatabase.deleteNode(nodeId);
        setNodes(prev => prev.filter(node => node.id !== nodeId));
        setSessionNodes(prev => prev.filter(node => node.id !== nodeId));

        setLinks(prev => prev.filter(link =>
            link.sourceId !== nodeId && link.targetId !== nodeId
        ));
        setSessionLinks(prev => prev.filter(link =>
            link.sourceId !== nodeId && link.targetId !== nodeId
        ));
    };

    const deleteLink = async (linkId: string) => {
        await graphDatabase.deleteLink(linkId);
        setLinks(prev => prev.filter(link => link.id !== linkId));
        setSessionLinks(prev => prev.filter(link => link.id !== linkId));
    };

    return {
        nodes,
        links,
        addNode,
        updateNodeColor,
        getGraphData,
        sessionNodes,
        sessionLinks,
        setSessionNodes,
        setSessionLinks,
        deleteNode,
        deleteLink,
        createLinkBetweenNodes
    };
}; 