import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Function to test Firebase connectivity and provide detailed diagnostic info
export const testFirebaseConnection = async () => {
  const results = {
    browserOnline: navigator.onLine,
    firebaseReachable: false,
    firestoreRead: false,
    firestoreWrite: false,
    error: null,
    errorDetails: null,
    tests: {}
  };
  
  try {
    // Test 1: Check if the browser is online
    results.tests.browserStatus = {
      passed: navigator.onLine,
      detail: navigator.onLine ? 'Browser reports online' : 'Browser reports offline'
    };
    
    if (!navigator.onLine) {
      results.error = 'Browser is offline. Check your internet connection.';
      return results;
    }
    
    // Test 2: Try to reach Firebase domain
    try {
      const firebaseReachable = await fetch('https://firestore.googleapis.com/v1', { 
        method: 'HEAD',
        mode: 'no-cors', // This is needed for CORS issues
        cache: 'no-cache'
      });
      results.firebaseReachable = true;
      results.tests.firebaseReachable = {
        passed: true,
        detail: 'Firebase domain is reachable'
      };
    } catch (error) {
      results.tests.firebaseReachable = {
        passed: false,
        detail: `Firebase domain is unreachable: ${error.message}`
      };
      results.error = 'Cannot reach Firebase servers. There might be a network issue or firewall blocking access.';
      results.errorDetails = error.toString();
      return results;
    }
    
    // Test 3: Try to read a document from Firestore
    try {
      // Try to get a known document or collection listing
      const testReadRef = doc(db, '_connection_test', 'test_doc');
      await getDoc(testReadRef);
      results.firestoreRead = true;
      results.tests.firestoreRead = {
        passed: true,
        detail: 'Successfully read from Firestore'
      };
    } catch (error) {
      results.tests.firestoreRead = {
        passed: false,
        detail: `Failed to read from Firestore: ${error.message}`
      };
      
      // Continue with tests even if this fails
      console.error('Firestore read test failed:', error);
    }
    
    // Test 4: Try to write a document to Firestore
    try {
      // Create a test collection if not already there
      const testData = {
        timestamp: new Date().toISOString(),
        test: true
      };
      
      const testWriteRef = collection(db, '_connection_test');
      const docRef = await addDoc(testWriteRef, testData);
      await deleteDoc(docRef); // Clean up after test
      
      results.firestoreWrite = true;
      results.tests.firestoreWrite = {
        passed: true,
        detail: 'Successfully wrote to Firestore'
      };
    } catch (error) {
      results.tests.firestoreWrite = {
        passed: false,
        detail: `Failed to write to Firestore: ${error.message}`
      };
      
      // This is a critical failure if we can't write
      results.error = 'Cannot write to Firestore. This might be due to permissions or connectivity issues.';
      results.errorDetails = error.toString();
      return results;
    }
    
    // If we made it here, everything is working
    if (results.firestoreRead && results.firestoreWrite) {
      results.allTests = true;
    } else {
      results.error = 'Some Firebase tests failed. See details for more information.';
    }
    
    return results;
    
  } catch (error) {
    results.error = 'Unexpected error during Firebase connection tests';
    results.errorDetails = error.toString();
    return results;
  }
};

// Team Members API
export const teamMembersApi = {
  getAll: async () => {
    try {
      // Get all team members from Firestore
      const querySnapshot = await getDocs(collection(db, "teamMembers"));
      const teamMembers = [];
      querySnapshot.forEach((doc) => {
        teamMembers.push({ id: doc.id, ...doc.data() });
      });
      
      // Cache in localStorage as fallback
      localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
      return teamMembers;
    } catch (error) {
      console.error("Error fetching team members:", error);
      // Fallback to localStorage
      const fallback = localStorage.getItem('teamMembers');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (teamMember) => {
    try {
      // Add a new team member to Firestore
      const docRef = await addDoc(collection(db, "teamMembers"), {
        ...teamMember,
        timestamp: serverTimestamp()
      });
      
      const newMember = { id: docRef.id, ...teamMember };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify([...current, newMember]));
      
      return newMember;
    } catch (error) {
      console.error("Error adding team member:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      const newMember = { ...teamMember, id: Date.now().toString() };
      localStorage.setItem('teamMembers', JSON.stringify([...current, newMember]));
      return newMember;
    }
  },
  
  update: async (id, teamMember) => {
    try {
      // Update team member in Firestore
      const teamMemberRef = doc(db, "teamMembers", id);
      await updateDoc(teamMemberRef, {
        ...teamMember,
        timestamp: serverTimestamp()
      });
      
      const updatedMember = { id, ...teamMember };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.map(m => m.id === id ? updatedMember : m)
      ));
      
      return updatedMember;
    } catch (error) {
      console.error("Error updating team member:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.map(m => m.id === id ? { id, ...teamMember } : m)
      ));
      return { id, ...teamMember };
    }
  },
  
  delete: async (id) => {
    try {
      // Delete team member from Firestore
      await deleteDoc(doc(db, "teamMembers", id));
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      localStorage.setItem('teamMembers', JSON.stringify(
        current.filter(m => m.id !== id)
      ));
      
      return true;
    } catch (error) {
      console.error("Error deleting team member:", error);
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
      // Get all projects from Firestore
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      // Cache in localStorage as fallback
      localStorage.setItem('projects', JSON.stringify(projects));
      return projects;
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Fallback to localStorage
      const fallback = localStorage.getItem('projects');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (project) => {
    try {
      // Add a new project to Firestore
      const docRef = await addDoc(collection(db, "projects"), {
        ...project,
        timestamp: serverTimestamp()
      });
      
      const newProject = { id: docRef.id, ...project };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify([...current, newProject]));
      
      return newProject;
    } catch (error) {
      console.error("Error adding project:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      const newProject = { ...project, id: Date.now().toString() };
      localStorage.setItem('projects', JSON.stringify([...current, newProject]));
      return newProject;
    }
  },
  
  update: async (id, project) => {
    try {
      // Update project in Firestore
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, {
        ...project,
        timestamp: serverTimestamp()
      });
      
      const updatedProject = { id, ...project };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.map(p => p.id === id ? updatedProject : p)
      ));
      
      return updatedProject;
    } catch (error) {
      console.error("Error updating project:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.map(p => p.id === id ? { id, ...project } : p)
      ));
      return { id, ...project };
    }
  },
  
  delete: async (id) => {
    try {
      // Delete project from Firestore
      await deleteDoc(doc(db, "projects", id));
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify(
        current.filter(p => p.id !== id)
      ));
      
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
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
      // Get all services from Firestore
      const querySnapshot = await getDocs(collection(db, "services"));
      const services = [];
      querySnapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() });
      });
      
      // Cache in localStorage as fallback
      localStorage.setItem('services', JSON.stringify(services));
      return services;
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to localStorage
      const fallback = localStorage.getItem('services');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (service) => {
    try {
      // Add a new service to Firestore
      const docRef = await addDoc(collection(db, "services"), {
        ...service,
        timestamp: serverTimestamp()
      });
      
      const newService = { id: docRef.id, ...service };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify([...current, newService]));
      
      return newService;
    } catch (error) {
      console.error("Error adding service:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      const newService = { ...service, id: Date.now().toString() };
      localStorage.setItem('services', JSON.stringify([...current, newService]));
      return newService;
    }
  },
  
  update: async (id, service) => {
    try {
      // Update service in Firestore
      const serviceRef = doc(db, "services", id);
      await updateDoc(serviceRef, {
        ...service,
        timestamp: serverTimestamp()
      });
      
      const updatedService = { id, ...service };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.map(s => s.id === id ? updatedService : s)
      ));
      
      return updatedService;
    } catch (error) {
      console.error("Error updating service:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.map(s => s.id === id ? { id, ...service } : s)
      ));
      return { id, ...service };
    }
  },
  
  delete: async (id) => {
    try {
      // Delete service from Firestore
      await deleteDoc(doc(db, "services", id));
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('services') || '[]');
      localStorage.setItem('services', JSON.stringify(
        current.filter(s => s.id !== id)
      ));
      
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
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
      // Get all contact submissions from Firestore
      const querySnapshot = await getDocs(collection(db, "contactSubmissions"));
      const contactSubmissions = [];
      querySnapshot.forEach((doc) => {
        contactSubmissions.push({ id: doc.id, ...doc.data() });
      });
      
      // Cache in localStorage as fallback
      localStorage.setItem('contactSubmissions', JSON.stringify(contactSubmissions));
      return contactSubmissions;
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      // Fallback to localStorage
      const fallback = localStorage.getItem('contactSubmissions');
      return fallback ? JSON.parse(fallback) : [];
    }
  },
  
  add: async (submission) => {
    try {
      // Add a new contact submission to Firestore
      const docRef = await addDoc(collection(db, "contactSubmissions"), {
        ...submission,
        date: submission.date || new Date().toISOString(),
        isNew: true,
        timestamp: serverTimestamp()
      });
      
      const newSubmission = { id: docRef.id, ...submission };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify([...current, newSubmission]));
      
      return newSubmission;
    } catch (error) {
      console.error("Error adding contact submission:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      const newSubmission = { 
        ...submission, 
        id: Date.now().toString(),
        date: submission.date || new Date().toISOString(),
        isNew: true 
      };
      localStorage.setItem('contactSubmissions', JSON.stringify([...current, newSubmission]));
      return newSubmission;
    }
  },
  
  update: async (id, submission) => {
    try {
      // Update contact submission in Firestore
      const submissionRef = doc(db, "contactSubmissions", id);
      await updateDoc(submissionRef, {
        ...submission,
        timestamp: serverTimestamp()
      });
      
      const updatedSubmission = { id, ...submission };
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? updatedSubmission : s)
      ));
      
      return updatedSubmission;
    } catch (error) {
      console.error("Error updating contact submission:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? { id, ...submission } : s)
      ));
      return { id, ...submission };
    }
  },
  
  delete: async (id) => {
    try {
      // Delete contact submission from Firestore
      await deleteDoc(doc(db, "contactSubmissions", id));
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.filter(s => s.id !== id)
      ));
      
      return true;
    } catch (error) {
      console.error("Error deleting contact submission:", error);
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
      // Mark contact submission as read in Firestore
      const submissionRef = doc(db, "contactSubmissions", id);
      await updateDoc(submissionRef, {
        isNew: false,
        timestamp: serverTimestamp()
      });
      
      // Update local cache
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? { ...s, isNew: false } : s)
      ));
      
      return { id, isNew: false };
    } catch (error) {
      console.error("Error marking contact submission as read:", error);
      // Fallback to localStorage
      const current = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      localStorage.setItem('contactSubmissions', JSON.stringify(
        current.map(s => s.id === id ? { ...s, isNew: false } : s)
      ));
      return { id, isNew: false };
    }
  }
}; 