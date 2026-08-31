// Mock API service for UtsavGifts CRM
// Fully offline-capable mock mode until backend endpoints are ready

const MOCK_DELAY = 300; // ms simulation delay

const getStoredUser = () => {
  const saved = localStorage.getItem('utsav_user');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {
    username: 'admin',
    name: 'Administrator',
    email: 'admin@utsavgifts.com',
    mobile: '+91 9876543210',
    role: 'Super Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser&backgroundColor=ffdfbf'
  };
};

const saveStoredUser = (user) => {
  localStorage.setItem('utsav_user', JSON.stringify(user));
};

export const loginUser = async ({ username, password }) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  if (!username || !password) {
    throw new Error('Please enter both username and password.');
  }

  // Accept admin credentials or any valid input for mock mode
  const currentUser = getStoredUser();
  const token = 'mock_jwt_token_' + Date.now();
  
  return {
    success: true,
    message: 'Login successful',
    token,
    UserInfo: {
      token,
      token_expires_at: new Date(Date.now() + 86400000).toISOString(),
      user: {
        username: username,
        name: currentUser.name || username,
        email: currentUser.email,
        mobile: currentUser.mobile,
        role: currentUser.role
      }
    }
  };
};

export const logoutUser = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { success: true, message: 'Logged out successfully' };
};

export const sendPasswordResetEmail = async ({ username, email }) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  if (!username || !email) {
    throw new Error('Please provide both username and email.');
  }

  return {
    success: true,
    message: `Password reset link sent to ${email}. Please check your inbox.`
  };
};

export const changeUserPassword = async ({ username, old_password, new_password }) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  if (!old_password || !new_password) {
    throw new Error('Please fill out all password fields.');
  }

  if (new_password.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  return {
    success: true,
    message: 'Password updated successfully.'
  };
};

export const checkPanelStatus = async () => {
  return {
    code: 200,
    success: true,
    version: { version_panel: '2.4.0' },
    company_detils: {
      company_name: 'UtsavGifts CRM',
      company_logo: 'logo.png',
      tagline: 'Making Every Moment Special'
    },
    image_url: []
  };
};

export const fetchPanelDotenv = async () => {
  return { appEnv: 'production', mockMode: true };
};

export const fetchProfile = async () => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  const user = getStoredUser();
  return {
    success: true,
    data: user
  };
};

export const updateProfile = async ({ mobile, email }) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  const currentUser = getStoredUser();
  const updatedUser = {
    ...currentUser,
    mobile: mobile || currentUser.mobile,
    email: email || currentUser.email
  };

  saveStoredUser(updatedUser);

  return {
    success: true,
    message: 'Profile updated successfully.',
    data: updatedUser
  };
};
