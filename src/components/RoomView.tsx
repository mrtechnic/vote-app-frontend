import React, { useContext, useState } from "react";
import { XCircle, CheckCircle, Vote, Wifi, WifiOff, BarChart3, X, Users, Calendar, TrendingUp, Shield } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useRoom } from "../hooks/UseRoom";
import OTPVerification from "./OTPVerification";
import AccreditedVotersManager from "./AccreditedVotersManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RoomView: React.FC<{ roomId: string; onBack: () => void }> = ({
  roomId,
  onBack,
}) => {
  const authContext = useContext(AuthContext);
  const token = authContext?.token;
  const user = authContext?.user;
  const { isConnected } = useSocket();
  const [showChartModal, setShowChartModal] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showVotersManager, setShowVotersManager] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
  const [verifiedVoterName, setVerifiedVoterName] = useState<string | null>(null);

  const handleVerificationSuccess = (phoneNumber: string, voterName: string) => {
    setVerifiedPhoneNumber(phoneNumber);
    setVerifiedVoterName(voterName);
    setShowOTPVerification(false);
  };

  const handleBackFromVerification = () => {
    setShowOTPVerification(false);
  };

  const {
    room,
    loading,
    error,
    voting,
    hasVoted,
    showLiveTallies,
    handleVote,
  } = useRoom(roomId, user);

  // Note: OTP verification is now triggered by the blocking overlay button
  // instead of automatically showing the modal

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading room...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Room</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!room) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  const showResults = room.isExpired || showLiveTallies;

  // Use the actual vote counts from room.options for the chart
  const chartData = room.options.map((option) => ({
    name: option.text,
    votes: option.votes || 0,
  }));

  console.log("Chart Data:", chartData);
  console.log("Room options:", room.options);
  console.log("Room total votes:", room.totalVotes);

  const colors = [
    "#7c3aed", // Purple-600
    "#8b5cf6", // Purple-500
    "#6d28d9", // Purple-700
    "#a855f7", // Purple-400
    "#9333ea", // Purple-600
    "#7c2d12", // Purple-800
  ];

  // Show blocking overlay if verification is required but not completed
  const showBlockingOverlay = room?.requireAccreditation && !user && !verifiedPhoneNumber;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Blocking overlay for non-authenticated users who need verification */}
        {showBlockingOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
              <div className="mb-4">
                <Shield className="text-blue-600 mx-auto" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Required</h3>
              <p className="text-gray-600 mb-4">
                This voting room requires phone number verification before you can vote.
              </p>
                             <button
                 onClick={() => setShowOTPVerification(true)}
                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
               >
                 Start Verification
               </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <Wifi size={12} />
                    Live
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                    <WifiOff size={12} />
                    Offline
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {room.isExpired ? (
                  <div className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                    <XCircle size={14} />
                    Voting Ended
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle size={14} />
                    Active
                  </div>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{room.title}</h1>
          <p className="text-gray-600 mb-6">{room.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-blue-600 font-medium">Deadline</p>
                <p className="text-sm text-gray-900">{formatDate(room.deadline)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Vote className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-green-600 font-medium">Total Votes</p>
                <p className="text-sm text-gray-900">{room.totalVotes}</p>
              </div>
            </div>
            {user && room.creatorEmail === user.email && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Users className="text-purple-600" size={20} />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Unique Voters</p>
                  <p className="text-sm text-gray-900">{room.voters?.length || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Accreditation Status */}
          {room.requireAccreditation && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="text-yellow-600" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">Accredited Voting Required</h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    This room requires phone number verification before voting
                  </p>
                </div>
                {user && room.creatorEmail === user.email && (
                  <button
                    onClick={() => setShowVotersManager(true)}
                    className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Manage Voters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Verified Voter Status */}
          {verifiedPhoneNumber && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Verified Voter</h3>
                  <p className="text-xs text-green-700">
                    {verifiedVoterName} ({verifiedPhoneNumber})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voting Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {room.isExpired ? "Final Results" : "Cast Your Vote"}
            </h2>
            <div className="flex items-center gap-3">
              {room.requireAccreditation && !verifiedPhoneNumber && !user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                  <Shield size={14} />
                  Verification Required
                </div>
              )}
              {chartData.length > 0 && (
                                 <button
                   onClick={() => setShowChartModal(true)}
                   className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
                 >
                   <BarChart3 size={16} />
                   View Chart
                 </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {room.options.map((option, index) => {
              const voteCount = option.votes || 0;
              const percentage = room.totalVotes > 0 ? (voteCount / room.totalVotes) * 100 : 0;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{option.text}</h3>
                      {showResults && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Vote size={14} />
                            {voteCount} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {showResults && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                             <div
                         className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                  )}

                  {!room.isExpired && !hasVoted && (
                                         <button
                       onClick={() => handleVote(index, verifiedPhoneNumber || undefined)}
                       disabled={voting || (room.requireAccreditation && !verifiedPhoneNumber)}
                       className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                       aria-label={`Vote for ${option.text}`}
                     >
                       {voting ? "Voting..." : room.requireAccreditation && !verifiedPhoneNumber ? "Verification Required" : "Vote"}
                     </button>
                  )}
                </div>
              );
            })}
          </div>

          {hasVoted && !room.isExpired && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <p className="text-green-700 font-medium">Thank you for voting!</p>
                  <p className="text-green-600 text-sm">Your vote has been recorded successfully.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Modal */}
        {showChartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-3 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center gap-2">
                   <BarChart3 className="text-purple-600" size={16} />
                   <h3 className="text-base font-semibold text-gray-900">Voting Results</h3>
                 </div>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 3, right: 3, left: 3, bottom: 3 }}>
                    <XAxis 
                      dataKey="name" 
                      fontSize={10}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      fontSize={10}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '10px'
                      }}
                    />
                    <Bar dataKey="votes" radius={[2, 2, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  Total votes: {room.totalVotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOTPVerification && (
          <OTPVerification
            roomId={roomId}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBackFromVerification}
            isModal={true}
          />
        )}

        {/* Accredited Voters Manager Modal */}
        {showVotersManager && user && token && (
          <AccreditedVotersManager
            roomId={roomId}
            token={token}
            onClose={() => setShowVotersManager(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RoomView;
