import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // State for all content types
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('team');
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Refs for file inputs
  const teamMemberImageRef = useRef(null);
  const projectImageRef = useRef(null);
  
  // Parse query parameters for editing
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const editType = query.get('edit');
    const editId = query.get('id');
    
    if (editType && editId) {
      setIsEditing(true);
      setEditingType(editType);
      setEditingId(parseInt(editId, 10));
      
      // Set active tab based on edit type
      switch(editType) {
        case 'team':
          setActiveTab('team');
          break;
        case 'project':
          setActiveTab('projects');
          break;
        case 'service':
          setActiveTab('services');
          break;
        default:
          break;
      }
    }
  }, [location]);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedTeamMembers = localStorage.getItem('teamMembers');
    const loadedProjects = localStorage.getItem('projects');
    const loadedServices = localStorage.getItem('services');
    const loadedContactSubmissions = localStorage.getItem('contactSubmissions');
    
    if (loadedTeamMembers) setTeamMembers(JSON.parse(loadedTeamMembers));
    if (loadedProjects) setProjects(JSON.parse(loadedProjects));
    if (loadedServices) setServices(JSON.parse(loadedServices));
    
    if (loadedContactSubmissions) {
      try {
        const submissions = JSON.parse(loadedContactSubmissions);
        console.log('Loaded contact submissions:', submissions);
        
        // Only update state if submissions is an array and not empty
        if (Array.isArray(submissions) && submissions.length > 0) {
          setContactSubmissions(submissions);
          
          // Check if there are any new messages
          const hasNew = submissions.some(submission => submission.isNew);
          setHasNewMessages(hasNew);
        } else {
          console.log('No valid contact submissions found in localStorage');
        }
      } catch (error) {
        console.error('Error parsing contact submissions:', error);
      }
    } else {
      console.log('No contact submissions found in localStorage');
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);
  
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    localStorage.setItem('services', JSON.stringify(services));
  }, [services]);
  
  // Only save contactSubmissions to localStorage if it's not empty
  useEffect(() => {
    if (contactSubmissions && contactSubmissions.length > 0) {
      console.log('Saving contact submissions:', contactSubmissions);
      localStorage.setItem('contactSubmissions', JSON.stringify(contactSubmissions));
    } else {
      // Don't overwrite existing submissions with an empty array
      const existingSubmissions = localStorage.getItem('contactSubmissions');
      if (existingSubmissions) {
        try {
          const parsedSubmissions = JSON.parse(existingSubmissions);
          if (Array.isArray(parsedSubmissions) && parsedSubmissions.length > 0) {
            console.log('Keeping existing submissions in localStorage:', parsedSubmissions);
            // Update state with existing submissions from localStorage
            setContactSubmissions(parsedSubmissions);
            return;
          }
        } catch (error) {
          console.error('Error parsing existing submissions:', error);
        }
      }
      console.log('No contact submissions to save');
    }
  }, [contactSubmissions]);
  
  // Load item for editing
  useEffect(() => {
    if (isEditing && editingId) {
      switch(editingType) {
        case 'team':
          const teamMember = teamMembers.find(m => m.id === editingId);
          if (teamMember) {
            setNewTeamMember(teamMember);
            setTeamMemberImagePreview(teamMember.image);
          }
          break;
        case 'project':
          const project = projects.find(p => p.id === editingId);
          if (project) {
            setNewProject(project);
            setProjectImagePreview(project.image);
          }
          break;
        case 'service':
          const service = services.find(s => s.id === editingId);
          if (service) {
            setNewService(service);
          }
          break;
        default:
          break;
      }
    }
  }, [isEditing, editingId, editingType, teamMembers, projects, services]);
  
  // Form state for adding new team members
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    image: '/api/placeholder/150/150' // Default placeholder
  });
  
  // Preview state for images
  const [teamMemberImagePreview, setTeamMemberImagePreview] = useState(null);
  const [projectImagePreview, setProjectImagePreview] = useState(null);
  
  // Form state for adding new projects
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    link: '',
    image: '/api/placeholder/300/200' // Default placeholder
  });
  
  // Form state for adding new services
  const [newService, setNewService] = useState({
    title: '',
    price: '',
    description: ''
  });
  
  // Mark a contact submission as read
  const markAsRead = (id) => {
    setContactSubmissions(contactSubmissions.map(submission => 
      submission.id === id ? { ...submission, isNew: false } : submission
    ));
    
    // Check if there are still any new messages
    const stillHasNew = contactSubmissions.some(submission => 
      submission.id !== id && submission.isNew
    );
    setHasNewMessages(stillHasNew);
  };
  
  // Delete a contact submission
  const deleteSubmission = (id) => {
    const updatedSubmissions = contactSubmissions.filter(submission => submission.id !== id);
    setContactSubmissions(updatedSubmissions);
    
    // Check if there are still any new messages
    const stillHasNew = updatedSubmissions.some(submission => submission.isNew);
    setHasNewMessages(stillHasNew);
  };
  
  // When clicking on the messages tab, mark all as read
  const handleMessagesTabClick = () => {
    setActiveTab('messages');
    // Only mark all as read if there are new messages
    if (hasNewMessages) {
      setContactSubmissions(contactSubmissions.map(submission => ({
        ...submission,
        isNew: false
      })));
      setHasNewMessages(false);
    }
  };
  
  // Handle file selection for team member image
  const handleTeamMemberImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setTeamMemberImagePreview(imageUrl);
      
      // Read file as Data URL to store in localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTeamMember({
          ...newTeamMember,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle file selection for project image
  const handleProjectImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProjectImagePreview(imageUrl);
      
      // Read file as Data URL to store in localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject({
          ...newProject,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle input changes for team member form
  const handleTeamMemberChange = (e) => {
    setNewTeamMember({
      ...newTeamMember,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle input changes for project form
  const handleProjectChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle input changes for service form
  const handleServiceChange = (e) => {
    setNewService({
      ...newService,
      [e.target.name]: e.target.value
    });
  };
  
  // Add or update a team member
  const addTeamMember = (e) => {
    e.preventDefault();
    
    if (isEditing && editingType === 'team') {
      // Update existing team member
      setTeamMembers(teamMembers.map(member => 
        member.id === editingId ? { ...newTeamMember } : member
      ));
      
      // Reset editing state
      setIsEditing(false);
      setEditingType(null);
      setEditingId(null);
      
      // Clear form
      setNewTeamMember({ name: '', role: '', email: '', phone: '', github: '', linkedin: '', image: '/api/placeholder/150/150' });
      setTeamMemberImagePreview(null);
      if (teamMemberImageRef.current) {
        teamMemberImageRef.current.value = '';
      }
      
      // Remove query parameters
      navigate('/admin', { replace: true });
    } else {
      // Add new team member
      const id = teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.id)) + 1 : 1;
      setTeamMembers([...teamMembers, { id, ...newTeamMember }]);
      setNewTeamMember({ name: '', role: '', email: '', phone: '', github: '', linkedin: '', image: '/api/placeholder/150/150' });
      setTeamMemberImagePreview(null);
      if (teamMemberImageRef.current) {
        teamMemberImageRef.current.value = '';
      }
    }
  };
  
  // Add or update a project
  const addProject = (e) => {
    e.preventDefault();
    
    if (isEditing && editingType === 'project') {
      // Update existing project
      setProjects(projects.map(project => 
        project.id === editingId ? { ...newProject } : project
      ));
      
      // Reset editing state
      setIsEditing(false);
      setEditingType(null);
      setEditingId(null);
      
      // Clear form
      setNewProject({ title: '', description: '', link: '', image: '/api/placeholder/300/200' });
      setProjectImagePreview(null);
      if (projectImageRef.current) {
        projectImageRef.current.value = '';
      }
      
      // Remove query parameters
      navigate('/admin', { replace: true });
    } else {
      // Add new project
      const id = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
      setProjects([...projects, { id, ...newProject }]);
      setNewProject({ title: '', description: '', link: '', image: '/api/placeholder/300/200' });
      setProjectImagePreview(null);
      if (projectImageRef.current) {
        projectImageRef.current.value = '';
      }
    }
  };
  
  // Add or update a service
  const addService = (e) => {
    e.preventDefault();
    
    if (isEditing && editingType === 'service') {
      // Update existing service
      setServices(services.map(service => 
        service.id === editingId ? { ...newService } : service
      ));
      
      // Reset editing state
      setIsEditing(false);
      setEditingType(null);
      setEditingId(null);
      
      // Clear form
      setNewService({ title: '', price: '', description: '' });
      
      // Remove query parameters
      navigate('/admin', { replace: true });
    } else {
      // Add new service
      const id = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
      setServices([...services, { id, ...newService }]);
      setNewService({ title: '', price: '', description: '' });
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingType(null);
    setEditingId(null);
    
    // Reset forms
    setNewTeamMember({ name: '', role: '', email: '', phone: '', github: '', linkedin: '', image: '/api/placeholder/150/150' });
    setTeamMemberImagePreview(null);
    setNewProject({ title: '', description: '', link: '', image: '/api/placeholder/300/200' });
    setProjectImagePreview(null);
    setNewService({ title: '', price: '', description: '' });
    
    // Remove query parameters
    navigate('/admin', { replace: true });
  };
  
  // Remove a team member
  const removeTeamMember = (id) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };
  
  // Remove a project
  const removeProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };
  
  // Remove a service
  const removeService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  // Debug function to fix contact submissions
  const debugFixContactSubmissions = () => {
    try {
      // Get current submissions from localStorage
      const submissionsStr = localStorage.getItem('contactSubmissions');
      console.log('Current localStorage value:', submissionsStr);
      
      if (submissionsStr) {
        // Parse the submissions
        const submissions = JSON.parse(submissionsStr);
        console.log('Parsed submissions:', submissions);
        
        if (Array.isArray(submissions)) {
          // Update state with the submissions from localStorage
          setContactSubmissions(submissions);
          
          // Check if there are any new messages
          const hasNew = submissions.some(submission => submission.isNew);
          setHasNewMessages(hasNew);
          
          console.log('Contact submissions fixed:', submissions);
          alert(`Successfully loaded ${submissions.length} contact submissions from localStorage.`);
        } else {
          console.error('Submissions is not an array:', submissions);
          alert('Error: Submissions in localStorage is not an array.');
        }
      } else {
        console.log('No submissions found in localStorage');
        alert('No contact submissions found in localStorage.');
      }
    } catch (error) {
      console.error('Error fixing contact submissions:', error);
      alert(`Error fixing contact submissions: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Website Content Management</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('team')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Members
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Services
            </button>
            <button
              onClick={handleMessagesTabClick}
              className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
              {hasNewMessages && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {contactSubmissions.filter(s => s.isNew).length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'team' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing && editingType === 'team' ? 'Edit Team Member' : 'Manage Team Members'}
          </h2>
          
          <form onSubmit={addTeamMember} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {isEditing && editingType === 'team' ? 'Edit Team Member' : 'Add New Team Member'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTeamMember.name}
                  onChange={handleTeamMemberChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  name="role"
                  value={newTeamMember.role}
                  onChange={handleTeamMemberChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newTeamMember.email}
                  onChange={handleTeamMemberChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={newTeamMember.phone}
                  onChange={handleTeamMemberChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL (Optional)</label>
                <input
                  type="url"
                  name="github"
                  value={newTeamMember.github}
                  onChange={handleTeamMemberChange}
                  placeholder="https://github.com/username"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL (Optional)</label>
                <input
                  type="url"
                  name="linkedin"
                  value={newTeamMember.linkedin}
                  onChange={handleTeamMemberChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <input
                  ref={teamMemberImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTeamMemberImageChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {teamMemberImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={teamMemberImagePreview} 
                      alt="Preview" 
                      className="h-24 w-24 object-cover rounded-full border" 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditing && editingType === 'team' ? 'Update Team Member' : 'Add Team Member'}
              </button>
              
              {isEditing && editingType === 'team' && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="border rounded-lg p-4 relative">
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingType('team');
                      setEditingId(member.id);
                      setNewTeamMember(member);
                      setTeamMemberImagePreview(member.image);
                      setActiveTab('team');
                    }}
                    className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex items-center">
                  <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
                    <div className="flex mt-2 space-x-2">
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'projects' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing && editingType === 'project' ? 'Edit Project' : 'Manage Projects'}
          </h2>
          
          <form onSubmit={addProject} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {isEditing && editingType === 'project' ? 'Edit Project' : 'Add New Project'}
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newProject.title}
                  onChange={handleProjectChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={handleProjectChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project URL (Optional)</label>
                <input
                  type="url"
                  name="link"
                  value={newProject.link}
                  onChange={handleProjectChange}
                  placeholder="https://example.com/project"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">The "View Details" button will link to this URL</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                <input
                  ref={projectImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProjectImageChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {projectImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={projectImagePreview} 
                      alt="Preview" 
                      className="h-36 w-full object-cover rounded border" 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditing && editingType === 'project' ? 'Update Project' : 'Add Project'}
              </button>
              
              {isEditing && editingType === 'project' && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div key={project.id} className="border rounded-lg overflow-hidden relative">
                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingType('project');
                      setEditingId(project.id);
                      setNewProject(project);
                      setProjectImagePreview(project.image);
                      setActiveTab('projects');
                    }}
                    className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeProject(project.id)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
                <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                    >
                      {project.link}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'services' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing && editingType === 'service' ? 'Edit Service' : 'Manage Services'}
          </h2>
          
          <form onSubmit={addService} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {isEditing && editingType === 'service' ? 'Edit Service' : 'Add New Service'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newService.title}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="text"
                  name="price"
                  value={newService.price}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newService.description}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Enter service description. Line breaks will be preserved in the display."
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Line breaks will be preserved when displayed on the website.</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditing && editingType === 'service' ? 'Update Service' : 'Add Service'}
              </button>
              
              {isEditing && editingType === 'service' && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <div key={service.id} className="border rounded-lg p-4 relative">
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingType('service');
                      setEditingId(service.id);
                      setNewService(service);
                      setActiveTab('services');
                    }}
                    className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeService(service.id)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
                <h3 className="font-medium">{service.title}</h3>
                <p className="text-sm text-blue-600 my-1">{service.price}</p>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">{service.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'messages' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Submissions</h2>
          
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {contactSubmissions && contactSubmissions.length > 0 
                ? `Showing ${contactSubmissions.length} contact submission(s)` 
                : 'No contact submissions to display'}
            </p>
            <button
              onClick={debugFixContactSubmissions}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Refresh Submissions
            </button>
          </div>
          
          {contactSubmissions && contactSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {contactSubmissions.map(submission => (
                <div 
                  key={submission.id} 
                  className={`border rounded-lg p-4 relative ${submission.isNew ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {submission.name}
                        {submission.isNew && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">New</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(submission.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex">
                      {submission.isNew && (
                        <button
                          onClick={() => markAsRead(submission.id)}
                          className="text-blue-600 text-sm mr-3 hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteSubmission(submission.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-center text-gray-500 py-8">No contact submissions yet.</p>
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md mt-4">
                <h3 className="text-yellow-800 font-medium mb-2">Debugging Information</h3>
                <p className="text-sm text-yellow-700">
                  Contact submissions value: {JSON.stringify(contactSubmissions)}
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Try submitting a contact form on the main website to see if it appears here.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Raw localStorage value: {localStorage.getItem('contactSubmissions')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 border-t pt-4 flex justify-between">
        <a href="/" className="text-blue-600 hover:underline">Back to Website</a>
        <button 
          onClick={handleLogout}
          className="text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;