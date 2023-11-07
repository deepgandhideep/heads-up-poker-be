// src/components/PlayerInterface.js
import React from 'react';

class PlayerInterface extends React.Component {
  handleAction(action) {
    if (!this.isValidAction(action)) {
      alert('Invalid action!');
      return;
    }
    // Perform the action...
  }

  isValidAction(action) {
    // Implement validation logic here...
  }

  render() {
    // Render player interface here...
  }
}

export default PlayerInterface;

// src/components/DealerInterface.js
import React from 'react';

class DealerInterface extends React.Component {
  handleAction(action) {
    if (!this.isValidAction(action)) {
      alert('Invalid action!');
      return;
    }
    // Perform the action...
  }

  isValidAction(action) {
    // Implement validation logic here...
  }

  render() {
    // Render dealer interface here...
  }
}

export default DealerInterface;