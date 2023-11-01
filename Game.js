"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const PokerSolver = __importStar(require("pokersolver"));
const Deck_1 = require("./Deck");
const Player_1 = require("./Player");
class Game {
    constructor(stackSize) {
        this.communityCards = [];
        this.pot = 0;
        this.currentRoundBet = 0;
        this.deck = new Deck_1.Deck();
        this.player1 = new Player_1.Player(stackSize);
        this.player2 = new Player_1.Player(stackSize);
        this.currentPlayer = this.player1;
    }
    dealInitialCards() {
        this.deck.shuffle();
        this.player1.takeCard(this.deck.draw());
        this.player1.takeCard(this.deck.draw());
        this.player2.takeCard(this.deck.draw());
        this.player2.takeCard(this.deck.draw());
        this.currentRoundBet = 0;
    }
    dealFlop() {
        for (let i = 0; i < 3; i++) {
            this.communityCards.push(this.deck.draw());
        }
        this.collectBets();
        this.currentRoundBet = 0;
    }
    dealTurnOrRiver() {
        this.communityCards.push(this.deck.draw());
        this.collectBets();
        this.currentRoundBet = 0;
    }
    evaluateHands() {
        const hand1 = PokerSolver.Hand.solve([...this.player1.hand, ...this.communityCards].map((card) => card.toString()));
        const hand2 = PokerSolver.Hand.solve([...this.player2.hand, ...this.communityCards].map((card) => card.toString()));
        const winner = PokerSolver.Hand.winners([hand1, hand2])[0];
        if (winner === hand1) {
            return "Player 1 wins!";
        }
        else if (winner === hand2) {
            return "Player 2 wins!";
        }
        else {
            return "It's a tie!";
        }
    }
    switchPlayer() {
        this.currentPlayer =
            this.currentPlayer === this.player1 ? this.player2 : this.player1;
    }
    collectBets() {
        this.pot += this.player1.currentBet + this.player2.currentBet;
        this.player1.currentBet = 0;
        this.player2.currentBet = 0;
    }
    playerAction(action, amount) {
        switch (action) {
            case "bet":
                this.currentPlayer.bet(amount);
                this.currentRoundBet = this.currentPlayer.currentBet;
                break;
            case "raise":
                this.currentPlayer.raise(amount);
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
exports.Game = Game;
