import Player from './player.js';
import Card from './card.js';
import Deck from './deck.js';
import Evaluator from './evaluator.js';

class TexasHoldem {
    constructor(player1, player2) {
        this.deck = new Deck();
        this.players = [player1, player2];
        this.pot = 0;
        this.community_cards = [];
        this.current_bettor = 0; // 0 or 1 for heads-up
    }

    dealInitialCards() {
        for(let player of this.players) {
            player.receiveCards([this.deck.deal(), this.deck.deal()]);
        }
    }

    dealFlop() {
        for(let i = 0; i < 3; i++) {
            this.community_cards.push(this.deck.deal());
        }
    }

    dealTurnOrRiver() {
        this.community_cards.push(this.deck.deal());
    }

    collectBets() {
        const MIN_BET = 50;
        let currentBet = 0;
        let lastAggressor = null;
    
        // This dictionary will keep track of each player's contribution to the pot during this betting round.
        let contributions = {};
        this.players.forEach(player => contributions[player] = 0);
        let firstRound = true;
    
        while (true) {
            let allPlayersActed = true;  // Track if all players have had a chance to act
    
            for (let player of this.players) {
                if (!firstRound && (player.chips === 0 || contributions[player] >= currentBet)) {
                    continue;
                }
    
                allPlayersActed = false;  // At least one player hasn't acted
    
                while (true) {
                    console.log(`${player.name}'s turn with ${player.chips} chips. Current bet: ${currentBet}`);
                    let action = prompt("What would you like to do? (check/bet/call/fold/raise): ");
    
                    if (action === 'check' && currentBet === 0) {
                        console.log(`${player.name} checks.`);
                        break;
                    } else if (action === 'bet' && currentBet === 0) {
                        let betAmount = parseInt(prompt(`How much would you like to bet? (>= ${MIN_BET}): `));
                        betAmount = Math.min(player.chips, Math.max(MIN_BET, betAmount));
                        this.pot += player.bet(betAmount);
                        contributions[player] += betAmount;
                        currentBet = betAmount;
                        lastAggressor = player;
                        console.log(`${player.name} bets ${betAmount} chips. Total pot: ${this.pot} chips.`);
                        break;
                    } else if (action === 'call') {
                        let amountToCall = currentBet - contributions[player];
                        let betAmount = Math.min(player.chips, amountToCall);
                        this.pot += player.bet(betAmount);
                        contributions[player] += betAmount;
                        console.log(`${player.name} calls ${betAmount} chips. Total pot: ${this.pot} chips.`);
                        if (player.chips === 0) {
                            console.log(`${player.name} is all-in!`);
                            return false;
                        }
                        break;
                    } else if (action === 'fold') {
                        console.log(`${player.name} folds.`);
                        let otherPlayer = this.players[1] === player ? this.players[0] : this.players[1];
                        otherPlayer.receiveChips(this.pot);
                        this.pot = 0;
                        return true;
                    } else if (action === 'raise') {
                        let raiseAmount = parseInt(prompt(`How much would you like to raise over the current bet? (>= ${MIN_BET}): `));
                        raiseAmount = Math.max(MIN_BET, raiseAmount);
                        let totalRaise = currentBet + raiseAmount - contributions[player];
                        totalRaise = Math.min(player.chips, totalRaise);
                        this.pot += player.bet(totalRaise);
                        contributions[player] += totalRaise;
                        currentBet += raiseAmount;
                        lastAggressor = player;
                        console.log(`${player.name} raises to ${currentBet} chips. Total pot: ${this.pot} chips.`);
                        if (player.chips === 0) {
                            console.log(`${player.name} is all-in!`);
                            return false;
                        }
                        break;
                    } else {
                        console.log("Invalid action. Try again.");
                    }
                }
            }
    
            // Reset firstRound flag after all players have had a chance to act
            firstRound = false;
    
            // End the betting round if all players have acted and there's no outstanding bet to be matched.
            if (allPlayersActed && (lastAggressor === null || Object.values(contributions).every(contribution => contribution >= currentBet))) {
                break;
            }
        }
    }
    determineWinner() {
        // Determine winner using HandEvaluation
        let evaluator = new Evaluator();
        let player1Score = evaluator.evaluate(this.players[0].hand, this.community_cards);
        let player2Score = evaluator.evaluate(this.players[1].hand, this.community_cards);

        if (player1Score < player2Score) {
            let winningHandType = evaluator.classToString(evaluator.getRankClass(player1Score));
            console.log(`The winning hand is: ${winningHandType}`);
            return this.players[0];
        } else if (player2Score < player1Score) {
            let winningHandType = evaluator.classToString(evaluator.getRankClass(player2Score));
            console.log(`The winning hand is: ${winningHandType}`);
            return this.players[1];
        } else {
            return null;  // Tie
        }
    }

    playRound() {
        // 1. Reset for a new round
        this.deck = new Deck();
        this.pot = 0;
        this.community_cards = [];
        for(let player of this.players) {
            player.hand = [];
        }

        // 2. Deal initial cards
        this.dealInitialCards();

        Card.printPrettyCards(this.players[0].hand);
        Card.printPrettyCards(this.players[1].hand);

        // 3. Pre-flop betting
        if (this.collectBets()) {
            return;
        }

        // Check if any player is all-in. If so, reveal all community cards and determine winner.
        if (this.players.some(player => player.chips === 0)) {
            this.dealFlop();
            this.dealTurnOrRiver();
            this.dealTurnOrRiver();
        } else {
            // 4. Deal the flop
            this.dealFlop();
            Card.printPrettyCards(this.community_cards);

            // 5. Betting after the flop
            if (this.collectBets()) {
                return;
            }

            if (this.players.some(player => player.chips === 0)) {
                this.dealTurnOrRiver();
                this.dealTurnOrRiver();
            } else {
                // 6. Deal the turn
                this.dealTurnOrRiver();
                Card.printPrettyCards(this.community_cards);

                // 7. Betting after the turn
                if (this.collectBets()) {
                    return;
                }

                // 8. Deal the river
                this.dealTurnOrRiver();

                // 8. Betting after the river
                Card.printPrettyCards(this.community_cards);
                if (this.collectBets()) {
                    return;
                }
            }
        }

        Card.printPrettyCards(this.community_cards);

        // 9. Determine the winner
        let winner = this.determineWinner();

        // 10. Distribute the pot
        if (winner) {
            winner.receiveChips(this.pot);
            console.log(`${winner.name} wins ${this.pot} chips!`);
        } else {
            // Pot split in case of a tie
            let potHalf = Math.floor(this.pot / 2);
            this.players[0].receiveChips(potHalf);
            this.players[1].receiveChips(potHalf);
            console.log(`It's a tie! Each player receives ${potHalf} chips.`);
        }
    }


    playGame() {
        // Assuming each player starts with 1000 chips
        console.log("Welcome to Heads-Up Texas Hold'em!");
        console.log(`Player 1: ${this.players[0].name} with ${this.players[0].chips} chips.`);
        console.log(`Player 2: ${this.players[1].name} with ${this.players[1].chips} chips.`);

        while (this.players[0].chips > 0 && this.players[1].chips > 0) {
            this.playRound();

            // Check if a player has lost all chips
            for (let player of this.players) {
                if (player.chips <= 0) {
                    console.log(`${player.name} has run out of chips.`);
                    return;
                }
            }

            console.log(`Player 1: ${this.players[0].name} with ${this.players[0].chips} chips.`);
            console.log(`Player 2: ${this.players[1].name} with ${this.players[1].chips} chips.`);

            // Prompt for continuation or exit
            // This is a synchronous prompt using the 'prompt' function in Node.js environments
            let continueGame = prompt("Continue to next round? (yes/no): ").trim().toLowerCase();
            if (continueGame !== 'yes') {
                break;
            }
        }

        console.log("Thank you for playing!");
    }


module.exports = TexasHoldem; 

  