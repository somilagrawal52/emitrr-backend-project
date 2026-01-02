🎮 Connect 4 Multiplayer Game (Real-Time)

A real-time Connect 4 multiplayer game built using Node.js, Socket.IO, MongoDB, and Kafka for analytics events.
Players can play against each other or against a bot, with leaderboard tracking and game analytics.

🚀 Features

Real-time multiplayer gameplay using Socket.IO

Bot fallback if no opponent joins

Persistent leaderboard using MongoDB

Game analytics events using Apache Kafka

Reconnect support on disconnect

Clean EJS-based frontend (no React)

🛠 Tech Stack

Backend: Node.js, Express

Realtime: Socket.IO

Database: MongoDB (Mongoose)

Messaging / Analytics: Apache Kafka (KafkaJS)

Frontend: EJS, Vanilla JS, CSS

📁 Project Structure
.
├── server.js
├── socket.js
├── package.json
├── /game
│   ├── gameManager.js
│   ├── board.js
│   ├── rules.js
│   └── bot.js
├── /db
│   └── mongo.js
├── /matchmaking
│   └── queue.js
├── /routes
│   └── leaderboard.js
├── /kafka
│   └── producer.js
├── /views
│   └── index.ejs
├── /public
│   ├── client.js
│   └── style.css
└── README.md

✅ Prerequisites

Make sure you have the following installed:

Node.js (v18+ recommended)

MongoDB (local or Atlas)

Apache Kafka (v3.6.0)

ZooKeeper (required for Kafka on Windows)

⚙️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/your-username/connect4-game.git
cd connect4-game

2️⃣ Install Dependencies
npm install

3️⃣ Start MongoDB

If using local MongoDB:

mongod


Ensure MongoDB is running on:

mongodb://localhost:27017/connect4

4️⃣ Start ZooKeeper (Kafka dependency)
cd C:\kafka_2.12-3.6.0
bin\windows\zookeeper-server-start.bat config\zookeeper.properties


⚠️ Ensure dataDir in zookeeper.properties is set to a valid Windows path.

5️⃣ Start Kafka Broker

Open a new terminal:

cd C:\kafka_2.12-3.6.0
bin\windows\kafka-server-start.bat config\server.properties


Kafka should now be running on:

localhost:9092

6️⃣ Create Kafka Topic (One Time)
bin\windows\kafka-topics.bat --create ^
--topic connect4-events ^
--bootstrap-server localhost:9092 ^
--partitions 1 ^
--replication-factor 1

7️⃣ Start the Application
npm start


You should see:

Server running on port 3000
MongoDB connected
Kafka producer connected

🌐 Run the App

Open your browser and go to:

http://localhost:3000


Enter a username

Join a game

Play against another player or a bot

📊 Kafka Analytics Events

The app publishes the following Kafka events:

GAME_STARTED

MOVE_PLAYED

GAME_ENDED

Each event contains:

{
  "type": "MOVE_PLAYED",
  "payload": {
    "gameId": "...",
    "player": "Somil",
    "column": 3
  },
  "timestamp": 1700000000000
}

🏆 Leaderboard API

Endpoint:

GET /leaderboard


Returns top players sorted by wins.

🧪 Troubleshooting
Kafka connection error?

Ensure ZooKeeper is running before Kafka

Ensure port 9092 is free

Check Windows paths in Kafka configs

Frontend not loading?

Ensure client.js and style.css are inside /public

Ensure express.static("public") is enabled

📌 Future Improvements

Kafka consumer for analytics dashboard

Authentication

Match history UI

Deployment using Docker / Cloud

👤 Author

Somil Agrawal
Final-year Engineering Student
Backend & Systems Enthusiast