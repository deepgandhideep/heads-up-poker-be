const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const PokerSolver = require('pokersolver').Hand;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname, 'player.html'));
});

app.get('/dealer', (req, res) => {
    res.sendFile(path.join(__dirname, 'dealer.html'));
});

// Game state
let gameState = {
  players: {},
  board: [],
  pot: 0,
  turn: null,
  stage: "pre-flop",
  deck: []
};

// Helper functions
function initializeDeck() {
    const suits = ['h', 'd', 'c', 's'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    
    gameState.deck = [];

    for (let suit of suits) {
        for (let value of values) {
            gameState.deck.push(value + suit);
        }
    }

    // Shuffle the deck
    gameState.deck.sort(() => Math.random() - 0.5);
}

function dealCards(n) {
  return gameState.deck.splice(0, n);
}

function evaluateWinner(player1Hand, player2Hand, board) {
    // Create hands in the format the library expects
    const player1Eval = PokerSolver.solve(player1Hand.concat(board));
    const player2Eval = PokerSolver.solve(player2Hand.concat(board));

    // Compare the hands
    const winner = PokerSolver.winners([player1Eval, player2Eval]);

    if (winner.length === 1) {
        if (winner[0] === player1Eval) return 'player1';
        else return 'player2';
    } else {
        return 'draw';
    }
}

function dealCommunityCards() {
  switch (gameState.stage) {
    case "flop":
      gameState.board.push(...dealCards(3));
      gameState.stage = "turn";
      break;
    case "turn":
      gameState.board.push(...dealCards(1));
      gameState.stage = "river";
      break;
    case "river":
      gameState.board.push(...dealCards(1));
      gameState.stage = "showdown";
      break;
    default:
      console.error("Incorrect stage for dealing community cards:", gameState.stage);
  }
}

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('joinGame', (playerName) => {
    if (Object.keys(gameState.players).length < 2) {
      gameState.players[socket.id] = {
        name: playerName,
        hand: [],
        stack: 1000,
        bet: 0
      };
      socket.emit('gameState', gameState);
      io.emit('message', `${playerName} has joined the game.`);
    } else {
      socket.emit('message', 'The game is full.');
    }
  });

  socket.on('playerAction', (action) => {
    switch (action.type) {
      case 'fold':
        gameState.turn = Object.keys(gameState.players).find(id => id !== socket.id);
        gameState.players[socket.id].bet = 0;
        break;
      case 'check':
        gameState.turn = Object.keys(gameState.players).find(id => id !== socket.id);
        break;
      case 'bet':
        const betAmount = action.amount;
        if (gameState.players[socket.id].stack >= betAmount) {
          gameState.players[socket.id].stack -= betAmount;
          gameState.players[socket.id].bet = betAmount;
          gameState.pot += betAmount;
          gameState.turn = Object.keys(gameState.players).find(id => id !== socket.id);
        } else {
          socket.emit('message', 'Insufficient chips to bet that amount.');
        }
        break;
      default:
        console.error('Unknown player action:', action.type);
    }
    io.emit('gameState', gameState);
  });

  socket.on('startGame', () => {
    if (Object.keys(gameState.players).length === 2) {
      initializeDeck();
      for (const playerId in gameState.players) {
        gameState.players[playerId].hand.push(...dealCards(2));
      }
      gameState.turn = Object.keys(gameState.players)[0];
      io.emit('gameState', gameState);
      io.emit('message', 'The game has started!');
    } else {
      socket.emit('message', 'Need two players to start the game.');
    }
  });

  socket.on('showdown', () => {
    const player1Id = Object.keys(gameState.players)[0];
    const player2Id = Object.keys(gameState.players)[1];
    
    const winner = evaluateWinner(
        gameState.players[player1Id].hand,
        gameState.players[player2Id].hand,
        gameState.board
    );

    switch (winner) {
        case 'player1':
            gameState.players[player1Id].stack += gameState.pot;
            io.emit('message', 'Player 1 wins the pot!');
            break;
        case 'player2':
            gameState.players[player2Id].stack += gameState.pot;
            io.emit('message', 'Player 2 wins the pot!');
            break;
        case 'draw':
            const splitPot = gameState.pot / 2;
            gameState.players[player1Id].stack += splitPot;
            gameState.players[player2Id].stack += splitPot;
            io.emit('message', 'It\'s a draw! The pot is split.');
            break;
    }

    gameState.pot = 0;
    io.emit('gameState', gameState);
});


  socket.on('nextStage', () => {
    if (["flop", "turn", "river"].includes(gameState.stage)) {
      dealCommunityCards();
      io.emit('gameState', gameState);
    } else {
      socket.emit('message', `Can't proceed to the next stage from ${gameState.stage}.`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    delete gameState.players[socket.id];
    io.emit('gameState', gameState);
    io.emit('message', 'A player has left the game.');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
