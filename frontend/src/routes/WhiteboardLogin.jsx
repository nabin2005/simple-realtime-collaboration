import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WhiteboardLogin = () => {

    const [roomID, setRoomID] = useState('')
    const [username, setUsername] = useState('')
    const navigate = useNavigate()

    const joinRoom = () => {
        if (roomID && username) {
            navigate(`/board/${roomID}`, { state: { username } })
        } else {
            alert('Please enter a room ID and username')
        }
    }

    const generateRoomID = () => {
        const randomRoomID = Math.random().toString(36).substring(2, 12)
        return randomRoomID
    }

    return (
        <div>
            <div className='flex flex-col items-center justify-center h-screen'>
                <h1 className='text-3xl font-bold mb-4'>Join a Room</h1>
                <div className='flex flex-col space-y-4'>
                    <input
                        placeholder='room id'
                        onChange={(e) => setRoomID(e.target.value)}
                        value={roomID}
                        className='border border-gray-300 rounded p-2'
                    />
                    <input
                        placeholder='username'
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        className='border border-gray-300 rounded p-2'
                    />
                </div>

                <div className='flex flex-col space-y-4 mt-4'>
                    <button
                        onClick={joinRoom}
                        className='mt-4 bg-blue-500 text-white py-2 px-4 rounded'
                    >
                        Join
                    </button>
                    <button
                        onClick={() => setRoomID(generateRoomID())} 
                        className='mt-2 bg-gray-300 text-black py-2 px-4 rounded'
                    >
                        New Room ID
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WhiteboardLogin
