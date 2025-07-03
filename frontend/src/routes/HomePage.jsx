import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import CodeIcon from '../assets/code.png';
import BoardIcon from '../assets/board.png';
import FileTransferIcon from '../assets/filetransfer.png';
import ChatIcon from '../assets/chat.png';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-white p-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm mb-4">Real-time Collaboration</h1>
        <p className="text-lg text-gray-600">Select a tool to start collaborating in real-time</p>
      </div>

      <div className="flex justify-center">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        <Card
          title="Code Editor"
          description="Collaborate and write code in real-time."
          icon={CodeIcon}
          onClick={() => navigate('/code-editor-login')}
          />
        <Card
          title="File Transfer"
          description="Easily share files with others in real-time."
          icon={FileTransferIcon}
          onClick={() => navigate('/filetransfer')}
          />
        <Card
          title="Whiteboard"
          description="Draw, sketch, and brainstorm ideas together."
          icon={BoardIcon}
          onClick={() => navigate('/whiteboard-login')}
          />
        <Card
          title="Chat App"
          description="Communicate instantly with your team."
          icon={ChatIcon}
          onClick={() => navigate('/chat-login')}
          />
      </div>
    </div>
    </div>
  );
};

export default HomePage;
