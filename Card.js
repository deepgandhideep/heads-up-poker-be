"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    toString() {
        return `${this.value}${this.suit.charAt(0).toLowerCase()}`;
    }
}
exports.default = Card;
