// Import the color data
import colorData from './types.json';

// Helper function to capitalize first letter of a string
const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export interface Thought {
  id: string;
  name: string;
  backgroundColor?: string;
  foregroundColor?: string;
  content?: string;
}

// Create a type for the color entries
interface ColorEntry {
  id: string;
  name: string;
  // ... other fields
}

// Generate ColorTypeIds dynamically
export const ColorTypeIds = colorData.reduce<Record<string, string>>((acc, color) => {
  const colorName = capitalizeFirstLetter(color.name);
  return {
    ...acc,
    [colorName]: color.id
  };
}, {}); 