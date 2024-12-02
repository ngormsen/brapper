import { ColorNumber } from '../components/ColorLegend';

export interface Node {
    id: string;
    text: string;
    color?: ColorNumber;
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
    }>;
    links: Array<{
        source: string;
        target: string;
    }>;
} 