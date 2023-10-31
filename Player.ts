import { Card } from "./Card";

export class Player {
  hand: Card[] = [];
  stack: number;
  currentBet: number = 0;

  constructor(initialStack: number) {
    this.stack = initialStack;
  }

  takeCard(card: Card): void {
    this.hand.push(card);
  }

  bet(amount: number): void {
    if (amount <= 0) {
      throw new Error("Bet amount must be positive.");
    }
    if (amount >= this.stack) {
      this.allIn();
    } else {
      this.currentBet = amount;
      this.stack -= amount;
    }
  }

  raise(amount: number): void {
    if (amount <= 0) {
      throw new Error("Raise amount must be positive.");
    }
    const totalBet = this.currentBet + amount;
    if (totalBet >= this.stack) {
      this.allIn();
    } else {
      this.stack -= amount;
      this.currentBet = totalBet;
    }
  }

  call(currentRoundBet: number): void {
    const amountToCall = currentRoundBet - this.currentBet;
    if (amountToCall > this.stack) {
      this.allIn();
    } else {
      this.currentBet += amountToCall;
      this.stack -= amountToCall;
    }
  }

  check(currentRoundBet: number): void {
    if (this.currentBet < currentRoundBet) {
      throw new Error("Cannot check: there is a bet in the current round.");
    }
  }

  allIn(): void {
    this.currentBet += this.stack;
    this.stack = 0;
  }

  fold(): void {
    this.hand = [];
  }
}
