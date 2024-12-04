import { createClient } from '@supabase/supabase-js';
import { Link, Node } from '../types/graph';
import { NodeCandidate } from '../out/db_model';

console.log('supabase', process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = "https://qvpvnkgypvwwattunflc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cHZua2d5cHZ3d2F0dHVuZmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNDQ5MjYsImV4cCI6MjA0ODcyMDkyNn0.8BK4z6zlMjE8ouDozJbVCr_1nWXJgpL2Nshi4o9ioCg"

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const TABLES = {
    NODES: 'nodes',
    LINKS: 'links',
    NODE_CANDIDATES: 'node_candidates'
} as const;

interface DbLink extends Omit<Link, 'sourceId' | 'targetId'> {
    source_id: string
    target_id: string
    created_at: string
    updated_at: string
}

export const graphDatabase = {
    // Node operations
    async createNode(node: Omit<Node, 'id'>): Promise<Node | null> {
        const { data, error } = await supabase
            .from('nodes')
            .insert({ text: node.text, color: node.color })
            .select()
            .single()

        if (error) {
            console.error('Error creating node:', error)
            return null
        }

        return data
    },

    async updateNode(node: Node): Promise<Node | null> {
        const { data, error } = await supabase
            .from('nodes')
            .update({ text: node.text, color: node.color })
            .eq('id', node.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating node:', error)
            return null
        }

        return data
    },

    async deleteNode(nodeId: string): Promise<boolean> {
        const { error } = await supabase
            .from('nodes')
            .delete()
            .eq('id', nodeId)

        if (error) {
            console.error('Error deleting node:', error)
            return false
        }

        return true
    },

    async getAllNodes(): Promise<Node[]> {
        const { data, error } = await supabase
            .from(TABLES.NODES)
            .select('*')
            .order('created_at')

        if (error) {
            console.error('Error fetching nodes:', error)
            return []
        }

        return data
    },

    // Link operations
    async createLink(link: Omit<Link, 'id'>): Promise<Link | null> {
        const { data, error } = await supabase
            .from('links')
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

    async deleteLink(linkId: string): Promise<boolean> {
        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', linkId)

        if (error) {
            console.error('Error deleting link:', error)
            return false
        }

        return true
    },

    async getAllLinks(): Promise<Link[]> {
        const { data, error } = await supabase
            .from(TABLES.LINKS)
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
    async getFullGraph(): Promise<{ nodes: Node[], links: Link[] }> {
        const nodes = await this.getAllNodes()
        const links = await this.getAllLinks()
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
    }
};