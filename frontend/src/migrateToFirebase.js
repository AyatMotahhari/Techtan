import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Migration script to transfer data from localStorage to Firebase
 * 
 * To use:
 * 1. Import this file in your AdminPanel.js temporarily
 * 2. Call the migrateLocalStorageToFirebase() function from a button or useEffect
 * 3. Remove the import and function call once migration is complete
 */
export const migrateLocalStorageToFirebase = async () => {
  console.log('Starting migration from localStorage to Firebase...');
  let migrationResults = {
    teamMembers: { total: 0, success: 0 },
    projects: { total: 0, success: 0 },
    services: { total: 0, success: 0 },
    contactSubmissions: { total: 0, success: 0 },
  };

  // Helper function to get data from localStorage
  function getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return [];
    }
  }

  // Helper function to check if similar item exists in Firestore
  async function itemExists(collectionName, item) {
    if (!item.name && !item.title && !item.email) return false;
    
    let fieldToCheck = '';
    let valueToCheck = '';
    
    if (item.name) {
      fieldToCheck = 'name';
      valueToCheck = item.name;
    } else if (item.title) {
      fieldToCheck = 'title';
      valueToCheck = item.title;
    } else if (item.email) {
      fieldToCheck = 'email';
      valueToCheck = item.email;
    }
    
    if (!fieldToCheck) return false;
    
    const q = query(collection(db, collectionName), where(fieldToCheck, "==", valueToCheck));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Helper function to save items to Firebase
  async function saveToFirebase(collectionName, items) {
    let results = { total: items.length, success: 0 };
    
    for (const item of items) {
      try {
        // Skip if item appears to already exist
        const exists = await itemExists(collectionName, item);
        if (exists) {
          console.log(`Item already exists in ${collectionName}:`, item);
          continue;
        }
        
        // Add timestamp
        const itemToSave = { ...item, timestamp: serverTimestamp() };
        
        // Remove the id from localStorage as Firebase will generate its own
        // But keep a copy if we need to reference it
        const originalId = itemToSave.id;
        delete itemToSave.id;
        
        // Add to Firebase
        await addDoc(collection(db, collectionName), itemToSave);
        results.success++;
        
      } catch (error) {
        console.error(`Error saving item to ${collectionName}:`, error, item);
      }
    }
    
    return results;
  }
  
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
  
  // Migrate data to Firebase
  if (teamMembers.length > 0) {
    migrationResults.teamMembers = await saveToFirebase('teamMembers', teamMembers);
  }
  
  if (projects.length > 0) {
    migrationResults.projects = await saveToFirebase('projects', projects);
  }
  
  if (services.length > 0) {
    migrationResults.services = await saveToFirebase('services', services);
  }
  
  if (contactSubmissions.length > 0) {
    migrationResults.contactSubmissions = await saveToFirebase('contactSubmissions', contactSubmissions);
  }
  
  // Log migration results
  console.log('Migration results:');
  console.log(`- Team Members: ${migrationResults.teamMembers.success}/${migrationResults.teamMembers.total} migrated`);
  console.log(`- Projects: ${migrationResults.projects.success}/${migrationResults.projects.total} migrated`);
  console.log(`- Services: ${migrationResults.services.success}/${migrationResults.services.total} migrated`);
  console.log(`- Contact Submissions: ${migrationResults.contactSubmissions.success}/${migrationResults.contactSubmissions.total} migrated`);
  
  return migrationResults;
}; 