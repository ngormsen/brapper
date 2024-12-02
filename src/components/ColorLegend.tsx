import React from 'react';

const colors = {
    1: { classes: 'bg-pink-100 border-pink-300', name: 'Pink' },
    2: { classes: 'bg-blue-100 border-blue-300', name: 'Blue' },
    3: { classes: 'bg-green-100 border-green-300', name: 'Green' },
    4: { classes: 'bg-yellow-100 border-yellow-300', name: 'Yellow' },
    5: { classes: 'bg-purple-100 border-purple-300', name: 'Purple' },
    6: { classes: 'bg-white border-gray-300', name: 'White' },
    7: { classes: 'bg-orange-100 border-orange-300', name: 'Orange' },
    8: { classes: 'bg-teal-100 border-teal-300', name: 'Teal' },
    9: { classes: 'bg-gray-100 border-gray-300', name: 'Indigo' },
} as const;

export type ColorNumber = keyof typeof colors;

interface ColorLegendProps {
    selectedColor: number | null;
    setSelectedColor: React.Dispatch<React.SetStateAction<number | null>>;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ selectedColor, setSelectedColor }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Color Legend (Press 1-9)</h2>
            <div className="flex flex-wrap gap-2">
                {(Object.entries(colors) as Array<[string, { classes: string, name: string }]>).map(([numStr, color]) => {
                    const num = Number(numStr) as ColorNumber;
                    return (
                        <div
                            key={num}
                            className={`${color.classes} px-3 py-2 rounded border cursor-pointer ${selectedColor === num ? 'ring-2 ring-blue-500' : ''
                                }`}
                            onClick={() => setSelectedColor(prev => prev === num ? null : num)}
                        >
                            {num}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export { colors };
export default ColorLegend; 