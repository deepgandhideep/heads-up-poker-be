import { useEffect, useState } from "react";
import "./App.css";
import useAppSocket from "./hooks/useAppSocket";
import tableSvg from "./assets/table-nobg-svg-01.svg";
import Player from "./components/Player";
import { generateTable } from "./utils/players";

function App() {
  const [playerName, setPlayerName] = useState<string>("");
  const { joinGame } = useAppSocket();
  const [players, setPlayers] = useState<Array<any>>([]);

  useEffect(() => {
    setPlayers(generateTable());
  }, []);

  // const handleJoinGame = () => {
  //   return joinGame(playerName);
  // };

  const renderBoard = () => {
    return players.map((player: any, index: number) => {
      return (
        <Player
          key={index}
          arrayIndex={index}
          isActive={true}
          player={player}
        />
      );
    });
  };

  return (
    <>
      <div className="poker-table--wrapper">
        <div className="poker-app--background">
          <div className="poker-table--container">
            <img
              className="poker-table--table-image"
              src={tableSvg}
              alt="Poker Table"
            />
            {renderBoard()}
            <div className="community-card-container">
              {/* {this.renderCommunityCards()} */}
            </div>
            <div className="pot-container">
              // POT HERE
              {/* <img
                style={{ height: 55, width: 55 }}
                src={"./assets/pot.svg"}
                alt="Pot Value"
              />
              <h4> {`${this.state.pot}`} </h4> */}
            </div>
          </div>
          {/* {this.state.phase === "showdown" && this.renderShowdown()} */}
          <div className="game-action-bar">
            <div className="action-buttons">
              // ACTION BUTTONS HERE
              {/* {this.renderActionButtons()} */}
            </div>
            <div className="slider-boi">
              // MENU HERE
              {/* {!this.state.loading &&
                renderActionMenu(
                  highBet,
                  players,
                  activePlayerIndex,
                  phase,
                  this.handleBetInputChange
                )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
