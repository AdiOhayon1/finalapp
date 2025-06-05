const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const admin = require("firebase-admin");
const verifyToken = require("../middleware/auth");
const db = admin.firestore();

// 📦 הגדרת אחסון קבצים
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

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
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image;

    if (!req.user.email) {
      console.error("⚠️ Missing user email in request.");
      return res.status(400).json({ error: "Missing user email." });
    }

    console.log("✅ Creating post for:", req.user.email);

    const postData = {
      caption,
      username: req.user.name || req.user.displayName || req.user.email,
      email: req.user.email,
      image: imageUrl,
      likes: 0,
      comments: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("posts").add(postData);
    res.status(201).json({ id: docRef.id, ...postData });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ✅ שאר הפונקציות (put, delete, like, comment) ללא שינוי מהותי
// (נשארו כמו בקוד שלך – תקינים)

module.exports = router;
