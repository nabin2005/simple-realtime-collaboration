import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const CodeEditor = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || '';
  const navigate = useNavigate();

  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [javascriptCode, setJavascriptCode] = useState('');
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3000');
      console.log('Socket connected:', socketRef.current.connected);
    }
    const socket = socketRef.current;

    if (roomId && username) {
      console.log('Joining room:', roomId, 'as', username);
      socket.emit('joinRoom', roomId, username);

      socket.on('codeChange', ({ newHtmlCode, newCssCode, newJavascriptCode, sender }) => {
        if (sender !== username) {
          if (newHtmlCode !== undefined) setHtmlCode(newHtmlCode);
          if (newCssCode !== undefined) setCssCode(newCssCode);
          if (newJavascriptCode !== undefined) setJavascriptCode(newJavascriptCode);
        }
      });

      socket.on('roomUsers', (userList) => {
        setUsers(userList);
      });

      return () => {
        socket.off('codeChange');
        socket.off('roomUsers');
        socket.emit('leaveRoom', roomId, username);
      };
    }
  }, [roomId, username]);

  const handleCodeChange = (newHtmlCode, newCssCode, newJavascriptCode) => {
    if (newHtmlCode !== undefined) setHtmlCode(newHtmlCode);
    if (newCssCode !== undefined) setCssCode(newCssCode);
    if (newJavascriptCode !== undefined) setJavascriptCode(newJavascriptCode);

    if (socketRef.current) {
      socketRef.current.emit('codeChange', {
        newHtmlCode,
        newCssCode,
        newJavascriptCode,
        roomId,
        sender: username,
      });
    }
  };

  const handleKeyDown = (e, setValue) => {
    const openCloseMap = {
      '(': ')',
      '{': '}',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`',
      '<': '></>',
    };
  
    const closingChar = openCloseMap[e.key];
    if (closingChar) {
      e.preventDefault();
      const textarea = e.target;
      const { selectionStart, selectionEnd, value } = textarea;
  
      const newValue =
        value.substring(0, selectionStart) +
        e.key +
        closingChar +
        value.substring(selectionEnd);
  
      setValue(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    }
  };
  

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Code Editor</h1>
        <button
          onClick={() => navigate('/code-editor-login')}
          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded text-sm font-medium shadow"
        >
          Leave Room
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">
          Room ID: <span className="text-green-400 font-semibold">'{roomId}'</span> | User:{' '}
          <span className="text-blue-400 font-semibold">{username}</span>
        </p>

        <div className="relative">
          <button
            onClick={() => setShowUsers((prev) => !prev)}
            className="bg-[#2a2a2a] border border-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#3c3c3c] transition duration-150 ease-in-out shadow-sm"
          >
            Users
          </button>

          {showUsers && (
            <div className="absolute right-0 mt-2 bg-[#252525] border border-gray-700 rounded-xl w-60 max-h-64 overflow-y-auto p-3 z-50 shadow-2xl transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <h3 className="text-sm font-semibold text-white mb-2">Users in Room</h3>
              <ul className="text-sm space-y-1">
                {users.map((user, idx) => (
                  <li
                    key={idx}
                    className={`${
                      user === username ? 'font-bold text-blue-400' : 'text-gray-300'
                    } hover:text-white transition`}
                  >
                    {user}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        {/* Code Editor Panels */}
        <div className="space-y-6">
          {[
            { label: 'HTML', value: htmlCode, onChange: (val) => handleCodeChange(val, cssCode, javascriptCode) },
            { label: 'CSS', value: cssCode, onChange: (val) => handleCodeChange(htmlCode, val, javascriptCode) },
            { label: 'JavaScript', value: javascriptCode, onChange: (val) => handleCodeChange(htmlCode, cssCode, val) },
          ].map(({ label, value, onChange }, i) => (
            <div key={i}>
              <label className="block text-sm mb-1 font-medium text-gray-300">{label}</label>
              <textarea
                className="w-full h-40 resize-none bg-[#1f1f1f] border border-gray-700 rounded-lg 
                px-4 py-3 font-mono text-sm text-gray-200 focus:outline-none focus:ring-2
                 focus:ring-blue-500 transition duration-150 ease-in-out scrollbar-thin 
                 scrollbar-thumb-gray-600 scrollbar-track-gray-800 shadow-md"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, onChange)}
              />
            </div>
          ))}
        </div>

        {/* Live Output */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-white">Live Output</h2>
          <iframe
            className="w-full h-[550px] rounded-lg border border-gray-700 bg-white shadow-lg"
            srcDoc={`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${cssCode}</style></head><body>${htmlCode}<script>${javascriptCode}</script></body></html>`}
            title="Live Output"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
