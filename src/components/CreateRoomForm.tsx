import {  useState } from "react";

import { Plus, XCircle, Shield } from "lucide-react";
import { createRoom } from "../utils/api";


const CreateRoomForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requireAccreditation, setRequireAccreditation] = useState(false);
  const [accreditedVoters, setAccreditedVoters] = useState<{ name: string; phoneNumber: string }[]>([
    { name: '', phoneNumber: '' }
  ]);

  

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        throw new Error('At least 2 options are required');
      }
      
      if (requireAccreditation) {
        const validVoters = accreditedVoters.filter(voter => 
          voter.name.trim() && voter.phoneNumber.trim()
        );
        if (validVoters.length === 0) {
          throw new Error('At least one accredited voter is required when accreditation is enabled');
        }
      }
      
      await createRoom({
        title: title.trim(),
        description: description.trim(),
        options: validOptions,
        deadline,
        requireAccreditation,
        accreditedVoters: requireAccreditation ? accreditedVoters.filter(voter => 
          voter.name.trim() && voter.phoneNumber.trim()
        ) : []
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 1);
  const minDateString = minDate.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create Situation Room</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidates (2-5)
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder='Enter Candidate'
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-md"
              >
                <Plus size={16} />
                Add Candidate
              </button>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voting Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={minDateString}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Shield size={16} />
              Accreditation Settings
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="requireAccreditation"
                checked={requireAccreditation}
                onChange={(e) => setRequireAccreditation(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="requireAccreditation" className="text-sm text-gray-700">
                Require phone number verification for voting
              </label>
            </div>
            {requireAccreditation && (
              <p className="text-xs text-gray-500 mt-1">
                Voters will need to enter their phone number and verify with OTP before voting
              </p>
            )}
          </div>
          
          {requireAccreditation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accredited Voters
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add the phone numbers and names of voters who can participate
              </p>
              {accreditedVoters.map((voter, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Voter name"
                    value={voter.name}
                    onChange={(e) => {
                      const newVoters = [...accreditedVoters];
                      newVoters[index].name = e.target.value;
                      setAccreditedVoters(newVoters);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={voter.phoneNumber}
                    onChange={(e) => {
                      const newVoters = [...accreditedVoters];
                      newVoters[index].phoneNumber = e.target.value;
                      setAccreditedVoters(newVoters);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {accreditedVoters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAccreditedVoters(accreditedVoters.filter((_, i) => i !== index))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAccreditedVoters([...accreditedVoters, { name: '', phoneNumber: '' }])}
                className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-md text-sm"
              >
                <Plus size={16} />
                Add Voter
              </button>
            </div>
          )}
         
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomForm;