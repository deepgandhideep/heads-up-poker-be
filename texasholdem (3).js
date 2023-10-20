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
        this.current_bet = 0;
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
    
    playerCheck(player) {
        console.log(`${player.name} checks.`);
    }

    playerBet(player, betAmount) {
        betAmount = Math.min(player.chips, Math.max(TexasHoldem.MIN_BET, betAmount));
        this.pot += player.bet(betAmount);
        console.log(`${player.name} bets ${betAmount} chips. Total pot: ${this.pot} chips.`);
        return betAmount;
    }

    playerCall(player, currentBet, contributions) {
        let amountToCall = currentBet - contributions[player];
        let betAmount = Math.min(player.chips, amountToCall);
        this.pot += player.bet(betAmount);
        console.log(`${player.name} calls ${betAmount} chips. Total pot: ${this.pot} chips.`);
        if (player.chips === 0) {
            console.log(`${player.name} is all-in!`);
        }
        return betAmount;
    }

    playerFold(player) {
        console.log(`${player.name} folds.`);
        let otherPlayer = this.players[1] === player ? this.players[0] : this.players[1];
        otherPlayer.receiveChips(this.pot);
        this.pot = 0;
    }

    playerRaise(player, raiseAmount, currentBet, contributions) {
        raiseAmount = Math.max(TexasHoldem.MIN_BET, raiseAmount);
        let totalRaise = currentBet + raiseAmount - contributions[player];
        totalRaise = Math.min(player.chips, totalRaise);
        this.pot += player.bet(totalRaise);
        console.log(`${player.name} raises to ${currentBet + raiseAmount} chips. Total pot: ${this.pot} chips.`);
        if (player.chips === 0) {
            console.log(`${player.name} is all-in!`);
        }
        return currentBet + raiseAmount; // new current bet after the raise
    }
    
    async getActionFromPlayer(player, contributions) {
        let validAction = false;

        while (!validAction) {
            const availableActions = player.currentBet === this.currentBet ? "[check], [raise], or [fold]" : "[call], [raise], or [fold]";
            const action = await prompt(`Player ${player.name}, do you want to ${availableActions}?`);

            switch (action.toLowerCase()) {
                case "check":
                    if (player.currentBet === this.currentBet) {
                        this.playerCheck(player);
                        validAction = true;
                    } else {
                        console.log("You can't check now. The current table bet is higher than yours.");
                    }
                    break;

                case "call":
                    this.currentBet = this.playerCall(player, this.currentBet, contributions);
                    validAction = true;
                    break;

                case "raise":
                    const raiseAmount = parseInt(await prompt(`Player ${player.name}, how much do you want to raise?`), 10);
                    if (raiseAmount > 0 && raiseAmount <= (player.chips - player.currentBet)) {
                        this.currentBet = this.playerRaise(player, raiseAmount, this.currentBet, contributions);
                        validAction = true;
                    } else {
                        console.log("Invalid raise amount.");
                    }
                    break;

                case "fold":
                    this.playerFold(player);
                    validAction = true;
                    break;

                default:
                    console.log(`Invalid action. Please choose ${availableActions}.`);
                    break;
            }
        }
    }

    
    collectBets() {
        // Reset initial states
        this.roundIsOver = false;
        this.currentBet = 0;
        let contributions = { [this.players[0].name]: 0, [this.players[1].name]: 0 };
        this.pot = 0;

        while (!this.roundIsOver) {
            for (let player of this.players) {
                if (player.hasFolded) {
                    this.roundIsOver = true;
                    break;
                }

                if (player.currentBet < this.currentBet || contributions[player.name] < this.currentBet) {
                    await this.getActionFromPlayer(player, contributions);
                }

                if (this.players[0].hasFolded || this.players[1].hasFolded) {
                    this.roundIsOver = true;
                }
            }
        }

        // Collect the bets and add them to the pot
        for (let player of this.players) {
            this.pot += player.currentBet;
            player.chips -= player.currentBet;
            player.currentBet = 0;
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

    async playRound() {
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
        if (await this.collectBets()) {
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
            if (await this.collectBets()) {
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
                if (await this.collectBets()) {
                    return;
                }

                // 8. Deal the river
                this.dealTurnOrRiver();

                // 8. Betting after the river
                Card.printPrettyCards(this.community_cards);
                if (await this.collectBets()) {
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


    async playGame() {
        // Assuming each player starts with 1000 chips
        console.log("Welcome to Heads-Up Texas Hold'em!");
        console.log(`Player 1: ${this.players[0].name} with ${this.players[0].chips} chips.`);
        console.log(`Player 2: ${this.players[1].name} with ${this.players[1].chips} chips.`);

        while (this.players[0].chips > 0 && this.players[1].chips > 0) {
            await this.playRound();

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

TexasHoldem.MIN_BET = 50;
module.exports = TexasHoldem; 







