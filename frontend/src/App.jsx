import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './routes/HomePage';
import ChatRoom from './routes/ChatRoom';
import RoomLogin from './components/ChatLogin';
import CodeEditor from './routes/CodeEditor';
import CodeEditorLogin from './routes/CodeEditorLogin';
import WhiteboardLogin from './routes/WhiteboardLogin';
import WhiteBoard from './routes/WhiteBoard';
import FileTransfer from './routes/FileTransfer';
import FileTransferLogin from './routes/FileTransferLogin';


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat-login" element={<RoomLogin />} />
      <Route path="/code-editor-login" element={<CodeEditorLogin />} />
      <Route path="/whiteboard-login" element={<WhiteboardLogin />} />
      <Route path="/room/:roomId" element={<ChatRoom />} />
      <Route path="/editor/:roomId" element={<CodeEditor />} />
      <Route path="/board/:roomId" element={<WhiteBoard />} />
      <Route path="/filetransfer" element={<FileTransfer />} />

      </Routes>
  );
}

export default App;
