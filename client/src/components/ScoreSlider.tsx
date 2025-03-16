import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface ScoreSliderProps {
  id: string;
  label: string;
  percentage: string;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
}

export default function ScoreSlider({ 
  id, 
  label, 
  percentage, 
  min, 
  max, 
  defaultValue, 
  onChange 
}: ScoreSliderProps) {
  const [value, setValue] = useState(defaultValue);
  
  // Initialize with default value
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (newValue: number[]) => {
    const newScore = newValue[0];
    setValue(newScore);
    onChange(newScore);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="font-medium">
          {label} <span className="text-sm text-gray-500">({percentage})</span>
        </label>
        <Badge variant="secondary" className="bg-teal-100 text-teal-800">
          {value}
        </Badge>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={handleChange}
        className="w-full h-2"
      />
    </div>
  );
}
