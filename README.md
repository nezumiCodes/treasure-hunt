# Treasure Hunt

Single page Trasure Hunt game, implemeted using JavaScript.

<hr>

## Setup stage
The setup stage is initiated when the player clicks on the `Start` button. During the setup stage, the player needs to click on the board cells and place obstacles, treasures and a hunter using the following keys:
<ul>
    <li>`o` for obstacle</li>
    <li>`5`, `6`, `7` or `8` for treasures of different value</li>
    <li>`h` for hunter</li>
</ul>
Any other input will result to an alert popup. The player can place as many obstacles and treasures as they like, but only one treasure hunter can be on the board. Upon finishing the setup, the player should click on the `End Setup` button.

If no treasures have been placed on the board, then the game ends immediately.

<hr>

## Play stage
The player can move around the board using the keys `a`, `w`, `s` and `d`. If they try to move on a cell with an obstacle, they hunter will remian in place. Treasures can be claimed by moving on the treasure cell. When a treasure is taken, the scoreboard updates with the value of the treasure, as well as the number of remaining treasure of the same value. Each valid move will increase the rounds by 1. 

The player can end the game whenever they want if they press on the `End Game` button. The game automatically ends when the player has taken all treasures or there are no moves available. 

<hr>

## End Stage
Upon ending the game, a popup appears showing the performance of the player. The performance is calculated as the `Score / Rounds` round up to 2 decimals. To maximise the performance the player has to find the optimal path to claim all the treasures, without wasting moves.

The player has the option to restart the game, starting again from setting up the game board.
