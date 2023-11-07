import React from 'react';
import { Button, TextField } from '@material-ui/core';

function PlayerInterface() {
  return (
    <div>
      <TextField id="playerName" placeholder="Enter Name" />
      <Button id="joinGame">Join Game</Button>
      {/* More code to display the player's cards and actions... */}
    </div>
  );
}

export default PlayerInterface;