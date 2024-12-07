import { ColorNumber } from '../components/ColorLegend';

export interface Node {
    id: string;
    text: string;
    color?: ColorNumber;
    updated_at?: Date;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
}

export interface GraphData {
    nodes: Array<{
        id: string;
        text: string;
        color?: ColorNumber;
        updated_at?: Date;
    }>;
    links: Array<{
        id: string
        source: string;
        target: string;
    }>;
}
