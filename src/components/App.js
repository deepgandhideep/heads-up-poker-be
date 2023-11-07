import React from 'react';
import PlayerInterface from './PlayerInterface';
import DealerInterface from './DealerInterface';

function getUserRole() {
  // This function should be implemented to get the user's role
  // For the purpose of this example, we will return 'player'
  return 'player';
}

function App() {
  const userRole = getUserRole(); // Function to get the user's role
  return (
    <div>
      {userRole === 'player' ? <PlayerInterface /> : <DealerInterface />}
    </div>
  );
}

export default App;