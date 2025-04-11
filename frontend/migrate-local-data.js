/**
 * Data migration script to transfer data from localStorage to JSON server
 * 
 * To use:
 * 1. Start the JSON server with: npm run server
 * 2. Open your site in the browser
 * 3. Run this script in the browser console
 */

(async function migrateLocalDataToServer() {
  const API_BASE_URL = 'http://localhost:4000';
  
  // Helper function to fetch data from localStorage
  function getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return [];
    }
  }
  
  // Helper function to save to the API
  async function saveToAPI(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'GET',
      });
      
      // Check if data exists on server
      const existingData = await response.json();
      
      if (Array.isArray(existingData) && existingData.length > 0) {
        console.log(`${endpoint} already has ${existingData.length} items. Skipping import.`);
        return false;
      }
      
      // POST each item to server
      let successCount = 0;
      for (const item of data) {
        try {
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          });
          
          if (response.ok) {
            successCount++;
          } else {
            console.error(`Failed to save item to ${endpoint}:`, await response.text());
          }
        } catch (error) {
          console.error(`Error saving item to ${endpoint}:`, error);
        }
      }
      
      console.log(`Saved ${successCount} out of ${data.length} items to ${endpoint}`);
      return successCount > 0;
    } catch (error) {
      console.error(`Error saving to ${endpoint}:`, error);
      return false;
    }
  }
  
  console.log('Starting data migration from localStorage to JSON server...');
  
  // Get data from localStorage
  const teamMembers = getFromLocalStorage('teamMembers');
  const projects = getFromLocalStorage('projects');
  const services = getFromLocalStorage('services');
  const contactSubmissions = getFromLocalStorage('contactSubmissions');
  
  console.log('Data found in localStorage:');
  console.log(`- Team Members: ${teamMembers.length}`);
  console.log(`- Projects: ${projects.length}`);
  console.log(`- Services: ${services.length}`);
  console.log(`- Contact Submissions: ${contactSubmissions.length}`);
  
  // Save to API
  const results = await Promise.all([
    saveToAPI('teamMembers', teamMembers),
    saveToAPI('projects', projects),
    saveToAPI('services', services),
    saveToAPI('contactSubmissions', contactSubmissions)
  ]);
  
  console.log('Migration complete!');
  console.log('Summary:');
  console.log(`- Team Members: ${results[0] ? 'Migrated' : 'Skipped'}`);
  console.log(`- Projects: ${results[1] ? 'Migrated' : 'Skipped'}`);
  console.log(`- Services: ${results[2] ? 'Migrated' : 'Skipped'}`);
  console.log(`- Contact Submissions: ${results[3] ? 'Migrated' : 'Skipped'}`);
  console.log('\nPlease verify your data at http://localhost:4000');
})(); 