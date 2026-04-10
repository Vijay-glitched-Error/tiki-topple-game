# tiki-topple-game
Tikki Topple (Online Board Game)
1. Introduction

Tikki Topple is a strategic multiplayer board game developed as an online web-based application. The game is designed to simulate the dynamics of the traditional Tikki Topple board game in a digital environment, allowing multiple players to compete in real time.

Each player is assigned specific Tikki cards (targets) and a set of Topple cards (actions). By using these action cards, players can manipulate the positions of tikkis on the board. The objective is to strategically position assigned tikkis within the top ranks while disrupting opponents’ plans.

2. Game Description
Players are assigned hidden Tikki cards representing their targets.
Each player receives Topple cards that allow them to perform actions such as moving or eliminating tikkis.
Players take turns using these cards to alter the arrangement of tikkis on the board.
The gameplay involves both strategic planning and competitive interaction among players.

At the end of each round:

The top three tikkis on the board are considered for scoring.
Players receive points based on the positions of their assigned tikkis.

The player with the highest score at the conclusion of the game is declared the winner.

3. Game Instructions
3.1 Number of Players
Minimum: 2 players
Maximum: 4 players
3.2 Tikki Card Configuration
For 2 players: 7 tikki cards are used
For 3 or 4 players: 1 tikki card is removed from the set
3.3 Gameplay Procedure
Each player is assigned:
Tikki cards (targets)
Topple cards (action cards)
Players take turns performing actions using their Topple cards, including:
Moving tikkis forward
Moving tikkis backward
Eliminating tikkis from the board
The arrangement of tikkis changes dynamically throughout the game based on player actions.
At the end of the round:
The top three tikkis are identified
Points are awarded accordingly
The game concludes after all rounds are completed, and the player with the highest total score wins.
4. How to Run the Application
4.1 Prerequisites

Ensure the following are installed on your system:

Node.js (https://nodejs.org
)
A code editor such as Visual Studio Code
4.2 Installation and Setup
Step 1: Clone the Repository
git clone https://github.com/Vijay-glitched-Error/tiki-topple-game.git
cd tiki-topple-game
Step 2: Install Dependencies

Frontend:

cd client
npm install

Backend (if applicable):

cd server
npm install
4.3 Running the Application

Frontend:

npm run dev

or

npm start

Backend:

node server.js

or

npm start
4.4 Accessing the Application

Open a web browser and navigate to:

http://localhost:3000

(Refer to the terminal output for the exact port if different.)

5. Gameplay (Online Mode)
A player creates a game room using a unique room code.
Other players join the room by entering:
The same room code
Their respective names
Once all players have joined, the game session begins.
Players take turns and use their Topple cards strategically.
The player with the highest score at the end of the game is declared the winner.
6. Technology Stack
Frontend: HTML, CSS, JavaScript / React
Backend: Node.js
Version Control: Git and GitHub
7. Contributors
Project developed collaboratively by the team
