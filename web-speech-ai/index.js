"use strict";

require("dotenv").config();
const express = require("express");
const axios = require("axios"); // <-- Using Axios for API calls
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Static file serving
app.use(express.static(__dirname + "/views")); // HTML
app.use(express.static(__dirname + "/public")); // JS, CSS

// Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("chat message", async (text) => {
    console.log("🗣️ User said:", text);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo", // You can try gpt-4 or claude models too
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: text },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      console.log("🤖 Bot reply:", reply);
      socket.emit("bot reply", reply);
    } catch (error) {
      console.error("❌ OpenRouter API Error:", error.message);
      socket.emit("bot reply", "OpenRouter failed to reply. Try again.");
    }
  });
});

// Start server
http.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});



