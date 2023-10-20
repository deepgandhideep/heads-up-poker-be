class Player {
    constructor(name, chips = 1000) {
        this.name = name;
        this.chips = chips;
        this.hand = [];
    }

    bet(amount) {
        this.chips -= amount;
        return amount;
    }

    receiveChips(amount) {
        this.chips += amount;
    }

    receiveCards(cards) {
        this.hand.push(...cards);
    }
}


module.exports = Player;

