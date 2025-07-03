import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const FileTransfer = () => {
  const [myId, setMyId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [receivedFile, setReceivedFile] = useState(null);
  const fileInputRef = useRef();
  const socket = io("http://localhost:3000");

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("receive-file", ({ from, file }) => {
      const blob = new Blob([new Uint8Array(file.buffer)]);
      const url = URL.createObjectURL(blob);
      setReceivedFile({ name: file.name, url, from, file });
    });

    return () => {
      socket.off("receive-file");
    };
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSendFile = () => {
    if (!selectedFile || !targetId) return alert("Please select a file and enter receiver's ID");

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      socket.emit("send-file-to", {
        targetId,
        file: {
          name: selectedFile.name,
          buffer: arrayBuffer,
          type: selectedFile.type,
          size: selectedFile.size
        },
      });
      alert(`File "${selectedFile.name}" sent to ${targetId}`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">File Transfer</h2>

        <div className="mb-4">
          <p className="text-gray-700">Your ID:</p>
          <div className="bg-gray-200 px-3 py-2 rounded text-sm font-mono text-gray-800">
            {myId}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Receiver's Socket ID</label>
          <input
            type="text"
            placeholder="Enter Receiver's ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Choose File</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded bg-white"
          />
        </div>

        <button
          onClick={handleSendFile}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition duration-200"
        >
          Send File
        </button>

        {receivedFile && (
          <div className="mt-6 bg-green-100 border border-green-300 rounded p-4">
            <p className="text-green-800 font-medium mb-2">File Received from <code className="text-sm">{receivedFile.from}</code></p>
            <div className="text-gray-800">
              <p className="font-semibold">{receivedFile.name}</p>
              <p className="text-sm text-gray-600 mb-1">
                Size: {(receivedFile.file?.size / 1024).toFixed(2)} KB
              </p>
              <a
                href={receivedFile.url}
                download={receivedFile.name}
                className="text-blue-600 hover:underline"
              >
                Download File
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTransfer;
