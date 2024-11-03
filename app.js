const express = require("express"); // Importing Express, a Node.js framework, to handle HTTP requests and simplify server setup.
const http = require("http"); // Importing the HTTP module to create a server instance.
const socketIo = require("socket.io"); // Importing Socket.io, a library enabling real-time, bidirectional communication between client and server.
const cors = require('cors'); // Importing CORS to enable Cross-Origin Resource Sharing for handling requests from different origins.
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"})
const app = express(); // Initialize the Express app

// Create an HTTP server instance based on the Express app
const server = http.createServer(app);
app.use(cors());

// Apply the CORS middleware to allow requests from any origin

const BASE = process.env.BASE;

// Set up Socket.io to work with the HTTP server and configure CORS for specific request types and origins
const io = socketIo(server, {
    cors: {
        origin : BASE,
        // origin: "*", // Allow all origins (useful for development; can be restricted in production)
        methods: ["GET", "PUT"] // Allow only GET and PUT methods for incoming requests
    }
});

// Listen for a new client connection event on Socket.io
io.on("connection", (socket) => {
    console.log("New user logged in", socket.id); // Log each new connection with the unique socket ID

    // Listen for "join_room" event from client and add the user to the specified room
    socket.on("join_room", (code, username) => { // getting code,username from frontend
        socket.join(code); // Join the specified room (code)
        console.log(`User ID: ${socket.id} joined room: ${code}, Username: ${username}`); // Log the room join info with the username
    });

    // Listen for "sendtext" event from client with the message to be sent to the room
    socket.on("sendtext", (message) => {
        console.log(message); // Log the message content for debugging
        const { room } = message; // Destructure to get the room from message data
        socket.to(room).emit("receive_message", message); // Broadcast the message to everyone in the specified room except the sender
    });

    // Listen for a client disconnect event
    socket.on("disconnect", () => {
        console.log("User disconnected.", socket.id); // Log when a user disconnects with their socket ID
    });
});

// Start the server on port 5000 and log to confirm the server is running
// Confirmation message in the console when the server starts successfully
const PORT = process.env.PORT || 6036;
server.listen(PORT, () => { console.log(`Server started on port ${PORT}.`); });
