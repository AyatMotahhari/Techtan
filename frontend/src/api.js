// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Helper for making API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Use localStorage as fallback if API request fails
    if (method === 'GET') {
      const fallbackData = localStorage.getItem(endpoint);
      return fallbackData ? JSON.parse(fallbackData) : [];
    }
    
    throw error;
  }
}

// Team Members API
export const teamMembersApi = {
  getAll: async () => {
    try {
      const data = await apiRequest('teamMembers');
      // Cache in localStorage as fallback
      localStorage.setItem('teamMembers', JSON.stringify(data));
      return data;
    } catch (error) {
      // Fallback to localStorage
      const fallback = localStorage.getItem('teamMembers');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (teamMember) => {
    try {
      const result = await apiRequest('teamMembers', 'POST', teamMember);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify([...current, result]));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      const newMember = { ...teamMember, id: current.length > 0 ? Math.max(...current.map(m => m.id)) + 1 : 1 };
      localStorage.setItem('teamMembers', JSON.stringify([...current, newMember]));
      return newMember;
    }
  },
  
  update: async (id, teamMember) => {
    try {
      const result = await apiRequest(`teamMembers/${id}`, 'PUT', teamMember);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.map(m => m.id === id ? result : m)
      ));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.map(m => m.id === id ? teamMember : m)
      ));
      return teamMember;
    }
  },
  
  delete: async (id) => {
    try {
      await apiRequest(`teamMembers/${id}`, 'DELETE');
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.filter(m => m.id !== id)
      ));
      
      return true;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.filter(m => m.id !== id)
      ));
      return true;
    }
  }
};

// Projects API
export const projectsApi = {
  getAll: async () => {
    try {
      const data = await apiRequest('projects');
      // Cache in localStorage as fallback
      localStorage.setItem('projects', JSON.stringify(data));
      return data;
    } catch (error) {
      // Fallback to localStorage
      const fallback = localStorage.getItem('projects');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (project) => {
    try {
      const result = await apiRequest('projects', 'POST', project);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify([...current, result]));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      const newProject = { ...project, id: current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1 };
      localStorage.setItem('projects', JSON.stringify([...current, newProject]));
      return newProject;
    }
  },
  
  update: async (id, project) => {
    try {
      const result = await apiRequest(`projects/${id}`, 'PUT', project);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.map(p => p.id === id ? result : p)
      ));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.map(p => p.id === id ? project : p)
      ));
      return project;
    }
  },
  
  delete: async (id) => {
    try {
      await apiRequest(`projects/${id}`, 'DELETE');
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.filter(p => p.id !== id)
      ));
      
      return true;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.filter(p => p.id !== id)
      ));
      return true;
    }
  }
};

// Services API
export const servicesApi = {
  getAll: async () => {
    try {
      const data = await apiRequest('services');
      // Cache in localStorage as fallback
      localStorage.setItem('services', JSON.stringify(data));
      return data;
    } catch (error) {
      // Fallback to localStorage
      const fallback = localStorage.getItem('services');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (service) => {
    try {
      const result = await apiRequest('services', 'POST', service);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify([...current, result]));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      const newService = { ...service, id: current.length > 0 ? Math.max(...current.map(s => s.id)) + 1 : 1 };
      localStorage.setItem('services', JSON.stringify([...current, newService]));
      return newService;
    }
  },
  
  update: async (id, service) => {
    try {
      const result = await apiRequest(`services/${id}`, 'PUT', service);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.map(s => s.id === id ? result : s)
      ));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.map(s => s.id === id ? service : s)
      ));
      return service;
    }
  },
  
  delete: async (id) => {
    try {
      await apiRequest(`services/${id}`, 'DELETE');
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.filter(s => s.id !== id)
      ));
      
      return true;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.filter(s => s.id !== id)
      ));
      return true;
    }
  }
};

// Contact Submissions API
export const contactApi = {
  getAll: async () => {
    try {
      const data = await apiRequest('contactSubmissions');
      // Cache in localStorage as fallback
      localStorage.setItem('contactSubmissions', JSON.stringify(data));
      return data;
    } catch (error) {
      // Fallback to localStorage
      const fallback = localStorage.getItem('contactSubmissions');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (submission) => {
    try {
      const result = await apiRequest('contactSubmissions', 'POST', submission);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify([...current, result]));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      const newSubmission = { ...submission, id: current.length > 0 ? Math.max(...current.map(s => s.id)) + 1 : 1 };
      localStorage.setItem('contactSubmissions', JSON.stringify([...current, newSubmission]));
      return newSubmission;
    }
  },
  
  update: async (id, submission) => {
    try {
      const result = await apiRequest(`contactSubmissions/${id}`, 'PUT', submission);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? result : s)
      ));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? submission : s)
      ));
      return submission;
    }
  },
  
  delete: async (id) => {
    try {
      await apiRequest(`contactSubmissions/${id}`, 'DELETE');
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.filter(s => s.id !== id)
      ));
      
      return true;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.filter(s => s.id !== id)
      ));
      return true;
    }
  },
  
  markAsRead: async (id) => {
    try {
      // First get the submission
      const submission = await apiRequest(`contactSubmissions/${id}`, 'GET');
      
      // Update it as read
      const updated = { ...submission, isNew: false };
      const result = await apiRequest(`contactSubmissions/${id}`, 'PUT', updated);
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? result : s)
      ));
      
      return result;
    } catch (error) {
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? { ...s, isNew: false } : s)
      ));
      return { id, isNew: false };
    }
  }
}; 