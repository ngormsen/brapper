export interface NodeInputProps {
  onAddNode: (text: string) => void;
}

export interface NodeDisplayProps {
  text: string;
  maxLength?: number;
} 