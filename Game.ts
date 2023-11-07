const PokerSolver: any = require("pokersolver");
import Card from "./Card";
import Deck from "./Deck";
import Player from "./Player";

type Nullable<T> = T | null;
enum GameStage {
  PreFlop = "pre-flop",
  Flop = "flop",
  Turn = "turn",
  River = "river",
  ShowDown = "show-down",
}

export default class Game {
  private gameState: {
    deck: Deck;
    player1: Player;
    player2: Player;
    communityCards: string[];
    pot: number;
    currentPlayer: Player;
    currentRoundBet: number;
    winner: Nullable<Player>;
    winDesc: string;
    gameStage: string;
  };

  constructor(player1: Player, player2: Player) {
    this.gameState = {
      deck: new Deck(),
      player1: player1,
      player2: player2,
      communityCards: [],
      pot: 0,
      currentPlayer: player1,
      currentRoundBet: 0,
      winner: null,
      winDesc: "",
      gameStage: GameStage.PreFlop,
    };
  }

  newGame(): void {
    this.gameState.communityCards = [];
    this.gameState.pot = 0;
    this.gameState.currentRoundBet = 0;
    this.gameState.player1.clearHand();
    this.gameState.player2.clearHand();
    this.gameState.deck.shuffle();
    this.gameState.winner = null;
    this.gameState.winDesc = "";
    console.log("New game started. Deck shuffled and player hands cleared.");
  }

  dealInitialCards(): void {
    this.gameState.deck.shuffle();
    this.gameState.player1.takeCard(this.gameState.deck.draw()!);
    this.gameState.player1.takeCard(this.gameState.deck.draw()!);
    this.gameState.player2.takeCard(this.gameState.deck.draw()!);
    this.gameState.player2.takeCard(this.gameState.deck.draw()!);
    this.gameState.currentRoundBet = 0;
    console.log(
      this.gameState.player1.name +
        " hands " +
        JSON.stringify(this.gameState.player1.hand)
    );
    console.log(
      this.gameState.player2.name +
        " hands " +
        JSON.stringify(this.gameState.player2.hand)
    );
  }

  dealFlop(): void {
    if (this.gameState.currentRoundBet != 0) {
      console.log("Cant deal yet");
      return;
    }
    for (let i = 0; i < 3; i++) {
      const card: Card = this.gameState.deck.draw()!;
      this.gameState.communityCards.push(
        card.value + card.suit.charAt(0).toLocaleLowerCase()
      );
    }
    this.collectBets();
    this.gameState.currentRoundBet = 0;
    console.log("Community cards " + this.gameState.communityCards);
    this.gameState.gameStage = GameStage.Flop;
  }

  dealTurnOrRiver(): void {
    if (this.gameState.currentRoundBet != 0) {
      console.log("Cant deal yet");
      return;
    }
    const card: Card = this.gameState.deck.draw()!;
    this.gameState.communityCards.push(
      card.value + card.suit.charAt(0).toLocaleLowerCase()
    );
    this.collectBets();
    this.gameState.currentRoundBet = 0;
    console.log("Community cards " + this.gameState.communityCards);
    if (this.gameState.gameStage == GameStage.Flop)
      this.gameState.gameStage = GameStage.Turn;
    else if (this.gameState.gameStage == GameStage.Turn)
      this.gameState.gameStage = GameStage.River;
  }

  evaluateHands() {
    const hand1 = PokerSolver.Hand.solve(
      [...this.gameState.player1.hand, ...this.gameState.communityCards].map(
        (card) => card.toString()
      )
    );
    const hand2 = PokerSolver.Hand.solve(
      [...this.gameState.player2.hand, ...this.gameState.communityCards].map(
        (card) => card.toString()
      )
    );

    const winner = PokerSolver.Hand.winners([hand1, hand2])[0];

    if (winner === hand1) {
      console.log(
        "Winner " + this.gameState.player1.name + " - " + winner.descr
      );
      this.gameState.player1.credit(this.gameState.pot);
      this.gameState.pot = 0;
      this.gameState.winner = this.gameState.player1;
      this.gameState.winDesc = winner.descr;
    } else if (winner === hand2) {
      console.log(
        "Winner " + this.gameState.player2.name + " - " + winner.descr
      );
      this.gameState.winner = this.gameState.player2;
      this.gameState.winDesc = winner.descr;
      this.gameState.player2.credit(this.gameState.pot);
      this.gameState.pot = 0;
    } else {
      console.log("Winner - It's a tie");
      this.gameState.player1.credit(this.gameState.pot / 2);
      this.gameState.player2.credit(this.gameState.pot / 2);
      this.gameState.pot = 0;
    }
    console.log("Player1 " + JSON.stringify(this.gameState.player1));
    console.log("Player2 " + JSON.stringify(this.gameState.player2));
  }

  switchPlayer(): void {
    this.gameState.currentPlayer =
      this.gameState.currentPlayer === this.gameState.player1
        ? this.gameState.player2
        : this.gameState.player1;
  }

  collectBets(): void {
    console.log(
      "collectBets Pl1 " +
        this.gameState.player1.currentBet +
        " PL2 " +
        this.gameState.player2.currentBet
    );
    this.gameState.pot +=
      +this.gameState.player1.currentBet + +this.gameState.player2.currentBet;
    this.gameState.player1.currentBet = 0;
    this.gameState.player2.currentBet = 0;
  }

  playerAction(
    player: Player,
    action: "bet" | "call" | "check" | "fold" | "raise",
    amount?: number
  ): void {
    if (player !== this.gameState.currentPlayer) {
      console.log("Invalid player trying to perform an action!");
      //throw new Error();
    }
    switch (action) {
      case "bet":
        this.gameState.currentPlayer.bet(amount!);
        this.gameState.currentRoundBet =
          this.gameState.currentPlayer.currentBet;
        break;
      case "raise":
        this.gameState.currentPlayer.raise(amount!);
        this.gameState.currentRoundBet =
          this.gameState.currentPlayer.currentBet;
        break;
      case "call":
        const callAmount =
          this.gameState.currentRoundBet -
          this.gameState.currentPlayer.currentBet;
        this.gameState.currentPlayer.call(callAmount);
        break;
      case "check":
        this.gameState.currentPlayer.check(this.gameState.currentRoundBet);
        break;
      case "fold":
        this.gameState.currentPlayer.fold();
        this.evaluateHands();
        return;
    }
    this.switchPlayer();

    console.log(
      "actionBets PL1 " +
        this.gameState.player1.currentBet +
        " PL2 " +
        this.gameState.player2.currentBet
    );

    // If both players' current bets are equal, collect bets
    if (
      this.gameState.player1.currentBet == this.gameState.player2.currentBet
    ) {
      console.log("Conditions passed");
      this.collectBets();
      this.gameState.currentRoundBet = 0;
      if (this.gameState.gameStage == GameStage.River)
        this.gameState.gameStage = GameStage.ShowDown;
    }
    console.log("pot " + this.gameState.pot);
    console.log("Player1 " + JSON.stringify(this.gameState.player1));
    console.log("Player2 " + JSON.stringify(this.gameState.player2));
  }
}
