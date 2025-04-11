import React, { useEffect, useState } from 'react';
import { db, checkFirebasePermissions } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

const FirebaseCheck = () => {
  const [testResults, setTestResults] = useState({
    running: true,
    overallStatus: 'running',
    tests: []
  });

  useEffect(() => {
    async function runTests() {
      const results = {
        running: false,
        overallStatus: 'unknown',
        tests: []
      };

      try {
        // Test 1: Check permissions
        try {
          const permissionsResult = await checkFirebasePermissions();
          results.tests.push({
            name: 'Firebase Permissions Check',
            status: permissionsResult.success ? 'pass' : 'fail',
            message: permissionsResult.message || permissionsResult.error
          });
        } catch (error) {
          results.tests.push({
            name: 'Firebase Permissions Check',
            status: 'fail',
            message: `Error checking permissions: ${error.message}`
          });
        }

        // Test 2: Connection test - Write a test document
        try {
          const testDocRef = doc(collection(db, '_connection_test'));
          await setDoc(testDocRef, {
            timestamp: new Date().toISOString(),
            message: 'Test connection document'
          });
          
          results.tests.push({
            name: 'Write Test Document',
            status: 'pass',
            message: 'Successfully wrote test document to Firestore'
          });
          
          // Try to read it back
          const docSnap = await getDoc(testDocRef);
          
          if (docSnap.exists()) {
            results.tests.push({
              name: 'Read Test Document',
              status: 'pass',
              message: `Successfully read test document: ${JSON.stringify(docSnap.data())}`
            });
          } else {
            results.tests.push({
              name: 'Read Test Document',
              status: 'fail',
              message: 'Document written but could not be read back'
            });
          }
          
          // Clean up the test document
          await deleteDoc(testDocRef);
          results.tests.push({
            name: 'Delete Test Document',
            status: 'pass',
            message: 'Successfully deleted test document'
          });
        } catch (error) {
          results.tests.push({
            name: 'Firestore Write/Read Test',
            status: 'fail',
            message: `Error during write/read test: ${error.message}`
          });
        }
        
        // Test 3: Collection Query
        try {
          const testCol = collection(db, '_connection_test');
          const q = query(testCol, where('timestamp', '!=', null));
          const querySnapshot = await getDocs(q);
          
          results.tests.push({
            name: 'Collection Query Test',
            status: 'pass',
            message: `Query executed successfully, found ${querySnapshot.size} documents`
          });
        } catch (error) {
          results.tests.push({
            name: 'Collection Query Test',
            status: 'fail',
            message: `Error during collection query: ${error.message}`
          });
        }
        
        // Calculate overall status
        const allPassed = results.tests.every(test => test.status === 'pass');
        const anyFailed = results.tests.some(test => test.status === 'fail');
        
        if (allPassed) {
          results.overallStatus = 'pass';
        } else if (anyFailed) {
          results.overallStatus = 'fail';
        } else {
          results.overallStatus = 'partial';
        }
      } catch (error) {
        results.tests.push({
          name: 'Overall Test Suite',
          status: 'fail',
          message: `Fatal error running tests: ${error.message}`
        });
        results.overallStatus = 'fail';
      }
      
      results.running = false;
      setTestResults(results);
    }
    
    runTests();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Diagnostics</h1>
      
      {testResults.running ? (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-700">Running Firebase diagnostic tests...</p>
        </div>
      ) : (
        <>
          <div className={`mb-6 p-4 rounded-lg ${
            testResults.overallStatus === 'pass' ? 'bg-green-100 text-green-800' :
            testResults.overallStatus === 'fail' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <h2 className="font-bold">
              {testResults.overallStatus === 'pass' ? 'All Tests Passed!' :
               testResults.overallStatus === 'fail' ? 'Connection Tests Failed' :
               'Partial Success'}
            </h2>
            <p>
              {testResults.overallStatus === 'pass' 
                ? 'Your Firebase connection is working correctly.'
                : 'There are some issues with your Firebase connection. See details below.'}
            </p>
          </div>
          
          <div className="space-y-4">
            {testResults.tests.map((test, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                test.status === 'pass' ? 'bg-green-50 border-green-200' : 
                test.status === 'fail' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <h3 className="font-medium flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    test.status === 'pass' ? 'bg-green-500' : 
                    test.status === 'fail' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></span>
                  {test.name}
                </h3>
                <p className="text-sm mt-1 ml-5">{test.message}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Troubleshooting Steps</h3>
            <ol className="list-decimal list-inside text-sm space-y-2 text-blue-900">
              <li>
                <strong>Check Firebase Rules:</strong> Make sure your Firestore security rules allow read/write access.
                <pre className="bg-gray-800 text-white p-2 rounded mt-1 text-xs">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </li>
              <li>
                <strong>Check Network Connection:</strong> Ensure your device has a stable internet connection.
              </li>
              <li>
                <strong>Browser Compatibility:</strong> Some browsers may have stricter privacy settings that block certain connections.
              </li>
              <li>
                <strong>Clear Browser Cache:</strong> Clear your browser's cache and cookies, then try again.
              </li>
              <li>
                <strong>Firebase Project Status:</strong> Check if your Firebase project is active and not suspended.
              </li>
            </ol>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Run Tests Again
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FirebaseCheck; 