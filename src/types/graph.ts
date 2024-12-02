import { ColorNumber } from '../components/ColorLegend';

export interface Node {
    id: string;
    text: string;
    type: 'concept' | 'evidence' | 'question';
    color?: ColorNumber;
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'supports' | 'contradicts' | 'relates';
}

export interface GraphData {
    nodes: Array<{
        id: string;
        text: string;
        color?: string;
    }>;
    links: Array<{
        source: string;
        target: string;
        type: string;
    }>;
} 