// const { google } = require("googleapis");
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const { Readable } = require("stream");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "http://localhost:5173" }));

// const SCOPE = ["https://www.googleapis.com/auth/drive"];
// const JWT_SECRET = process.env.JWT_SECRET;

// const authorize = async () => {
//   console.log(process.env.PRIVATE_KEY)
//   const auth = new google.auth.JWT(
//     process.env.CLIENT_EMAIL,
//     null,
//     process.env.PRIVATE_KEY,
//     SCOPE
//   );
//   auth.authorize((err, tokens) => {
//     if (err) {
//       console.log(err);
//       return;
//     } else {
//       console.log("Authorized");
//     }
//   });
//   return auth;
// };

// let drive;

// const init = async () => {
//   const auth = await authorize();
//   drive = google.drive({ version: "v3", auth });
// };

// init();

// const verifyToken = (req, res, next) => {
//   const token = req.headers["authorization"];

//   if (!token) {
//     return res
//       .status(403)
//       .json({ message: "Access denied. No token provided." });
//   }

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Invalid token" });
//     }
//     req.email = decoded;
//     next();
//   });
// };

// const registerUser = async (req, res) => {
//   const fileId = "1uuE-FHjxFcVQyim8tkWW8WRBFuAYI-HT";
//   const parentFolderId = "1_o-YkMJwLO0vqtNfBk96Wewyj3WQ39nc";

//   const getFile = async () => {
//     const response = await drive.files.get({
//       fileId: fileId,
//       alt: "media",
//     });
//     return response.data;
//   };

//   const updateFile = async (content) => {
//     const media = {
//       mimeType: "application/json",
//       body: JSON.stringify(content),
//     };
//     await drive.files.update({
//       fileId: fileId,
//       media: media,
//     });
//   };

//   const createFolder = async (teamname) => {
//     const fileMetadata = {
//       name: teamname,
//       mimeType: "application/vnd.google-apps.folder",
//       parents: [parentFolderId],
//     };

//     try {
//       const folder = await drive.files.create({
//         resource: fileMetadata,
//         fields: "id",
//       });
//       console.log(`Folder "${teamname}" created with ID:`, folder.data.id);
//       return folder.data.id;
//     } catch (error) {
//       console.error("Error creating folder:", error);
//       throw new Error("Could not create folder");
//     }
//   };

//   try {
//     const users = await getFile();
//     const newUser = req.body;

//     if (!newUser.teamname || !newUser.username || !newUser.email) {
//       return res
//         .status(400)
//         .json({ message: "Teamname, username, and email are required" });
//     }

//     const isUsernameTaken = users.some(
//       (user) => user.username === newUser.username
//     );
//     if (isUsernameTaken) {
//       return res.status(400).json({ message: "Username is already taken" });
//     }

//     const isEmailRegistered = users.some(
//       (user) => user.email === newUser.email
//     );
//     if (isEmailRegistered) {
//       return res.status(400).json({ message: "Email is already registered" });
//     }

//     const folderId = await createFolder(newUser.teamname);
//     newUser.folderId = folderId;

//     users.push(newUser);
//     await updateFile(users);

//     res.json({ message: "User registered successfully", folderId });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res
//       .status(500)
//       .json({ message: "Error registering user", error: error.message });
//   }
// };

// const port = (process.env.PORT || 3000);

// app.listen(port, () => {
//   console.log("Server is running on port 3000");
// });

// app.post("/register", async (req, res) => {
//   registerUser(req, res);
// });

// app.post("/login", async (req, res) => {
//   const fileId = "1uuE-FHjxFcVQyim8tkWW8WRBFuAYI-HT";

//   const getFile = async (fileId) => {
//     const res = await drive.files.get({
//       fileId: fileId,
//       alt: "media",
//     });
//     return res.data;
//   };

//   try {
//     const users = await getFile(fileId);
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const foundUser = users.find((u) => u.email === email);

//     if (!foundUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (foundUser.password !== password) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign({ email: foundUser.email }, JWT_SECRET, {
//       expiresIn: "3h",
//     });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.put("/upload/:filename", verifyToken, async (req, res) => {
//   const { filename } = req.params;
//   const { email, content } = req.body;
//   const fileId = "1uuE-FHjxFcVQyim8tkWW8WRBFuAYI-HT";

//   if (!email || !filename || !content) {
//     return res
//       .status(400)
//       .json({ message: "Email, filename, and content are required" });
//   }
//   const getFile = async (fileId) => {
//     const res = await drive.files.get({
//       fileId: fileId,
//       alt: "media",
//     });
//     return res.data;
//   };
//   try {
//     const users = await getFile(fileId);
//     const user = users.find((u) => u.email === email);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     if (!user.folderId) {
//       return res.status(400).json({ message: "User has no assigned folder" });
//     }

//     const folderId = user.folderId;

//     const fileMetadata = {
//       name: filename.endsWith(".cpp") ? filename : `${filename}.cpp`,
//       parents: [folderId],
//     };

//     const media = {
//       mimeType: "text/plain",
//       body: Readable.from([content]),
//     };

//     const file = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id",
//     });

//     console.log(`.cpp file created with ID: ${file.data.id}`);
//     res.json({ message: "File uploaded successfully", fileId: file.data.id });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     res
//       .status(500)
//       .json({ message: "Error uploading file", error: error.message });
//   }
// });

// app.get("/protected", verifyToken, (req, res) => {
//   res.send("Protected route");
// });

const { google } = require("googleapis");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Readable } = require("stream");
const cors = require("cors");
require("dotenv").config();

// Constants
const SCOPE = ["https://www.googleapis.com/auth/drive"];
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
const USERS_FILE_ID = "1uuE-FHjxFcVQyim8tkWW8WRBFuAYI-HT";
const PARENT_FOLDER_ID = "1_o-YkMJwLO0vqtNfBk96Wewyj3WQ39nc";

// Initialize app
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Google Drive setup
let drive;

const authorize = async () => {
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines in env
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

// Utility functions
const getUsersFile = async () => {
  const response = await drive.files.get({
    fileId: USERS_FILE_ID,
    alt: "media",
  });
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

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
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
      message: "Teamname, username, email, and password are required" 
    });
  }
  
  next();
};

// Route handlers
const registerUser = async (req, res) => {
  try {
    const users = await getUsersFile();
    const newUser = req.body;

    // Check for existing user
    if (users.some(user => user.username === newUser.username)) {
      return res.status(400).json({ message: "Username is already taken" });
    }
    
    if (users.some(user => user.email === newUser.email)) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create folder and add user
    const folderId = await createFolder(newUser.teamname);
    newUser.folderId = folderId;
    
    await updateUsersFile([...users, newUser]);
    res.json({ message: "User registered successfully", folderId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const users = await getUsersFile();
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "3h" });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { email, content } = req.body;
    
    const users = await getUsersFile();
    const user = users.find(u => u.email === email);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.folderId) return res.status(400).json({ message: "User has no assigned folder" });

    const fileMetadata = {
      name: filename.endsWith(".cpp") ? filename : `${filename}.cpp`,
      parents: [user.folderId],
    };

    const media = {
      mimeType: "text/plain",
      body: Readable.from([content]),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    res.json({ message: "File uploaded successfully", fileId: file.data.id });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
};

// Routes
app.post("/register", validateUserData, registerUser);
app.post("/login", loginUser);
app.put("/upload/:filename", verifyToken, uploadFile);
app.get("/protected", verifyToken, (req, res) => {
  res.send("Protected route");
});

// Initialize and start server
(async () => {
  try {
    await initDrive();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Initialization error:", error);
    process.exit(1);
  }
})();