const Player = require("./player_v1");
const Deck = require("./deck_v1");
const { Hand } = require("pokersolver");

let gameState = {
  players: [],
  community_cards: [],
  pot: 0,
  deck: {},
  state: {},
  winner: "",
  reason: "",
};

class TexasHoldem {
  constructor(player1, player2) {
    console.log(
      "init " + JSON.stringify(player1) + " " + JSON.stringify(player2)
    );

    gameState.deck = new Deck();
    gameState.players = [player1, player2];
    gameState.pot = 0;
    gameState.community_cards = [];
  }

  resetForNewRound() {
    gameState.deck = new Deck();
    gameState.deck.shuffleCards();
    gameState.pot = 0;
    gameState.community_cards = [];
    for (let player of gameState.players) {
      player.hand = [];
      player.currentBet = 0;
      player.hasFolded = false;
    }
  }
  dealInitialCards() {
    gameState.deck.shuffleCards();
    for (let player of gameState.players) {
      player.receiveCards([gameState.deck.deal(), gameState.deck.deal()]);
    }
    gameState.state = "pre-flop";
  }

  dealFlop() {
    for (let i = 0; i < 3; i++) {
      gameState.community_cards.push(gameState.deck.deal());
    }
    gameState.state = "flop";
    console.log("gs after flopdeal " + JSON.stringify(gameState));
  }

  dealTurnOrRiver() {
    gameState.community_cards.push(gameState.deck.deal());
    if (gameState.state == "flop") gameState.state = "turn";
    else if (gameState.state == "turn") gameState.state = "river";
    console.log("gs after dealTurnOrRiver " + JSON.stringify(gameState));
  }

  playerCheck(player) {
    console.log(`${player.name} checks.`);
  }

  playerFold(player) {
    console.log(`${player.name} folds.`);
    player.hasFolded = true;
    let otherPlayer =
      this.players[1] === player ? this.players[0] : this.players[1];
    otherPlayer.receiveChips(this.pot);
    this.pot = 0;
  }

  playerBet(player, betAmount) {
    betAmount = Math.min(
      player.chips,
      Math.max(TexasHoldem.MIN_BET, betAmount)
    );
    player.currentBet += betAmount;
    this.pot += player.bet(betAmount);
    console.log(
      `${player.name} bets ${betAmount} chips. Total pot: ${this.pot} chips.`
    );
    return betAmount;
  }

  playerCall(player, currentBet, contributions) {
    let amountToCall = currentBet - contributions[player.name];
    let betAmount = Math.min(player.chips, amountToCall);
    player.currentBet += betAmount;
    this.pot += player.bet(betAmount);
    console.log(
      `${player.name} calls ${betAmount} chips. Total pot: ${this.pot} chips.`
    );
    contributions[player.name] += betAmount;
    if (player.chips === 0) {
      console.log(`${player.name} is all-in!`);
    }
    return betAmount;
  }

  playerRaise(player, raiseAmount, currentBet, contributions) {
    raiseAmount = Math.max(TexasHoldem.MIN_BET, raiseAmount);
    let totalRaise = currentBet + raiseAmount - contributions[player.name];
    totalRaise = Math.min(player.chips, totalRaise);
    player.currentBet += totalRaise;
    this.pot += player.bet(totalRaise);
    console.log(
      `${player.name} raises to ${currentBet + raiseAmount} chips. Total pot: ${
        this.pot
      } chips.`
    );
    contributions[player.name] += totalRaise;
    if (player.chips === 0) {
      console.log(`${player.name} is all-in!`);
    }
    return currentBet + raiseAmount;
  }

  dealHands() {
    this.resetForNewRound();
    this.dealInitialCards();
  }

  showDown() {
    // 9. Determine the winner
    const player1Eval = Hand.solve(
      gameState.players[0].hand.concat(gameState.community_cards)
    );
    const player2Eval = Hand.solve(
      gameState.players[1].hand.concat(gameState.community_cards)
    );
    const winner = Hand.winners([player1Eval, player2Eval]);

    if (winner.length === 1) {
      if (winner[0] === player1Eval) {
        gameState.winner = gameState.players[0];
        gameState.reason = player1Eval.descr;
      } else {
        gameState.winner = gameState.players[1];
        gameState.reason = player2Eval.descr;
      }
    } else {
      gameState.winner = null;
    }

    // 10. Distribute the pot
    if (gameState.winner) {
      gameState.winner.receiveChips(gameState.pot);
      console.log(`${winner.name} wins ${gameState.pot} chips!`);
    } else {
      // Pot split in case of a tie
      let potHalf = Math.floor(gameState.pot / 2);
      this.players[0].receiveChips(potHalf);
      this.players[1].receiveChips(potHalf);
      console.log(`It's a tie! Each player receives ${potHalf} chips.`);
    }
  }

  playGame() {
    // Assuming each player starts with 1000 chips
    console.log("Welcome to Heads-Up Texas Hold'em!");
    console.log("gs " + JSON.stringify(gameState));
    console.log(
      `Player 1: ${gameState.players[0].name} with ${gameState.players[0].chips} chips.`
    );
    console.log(
      `Player 2: ${gameState.players[1].name} with ${gameState.players[1].chips} chips.`
    );

    this.dealHands();
  }
  getGameState() {
    return gameState;
  }
}

TexasHoldem.MIN_BET = 50;
module.exports = TexasHoldem;
