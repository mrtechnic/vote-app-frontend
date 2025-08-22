import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_DECISION_VOTING_API_URL || 'https://vote-app-backend-s9a0.onrender.com/api';

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const {
      response: { status },
    } = error;

    if (status === 401) return await handleLogout();

    return Promise.reject(error);
  }
);

export async function handleLogout() {
  return await logout().then(() => {
    window.location.assign(
      '/login'
    );
  });
}

export const logout = async () => {
  try {
    const response = await api.get('/auth/logOut');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

export const signin = async (email: string, password: string) => {
  try {
      const response = await api.post('/auth/login', { email, password });
  return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong'};
  }

};

export const signup = async (email: string, password: string, name: string) => {
  try {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

export const createRoom = async (roomData: any) => {
  const response = await api.post('/rooms', roomData, {
  });
  return response.data;
};

export const getRoom = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

export const vote = async (
  roomId: string,
  optionId: string,
  phoneNumber?: string
) => {
  const response = await api.post(
    `/rooms/${roomId}/vote`,
    { optionId, phoneNumber },
  );
  return response.data;
};

export const getMyRooms = async () => {
  const response = await api.get('/rooms/my-rooms', {
  });
  return response.data;
};

export const getLiveTallies = async (roomId: string) => {




  const response = await api.get(`/rooms/${roomId}/tallies`, {
  });
  return response.data;
};

export const deleteRoom = async (roomId: string) => {
  const response = await api.delete(`/rooms/${roomId}`, {
  });
  return response.data;
};

// Accreditation system API functions
export const requestOTP = async (roomId: string, phoneNumber: string) => {
  const response = await api.post(`/rooms/${roomId}/request-otp`, {
    phoneNumber
  });
  return response.data;
};

export const verifyOTP = async (roomId: string, phoneNumber: string, otp: string) => {
  const response = await api.post(`/rooms/${roomId}/verify-otp`, {
    phoneNumber,
    otp
  });
  return response.data;
};

export const addAccreditedVoters = async (roomId: string, voters: any[]) => {
  const response = await api.post(`/rooms/${roomId}/add-accredited-voters`, {
    voters
  }, {
  });
  return response.data;
};

export const getAccreditedVoters = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}/accredited-voters`, {
  });
  return response.data;
};

// Password reset API functions
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to send password reset email' };
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

export default api


