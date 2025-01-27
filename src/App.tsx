import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';
import Confetti from 'react-confetti';

interface WheelItem {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  '#7C3AED', 
  '#4F46E5', 
  '#0EA5E9', 
  '#3730A3', 
  '#8B5CF6', 
  '#6D28D9',
  '#4C1D95', 
  '#3730A3',
];

function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const wheelRef = useRef<SVGSVGElement | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', text: 'Item 1', color: '#FF0000'},
    { id: '2', text: 'Item 2', color: '#FF69B4'},
    { id: '3', text: 'Item 3', color: '#FF1493'},
    { id: '4', text: 'Item 4', color: '#8A2BE2'},
  ]);

  const spinWheel = () => {
    if (isSpinning || items.length < 2) return;
    
    setIsSpinning(true);
    
    const minSpins = 5;
    const maxSpins = 8;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const additionalDegrees = Math.floor(Math.random() * 360);
    const totalDegrees = spins * 360 + additionalDegrees;
    const finalRotation = currentRotation + totalDegrees;
    
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = `rotate(${currentRotation}deg)`;
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (wheelRef.current) {
            wheelRef.current.style.transition = 'transform 8s cubic-bezier(0.32, 0.06, 0.32, 0.95)';
            wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
          }
        });
      });
    }

    setTimeout(() => {
      setIsSpinning(false);
      setCurrentRotation(finalRotation);
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }, 8000);
  };


  const handleDeleteItem = (id: string) => {
    if (items.length <= 2) {
      alert('You need at least 2 items on the wheel!');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: WheelItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      color: COLORS[items.length % COLORS.length],
    };
    
    setItems([...items, newItem]);
    setNewItemText('');
    setShowAddModal(false);
  };

  useEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
    setCurrentRotation(0);
  }, [items.length]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const calculateSliceStyles = (index: number, total: number) => {
    const angle = 360 / total;
    const startAngle = index * angle;
    const endAngle = startAngle + angle;
    
    const centerX = 50;
    const centerY = 50;
    const radius = 50;

    const startX = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
    const startY = centerY - radius * Math.sin((Math.PI * startAngle) / 180);
    const endX = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
    const endY = centerY - radius * Math.sin((Math.PI * endAngle) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathD = `M ${centerX} ${centerY}
                   L ${startX} ${startY}
                   A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}
                   Z`;

    return {
      d: pathD,
      transform: `rotate(${-startAngle}deg)`,
      transformOrigin: 'center',
    };
  };

  const calculateTextPosition = (index: number, total: number) => {
    const sliceAngle = 360 / total;
    const midAngle = ((index * sliceAngle) + (sliceAngle / 2)) * (Math.PI / 180);
    const radius = 32; // Slightly reduced radius for better positioning
    
    // Calculate position using trigonometry for exact center of slice
    const x = 50 + (radius * Math.cos(midAngle));
    const y = 50 + (radius * Math.sin(midAngle));
    
    // Calculate rotation to keep text horizontal
    const rotation = (index * sliceAngle) + (sliceAngle / 2);
    const adjustedRotation = rotation > 180 ? rotation - 180 : rotation;
    
    return {
      x,
      y,
      rotation: adjustedRotation - 90 // Adjust rotation to keep text readable
    };
  };

  const calculateFontSize = (total: number) => {
    // Dynamic font size based on number of items
    const baseFontSize = 8;
    const scaleFactor = Math.max(0.5, 1 - (total * 0.05));
    return Math.max(4, baseFontSize * scaleFactor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C3AED] to-[#3730A3] flex flex-col items-center justify-center p-4">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${showConfetti ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
  <Confetti width={windowDimensions.width} height={windowDimensions.height} />
</div>
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl pt-8 bg-transparent" id='centerDiv'>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Spin of Fortune</h1>
          <p className="text-gray-900">Spin the wheel and try your luck!</p>
        </div>

        <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-8">
          <div className="relative w-full h-full">
            <svg 
              ref = {wheelRef}
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ 
                transformOrigin: 'center',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
                border: '2px solid #fff',
                borderRadius: '50%',
              }}
            >
              <circle cx="50" cy="50" r="48" fill="#5B21B6" stroke="#8B5CF6" strokeWidth="4"/>
              <g>
              {items.map((item, index) => {
                const sliceStyles = calculateSliceStyles(index, items.length);
                return (
                  <path
                    key={`slice-${item.id}`}
                    d={sliceStyles.d}
                    fill={item.color}
                    className="transition-colors"
                    stroke="#fff" 
                    strokeWidth="0.5"  
                  />
                );
              })}
            </g>
            <g>
              {items.map((item, index) => {
                const textPosition = calculateTextPosition(index, items.length);
                const fontSize = calculateFontSize(items.length);
                return (
                  <text
                    key={`text-${item.id}`}
                    x={textPosition.x}
                    y={textPosition.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontWeight="bold"
                    fontSize={fontSize}
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                    transform={`rotate(${textPosition.rotation}, ${textPosition.x}, ${textPosition.y})`}
                    className="select-none"
                  >
                    {item.text}
                  </text>
                );
              })}
            </g>
            </svg>

            {!isSpinning && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div 
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={spinWheel}
                  style={{
                    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                    border: '4px solid #333',
                  }}
                >
                  <Play className="w-10 h-10 text-gray-800 ml-2" />
                </div>
              </div>
            )}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div 
                className="w-8 h-12"
                style={{ 
                  background: '#333',
                  clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center gap-4 mb-4 relative z-10">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 w-full max-w-xs rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors"
          >
            <Plus size={20} /> Add New
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 w-full max-w-xs rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors"
          >
            <Trash2 size={20} /> Delete
          </button>
        </div>

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-20">
          <div className="rounded-lg p-6 max-w-md w-full bg-gradient-to-br from-purple-600 to-blue-500">
            <h2 className="text-xl font-bold mb-4">Delete Option</h2>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-4">
              {items.map(item => (
                <div
                  key={item.id}
                  tabIndex={0}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded border-b border-gray-300 focus:bg-transparent focus:outline-none"
                >
                  <span className='text-white'>{item.text}</span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 "
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="mt-4 w-full px-4 py-2 bg-[#6B7280] text-white rounded-lg hover:bg-[#4B5563] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full bg-gradient-to-br from-purple-600 to-blue-500">
            <h2 className="text-xl font-bold mb-4">Add New Option</h2>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Write option.."
              className="w-full p-2 border rounded-lg mb-4 bg-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#6B7280] text-white rounded-lg hover:bg-[#4B5563] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;