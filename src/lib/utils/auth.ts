// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      detail?: string;
      [key: string]: unknown;
    };
  };
}

// Handle API errors
export const handleApiError = (error: unknown) => async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: response.statusText || 'An error occurred'
    }));
    
    if (response.status === 401) {
      // Handle unauthorized error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Optionally redirect to login
        window.location.href = '/login';
      }
    }
    
    const error = new Error(errorData.detail || 'API request failed');
    (error as ApiError).response = {
      status: response.status,
      data: errorData
    };
    throw error;
  }
  return response;
};
