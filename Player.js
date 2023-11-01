"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(initialStack) {
        this.hand = [];
        this.currentBet = 0;
        this.stack = initialStack;
    }
    takeCard(card) {
        this.hand.push(card);
    }
    bet(amount) {
        if (amount <= 0) {
            throw new Error("Bet amount must be positive.");
        }
        if (amount >= this.stack) {
            this.allIn();
        }
        else {
            this.currentBet = amount;
            this.stack -= amount;
        }
    }
    raise(amount) {
        if (amount <= 0) {
            throw new Error("Raise amount must be positive.");
        }
        const totalBet = this.currentBet + amount;
        if (totalBet >= this.stack) {
            this.allIn();
        }
        else {
            this.stack -= amount;
            this.currentBet = totalBet;
        }
    }
    call(currentRoundBet) {
        const amountToCall = currentRoundBet - this.currentBet;
        if (amountToCall > this.stack) {
            this.allIn();
        }
        else {
            this.currentBet += amountToCall;
            this.stack -= amountToCall;
        }
    }
    check(currentRoundBet) {
        if (this.currentBet < currentRoundBet) {
            throw new Error("Cannot check: there is a bet in the current round.");
        }
    }
    allIn() {
        this.currentBet += this.stack;
        this.stack = 0;
    }
    fold() {
        this.hand = [];
    }
}
exports.Player = Player;
