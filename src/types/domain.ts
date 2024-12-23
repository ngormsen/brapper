import { ColorNumber } from '../components/ColorLegend';

// Core domain entities
export interface Node {
    id: string;
    text: string;
    color?: ColorNumber;
    updated_at?: Date;
    x?: number;
    y?: number;
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
}

// Domain-specific data structures
export interface GraphData {
    nodes: Node[];
    links: Link[];
}

// Domain-specific value objects
export interface ColorConfig {
    bg: string;
    border: string;
}

export interface NodeDisplayConfig {
    text: string;
    maxLength?: number;
    colorClass?: string;
    isDeleteMode?: boolean;
    isHovered?: boolean;
}

