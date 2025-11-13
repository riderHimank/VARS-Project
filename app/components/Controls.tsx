"use client";

import { useState } from "react";

interface ControlsProps {
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
}

export default function Controls({
  onColorChange,
  onSizeChange,
}: ControlsProps) {
  const [selectedColor, setSelectedColor] = useState("#4a5568");
  const [selectedSize, setSelectedSize] = useState("M");

  const colors = [
    { name: "Gray", value: "#4a5568" },
    { name: "Pink", value: "#ff6b9d" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    onSizeChange(size);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Color Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Select Color
        </h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`w-12 h-12 rounded-full border-4 transition-all ${
                selectedColor === color.value
                  ? "border-indigo-600 scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Select Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSize === size
                  ? "bg-indigo-600 text-white scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-indigo-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-indigo-900 mb-2">AR Controls</h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Click and drag to rotate</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Auto-rotating animation</li>
          <li>• Real-time color preview</li>
        </ul>
      </div>
    </div>
  );
}
