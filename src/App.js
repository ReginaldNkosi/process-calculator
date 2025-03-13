import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App = () => {
  const [processValue, setProcessValue] = useState(50.0);
  const [pvMin, setPvMin] = useState(0);
  const [pvMax, setPvMax] = useState(100);
  const [currentMa, setCurrentMa] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [colorCode, setColorCode] = useState('');
  const [bandCount, setBandCount] = useState(3);
  const [graphData, setGraphData] = useState([]);

  // Function to calculate 4-20mA current from process value
  const calculateCurrent = (processValue, pvMin, pvMax) => {
    return 4 + (processValue - pvMin) * (16 / (pvMax - pvMin));
  };

  // Function to calculate resistance using Ohm's Law with a fixed 24V supply
  const calculateResistance = (currentMa) => {
    const currentA = currentMa / 1000; // Convert mA to A
    return 24 / currentA; // R = V/I
  };

  // Function to determine resistor color code based on band count
  const getResistorColorCode = (resistance, bandCount) => {
    const colors = ["Black", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Gray", "White"];
    const toleranceColor = "Gold"; // default tolerance color

    const resistanceRounded = Math.round(resistance);
    
    if (bandCount === 3 || bandCount === 4) {
      // For 3- and 4-band: use 2 significant digits
      const digits = resistanceRounded.toString().split('');
      if (digits.length < 2) {
        return "N/A";
      }
      const firstBand = colors[parseInt(digits[0])];
      const secondBand = colors[parseInt(digits[1])];
      let multiplier = digits.length - 2;
      if (multiplier < 0) multiplier = 0;
      const multiplierBand = colors[multiplier];
      return bandCount === 3 
        ? `${firstBand}, ${secondBand}, ${multiplierBand}`
        : `${firstBand}, ${secondBand}, ${multiplierBand}, ${toleranceColor}`;
    } else if (bandCount === 5) {
      // For 5-band: use 3 significant digits
      let digits = resistanceRounded.toString().split('');
      // Pad with zeros if necessary
      while (digits.length < 3) {
        digits.unshift('0');
      }
      const firstBand = colors[parseInt(digits[0])];
      const secondBand = colors[parseInt(digits[1])];
      const thirdBand = colors[parseInt(digits[2])];
      let multiplier = digits.length - 3;
      if (multiplier < 0) multiplier = 0;
      const multiplierBand = colors[multiplier];
      return `${firstBand}, ${secondBand}, ${thirdBand}, ${multiplierBand}, ${toleranceColor}`;
    } else {
      return "Invalid band count";
    }
  };

  // Generate data for the resistance vs current graph
  const generateGraphData = () => {
    const data = [];
    for (let i = 4; i <= 20; i += 0.5) {
      data.push({
        current: i,
        resistance: calculateResistance(i)
      });
    }
    return data;
  };

  // Update calculations when inputs change
  useEffect(() => {
    const current = calculateCurrent(processValue, pvMin, pvMax);
    setCurrentMa(current);
    
    const res = calculateResistance(current);
    setResistance(res);
    
    const code = getResistorColorCode(res, bandCount);
    setColorCode(code);
    
    // Generate graph data
    setGraphData(generateGraphData());
  }, [processValue, pvMin, pvMax, bandCount]);

  // Initialize graph data on component mount
  useEffect(() => {
    setGraphData(generateGraphData());
  }, []);

  // Visualization for the resistor color bands
  const ColorBand = ({ color }) => {
    const colorMap = {
      "Black": "bg-black",
      "Brown": "bg-amber-800",
      "Red": "bg-red-600",
      "Orange": "bg-orange-500",
      "Yellow": "bg-yellow-400",
      "Green": "bg-green-600",
      "Blue": "bg-blue-600",
      "Violet": "bg-purple-600",
      "Gray": "bg-gray-500",
      "White": "bg-white border border-gray-300",
      "Gold": "bg-yellow-600"
    };

    return (
      <div className={`h-12 w-4 rounded-sm mx-1 ${colorMap[color] || "bg-gray-300"}`}></div>
    );
  };

  const renderColorBands = () => {
    if (!colorCode || colorCode === "N/A") return null;
    
    const bands = colorCode.split(', ');
    return (
      <div className="flex justify-center items-center mt-4">
        {bands.map((color, index) => (
          <ColorBand key={index} color={color} />
        ))}
      </div>
    );
  };

  // Fixed custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const currentValue = payload[0].payload.current;
      const resistanceValue = payload[0].payload.resistance;
      
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="text-sm">{`Current: ${currentValue.toFixed(1)} mA`}</p>
          <p className="text-sm">{`Resistance: ${resistanceValue.toFixed(2)} Ω`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Process Value to 4-20mA Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Process Value: {processValue}
            </label>
            <input
              type="range"
              min={pvMin}
              max={pvMax}
              step="0.1"
              value={processValue}
              onChange={(e) => setProcessValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{pvMin}</span>
              <span>{pvMax}</span>
            </div>
            <div className="mt-3">
              <input
                type="number"
                value={processValue}
                onChange={(e) => setProcessValue(Math.min(pvMax, Math.max(pvMin, parseFloat(e.target.value) || 0)))}
                className="w-full p-2 border border-gray-300 rounded text-right"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={pvMin}
                onChange={(e) => setPvMin(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={pvMax}
                onChange={(e) => setPvMax(parseFloat(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* New resistor band count selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resistor Band Count:
            </label>
            <select
              value={bandCount}
              onChange={(e) => setBandCount(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={3}>3-band</option>
              <option value={4}>4-band</option>
              <option value={5}>5-band</option>
            </select>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Results</h2>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-sm font-medium text-gray-700">4-20mA Current:</div>
              <div className="text-sm text-right font-mono">{currentMa.toFixed(2)} mA</div>
              
              <div className="text-sm font-medium text-gray-700">Resistance:</div>
              <div className="text-sm text-right font-mono">{resistance.toFixed(2)} Ω</div>
              
              <div className="text-sm font-medium text-gray-700">Resistor Color Code:</div>
              <div className="text-sm text-right font-mono">{colorCode}</div>
            </div>
            
            {renderColorBands()}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Resistance vs Current Graph</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={graphData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="current" 
                  label={{ value: 'Current (mA)', position: 'insideBottom', offset: -5 }} 
                  domain={[4, 20]}
                />
                <YAxis 
                  label={{ value: 'Resistance (Ω)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="resistance" 
                  stroke="#82ca9d" 
                  dot={false}
                  activeDot={{ r: 6, fill: '#82ca9d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              This graph shows the relationship between current (mA) and resistance (Ω). 
              The resistance curve follows Ohm's Law: R = 24V/I, showing the inverse relationship.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Current point:</span> {currentMa.toFixed(2)} mA, {resistance.toFixed(2)} Ω
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
