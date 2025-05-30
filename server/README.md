# PostPassport Server

This is the server-side implementation for the PostPassport application.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a Firebase Service Account:
   - Go to Firebase Console
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-service-account.json` in the server directory

3. Create a `.env` file in the server directory with the following content:
```
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Posts

- `GET /posts` - Get all posts
  - Query parameter: `user` (optional) - Filter posts by username

- `POST /posts` - Create a new post
  - Body: 
    - `caption` (string)
    - `username` (string)
    - `image` (file or URL)

- `PUT /posts/:id` - Update a post
  - Body:
    - `caption` (string)

- `DELETE /posts/:id` - Delete a post

## File Structure

```
server/
├── routes/
│   └── posts.js
├── uploads/
├── .env
├── package.json
├── server.js
└── README.md
``` 