const { shuffle } = require('lodash'); // We use lodash's shuffle because JavaScript does not have a built-in shuffle method
const Card = require('./Card');

class Deck {
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
        return Card.printPrettyCards(this.cards);
    }

    static getFullDeck() {
        if (Deck._FULL_DECK.length) {
            return [...Deck._FULL_DECK];
        }

        for (const rank of Card.STR_RANKS) {
            for (const [suit, val] of Object.entries(Card.CHAR_SUIT_TO_INT_SUIT)) {
                Deck._FULL_DECK.push(new Card(rank + suit));
            }
        }

        return [...Deck._FULL_DECK];
    }
}

module.exports = Deck;
