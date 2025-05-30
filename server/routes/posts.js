const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const verifyToken = require('../middleware/auth');
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

router.get('/', async (req, res) => {
  try {
    const { user } = req.query;
    let query = db.collection('posts');
    
    if (user) {
      query = query.where('username', '==', user);
    }
    
    const snapshot = await query.get();
    const posts = [];
    
    snapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(posts);
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Protected routes - require authentication
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    const postData = {
      caption,
      username: req.user.email,
      image: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('posts').add(postData);
    res.status(201).json({
      id: docRef.id,
      ...postData
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const postRef = db.collection('posts').doc(id);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.data().username !== req.user.email) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    await postRef.update({
      caption,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ id, caption });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const postRef = db.collection('posts').doc(id);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.data().username !== req.user.email) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await postRef.delete();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router; 