import { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import RoomView from '../../components/RoomView'
import RoomCard from "../../components/RoomCard";
import CreateRoomForm from "../../components/CreateRoomForm";
import { getMyRooms } from "../../utils/api";
import type { Room } from "../../types";
import { useSocket } from "../../contexts/SocketContext";



const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'room'>('dashboard');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const { socket, joinRoom, leaveRoom } = useSocket();
  const user = {} as any;



  const roomId = 'admin-dashboard-stream'

    useEffect(() => {

      joinRoom(roomId);
      
      return () => {
        leaveRoom(roomId);
      };
    },
   [ joinRoom, leaveRoom]);

  useEffect(() => {
  if (!socket) return;

  const handleVoteUpdate = (data: {
    roomId: string;
    tallies: number[];
    totalVotes: number;
    optionId: string;
    voterCount: number;
  }) => {
    console.log(data)
    // Filter/find the room that matches the incoming roomId
    const updatedRoom = rooms.find((room) => room.id === data.roomId);

    if (!updatedRoom) return; // If no room matches, do nothing

    // Example: update that room’s tallies and votes
    const newRooms = rooms.map((room) =>
      room.id === data.roomId
        ? {
            ...room,
            tallies: data.tallies,
            totalVotes: data.totalVotes,
            voterCount: data.voterCount,
          }
        : room
    );

    setRooms(newRooms);
  };

  socket.on("vote-updated", handleVoteUpdate);

  return () => {
    socket.off("vote-updated", handleVoteUpdate);
  };
}, [socket, rooms, setRooms]);



  const loadRooms = async () => {
   
    
    setLoading(true);
    try {
      const result = await getMyRooms();
      setRooms(result.rooms);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleViewRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('room');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    loadRooms(); // Refresh rooms when returning
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  if (currentView === 'room') {
    return <RoomView roomId={currentRoomId} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Situation Rooms</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus size={20} />
          Create Room
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading your rooms...</div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-600 mb-4">Create your first Situation room to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Create Your First Room
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onView={handleViewRoom}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      {showCreateForm && (
        <CreateRoomForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            loadRooms();
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;