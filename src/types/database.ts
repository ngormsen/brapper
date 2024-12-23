import { ColorNumber } from '../components/ColorLegend';

export interface DBNode {
    id: string;
    text: string;
    color?: ColorNumber;
    updated_at: Date;
    x?: number;
    y?: number;
}

export interface DBLink {
    id: string;
    sourceId: string;
    targetId: string;
}

export interface NodeCandidate {
    id: string;
    text: string;
    created_at: Date;
}

// Database response shapes
export interface DBGraphData {
    nodes: DBNode[];
    links: DBLink[];
} 