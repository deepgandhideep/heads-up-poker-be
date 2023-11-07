import Card from "./Card";

import dealerChipImageURL from "../assets/chip.svg";
import chipCountImageURL from "../assets/chips.svg";
import playerBetImageURL from "../assets/bet.svg";

const Player = (props: any) => {
  const {
    arrayIndex,
    // playerAnimationSwitchboard,
    // endTransition,
    // hasDealerChip,
    isActive,
    // phase,
    // clearCards,
    player: { robot, folded, cards, avatarURL, name, chips, bet },
  } = props;

  const renderPlayerCards = () => {
    return cards?.map((card: any, index: number) => {
      return (
        <Card
          key={index}
          cardData={{ ...card, animationDelay: 0 }}
          applyFoldedClassname={false}
        />
      );
    });
  };

  return (
    <div className={`player-entity--wrapper p${arrayIndex}`}>
      {/* <PlayerStatusNotificationBox
        index={arrayIndex}
        isActive={ifAnimating(arrayIndex)}
        content={playerAnimationSwitchboard[arrayIndex].content}
        endTransition={endTransition}
      /> */}
      <div className="centered-flex-row abscard">{renderPlayerCards()}</div>
      <div className="player-entity--container">
        <div className="player-avatar--container">
          <img
            className={`player-avatar--image${isActive ? " activePlayer" : ""}`}
            src={avatarURL}
            alt="Player Avatar"
          />
          <h5 className="player-info--name">{`${name}`}</h5>
          <div className="player-info--stash--container">
            <img
              className="player-info--stash--image"
              src={chipCountImageURL}
              alt="Player Stash"
            />
            <h5>{`${chips}`}</h5>
          </div>
          <div className="player-info--bet--container">
            <img
              className="player-info--bet--image"
              src={playerBetImageURL}
              alt="Player Bet"
            />
            <h5>{`Bet: ${bet}`}</h5>
          </div>
          {/* Dealer Chip: Should have a hasDealerChip conditional rendering? */}
          <div className="dealer-chip-icon-container">
            <img src={dealerChipImageURL} alt="Dealer Chip" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
