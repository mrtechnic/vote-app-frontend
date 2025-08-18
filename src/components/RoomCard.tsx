import { XCircle, CheckCircle, Clock, Vote, Eye, Share2, Trash2, AlertTriangle, Users, Trophy, TrendingUp } from "lucide-react";
import { useState } from "react";
import { deleteRoom } from "../utils/api";
import toast from "react-hot-toast";
import type { Room } from "../types";

const RoomCard: React.FC<{ 
  room: Room; 
  onView: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
}> = ({ room, onView, onDelete }) => {

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate leaderboard data
  const getLeaderboard = () => {
    if (!room.options || room.options.length === 0) return [];
    
    const optionsWithVotes = room.options.map(option => ({
      text: option.text,
      votes: option.votes || 0,
      percentage: room.totalVotes > 0 ? ((option.votes || 0) / room.totalVotes * 100).toFixed(1) : '0'
    }));
    
    return optionsWithVotes
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);
  };

  const leaderboard = getLeaderboard();

  const copyInviteUrl = () => {
    const url = `${window.location.origin}/room/${room.roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite URL copied to clipboard!');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
  

    try {
      await deleteRoom(room.roomId);
      toast.success('Room deleted successfully!');
      onDelete?.(room.roomId);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      toast.error(error.response?.data?.error || 'Failed to delete room');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Header with status */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {room.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {room.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-3">
              {room.isExpired ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                  <XCircle size={12} />
                  Ended
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle size={12} />
                  Active
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{formatDate(room.deadline)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Vote size={14} />
                <span>{room.totalVotes} Total Votes</span>
              </div>
              {room.voters && (
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{room.voters.length} voters</span>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={14} className="text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Election Result</span>
                </div>
                <div className="space-y-2">
                  {leaderboard.map((option, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-[120px]">
                          {option.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-green-600" />
                          <span className="text-xs font-medium text-gray-600">
                            {option.votes} votes
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({option.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {room.options.length > 3 && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    +{room.options.length - 3} more candidates
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5">
          <div className="flex gap-2">
            <button
              onClick={() => onView(room.roomId)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={copyInviteUrl}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Share2 size={14} />
              Share
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Delete Room</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{room.title}</strong>"? 
              This action cannot be undone and all voting data will be permanently lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomCard;