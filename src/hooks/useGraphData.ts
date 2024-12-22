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

    const addNode = async (text: string): Promise<Node | null> => {
        const newNode = await graphDatabase.createNode({ text });
        if (newNode) {
            setNodes(prev => [...prev, newNode]);
            setSessionNodes(prev => [...prev, newNode]);
        }
        return newNode;
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
            const isSourceNodeInSession = sessionNodes.some(node => node.id === link.sourceId);
            if (!isSourceNodeInSession) return false;
            const isTargetNodeInSession = sessionNodes.some(node => node.id === link.targetId);
            if (!isTargetNodeInSession) return false;

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
            await updateNodeUpdatedAt(sourceId, new Date());
            await updateNodeUpdatedAt(targetId, new Date());
        }
    };

    const updateNodeUpdatedAt = async (nodeId: string, updatedAt: Date) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const updatedNode = await graphDatabase.updateNode({ ...node, updated_at: updatedAt });
        if (updatedNode) {
            setNodes(prev => prev.map(node =>
                node.id === nodeId ? updatedNode : node
            ));
            setSessionNodes(prev => prev.map(node =>
                node.id === nodeId ? updatedNode : node
            ));
        }
    };

    const updateNodeColor = async (nodeId: string, selectedColor: ColorNumber) => {
        const node = sessionNodes.find(n => n.id === nodeId);
        if (!node) return;

        const oldColor = node.color;
        const updatedNode = await graphDatabase.updateNode({ ...node, color: selectedColor, updated_at: new Date() });

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


    const updateNodeText = async (nodeId: string, newText: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const updatedNode = await graphDatabase.updateNode({ ...node, text: newText, updated_at: new Date() });
        if (updatedNode) {
            setNodes(prev => prev.map(node =>
                node.id === nodeId ? updatedNode : node
            ));
            setSessionNodes(prev => prev.map(node =>
                node.id === nodeId ? updatedNode : node
            ));
        }
    };

    const getGraphData = useCallback((): GraphData => {
        return {
            nodes: nodes.map(node => ({
                id: node.id,
                text: node.text,
                color: node.color,
                updated_at: node.updated_at,
                x: node.x,
                y: node.y,
                vx: node.vx,
                vy: node.vy,
                fx: node.x,
                fy: node.y,
            })),
            links: links.map(link => ({
                id: link.id,
                source: link.sourceId,
                target: link.targetId,
            }))
        };
    }, [nodes, links]);

    const getSessionGraphData = useCallback((): GraphData => {
        return {
            nodes: sessionNodes.map(node => ({
                id: node.id,
                text: node.text,
                color: node.color,
                updated_at: node.updated_at
            })),
            links: sessionLinks.filter((link) => sessionNodes.some(node => node.id === link.sourceId) && sessionNodes.some(node => node.id === link.targetId))
                .map(link => ({
                    id: link.id,
                    source: link.sourceId,
                    target: link.targetId,
                }))
        };
    }, [sessionNodes, sessionLinks]);

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
        getSessionGraphData,
        sessionNodes,
        sessionLinks,
        setSessionNodes,
        setSessionLinks,
        deleteNode,
        deleteLink,
        createLinkBetweenNodes,
        updateNodeText
    };
}; 