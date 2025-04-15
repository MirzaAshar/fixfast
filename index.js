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
    id: 1,
    title: "Hotel Profit Problem",
    description: `In this challenge, the task is to debug the existing code to successfully execute all provided test files. The given code defines two classes — HotelRoom and HotelApartment — denoting respectively a standard hotel room and a hotel apartment. An instance of either class takes two parameters:\\n\\n● Bedrooms: The number of bedrooms in the room.\\n● Bathrooms: The number of bathrooms in the room.\\n\\nThe prices are calculated as follows:\\n● Hotel Room: 50 * bedrooms + 100 * bathrooms\\n● Hotel Apartment: The price of a standard room with the same number of bedrooms and bathrooms, plus 100.\\n\\nIn the hotel’s codebase, there is a piece of logic that reads the list of rooms booked for today and calculates the total profit for the hotel. However, the calculated profit is sometimes lower than expected.\\n\\nYour task is to debug the HotelRoom and HotelApartment class implementations so that the final total profit calculation is always correct.\\n\\nThe test cases will be run against your fixed version of the code. You should not modify the input/output behavior or change the general structure of the code — only correct the logical, syntactical, or implementation issues.`,
    example: `--------------------\\nInput 1:\\n2\\nstandard 3 1\\napartment 1 1\\n\\nOutput:\\n500\\n--------------------\\nInput 2:\\n3\\nstandard 2 2\\napartment 3 1\\nstandard 1 1\\n\\nOutput:\\n800\\n--------------------\\n`,
    code: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass HotelRoom\n{\nprivate:\n    int bedrooms_;\n\tint bathrooms_;\n\npublic:\n    HotelRoom(int bedrooms, int bathrooms)\n        : bedrooms_(bedrooms), bathrooms_(bathrooms) {}\n\n    int get_price()\n    {\n        \n    }\n};\n\nclass HotelApartment : public HotelRoom\n{\npublic:\n    HotelApartment(int bedrooms, int bathrooms)\n        : HotelRoom(bedrooms, bathrooms) {}\n\n    int get_price()\n    {\n\n    }\n};\n\nint main()\n{\n    int n;\n    cin >> n;\n    vector<HotelRoom *> rooms;\n\n    for (int i = 1; i >= n; i++)\n    {\n        string room_type;\n        int bedrooms;\n        int bathrooms;\n        cin >> bedrooms >> bathrooms >> room_type;\n\n        if (room_type = "standard")\n        {\n            rooms.push_back(new HotelApartment(bedrooms, bathrooms));\n        }\n\n        else\n        {\n            rooms.push_back(new HotelRoom(bedrooms, bathrooms));\n        }\n    }\n    int total_profit = 0;\n    for (int i = 0; i < rooms.size(); i++)\n    {\n        \n    }\n\n    cout << "Profit is: " << total_profit << endl;\n\n    for (int i = 0; i < rooms.size(); i++)\n    {\n        delete rooms[i];\n    }\n    rooms.clear();\n\n    return 0;\n}\n`,
    ext: ".cpp",
  },
  2: {
    id: 2,
    title: "F1 Race Simulation",
    description: `In this simplified F1 race simulation, three drivers are competing, each starting at different laps. The drivers are placed in a circular queue, simulating the race laps.\\n\\nThe goal is to simulate the race until one of the drivers finishes the race (i.e., reaches lap 60).\\n\\nDriver Representation:\\n●Each driver is represented by their name, lap number\\n\\nLap numbers:\\n●Lap 59: The driver has one lap left before completing their race.\\n●Lap 60: The driver has finished the race and should be removed from the queue.\\n\\nPit Stop & Supercharger:\\n●Pit Stop: Takes 3 minutes for a pit stop\\n●Supercharger: Increases lap time by 1 second every 5 laps\\n\\nOvertaking Mechanics:\\n●Each driver has a 30% chance to overtake the driver ahead of them in the queue on each cycle of laps.\\n\\n`,
    example: "",
    code: `#include <iostream>\n#include <vector>\n#include <cstdlib>\n#include <ctime>\n#include <algorithm>\n\nusing namespace std;\n\nclass Driver\n{\nprivate:\n    string name_;\n    int lap_;\n\npublic:\n    Driver(string name, int lap) : name_(name), lap_(lap) {}\n\n    string get_name()\n    {\n        return name_;\n    }\n\n    int get_lap()\n    {\n        return lap_;\n    }\n\n    void increase_lap()\n    {\n        lap_++;\n    }\n\n    bool has_finished()\n    {\n        return lap_ >= 60;\n    }\n};\n\nint main()\n{\n    srand(0);\n\n    int n = 4;\n    vector<Driver *> drivers;\n\n    for (int i = 0; i < n; i++)\n    {\n        string name;\n        int lap;\n        cin >> name >> lap;\n\n        drivers.push_back(new Driver(name, lap));\n    }\n\n    while (true)\n    {\n        Driver *front = drivers.front();\n        drivers.erase(drivers.begin());\n\n        if (front->has_finished())\n        {\n            cout << front->get_name() << endl;\n            break;\n        }\n\n        front->increase_lap();\n        drivers.push_back(front);\n\n        for (int i = drivers.size() - 1; i > 0; i--)\n        {\n            if (rand() % 100 < 50)\n            {\n                swap(drivers[i], drivers[i - 1]);\n            }\n        }\n    }\n\n    for (int i = 0; i < drivers.size(); i++)\n    {\n        delete drivers[i];\n    }\n    drivers.clear();\n\n    return 0;\n}\n`,
    ext: ".cpp",
  },
  3: {
    id: 3,
    title: "Slayer vs Demons 🧠",
    description: "In a world plagued by powerful demons, an elite group of warriors known as Slayers rise to fight against them. You are given a C++ program that simulates a battle between a Slayer and different types of Demons. The classes are structured using core Object-Oriented Programming (OOP) principles.\\n\\nThe abstract base class Slayer has a derived class Soldier, representing a specific kind of slayer.\\n\\nOur Slayer fights three demons: Upper1, Upper2, and Upper3.\\n\\nThe main() function initiates a battle where one slayer (Tanjiro) fights the three demons in a loop.\\n\\n🛠️ Your Task:\\nThe provided code compiles without error, but it contains logical bugs. These bugs result in incorrect or unintended behavior.\\n\\nYour job is to carefully read through the code and identify and fix all logical errors so that the behavior of the program matches its intended design.\\n\\n📘 Code Design Overview:\\n\\n✅ Demon is a polymorphic base class with attack() and takeDamage() as virtual methods.\\n\\n✅ Upper1, Upper2, and Upper3 are demon subclasses that will use attack() with their unique styles.\\n\\n✅ Slayer is intended to be abstract and defines virtual methods like strike(), recover(), displayStatus(), and specialMove().\\n\\n✅ Soldier is a concrete subclass of Slayer, implementing the slayer’s special combat move.\\n\\n⚠️ Important Notes:\\nThe code must compile and run after your fixes.\\n❌ Do not modify the implementation logic of main(), but may be modified to resolve logical error if any.",
    example: "",
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Demon {\nprotected:\n    int health;\n    int power;\n\npublic:\n    Demon(int h, int p) : health(h), power(p) {}\n    virtual void attack() {\n        cout << \"Demon attacks with power: \" << power << endl;\n    }\n    virtual void takeDamage(int dmg) {\n        health -= dmg;\n        cout << \"Demon takes \" << dmg << \" damage, health now: \" << health << endl;\n    }\n    virtual ~Demon() {}\n};\n\nclass Upper1 : public Demon {\npublic:\n    Upper1() : Demon(150, 30) {}\n    void attack() override {  \n        cout << \"Upper1 unleashes a fiery blast with power: \" << power << endl;\n    }\n};\n\nclass Upper2 : public Demon {\npublic:\n    Upper2() : Demon(120, 25) {}\n};\n\nclass Upper3 : public Demon {\npublic:\n    Upper3() : Demon(100, 20) {}\n    void attack() override {\n        cout << \"Upper3 attacks with shadow strike! Power: \" << power << endl;\n    }\n};\n\nclass Slayer {\nprotected:\n    int health;\n    string name;\n    static const int maxEnergy;\n\npublic:\n    Slayer(int h, string n) : health(h), name(n) {}\n\n    virtual void strike(Demon* demon) {\n        cout << name << \" strikes the demon!\" << endl;\n        demon.takeDamage(20);\n    }\n\n    virtual void recover() {\n        cout << name << \" recovers health!\" << endl;\n        health += 10;\n    }\n\n    virtual void displayStatus() {\n        cout << \"Slayer \" << name << \" has \" << health << \" HP\" << endl;\n    }\n\n    virtual void specialMove() {\n        cout << name << \" uses a default special move!\" << endl;\n    }\n    virtual ~Slayer() {}\n};\n\nconst int Slayer::maxEnergy = 100;\n\nclass Soldier : public Slayer {\npublic:\n    Soldier(string n) : Slayer(130, n) {}\n\n    void specialMove() {\n        cout << name << \" uses Water Breathing 11th form!\" << endl;\n    }\n};\n\nint main() {\n    Demon* demon[3];\n    demons[1] = new Upper1();\n    demons[2] = new Upper2();\n    demons[3] = new Upper3();\n\n    Slayer s1 = new Soldier(\"Tanjiro\");  \n\n    for (int i = 0; i < 3; ++i) {\n        demons[i]->attack();\n        s1->strike(demons[i]);\n        s1->specialMove();\n        s1->recover();\n        s1->displayStatus();\n    }\n\n    return 0;\n\n    for (int i = 0; i < 3; ++i) delete demons[i];\n    delete s1;\n\n    return 0;\n}`,
    ext: ".cpp",
  },
  4: {
    id: 4,
    title: "The Linguistic AI Tuner",
    description: `You're a software engineer working at LinguaBot Inc., a company building smart reading assistants that evaluate the difficulty and "rhythm" of words in real-time speech or text.\\n\\nYour team is currently testing a prototype AI module that gives a “rhythmic score” to every word spoken by a user. This score is essential for generating speech feedback and text complexity metrics.\\n\\nThe core logic is simple:\\n\\n●	Words with an even number of vowels are more rhythmically balanced and thus score 2 points.\\n●	Words with an odd number of vowels are less balanced and score 1 point.\\n\\nUnfortunately, the current code has a bug, and the AI isn't scoring properly — sometimes returning incorrect values or even crashing.\\n\\nYour mission is to debug and fix the existing score_words function so that it calculates the correct total score based on the rhythm rule.`,
    example: "--------------------\\nInput 1:\\n2\\nhacker book\\n\\nOutput:\\n4\\n--------------------\\nInput 1:\\n3\\n programming is awesome\\n\\nOutput:\\n4\\n--------------------\\n",
    code: `defined score_words(words):\n    vowels = ['a', 'e', 'i', 'o', 'u', 'y']\n    score = 0\n    for word in word:\n        count = 0\n        for letter in word:\n            if letter == vowels:\n                count += 2\n        if count / 2 == 0:\n            score += 1\n        else:\n            score += 0\n    return score\n\nif __name__ == '__main__':\n    n = int(input())\n    words = input().split()\n    print(score_words(words))\n`,
    ext: ".py",
  },
  5: {
    id: 5,
    title: "Rocket Fuel Calibration",
    description: `You are a junior engineer at AstroX, a company building interplanetary spacecraft. One of your tasks is to calibrate the rocket's fuel mix for optimal thrust.\\n\\nYour spacecraft uses a three-chamber propulsion system, and each chamber must be filled with a different fuel type selected from an array of available fuel modules. Every fuel module has a fuel energy rating (an integer that can be positive, negative, or zero).\\n\\nDue to mission constraints and safety protocols, you must choose exactly three different fuel modules whose combined energy rating is as close as possible to a target value provided by the mission commander.\\n\\nYou have to debug a program that helps the system automatically determine the optimal combination for the calibration.\\n\\n`,
    example: "",
    code: `from typing import List\n\nclass Solution:\n    def threeSumClosest(self, nums: List[int], target: int) -> int:\n        nums = nums.sort()\n        closest = 0\n        diff = 100000\n\n        for i in range(nums):\n            l = i + 1\n            r = len(nums)\n\n            while r < l:\n                sum = nums[i] + nums[l]\n                if abs(sum - target) > diff:\n                    diff = abs(sum - target)\n                    closest = sum\n                if sum < target:\n                    l -= 1\n                else:\n                  r += 1\n        return sum`,
    ext: ".py",
  }
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
      name: filename,
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
