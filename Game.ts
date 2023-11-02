const PokerSolver: any = require("pokersolver");
import Card from "./Card";
import Deck from "./Deck";
import Player from "./Player";

export default class Game {
  deck!: Deck;
  player1!: Player;
  player2!: Player;
  communityCards: string[] = [];
  pot: number = 0;
  currentPlayer: Player;
  currentRoundBet: number = 0;

  constructor(player1: Player, player2: Player) {
    this.deck = new Deck();
    this.player1 = player1;
    this.player2 = player2;
    this.currentPlayer = this.player1;
  }

  dealInitialCards(): void {
    this.deck.shuffle();
    this.player1.takeCard(this.deck.draw()!);
    this.player1.takeCard(this.deck.draw()!);
    this.player2.takeCard(this.deck.draw()!);
    this.player2.takeCard(this.deck.draw()!);
    this.currentRoundBet = 0;
    console.log(
      this.player1.name + " hands " + JSON.stringify(this.player1.hand)
    );
    console.log(
      this.player2.name + " hands " + JSON.stringify(this.player2.hand)
    );
  }

  dealFlop(): void {
    for (let i = 0; i < 3; i++) {
      const card: Card = this.deck.draw()!;
      this.communityCards.push(
        card.value + card.suit.charAt(0).toLocaleLowerCase()
      );
    }
    this.collectBets();
    this.currentRoundBet = 0;
    console.log("Community cards " + this.communityCards);
  }

  dealTurnOrRiver(): void {
    const card: Card = this.deck.draw()!;
    this.communityCards.push(
      card.value + card.suit.charAt(0).toLocaleLowerCase()
    );
    this.collectBets();
    this.currentRoundBet = 0;
    console.log("Community cards " + this.communityCards);
  }

  evaluateHands() {
    const hand1 = PokerSolver.Hand.solve(
      [...this.player1.hand, ...this.communityCards].map((card) =>
        card.toString()
      )
    );
    const hand2 = PokerSolver.Hand.solve(
      [...this.player2.hand, ...this.communityCards].map((card) =>
        card.toString()
      )
    );

    const winner = PokerSolver.Hand.winners([hand1, hand2])[0];

    if (winner === hand1) {
      console.log("Winner " + this.player1.name + " - " + winner.descr);
      this.player1.credit(this.pot);
      this.pot = 0;
    } else if (winner === hand2) {
      console.log("Winner " + this.player2.name + " - " + winner.descr);
      this.player2.credit(this.pot);
      this.pot = 0;
    } else {
      console.log("Winner - Its a tie");
      this.player1.credit(this.pot / 2);
      this.player2.credit(this.pot / 2);
      this.pot = 0;
    }
    console.log("Player1 " + JSON.stringify(this.player1));
    console.log("Player2 " + JSON.stringify(this.player2));
  }

  switchPlayer(): void {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;
  }

  collectBets(): void {
    this.pot += this.player1.currentBet + this.player2.currentBet;
    this.player1.currentBet = 0;
    this.player2.currentBet = 0;
  }

  playerAction(
    player: Player,
    action: "bet" | "call" | "check" | "fold" | "raise",
    amount?: number
  ): void {
    if (player !== this.currentPlayer) {
      throw new Error("Invalid player trying to perform an action!");
    }
    switch (action) {
      case "bet":
        this.currentPlayer.bet(amount!);
        this.currentRoundBet = this.currentPlayer.currentBet;
        break;
      case "raise":
        this.currentPlayer.raise(amount!);
        this.currentRoundBet = this.currentPlayer.currentBet;
        break;
      case "call":
        const callAmount = this.currentRoundBet - this.currentPlayer.currentBet;
        this.currentPlayer.call(callAmount);
        break;
      case "check":
        this.currentPlayer.check(this.currentRoundBet);
        break;
      case "fold":
        this.currentPlayer.fold();
        this.evaluateHands();
        return;
    }
    this.switchPlayer();

    // If both players' current bets are equal, collect bets
    if (this.player1.currentBet === this.player2.currentBet) {
      this.collectBets();
      this.currentRoundBet = 0;
    }
    console.log("pot " + this.pot);
    console.log("Player1 " + JSON.stringify(this.player1));
    console.log("Player2 " + JSON.stringify(this.player2));
  }
}
