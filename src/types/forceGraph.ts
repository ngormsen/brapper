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
