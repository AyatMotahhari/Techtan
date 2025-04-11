# Deployment Guide for Techtan Website

This guide explains how to set up the persistent data server for the Techtan website.

## Problem Solved

The website previously used localStorage for storing content (team members, projects, services, and contact submissions). While localStorage works well for development and testing, it has a major limitation: data is stored only in the browser where it was created. This means:

- Content added on one device won't appear on other devices
- When users visit the site, they won't see the content you've added as an admin
- Different browsers on the same computer will have different content

This deployment guide shows you how to set up a simple JSON server to store the website data centrally so all visitors see the same content.

## Setup Instructions

### 1. Install Required Software

- Make sure you have Node.js installed on your server (version 14+ recommended)
- You'll need npm (comes with Node.js)

### 2. Set Up the JSON Server

You have two options:

#### Option A: Use json-server (for testing or small sites)

1. Install json-server globally:
   ```
   npm install -g json-server
   ```

2. Create a directory for your data:
   ```
   mkdir -p /var/www/techtan-data
   ```

3. Copy the db.json file to this directory:
   ```
   cp frontend/db.json /var/www/techtan-data/
   ```

4. Create a systemd service to keep the server running:
   ```
   sudo nano /etc/systemd/system/techtan-data.service
   ```

   Add the following content:
   ```
   [Unit]
   Description=JSON Server for Techtan Website
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/techtan-data
   ExecStart=/usr/bin/json-server --watch db.json --port 4000 --host 0.0.0.0
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

5. Start and enable the service:
   ```
   sudo systemctl start techtan-data
   sudo systemctl enable techtan-data
   ```

#### Option B: Use a simple Express server (more robust)

1. Create a directory for your server:
   ```
   mkdir -p /var/www/techtan-server
   ```

2. Create a package.json file:
   ```
   cd /var/www/techtan-server
   npm init -y
   npm install express cors body-parser lowdb@1.0.0 --save
   ```

3. Create a server.js file:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const bodyParser = require('body-parser');
   const low = require('lowdb');
   const FileSync = require('lowdb/adapters/FileSync');
   
   const adapter = new FileSync('db.json');
   const db = low(adapter);
   
   // Set default data structure if db.json is empty
   db.defaults({ teamMembers: [], projects: [], services: [], contactSubmissions: [] }).write();
   
   const app = express();
   app.use(cors());
   app.use(bodyParser.json({limit: '50mb'}));
   
   // GET all items from a collection
   app.get('/:collection', (req, res) => {
     const data = db.get(req.params.collection).value();
     res.json(data || []);
   });
   
   // GET a specific item by ID
   app.get('/:collection/:id', (req, res) => {
     const item = db.get(req.params.collection)
       .find({ id: parseInt(req.params.id) })
       .value();
     
     if (item) {
       res.json(item);
     } else {
       res.status(404).json({ error: 'Item not found' });
     }
   });
   
   // POST a new item to a collection
   app.post('/:collection', (req, res) => {
     const collection = req.params.collection;
     const items = db.get(collection);
     let newItem = req.body;
     
     // If no ID is provided, generate one
     if (!newItem.id) {
       const maxId = items.size().value() > 0 
         ? Math.max(...items.map('id').value().filter(id => typeof id === 'number')) 
         : 0;
       newItem.id = maxId + 1;
     }
     
     items.push(newItem).write();
     res.status(201).json(newItem);
   });
   
   // PUT (update) an item
   app.put('/:collection/:id', (req, res) => {
     const collection = req.params.collection;
     const id = parseInt(req.params.id);
     const updateData = req.body;
     
     // Ensure the ID in the body matches the URL
     updateData.id = id;
     
     db.get(collection)
       .find({ id })
       .assign(updateData)
       .write();
     
     res.json(updateData);
   });
   
   // DELETE an item
   app.delete('/:collection/:id', (req, res) => {
     const collection = req.params.collection;
     const id = parseInt(req.params.id);
     
     db.get(collection)
       .remove({ id })
       .write();
     
     res.status(204).end();
   });
   
   const PORT = process.env.PORT || 4000;
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });
   ```

4. Copy your db.json file to this directory:
   ```
   cp frontend/db.json /var/www/techtan-server/
   ```

5. Create a systemd service:
   ```
   sudo nano /etc/systemd/system/techtan-data.service
   ```

   Add the following content:
   ```
   [Unit]
   Description=JSON Server for Techtan Website
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/techtan-server
   ExecStart=/usr/bin/node server.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

6. Start and enable the service:
   ```
   sudo systemctl start techtan-data
   sudo systemctl enable techtan-data
   ```

### 3. Set Up Nginx as a Reverse Proxy (Optional but Recommended)

1. Install Nginx if not already installed:
   ```
   sudo apt update
   sudo apt install nginx
   ```

2. Create a new Nginx site configuration:
   ```
   sudo nano /etc/nginx/sites-available/api.techtan.ir
   ```

   Add the following content:
   ```
   server {
       listen 80;
       server_name api.techtan.ir;

       location / {
           proxy_pass http://localhost:4000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

3. Enable the site:
   ```
   sudo ln -s /etc/nginx/sites-available/api.techtan.ir /etc/nginx/sites-enabled/
   ```

4. Test and reload Nginx:
   ```
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Set up SSL with Let's Encrypt:
   ```
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.techtan.ir
   ```

### 4. Update the Website Configuration

1. Create a .env file in the frontend directory:
   ```
   cd frontend
   nano .env
   ```

   Add the following content (update with your actual domain):
   ```
   REACT_APP_API_URL=https://api.techtan.ir
   ```

2. Rebuild the frontend:
   ```
   npm run build
   ```

3. Deploy the updated build to your web server.

### 5. Migrating Existing Data

If you already have data in localStorage that you want to migrate to the server:

1. Start the JSON server
2. Launch your site in the browser using the admin account
3. Open the browser console (F12)
4. Copy and paste the content of the `frontend/migrate-local-data.js` script into the console
5. Press Enter to run the script

The script will migrate all your existing data from localStorage to the JSON server.

## Testing Your Setup

1. Add content through the admin panel on your computer
2. Visit the site from a different device or browser
3. The content should be visible on all devices

## Troubleshooting

- If content isn't showing up, check the browser console for API errors
- Verify the API server is running with `systemctl status techtan-data`
- Check the API directly: `curl https://api.techtan.ir/teamMembers`
- Check the server logs: `journalctl -u techtan-data`

## Backup Procedure

It's important to back up your data regularly:

```
# Back up the database file
cp /var/www/techtan-server/db.json /var/backups/techtan-db-$(date +%Y%m%d).json
```

Consider setting up a cron job to automate this process. 