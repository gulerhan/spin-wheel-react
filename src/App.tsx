import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';

interface WheelItem {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  '#FF3131',
  '#FF1493',
  '#9400D3',
  '#0000FF', 
  '#00BFFF', 
  '#00FF00',
  '#FFD700', 
  '#FFA500',
  '#FF4500', 
  '#FF69B4', 
];

function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const wheelRef = useRef<SVGSVGElement | null>(null);
  
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', text: 'Doğruluk', color: '#FF0000'},
    { id: '2', text: 'Doğruluk', color: '#FF69B4'},
    { id: '3', text: 'Cesaretlik', color: '#FF1493'},
    { id: '4', text: 'Doğruluk', color: '#8A2BE2'},
  ]);

  const spinWheel = () => {
    if (isSpinning || items.length < 2) return;
    
    setIsSpinning(true);
    setResult(null);
    
    const minSpins = 5;
    const maxSpins = 8;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const degrees = spins * 360 + Math.floor(Math.random() * 360);
    
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (wheelRef.current) {
            wheelRef.current.style.transition = 'transform 8s cubic-bezier(0.32, 0.06, 0.32, 0.95)';
            wheelRef.current.style.transform = `rotate(${degrees}deg)`;
          }
        });
      });
    }

    setTimeout(() => {
      setIsSpinning(false);
      const winningIndex = Math.floor((360 - (degrees % 360)) / (360 / items.length));
      setResult(items[winningIndex].text);
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
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kim kazanacak ?</h1>
          <p className="text-gray-600">Çarkı çevir ve şansını dene!</p>
        </div>

        <div className="relative w-96 h-96 mx-auto mb-8">
          <div className="relative w-full h-full">
            <svg 
              ref = {wheelRef}
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ 
                transformOrigin: 'center',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))'
              }}
            >
              <circle cx="50" cy="50" r="48" fill="white" stroke="#E5E7EB" strokeWidth="4"/>
              {items.map((item, index) => {
                const sliceStyles = calculateSliceStyles(index, items.length);
                return (
                  <g key={item.id}>
                    <path
                      d={sliceStyles.d}
                      fill={item.color}
                      className="transition-colors"
                    />
                    <text
                      x="50"
                      y="20"
                      textAnchor="middle"
                      fill="white"
                      fontWeight="bold"
                      fontSize="6"
                      transform={`rotate(${(360 / items.length) * index + (360 / items.length / 2)} 50 50)`}
                      className="select-none"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {item.text}
                    </text>
                    <text
                      x="50"
                      y="30"
                      textAnchor="middle"
                      fontSize="8"
                      transform={`rotate(${(360 / items.length) * index + (360 / items.length / 2)} 50 50)`}
                      className="select-none"
                    >
                    </text>
                  </g>
                );
              })}
            </svg>

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

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Plus size={20} /> Yeni Ekle
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <Trash2 size={20} /> Sil
          </button>
        </div>

        {result && (
          <div className="mt-4 text-lg font-semibold text-center text-gray-800">
            Seçilen: <span className="text-purple-600">{result}</span>!
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Seçenek Sil</h2>
            <div className="max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                  <span>{item.text}</span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Yeni Seçenek Ekle</h2>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Seçenek yazın"
              className="w-full p-2 border rounded-lg mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Ekle
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;