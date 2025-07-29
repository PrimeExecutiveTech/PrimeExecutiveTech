import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import './App.css';

function App() {
  const [gameObjects, setGameObjects] = useState([
    { id: 1, type: 'rect', x: 100, y: 100, width: 50, height: 50, fill: 'red' },
    { id: 2, type: 'circle', x: 200, y: 150, radius: 30, fill: 'blue' }
  ]);
  const [selectedTool, setSelectedTool] = useState('rect');
  const [isPlaying, setIsPlaying] = useState(false);
  const stageRef = useRef();

  const handleStageClick = (e) => {
    if (isPlaying) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const newObject = {
      id: Date.now(),
      type: selectedTool,
      x: pos.x,
      y: pos.y,
      ...(selectedTool === 'rect' ? { width: 50, height: 50 } : { radius: 25 }),
      fill: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    
    setGameObjects([...gameObjects, newObject]);
  };

  const handleObjectDrag = (id, newPos) => {
    setGameObjects(gameObjects.map(obj => 
      obj.id === id ? { ...obj, x: newPos.x, y: newPos.y } : obj
    ));
  };

  const clearCanvas = () => {
    setGameObjects([]);
  };

  const exportCode = () => {
    const code = `// Generated Gamdev Code
const gameObjects = ${JSON.stringify(gameObjects, null, 2)};

// Game loop
function gameLoop() {
  // Add your game logic here
  gameObjects.forEach(obj => {
    // Update object positions, check collisions, etc.
  });
}`;
    
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard! 📋');
  };

  return (
    <div className="App">
      <header className="game-header">
        <h1>🎮 Gamdev Engine</h1>
        <p>Prime Executive Tech™️ - Game Development Made Easy</p>
      </header>
      
      <div className="game-container">
        <div className="toolbar">
          <h3>🛠️ Tools</h3>
          <div className="tool-buttons">
            <button 
              className={selectedTool === 'rect' ? 'active' : ''}
              onClick={() => setSelectedTool('rect')}
            >
              📦 Rectangle
            </button>
            <button 
              className={selectedTool === 'circle' ? 'active' : ''}
              onClick={() => setSelectedTool('circle')}
            >
              ⭕ Circle
            </button>
          </div>
          
          <div className="control-buttons">
            <button 
              className={isPlaying ? 'stop' : 'play'}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏹️ Stop' : '▶️ Play'}
            </button>
            <button onClick={clearCanvas}>🗑️ Clear</button>
            <button onClick={exportCode}>📤 Export Code</button>
          </div>
          
          <div className="object-list">
            <h4>📋 Objects ({gameObjects.length})</h4>
            {gameObjects.map(obj => (
              <div key={obj.id} className="object-item">
                {obj.type === 'rect' ? '📦' : '⭕'} {obj.type} #{obj.id}
              </div>
            ))}
          </div>
        </div>
        
        <div className="canvas-container">
          <Stage
            width={800}
            height={600}
            onClick={handleStageClick}
            ref={stageRef}
            className="game-canvas"
          >
            <Layer>
              {gameObjects.map(obj => {
                if (obj.type === 'rect') {
                  return (
                    <Rect
                      key={obj.id}
                      x={obj.x}
                      y={obj.y}
                      width={obj.width}
                      height={obj.height}
                      fill={obj.fill}
                      draggable={!isPlaying}
                      onDragEnd={(e) => handleObjectDrag(obj.id, e.target.position())}
                    />
                  );
                } else if (obj.type === 'circle') {
                  return (
                    <Circle
                      key={obj.id}
                      x={obj.x}
                      y={obj.y}
                      radius={obj.radius}
                      fill={obj.fill}
                      draggable={!isPlaying}
                      onDragEnd={(e) => handleObjectDrag(obj.id, e.target.position())}
                    />
                  );
                }
                return null;
              })}
              <Text
                text={isPlaying ? "🎮 Game Running!" : "🎨 Design Mode - Click to add objects"}
                x={10}
                y={10}
                fontSize={16}
                fill={isPlaying ? "green" : "black"}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default App;