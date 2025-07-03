import React, { useRef, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const WhiteBoard = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || '';
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const indicatorRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [isEraser, setIsEraser] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3000');
      console.log('Socket connected:', socketRef.current.connected);
    }

    const socket = socketRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    socket.emit('joinRoom', roomId, username);

    socket.on('canvasChange', ({ newCanvasData, sender }) => {
      if (sender !== username) {
        const img = new Image();
        img.src = newCanvasData;
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0);
        };
      }
    });

    const resizeCanvas = () => {
      const savedImage = canvas.toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const img = new Image();
      img.src = savedImage;
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    socket.on('roomUsers', (userList) => {
      setUsers(userList);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      socket.off('canvasChange');
      socket.off('roomUsers');
      socket.emit('leaveRoom', roomId, username);
      socket.disconnect();
    };
  }, [roomId, username]);

  const saveState = () => {
    const canvas = canvasRef.current;
    undoStack.current.push(canvas.toDataURL());
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    redoStack.current.push(canvas.toDataURL());

    const imgData = undoStack.current.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    emitCanvasChange();
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    undoStack.current.push(canvas.toDataURL());

    const imgData = redoStack.current.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    emitCanvasChange();
  };

  const emitCanvasChange = () => {
    const canvas = canvasRef.current;
    const newCanvasData = canvas.toDataURL();
    socketRef.current.emit('canvasChange', { newCanvasData, roomId, sender: username });
  };

  const handleMouseDown = (e) => {
    saveState();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setCursorPos({ x, y });

    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    emitCanvasChange();
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };

  const brushStyle = {
    position: 'absolute',
    left: cursorPos.x,
    top: cursorPos.y,
    width: `${lineWidth}px`,
    height: `${lineWidth}px`,
    border: isEraser ? '2px dashed gray' : '2px solid black',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: 50,
    backgroundColor: 'transparent',
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-white shadow-md border-b border-gray-300 z-10">
        
        {/* Room Info */}
        <div className="text-sm text-gray-600 mb-2 md:mb-0">
          Room ID: <span className="text-green-600 font-semibold">'{roomId}'</span> | User:{' '}
          <span className="text-blue-600 font-semibold">{username}</span>
        </div>
  
        {/* Color Picker & Eraser */}
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300"
            disabled={isEraser}
          />
          <button
            onClick={toggleEraser}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              isEraser
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {isEraser ? 'E' : 'E'}
          </button>
        </div>
  
        {/* Brush Size Slider */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Brush Size</label>
          <input
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="cursor-pointer"
          />
          <span className="text-sm w-6 text-center text-gray-700">{lineWidth}</span>
        </div>
  
        {/* Undo/Redo & Users */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow text-sm font-medium"
          >
            Undo
          </button>
          <button
            onClick={redo}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md shadow text-sm font-medium"
          >
            Redo
          </button>
  
          {/* Users Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUsers((prev) => !prev)}
              className="bg-gray-800 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-700 transition shadow-sm"
            >
              Users
            </button>
            {showUsers && (
              <div className="absolute right-0 mt-2 w-60 max-h-64 overflow-y-auto p-3 bg-white border border-gray-300 rounded-xl shadow-xl z-50 transition-all duration-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Users in Room</h3>
                <ul className="text-sm space-y-1">
                  {users.map((user, idx) => (
                    <li
                      key={idx}
                      className={`px-2 py-1 rounded ${
                        user === username
                          ? 'font-bold text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-100'
                      } transition`}
                    >
                      {user}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
  
          {/* Leave Room Button */}
          <button
            onClick={() => navigate('/whiteboard-login')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow"
          >
            Leave Room
          </button>
        </div>
      </div>
  
      {/* Canvas Section */}
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="relative w-full h-full max-w-[96%] max-h-[90%] bg-white rounded-lg shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            id="whiteboard"
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div ref={indicatorRef} style={brushStyle} />
        </div>
      </div>
    </div>
  );
  
};

export default WhiteBoard;