import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const ChatRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || '';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const socket = io('http://localhost:3000');

  useEffect(() => {
    if (roomId && username) {
      socket.emit('joinRoom', roomId, username);

      socket.on('userJoined', (joinedUser) => {
        setMessages((prev) => [
          ...prev,
          { username: 'System', text: `${joinedUser} has joined the room.` },
        ]);
      });

      socket.on('message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('roomUsers', (userList) => {
        setUsers(userList);
      });

      return () => {
        socket.off('userJoined');
        socket.off('message');
        socket.off('roomUsers');
        socket.emit('leaveRoom', roomId, username);
      };
    }
  }, [roomId, username]);

  const sendMessage = (msg) => {
    if (msg.trim()) {
      socket.emit('message', { roomId, username, text: msg });
      setMessage('');
    }
  };

  const leaveRoom = () => {
    socket.emit('leaveRoom', roomId, username);
    navigate('/chat-login');
  };

  return (
    <div className='bg-[#1e1e1e]'>
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen bg-[#1e1e1e] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Chat Room</h2>
        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold shadow"
        >
          Leave Room
        </button>
      </div>

      {/* Room Info */}
      <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
        <span>
          Room ID: <span className="text-green-400 font-semibold">'{roomId}'</span> | User:{' '}
          <span className="text-blue-400 font-semibold">{username}</span>
        </span>

        <div className="relative">
          <button
            onClick={() => setShowUsers((prev) => !prev)}
            className="bg-[#2a2a2a] border border-gray-700 px-3 py-1 rounded text-sm hover:bg-[#3c3c3c] transition"
          >
            Users
          </button>

          {showUsers && (
            <div className="absolute right-0 mt-2 bg-[#2f2f2f] border border-gray-700 rounded-lg w-60 max-h-64 overflow-y-auto p-3 z-50 shadow-2xl scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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

      {/* Chat Window */}
      <div className="flex flex-col bg-[#2b2b2b] rounded-lg border border-gray-700 flex-grow overflow-hidden shadow-xl">
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <span className={`font-bold ${msg.username === 'System' ? 'text-yellow-400' : 'text-blue-400'}`}>
                {msg.username}:
              </span>{' '}
              <span className="text-gray-200">{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex border-t border-gray-600 bg-[#242424] p-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(message)}
            className="flex-1 px-4 py-2 rounded-l bg-[#1f1f1f] text-white focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            onClick={() => sendMessage(message)}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-r text-white font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ChatRoom;
