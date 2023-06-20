const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;
const MAX_PLAYERS = 5;

// Store game state
const gameState = {
    players: [],
    currentPlayerIndex: 0,
};

app.get('/game.js', (req, res) => {
    res.sendFile(__dirname + '/public/game.js');
});

// Serve static files
app.use(express.static(__dirname + '/public'));

// Socket.IO events
io.on('connection', (socket) => {
    console.log('New player connected');

    // Check if the maximum number of players has been reached
    if (gameState.players.length >= MAX_PLAYERS) {
        socket.emit('maxPlayersReached');
        socket.disconnect(true);
        return;
    }

    // Create a new player
    const player = {
        id: socket.id,
        name: `Player ${gameState.players.length + 1}`,
        position: 0,
    };

    // Add the player to the game state
    gameState.players.push(player);

    // Send the player information to the connected socket
    socket.emit('playerCreated', player);

    // Notify the current player about their turn
    if (gameState.players.length === 1) {
        socket.emit('yourTurn');
    }

    // Broadcast the updated game state to all connected sockets
    io.emit('updateGameState', gameState);

    // Handle player movement
    socket.on('movePlayer', (steps) => {
        // Check if it's the player's turn
        if (player.id === gameState.players[gameState.currentPlayerIndex].id) {
            // Update the player's position
            player.position = (player.position + steps) % 40;

            // Move to the next player's turn
            gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

            // Notify the current player about their turn
            const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;
            io.to(currentPlayerId).emit('yourTurn');

            // Broadcast the updated game state to all connected sockets
            io.emit('updateGameState', gameState);
        }
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
        console.log('Player disconnected');

        // Remove the player from the game state
        const index = gameState.players.findIndex((p) => p.id === socket.id);
        if (index !== -1) {
            gameState.players.splice(index, 1);

            // Update current player index if needed
            if (gameState.currentPlayerIndex >= gameState.players.length) {
                gameState.currentPlayerIndex = 0;
            }

            // Notify the current player about their turn
            const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;
            io.to(currentPlayerId).emit('yourTurn');

            // Broadcast the updated game state to all connected sockets
            io.emit('updateGameState', gameState);
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
