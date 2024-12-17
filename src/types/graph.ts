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
    fx?: number;
    fy?: number;
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
}

export interface GraphData {
    nodes: Node[];
    links: Array<{
        id: string
        source: any;
        target: any;
    }>;
}
