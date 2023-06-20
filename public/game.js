document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const fieldWidth = canvas.width / 10;
    const fieldHeight = canvas.height / 10;

    // Function to draw a single field on the canvas
    const drawField = (x, y, width, height, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    };

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('maxPlayersReached', () => {
        alert('Maximum number of players reached');
    });

    socket.on('playerCreated', (player) => {
        console.log(`Player ${player.name} created`);
    });

    socket.on('updateGameState', (gameState) => {
        console.log('Updated game state', gameState);

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw fields for each player
        gameState.players.forEach((player, index) => {
            const x = (player.position % 10) * fieldWidth;
            const y = Math.floor(player.position / 10) * fieldHeight;

            const color = index === gameState.currentPlayerIndex ? 'red' : 'blue';
            drawField(x, y, fieldWidth, fieldHeight, color);

            // Draw player's name
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(player.name, x + 5, y + 20);
        });
    });

    socket.on('yourTurn', () => {
        console.log('Your turn');
    });

    // Example movement when the 'Move' button is clicked
    document.addEventListener('click', () => {
        const steps = Math.floor(Math.random() * 6) + 1; // Random number between 1 and 6
        socket.emit('movePlayer', steps);
    });
});
