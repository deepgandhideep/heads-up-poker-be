import * as PokerSolver from "pokersolver";
import { Card } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Game {
  deck: Deck;
  player1: Player;
  player2: Player;
  communityCards: Card[] = [];
  pot: number = 0;
  currentPlayer: Player;
  currentRoundBet: number = 0;

  constructor(stackSize: number) {
    this.deck = new Deck();
    this.player1 = new Player(stackSize);
    this.player2 = new Player(stackSize);
    this.currentPlayer = this.player1;
  }

  dealInitialCards(): void {
    this.deck.shuffle();
    this.player1.takeCard(this.deck.draw()!);
    this.player1.takeCard(this.deck.draw()!);
    this.player2.takeCard(this.deck.draw()!);
    this.player2.takeCard(this.deck.draw()!);
    this.currentRoundBet = 0;
  }

  dealFlop(): void {
    for (let i = 0; i < 3; i++) {
      this.communityCards.push(this.deck.draw()!);
    }
    this.collectBets();
    this.currentRoundBet = 0;
  }

  dealTurnOrRiver(): void {
    this.communityCards.push(this.deck.draw()!);
    this.collectBets();
    this.currentRoundBet = 0;
  }

  evaluateHands(): string {
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
      return "Player 1 wins!";
    } else if (winner === hand2) {
      return "Player 2 wins!";
    } else {
      return "It's a tie!";
    }
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
    action: "bet" | "call" | "check" | "fold" | "raise",
    amount?: number
  ): void {
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
        return;
    }
    this.switchPlayer();

    // If both players' current bets are equal, collect bets
    if (this.player1.currentBet === this.player2.currentBet) {
      this.collectBets();
      this.currentRoundBet = 0;
    }
  }
}
