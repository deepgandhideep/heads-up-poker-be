class Player {
  constructor(name, chips = 1000) {
    this.name = name;
    this.chips = chips;
    this.hand = [];
  }

  bet(amount) {
    console.log(JSON.stringify(amount));
    this.chips -= amount;
    return amount;
  }

  receiveChips(amount) {
    console.log(JSON.stringify(amount));
    this.chips += amount;
  }

  receiveCards(cards) {
    console.log(JSON.stringify(cards));
    this.hand.push(...cards);
  }
}

export default Player;
