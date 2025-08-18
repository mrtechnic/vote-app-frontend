import { useEffect, useState } from 'react';
import { getRoom, getLiveTallies, vote } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import type { Room, User } from '../types';

export const useRoom = (
  roomId: string,
  user?: User | null
) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [liveTallies, setLiveTallies] = useState<number[]>([]);
  const [showLiveTallies, setShowLiveTallies] = useState(false);
  const { socket, joinRoom, leaveRoom } = useSocket();

  const loadRoom = async () => {
    try {
      const result = await getRoom(roomId);
      console.log('Loaded room data:', result.room);
      setRoom(result.room);

  

      if (user && result.room.creatorEmail === user.email && !result.room.isExpired) {
        try {
          const talliesResult = await getLiveTallies(roomId);
          setLiveTallies(talliesResult.tallies);
          setShowLiveTallies(true);
        } catch (err) {
          console.warn('Cannot access tallies');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleVote = async (optionIndex: number, phoneNumber?: string) => {
  if (!room || voting || optionIndex >= room.options.length || optionIndex < 0)
    return;

  const selectedOption = room.options[optionIndex];
  if (!selectedOption?.id) {
    setError("Invalid option selected");
    return;
  }

  setVoting(true);
  try {
    await vote(roomId, selectedOption.id, phoneNumber);
    setHasVoted(true);

    // No need to reload room info since we'll get real-time updates
    // The socket will handle updating the UI automatically

    // Fetch fresh tallies if voting is still open and user is creator
    if (!room.isExpired && user && room.creatorEmail === user.email) {
      try {
        const talliesResult = await getLiveTallies(roomId);
        setLiveTallies(talliesResult.tallies);
        setShowLiveTallies(true);
      } catch (err) {
        console.warn("Could not refresh tallies");
      }
    }
  } catch (err: any) {
    if (err.message.includes("already voted")) {
      setHasVoted(true);
    }
    setError(err.message);
  } finally {
    setVoting(false);
  }
};


  // Listen for real-time vote updates
  useEffect(() => {
    if (!socket) return;

    const handleVoteUpdate = (data: {
      roomId: string;
      tallies: number[];
      totalVotes: number;
      optionId: string;
      voterCount: number;
    }) => {
      if (data.roomId === roomId) {
        console.log('Real-time vote update received:', data);
        setLiveTallies(data.tallies);
        setShowLiveTallies(true);
        
        // Update room data if available
        if (room) {
          setRoom(prevRoom => {
            if (!prevRoom) return prevRoom;
            return {
              ...prevRoom,
              options: prevRoom.options.map((option, index) => ({
                ...option,
                votes: data.tallies[index] || 0
              })),
              totalVotes: data.totalVotes
            };
          });
        }

        // Show notification for new votes (but not for the current user's own vote)
        if (user && room && room.creatorEmail === user.email) {
          toast.success(`New vote received! Total votes: ${data.totalVotes}`, {
            duration: 3000,
            position: 'top-right',
          });
        }
      }
    };

    socket.on('vote-updated', handleVoteUpdate);

    return () => {
      socket.off('vote-updated', handleVoteUpdate);
    };
  }, [socket, roomId, room]);

  // Join room for real-time updates
  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      
      return () => {
        leaveRoom(roomId);
      };
    }
  }, [roomId, joinRoom, leaveRoom]);

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  return {
    room,
    loading,
    error,
    hasVoted,
    voting,
    liveTallies,
    showLiveTallies,
    handleVote,
    reloadRoom: loadRoom
  };
};
