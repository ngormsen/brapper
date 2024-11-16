export interface Thought {
  id: string;
  name: string;
  backgroundColor?: string;
  children?: Thought[];
} 