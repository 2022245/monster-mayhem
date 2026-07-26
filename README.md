# Monster Mayhem

Monster Mayhem is a real time multiplayer web-based board game developed for the Concurrent Systems module at CCT College Dublin.
The project uses Node.js, Express and Socket.IO to support multiple players and multiple independent game sessions running concurrently.

## Repository

GitHub Repository:
https://github.com/2022245/monster-mayhem

## Video Demonstration 

Game Demo and Concurrecy desing explanation:
https://drive.google.com/drive/folders/1jb-lHEc47UL3ni-NpVJMCH8l2ow5SNKa?usp=drive_link

## Technologies Used

- JavaScript
- Node.js
- Express.js
- Socket.IO
- HTML5
- CSS3
- Git and GitHub

## Game Overview

Monster Mayhem is played on a 10x10 board between two players.
Each player controls 10 monsters consisting of:
- Vampires
- Werewolves
- Ghosts
Players submit their moves independently. A round is resolved once both players have submitted a move.

The battle rules are:
- Vampire defeats Werewolf
- Werewolf defeats Ghost
- Ghost defeats Vampire
- Two monsters of the same type eliminate each other
The game finishes when one player has no monsters remaining.

## Multiplayer and Concurrency

The game uses Socket.IO for real time communication between the clients and the Node.js server.
The server maintains the authoritative game state and processes player actions before broadcasting the updated state to the clients.
The application supports multiple independent game rooms. Each room contains its own:
- Players
- Board state
- Monsters
- Round information
- Battle statistics
- Win and loss records
This allows multiple games to run concurrently without the state of one game affecting another.
Player moves are submitted independently and stored by the server. The round is resolved only when both players have submitted their move, keeping both clients synchronized.

## Features

- 10x10 interactive game board
- Two-player real-time multiplayer
- Multiple independent game rooms
- Simultaneous player move submission
- Server-side move validation
- Real-time game-state synchronization
- Monster battle system
- Movement path validation
- Player elimination tracking
- Battle statistics
- Total games played
- Player win/loss records
- Draw tracking
- Play Again system
- Independent statistics for each game room
- Player connection and disconnection handling

## Installation

### Requirements

Node.js and npm must be installed.

### Clone the Repository

git clone https://github.com/2022245/monster-mayhem.git

Enter the project directory:
cd monster-mayhem


Install the required dependencies:
npm install

## Running the Application

Start the development server:
npm run dev


Then open:
http://localhost:3000

in a web browser.
Open a second browser window or incognito window to connect Player 2.
Additional browser windows can be opened to create additional independent game rooms.

## Testing Multiple Games

For example, four browser clients can be used simultaneously:

Game 1
├── Player 1
└── Player 2

Game 2
├── Player 1
└── Player 2

Actions and statistics from Game 1 remain isolated from Game 2.

## Game Statistics

During a game the application displays:
- Number of battles
- Player 1 eliminations
- Player 2 eliminations

Across rematches in the same game room it also maintains:
- Total games played
- Player 1 wins and losses
- Player 2 wins and losses
- Draws

## Author
**Student ID:** 2022245  
**Module:** Concurrent Systems  
**Institution:** CCT College Dublin