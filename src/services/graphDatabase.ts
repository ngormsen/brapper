import { createClient } from '@supabase/supabase-js';
import { NodeCandidate } from '../out/db_model';
import { Link, Node } from '../types/graph';

console.log('supabase', process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = "https://qvpvnkgypvwwattunflc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cHZua2d5cHZ3d2F0dHVuZmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNDQ5MjYsImV4cCI6MjA0ODcyMDkyNn0.8BK4z6zlMjE8ouDozJbVCr_1nWXJgpL2Nshi4o9ioCg"

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const NODES_TABLE_NAMES = {
    ORIGINAL: 'nodes',
    BACKUP: 'nodes_backup'
}

const LINKS_TABLE_NAMES = {
    ORIGINAL: 'links',
    BACKUP: 'links_backup'
}

const TABLES = {
    NODES: NODES_TABLE_NAMES.BACKUP,
    LINKS: LINKS_TABLE_NAMES.BACKUP,
    NODE_CANDIDATES: 'node_candidates'
} as const;

interface DbLink extends Omit<Link, 'sourceId' | 'targetId'> {
    source_id: string
    target_id: string
    created_at: string
    updated_at: string
}

const getTableNames = (isBackupMode: boolean) => ({
    NODES: isBackupMode ? NODES_TABLE_NAMES.BACKUP : NODES_TABLE_NAMES.ORIGINAL,
    LINKS: isBackupMode ? LINKS_TABLE_NAMES.BACKUP : LINKS_TABLE_NAMES.ORIGINAL,
    NODE_CANDIDATES: TABLES.NODE_CANDIDATES
});

export const graphDatabase = {
    // Node operations
    async createNode(node: Omit<Node, 'id'>, isBackupMode: boolean = false): Promise<Node | null> {
        const tables = getTableNames(isBackupMode);
        const { data, error } = await supabase
            .from(tables.NODES)
            .insert({ text: node.text, color: node.color })
            .select()
            .single()

        if (error) {
            console.error('Error creating node:', error)
            return null
        }

        return data
    },

    async updateNode(node: Node, isBackupMode: boolean = false): Promise<Node | null> {
        const tables = getTableNames(isBackupMode);
        const { data, error } = await supabase
            .from(tables.NODES)
            .update({ text: node.text, color: node.color, x: node.x, y: node.y, updated_at: node.updated_at })
            .eq('id', node.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating node:', error)
            return null
        }

        return data
    },

    async updateNodes(nodes: Node[], isBackupMode: boolean = false): Promise<Node[] | null> {
        const tables = getTableNames(isBackupMode);
        const { data, error } = await supabase
            .from(tables.NODES)
            .upsert(
                nodes.map(node => ({
                    id: node.id,
                    text: node.text,
                    color: node.color,
                    x: node.x,
                    y: node.y,
                    updated_at: node.updated_at
                }))
            )
            .select()

        if (error) {
            console.error('Error batch updating nodes:', error)
            return null
        }

        return data
    },

    async deleteNode(nodeId: string, isBackupMode: boolean = false): Promise<boolean> {
        const tables = getTableNames(isBackupMode);
        const { error } = await supabase
            .from(tables.NODES)
            .delete()
            .eq('id', nodeId)

        if (error) {
            console.error('Error deleting node:', error)
            return false
        }

        return true
    },

    async getAllNodes(isBackupMode: boolean = false): Promise<Node[]> {
        const tables = getTableNames(isBackupMode);
        const { data, error } = await supabase
            .from(tables.NODES)
            .select('*')
            .order('created_at')

        if (error) {
            console.error('Error fetching nodes:', error)
            return []
        }

        return data
    },

    // Link operations
    async createLink(link: Omit<Link, 'id'>, isBackupMode: boolean = false): Promise<Link | null> {
        const tables = getTableNames(isBackupMode);
        const { data, error } = await supabase
            .from(tables.LINKS)
            .insert({
                source_id: link.sourceId,
                target_id: link.targetId
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating link:', error)
            return null
        }

        // Transform the response to match our Link interface
        return {
            id: data.id,
            sourceId: data.source_id,
            targetId: data.target_id
        }
    },

    async deleteLink(linkId: string, isBackupMode: boolean = false): Promise<boolean> {
        const tables = getTableNames(isBackupMode);
        const { error } = await supabase
            .from(tables.LINKS)
            .delete()
            .eq('id', linkId)

        if (error) {
            console.error('Error deleting link:', error)
            return false
        }

        return true
    },

    async getAllLinks(isBackupMode: boolean = false): Promise<Link[]> {
        const tables = getTableNames(isBackupMode);
        const { data, error } = await supabase
            .from(tables.LINKS)
            .select('*')
            .order('created_at')

        if (error) {
            console.error('Error fetching links:', error)
            return []
        }

        // Transform the response to match our Link interface
        return data.map((link: DbLink) => ({
            id: link.id,
            sourceId: link.source_id,
            targetId: link.target_id
        }))
    },

    // Fetch entire graph
    async getFullGraph(isBackupMode: boolean = false): Promise<{ nodes: Node[], links: Link[] }> {
        const nodes = await this.getAllNodes(isBackupMode)
        const links = await this.getAllLinks(isBackupMode)
        return { nodes, links }
    }
}

export const nodeCandidateDatabase = {

    async createNodeCandidate(nodeCandidate: Omit<NodeCandidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NodeCandidate | null> {
        const { data, error } = await supabase
            .from(TABLES.NODE_CANDIDATES)
            .insert({ text: nodeCandidate.text })
            .select()
            .single();

        if (error) {
            console.error('Error creating node candidate:', error);
            return null;
        }

        return {
            id: data.id,
            text: data.text,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    },

    async deleteNodeCandidate(id: string): Promise<boolean> {
        const { error } = await supabase
            .from(TABLES.NODE_CANDIDATES)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting node candidate:', error);
            return false;
        }

        return true;
    },

    async updateNodeCandidate(nodeCandidate: Pick<NodeCandidate, 'id' | 'text'>): Promise<NodeCandidate | null> {
        const { data, error } = await supabase
            .from(TABLES.NODE_CANDIDATES)
            .update({ text: nodeCandidate.text })
            .eq('id', nodeCandidate.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating node candidate:', error);
            return null;
        }

        return {
            id: data.id,
            text: data.text,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    },

    async getAllNodeCandidates(): Promise<NodeCandidate[]> {
        const { data, error } = await supabase
            .from(TABLES.NODE_CANDIDATES)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching node candidates:', error);
            return [];
        }

        return data.map(candidate => ({
            id: candidate.id,
            text: candidate.text,
            createdAt: new Date(candidate.created_at),
            updatedAt: new Date(candidate.updated_at)
        }));
    }
};