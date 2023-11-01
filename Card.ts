export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type Value =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export default class Card {
  constructor(public suit: Suit, public value: Value) {}

  toString(): string {
    return `${this.value}${this.suit.charAt(0).toLowerCase()}`;
  }
}
