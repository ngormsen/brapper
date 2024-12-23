import { Node, Link } from './domain';

// Force Graph Node extension with physics properties
export interface ForceGraphNode extends Node {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number;
    fy?: number;
    __bckgDimensions?: [number, number];
}

// Force Graph Link extension
export interface ForceGraphLink extends Omit<Link, 'sourceId' | 'targetId'> {
    source: string | ForceGraphNode;
    target: string | ForceGraphNode;
}

// Force Graph Data structure
export interface ForceGraphData {
    nodes: ForceGraphNode[];
    links: ForceGraphLink[];
}

// Force Graph Event Handlers
export interface ForceGraphEvents {
    onNodeClick?: (node: ForceGraphNode) => void;
    onLinkClick?: (link: ForceGraphLink) => void;
    onNodeHover?: (node: ForceGraphNode | null) => void;
    onLinkHover?: (link: ForceGraphLink | null) => void;
}

// Force Graph Rendering Config
export interface ForceGraphConfig {
    nodeRelSize?: number;
    nodeId?: string;
    nodeVal?: (node: ForceGraphNode) => number;
    nodeLabel?: string | ((node: ForceGraphNode) => string);
    nodeAutoColorBy?: string;
    linkDirectionalParticles?: number;
    linkDirectionalParticleWidth?: number;
    dagMode?: 'td' | 'bu' | 'lr' | 'rl' | 'radialout' | 'radialin' | null;
    dagLevelDistance?: number;
    backgroundColor?: string;
    width?: number;
    height?: number;
} 