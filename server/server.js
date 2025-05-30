const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const postsRouter = require('./routes/posts');
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
  res.send('PostPassport API is running');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 