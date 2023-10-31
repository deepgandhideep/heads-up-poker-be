const Player = require("./player_v1");
const Deck = require("./deck_v1");
const { Hand } = require("pokersolver");

let gameState = {
  community_cards: [],
  pot: 0,
  deck: new Deck(),
  state: "pre-flop",
  winner: null,
  winnerName: "",
  reason: "",
};

class TexasHoldem {
  constructor(player1, player2) {
    (gameState.players = [player1, player2]),
      (gameState.contributions = {
        [player1.name]: 0,
        [player2.name]: 0,
      });
    gameState.currentTurn = player1;
    this.resetForNewRound();
  }

  resetForNewRound() {
    gameState.deck.shuffleCards();
    gameState.pot = 0;
    gameState.community_cards = [];

    for (let player of gameState.players) {
      player.hand = [];
      player.currentBet = 0;
      player.hasFolded = false;
    }
  }

  getOtherPlayer(currentPlayer) {
    if (gameState.players[0].name == currentPlayer.name) {
      return gameState.players[1];
    } else {
      return gameState.players[0];
    }
  }

  dealInitialCards() {
    gameState.deck.shuffleCards();
    for (let player of gameState.players) {
      player.receiveCards([gameState.deck.deal(), gameState.deck.deal()]);
    }
    gameState.state = "pre-flop";
    gameState.currentTurn = gameState.players[0];
  }

  bettingRound(player, action) {
    console.log("Player " + JSON.stringify(player));
    console.log("Action " + JSON.stringify(action));
    if (gameState.currentTurn !== player) {
      console.error(`It's not ${player.name}'s turn to act.`);
      return;
    }

    switch (action.action) {
      case "check":
        if (
          gameState.contributions[player.name] <
          gameState.contributions[this.getOtherPlayer().name]
        ) {
          console.error("Can't check. Need to call or fold.");
        } else {
          this.playerCheck(player);
        }
        break;
      case "bet":
        if (
          gameState.pot !== 0 &&
          gameState.contributions[player.name] ===
            gameState.contributions[this.getOtherPlayer().name]
        ) {
          console.error("Can't bet now. You can only raise, call, or fold.");
        } else {
          this.playerBet(player, action.amount);
        }
        break;
      case "call":
        this.playerCall(player);
        break;
      case "raise":
        if (
          gameState.pot === 0 ||
          gameState.contributions[player.name] ===
            gameState.contributions[this.getOtherPlayer().name]
        ) {
          console.error("Can't raise now. You can only bet.");
        } else {
          this.playerRaise(player, action.amount);
        }
        break;
      case "fold":
        this.playerFold(player);
        break;
      default:
        console.error("Invalid action. Please choose again.");
        return;
    }

    this.nextBettor();
  }

  playerCheck(player) {
    console.log(`${player.name} checks.`);
  }

  playerCall(player) {
    const otherPlayer = gameState.players.find((p) => p !== player);
    const minimumBet = gameState.contributions[otherPlayer.name];
    const amountToCall = minimumBet - gameState.contributions[player.name];

    if (amountToCall > player.stack) {
      console.error("Can't call, amount exceeds player's stack.");
      return;
    }

    player.stack -= amountToCall;
    gameState.contributions[player.name] += amountToCall;
    gameState.pot += amountToCall;
    console.log(`${player.name} calls ${amountToCall} chips.`);
  }

  playerBet(player, amount) {
    if (amount > player.stack) {
      console.error("Bet amount exceeds player's stack.");
      return;
    }

    player.stack -= amount;
    gameState.contributions[player.name] += amount;
    gameState.pot += amount;
    console.log(`${player.name} bets ${amount}.`);
  }

  playerRaise(player, amount) {
    const totalAmount = amount;

    if (totalAmount > player.stack) {
      console.error("Raise amount exceeds player's stack.");
      return;
    }

    player.stack -= totalAmount;
    gameState.contributions[player.name] += totalAmount;
    gameState.pot += totalAmount;
    console.log(`${player.name} raises to ${totalAmount}.`);
  }

  playerFold(player) {
    console.log(`${player.name} folds.`);
    player.status = "folded";
  }

  nextBettor() {
    const nextPlayerIndex =
      (gameState.players.findIndex((p) => p === gameState.currentTurn) + 1) % 2;

    const nextPlayer = gameState.players[nextPlayerIndex];
    if (nextPlayer.status === "folded") {
      this.nextBettor();
    } else {
      gameState.currentTurn = nextPlayer;
    }
  }

  dealFlop() {
    for (let i = 0; i < 3; i++) {
      gameState.community_cards.push(gameState.deck.deal());
    }
    gameState.state = "flop";
    console.log(JSON.stringify(gameState));
  }

  dealTurnOrRiver() {
    gameState.community_cards.push(gameState.deck.deal());
    if (gameState.state == "flop") gameState.state = "turn";
    else if (gameState.state == "turn") gameState.state = "river";
    console.log(JSON.stringify(gameState));
  }

  dealHands() {
    this.resetForNewRound();
    this.dealInitialCards();
  }

  showDown() {
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
        gameState.winnerName = gameState.players[0].name;
      } else {
        gameState.winner = gameState.players[1];
        gameState.reason = player2Eval.descr;
        gameState.winnerName = gameState.players[1].name;
      }
    } else {
      gameState.winner = null;
    }

    if (gameState.winner) {
      gameState.winner.receiveChips(gameState.pot);
      console.log(`${gameState.winner.name} wins ${gameState.pot} chips!`);
    } else {
      let potHalf = Math.floor(gameState.pot / 2);
      gameState.players[0].receiveChips(potHalf);
      gameState.players[1].receiveChips(potHalf);
      console.log(`It's a tie! Each player receives ${potHalf} chips.`);
    }
  }

  playGame() {
    console.log("Welcome to Heads-Up Texas Hold'em!");
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
