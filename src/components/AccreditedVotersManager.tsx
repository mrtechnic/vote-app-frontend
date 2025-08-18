import React, { useState, useEffect } from 'react';
import { Users, Plus, X, User, CheckCircle, XCircle } from 'lucide-react';
import { addAccreditedVoters, getAccreditedVoters } from '../utils/api';
import toast from 'react-hot-toast';

interface AccreditedVoter {
  name: string;
  phoneNumber: string;
  hasVoted: boolean;
  otpVerified: boolean;
}

interface AccreditedVotersManagerProps {
  roomId: string;
  token: string;
  onClose: () => void;
}

const AccreditedVotersManager: React.FC<AccreditedVotersManagerProps> = ({
  roomId,
  onClose
}) => {
  const [voters, setVoters] = useState<AccreditedVoter[]>([]);
  const [loading, setLoading] = useState(false);
  const [newVoters, setNewVoters] = useState<{ name: string; phoneNumber: string }[]>([
    { name: '', phoneNumber: '' }
  ]);

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async () => {
    try {
      const result = await getAccreditedVoters(roomId);
      setVoters(result.voters);
    } catch (error: any) {
      toast.error('Failed to load accredited voters');
    }
  };

  const handleAddVoter = () => {
    setNewVoters([...newVoters, { name: '', phoneNumber: '' }]);
  };

  const handleRemoveVoter = (index: number) => {
    if (newVoters.length > 1) {
      setNewVoters(newVoters.filter((_, i) => i !== index));
    }
  };

  const handleVoterChange = (index: number, field: 'name' | 'phoneNumber', value: string) => {
    const updatedVoters = [...newVoters];
    updatedVoters[index][field] = value;
    setNewVoters(updatedVoters);
  };

  const handleSubmit = async () => {
    const validVoters = newVoters.filter(voter => 
      voter.name.trim() && voter.phoneNumber.trim()
    );

    if (validVoters.length === 0) {
      toast.error('Please add at least one voter');
      return;
    }

    setLoading(true);
    try {
      await addAccreditedVoters(roomId, validVoters);
      toast.success('Accredited voters added successfully!');
      setNewVoters([{ name: '', phoneNumber: '' }]);
      loadVoters();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add accredited voters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Accredited Voters</h3>
              <p className="text-sm text-gray-600">Add voters who can participate in this room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Existing Voters */}
        {voters.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Accredited Voters</h4>
            <div className="space-y-2">
              {voters.map((voter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{voter.name}</p>
                      <p className="text-xs text-gray-500">{voter.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {voter.hasVoted ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        <CheckCircle size={12} />
                        Voted
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                        <XCircle size={12} />
                        Pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Voters */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Voters</h4>
          <div className="space-y-3">
            {newVoters.map((voter, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Voter name"
                    value={voter.name}
                    onChange={(e) => handleVoterChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={voter.phoneNumber}
                    onChange={(e) => handleVoterChange(index, 'phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={() => handleRemoveVoter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddVoter}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-3"
          >
            <Plus size={16} />
            Add another voter
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Voters'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccreditedVotersManager; 