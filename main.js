import Player from './Player.js';
import TexasHoldem from './TexasHoldem.js';
import Card from './Card.js';
import Deck from './Deck.js';
import Evaluator from './Evaluator.js';

let player1Name = prompt("Enter name for Player 1: ");
let player1 = new Player(player1Name, 1000);

let player2Name = prompt("Enter name for Player 2: ");
let player2 = new Player(player2Name, 1000);

// Start the game
let game = new TexasHoldem(player1, player2);
game.playGame();
