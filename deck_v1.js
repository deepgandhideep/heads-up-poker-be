const { shuffle } = require('lodash'); 

class Deck {
    static STR_RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    static CHAR_SUIT_TO_INT_SUIT = {
        "h": "♥", // Hearts
        "d": "♦", // Diamonds
        "c": "♣", // Clubs
        "s": "♠"  // Spades
    };
    static _FULL_DECK = [];

    constructor() {
        this.shuffle();
    }

    shuffle() {
        this.cards = Deck.getFullDeck();
        shuffle(this.cards);
    }

    deal(n = 1) {
        if (n === 1) {
            return this.cards.shift();
        }

        const cards = [];
        for (let i = 0; i < n; i++) {
            cards.push(this.deal());
        }
        return cards;
    }

    toString() {
        return this.cards.join(', ');
    }

    static getFullDeck() {
        if (Deck._FULL_DECK.length) {
            return [...Deck._FULL_DECK];
        }

        for (const rank of Deck.STR_RANKS) {
            for (const [suit, _] of Object.entries(Deck.CHAR_SUIT_TO_INT_SUIT)) {
                Deck._FULL_DECK.push(rank + suit);
            }
        }

        return [...Deck._FULL_DECK];
    }
}

module.exports = Deck;
