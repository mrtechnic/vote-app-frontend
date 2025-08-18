import React, { useState } from 'react';
import { Phone, Lock, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { requestOTP, verifyOTP } from '../utils/api';
import toast from 'react-hot-toast';

interface OTPVerificationProps {
  roomId: string;
  onVerificationSuccess: (phoneNumber: string, voterName: string) => void;
  onBack: () => void;
  isModal?: boolean;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  roomId,
  onVerificationSuccess,
  onBack,
  isModal = false
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [_, setOtpRequested] = useState(false);

  const handleRequestOTP = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await requestOTP(roomId, phoneNumber.trim());
      setOtpRequested(true);
      setStep('otp');
      toast.success('OTP sent successfully! Check the server console for the code.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(roomId, phoneNumber.trim(), otp.trim());
      toast.success('OTP verified successfully!');
      onVerificationSuccess(phoneNumber.trim(), result.voterName);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await requestOTP(roomId, phoneNumber.trim());
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {!isModal && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Voter Verification</h2>
            <p className="text-sm text-gray-600">Enter your phone number to vote</p>
          </div>
        </div>
        {isModal && (
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the phone number you were registered with
            </p>
          </div>

          <button
            onClick={handleRequestOTP}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {loading ? 'Sending OTP...' : 'Request OTP'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="text-green-500" size={20} />
              <span className="text-sm text-green-600 font-medium">OTP Sent</span>
            </div>
            <p className="text-sm text-gray-600">
              We've sent a 6-digit OTP code to <strong>{phoneNumber}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Check the server console for the OTP code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export default OTPVerification; 