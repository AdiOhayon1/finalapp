const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const admin = require("firebase-admin");
const verifyToken = require("../middleware/auth");
const db = admin.firestore();
const fs = require("fs");

// 📦 File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer to accept both images and videos
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  }
});

// ✅ שליפת פוסטים עם סינון לפי משתמש מחובר
router.get("/", async (req, res) => {
  try {
    const { user } = req.query;
    let query = db.collection("posts");

    if (user) {
      console.log("🔍 Filtering posts for user email:", user);
      query = query.where("username", "==", user);
    }

    const snapshot = await query.get();
    const posts = [];

    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      requestedUser: user || null,
      foundPostsCount: posts.length,
      posts,
    });
  } catch (error) {
    console.error("❌ Error getting posts:", error);
    res.status(500).json({ error: "Failed to get posts" });
  }
});

// ✅ יצירת פוסט חדש
router.post("/", verifyToken, upload.single("media"), async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!req.user.email) {
      console.error("⚠️ Missing user email in request.");
      return res.status(400).json({ error: "Missing user email." });
    }

    if (!file && !req.body.mediaUrl) {
      return res.status(400).json({ error: "No media file or URL provided." });
    }

    let mediaUrl;
    let mediaType = 'image'; // default type

    if (file) {
      mediaUrl = `/uploads/${file.filename}`;
      // Determine if the file is a video
      mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else {
      mediaUrl = req.body.mediaUrl;
      // Try to determine type from URL
      mediaType = req.body.mediaType || 'image';
    }

    console.log("✅ Creating post for:", req.user.email, "Media type:", mediaType);

    const postData = {
      caption,
      username: req.user.name || req.user.displayName || req.user.email,
      email: req.user.email,
      media: mediaUrl,
      mediaType,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("posts").add(postData);
    res.status(201).json({ id: docRef.id, ...postData });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    if (error.message.includes('Invalid file type')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to create post" });
    }
  }
});

// ✅ מחיקת פוסט
router.delete("/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    
    // Check if the user is authorized to delete the post
    if (postData.email !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized to delete this post" });
    }

    // Delete the post
    await postRef.delete();
    
    // If the post had an uploaded media, delete it from the uploads folder
    if (postData.media && postData.media.startsWith('/uploads/')) {
      const mediaPath = path.join(__dirname, '..', postData.media);
      try {
        await fs.promises.unlink(mediaPath);
      } catch (err) {
        console.error("Warning: Could not delete media file:", err);
      }
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ✅ עריכת פוסט
router.put("/:postId", verifyToken, upload.single("media"), async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, mediaType } = req.body;
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    
    if (postData.email !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized to edit this post" });
    }

    const updateData = {
      caption,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle media update
    if (req.file) {
      updateData.media = `/uploads/${req.file.filename}`;
      updateData.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      
      // Delete the old media file if it exists
      if (postData.media && postData.media.startsWith('/uploads/')) {
        const oldMediaPath = path.join(__dirname, '..', postData.media);
        try {
          await fs.promises.unlink(oldMediaPath);
        } catch (err) {
          console.error("Warning: Could not delete old media file:", err);
        }
      }
    } else if (req.body.mediaUrl) {
      updateData.media = req.body.mediaUrl;
      updateData.mediaType = mediaType || 'image';
    }

    await postRef.update(updateData);
    
    const updatedPost = await postRef.get();
    res.json({
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error("❌ Error updating post:", error);
    if (error.message.includes('Invalid file type')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to update post" });
    }
  }
});

// ✅ Like/Unlike post endpoint
router.post("/:postId/like", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { action } = req.body;
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    const likedBy = postData.likedBy || [];
    const userEmail = req.user.email;

    // Check if user has already liked the post
    const hasLiked = likedBy.includes(userEmail);

    if (action === "like") {
      if (hasLiked) {
        return res.status(400).json({ error: "You have already liked this post" });
      }
      // Add user to likedBy array and increment likes
      await postRef.update({
        likes: admin.firestore.FieldValue.increment(1),
        likedBy: admin.firestore.FieldValue.arrayUnion(userEmail)
      });
    } else if (action === "unlike") {
      if (!hasLiked) {
        return res.status(400).json({ error: "You haven't liked this post yet" });
      }
      // Remove user from likedBy array and decrement likes
      await postRef.update({
        likes: admin.firestore.FieldValue.increment(-1),
        likedBy: admin.firestore.FieldValue.arrayRemove(userEmail)
      });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Get updated post data
    const updatedPost = await postRef.get();
    res.json({
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error("❌ Error updating like:", error);
    res.status(500).json({ error: "Failed to update like" });
  }
});

// ✅ Add comment to post endpoint
router.post("/:postId/comment", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create comment with a regular timestamp instead of serverTimestamp
    const comment = {
      text: text.text,
      user: req.user.email,
      createdAt: new Date().toISOString()
    };

    // Get current comments array
    const postData = postDoc.data();
    const currentComments = postData.comments || [];

    // Add new comment to the array
    const updatedComments = [...currentComments, comment];

    // Update the post with the new comments array
    await postRef.update({
      comments: updatedComments
    });

    // Get updated post data
    const updatedPost = await postRef.get();
    res.json({
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ✅ Like/Unlike comment endpoint
router.post("/:postId/comments/:commentIndex/like", verifyToken, async (req, res) => {
  try {
    const { postId, commentIndex } = req.params;
    const { action } = req.body;
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    const comment = postData.comments[commentIndex];

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const likes = comment.likes || [];
    const userEmail = req.user.email;

    // Check if user has already liked the comment
    const hasLiked = likes.includes(userEmail);

    if (action === "like") {
      if (hasLiked) {
        return res.status(400).json({ error: "You have already liked this comment" });
      }
      // Add user to likes array
      comment.likes = [...likes, userEmail];
    } else if (action === "unlike") {
      if (!hasLiked) {
        return res.status(400).json({ error: "You haven't liked this comment yet" });
      }
      // Remove user from likes array
      comment.likes = likes.filter(email => email !== userEmail);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Update the post with the modified comment
    const comments = [...postData.comments];
    comments[commentIndex] = comment;
    await postRef.update({ comments });

    // Get updated post data
    const updatedPost = await postRef.get();
    res.json({
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error("❌ Error updating comment like:", error);
    res.status(500).json({ error: "Failed to update comment like" });
  }
});

// ✅ Add reply to comment endpoint
router.post("/:postId/comments/:commentIndex/reply", verifyToken, async (req, res) => {
  try {
    const { postId, commentIndex } = req.params;
    const { text } = req.body;
    
    console.log("📝 Reply request received:", {
      postId,
      commentIndex,
      text,
      user: req.user.email
    });

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log("❌ Post not found:", postId);
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    console.log("📄 Post data:", {
      id: postId,
      commentsCount: postData.comments?.length || 0
    });

    const comment = postData.comments[commentIndex];

    if (!comment) {
      console.log("❌ Comment not found:", {
        postId,
        commentIndex,
        availableComments: postData.comments?.length || 0
      });
      return res.status(404).json({ error: "Comment not found" });
    }

    // Create reply with a regular timestamp
    const reply = {
      text,
      user: req.user.email,
      createdAt: new Date().toISOString(),
      likes: []
    };

    // Initialize replies array if it doesn't exist
    if (!comment.replies) {
      comment.replies = [];
    }

    // Add new reply to the array
    comment.replies.push(reply);

    // Update the post with the modified comment
    const comments = [...postData.comments];
    comments[commentIndex] = comment;
    await postRef.update({ comments });

    console.log("✅ Reply added successfully:", {
      postId,
      commentIndex,
      replyCount: comment.replies.length
    });

    // Get updated post data
    const updatedPost = await postRef.get();
    res.json({
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error("❌ Error adding reply:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

// ✅ Like/Unlike reply endpoint
router.post("/:postId/comments/:commentIndex/replies/:replyIndex/like", verifyToken, async (req, res) => {
  try {
    const { postId, commentIndex, replyIndex } = req.params;
    const { action } = req.body;
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    const comment = postData.comments[commentIndex];

    if (!comment || !comment.replies || !comment.replies[replyIndex]) {
      return res.status(404).json({ error: "Reply not found" });
    }

    const reply = comment.replies[replyIndex];
    const likes = reply.likes || [];
    const userEmail = req.user.email;

    // Check if user has already liked the reply
    const hasLiked = likes.includes(userEmail);

    if (action === "like") {
      if (hasLiked) {
        return res.status(400).json({ error: "You have already liked this reply" });
      }
      // Add user to likes array
      reply.likes = [...likes, userEmail];
    } else if (action === "unlike") {
      if (!hasLiked) {
        return res.status(400).json({ error: "You haven't liked this reply yet" });
      }
      // Remove user from likes array
      reply.likes = likes.filter(email => email !== userEmail);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Update the post with the modified reply
    const comments = [...postData.comments];
    comments[commentIndex].replies[replyIndex] = reply;
    await postRef.update({ comments });

    // Get updated post data
    const updatedPost = await postRef.get();
    res.json({
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error("❌ Error updating reply like:", error);
    res.status(500).json({ error: "Failed to update reply like" });
  }
});

// ✅ שאר הפונקציות (put, delete, like, comment) ללא שינוי מהותי
// (נשארו כמו בקוד שלך – תקינים)

module.exports = router;
