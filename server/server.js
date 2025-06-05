const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path"); // ✅ נדרש לשורת ה־static

const app = express();

// ✅ הגדרות בסיסיות
app.use(cors());
app.use(express.json());

// ✅ מאפשר גישה לתמונות שהועלו (תיקיית uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅ הוספנו את זה

// ✅ התחברות ל-Firebase
const serviceAccount = require("./firebase-service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ חיבור למסד Firestore
const db = admin.firestore(); // אופציונלי כאן

// ✅ חיבור לראוטים מתוך ./routes/posts
const postRoutes = require("./routes/posts");
app.use("/posts", postRoutes);

// ✅ הפעלת השרת
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
