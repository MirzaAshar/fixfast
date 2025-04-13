const { google } = require("googleapis");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Readable } = require("stream");
const cors = require("cors");
const cache = require("memory-cache")
require("dotenv").config();

const USERS_CACHE_KEY = "users_cache";
const USERS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const QUESTIONS_CACHE_KEY = "questions_cache";
const QUESTIONS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const SCOPE = ["https://www.googleapis.com/auth/drive"];
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
const USERS_FILE_ID = "1uuE-FHjxFcVQyim8tkWW8WRBFuAYI-HT";
const PARENT_FOLDER_ID = "1_o-YkMJwLO0vqtNfBk96Wewyj3WQ39nc";
const questions = {
  1: {
    title: "Array Manipulation",
    description: "Write a function to find the maximum number in an array.",
    example: "Input: [1, 5, 3, 9, 2]\nOutput: 9",
    code: `function findMax(arr) { \n     return Math.max(...arr); \n}`,
  },
  2: {
    title: "String Reversal",
    description: "Write a function to reverse a string.",
    example: "Input: 'hello'\nOutput: 'olleh'",
    code: `function reverseString(str) { return str.split('').reverse().join(''); }`,
  },
};

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
// app.use(cors({ origin: "https://fix-fast.vercel.app" }));

let drive;

const authorize = async () => {
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    SCOPE
  );

  await new Promise((resolve, reject) => {
    auth.authorize((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return auth;
};

const initDrive = async () => {
  const auth = await authorize();
  drive = google.drive({ version: "v3", auth });
};

const getUsersFile = async () => {
  const cachedUsers = cache.get(USERS_CACHE_KEY);
  if (cachedUsers) return cachedUsers;

  const response = await drive.files.get({
    fileId: USERS_FILE_ID,
    alt: "media",
  });

  cache.put(USERS_CACHE_KEY, response.data, USERS_CACHE_DURATION);
  return response.data;
};

const updateUsersFile = async (content) => {
  const media = {
    mimeType: "application/json",
    body: JSON.stringify(content),
  };

  await drive.files.update({
    fileId: USERS_FILE_ID,
    media: media,
  });

  cache.del(USERS_CACHE_KEY); // Clear cache to ensure fresh data next time
};

const createFolder = async (folderName) => {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [PARENT_FOLDER_ID],
  };

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: "id",
  });

  return folder.data.id;
};

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const validateUserData = (req, res, next) => {
  const { teamname, username, email, password } = req.body;

  if (!teamname || !username || !email || !password) {
    return res.status(400).json({
      message: "Teamname, username, email, and password are required",
    });
  }

  next();
};

const registerUser = async (req, res) => {
  try {
    const users = await getUsersFile();
    const newUser = req.body;

    if (users.some((user) => user.username === newUser.username)) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    if (users.some((user) => user.email === newUser.email)) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const folderId = await createFolder(newUser.teamname);
    newUser.folderId = folderId;

    await updateUsersFile([...users, newUser]);
    res.json({ message: "User registered successfully", folderId });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const users = await getUsersFile();
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { email: user.email, teamname: user.teamname, username: user.username },
      JWT_SECRET,
      { expiresIn: "3h" }
    );
    res
      .status(200)
      .json({ message: "Login successful", token, username: user.username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { content , fileId } = req.body;
    const email = req.user.email

    const users = await getUsersFile();
    const user = users.find((u) => u.email === email);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.folderId)
      return res.status(400).json({ message: "User has no assigned folder" });

    const fileMetadata = {
      name: filename.endsWith(".cpp") ? filename : `${filename}.cpp`,
      parents: [user.folderId],
    };

    const media = {
      mimeType: "text/plain",
      body: Readable.from([content]),
    };

    let file;
    if (!fileId) {
      file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
      });
    } else {
      file = await drive.files.update({
      fileId: fileId,
      media: media,
      });
    }

    res.json({ message: "File uploaded successfully", fileId: file.data.id });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ message: "Error uploading file", error: error.message });
  }
};

const getQuestions = async (req, res) => {
  const cachedQuestions = cache.get(QUESTIONS_CACHE_KEY);
  if (cachedQuestions) return res.json({ questions: cachedQuestions });

  cache.put(QUESTIONS_CACHE_KEY, questions, QUESTIONS_CACHE_DURATION);
  res.json({ questions: questions });
};


app.post("/register", validateUserData, registerUser);
app.post("/login", loginUser);
app.put("/upload/:filename", verifyToken, uploadFile);
app.get("/questions", verifyToken, getQuestions);
app.get("/protected", verifyToken, (req, res) => {
  res.send("Protected route");
});

(async () => {
  try {
    await initDrive();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Initialization error:", error);
    process.exit(1);
  }
})();
