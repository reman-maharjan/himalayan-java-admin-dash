const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface User {
  id: number;
  full_name: string;
  email: string | null;
  phone_number: string;
  profile_picture: string | null;
  redeem_points: number;
}

interface LoginResponse {
  detail: string;
  user?: User;
  otp_required?: boolean;
}

interface VerifyOtpResponse {
  token: string;
  user: User;
}

interface ErrorResponse {
  detail: string;
}

export const authService = {
  async login(phoneNumber: string): Promise<{ success: boolean; data?: LoginResponse; error?: ErrorResponse }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: { detail: data.detail || 'Failed to send OTP' } 
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: { detail: 'Network error. Please try again.' } 
      };
    }
  },

  async verifyOtp(phoneNumber: string, otp: string): Promise<{ 
    success: boolean; 
    data?: VerifyOtpResponse; 
    error?: ErrorResponse 
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          otp 
        }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return { 
          success: false, 
          error: { 
            detail: data.detail || 
                   data.message || 
                   (typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Invalid OTP') || 
                   'Invalid OTP' 
          } 
        };
      }

      console.log('OTP verification response:', data);
      
      // Store the token in localStorage if it exists in the response
      if (data.token) {
        console.log('Storing auth token in localStorage');
        localStorage.setItem('authToken', data.token);
      } else if (data.access) {
        // Handle case where the token is named 'access' instead of 'token'
        console.log('Storing access token in localStorage');
        localStorage.setItem('authToken', data.access);
      } else {
        console.warn('No token found in the OTP verification response');
        return {
          success: false,
          error: { detail: 'Authentication token not found in the response' }
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: { 
          detail: error instanceof Error ? error.message : 'Network error. Please try again.' 
        } 
      };
    }
  },

  async register(userData: {
    full_name: string;
    phone_number: string;
    email?: string;
    profile_picture?: File;
  }): Promise<{ success: boolean; data?: User; error?: ErrorResponse }> {
    try {
      const formData = new FormData();
      formData.append('full_name', userData.full_name);
      formData.append('phone_number', userData.phone_number);
      if (userData.email) {
        formData.append('email', userData.email);
      }
      if (userData.profile_picture) {
        formData.append('profile_picture', userData.profile_picture);
      }

      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: { 
            detail: errorData.detail || 
                   errorData.message || 
                   Object.values(errorData).flat().join(' ') || 
                   'Registration failed' 
          } 
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: { detail: 'Network error. Please try again.' } 
      };
    }
  },

  // Add this method to get the current user's profile
  async getProfile(): Promise<{ success: boolean; data?: User; error?: ErrorResponse }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { 
        success: false, 
        error: { detail: 'No authentication token found' } 
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: { detail: data.detail || 'Failed to fetch profile' } 
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { 
        success: false, 
        error: { detail: 'Network error. Please try again.' } 
      };
    }
  },

  // Helper methods
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },

  logout(): void {
    localStorage.removeItem('authToken');
    // Redirect to login page
    window.location.href = '/login';
  },
};