/* * * * * * * * * * * * * * * * *
 *    CMST 495 6380 Group 2      *
 * * * * * * * * * * * * * * * * *
 *
 * Name: sketch.js
 * Author: Rachael Schutzman, Selamawit Asfaw, Danny Ramirez, Gilda Hogan, Gavin Spain
 * Description: Holds the "main" functions and variables for the game, 
 * and calls the other classes and their functions as needed.
 *
 */

/* Revision History
 * 11/17/2019 - Initially created.
 * (Danny Ramirez)
 * 
 * 11/18/2019  - Added initial version of the Snake class.
 * (Danny Ramirez)
 * 
 * 11/18/2019  - Added Game State machine and sound effects.
 * (Danny Ramirez)
 * 
 * 11/25/2019  - Changed the parent canvas container.
 * (Danny Ramirez)
 * 
 * 11/28/2019  - Added debugging options (collision, game state, input)
 *             - Fixed the background music which was not looping.
 *             - Added game pause feature.
 * (Danny Ramirez)
 * 
 * 11/29/2019  - Repositioned the grid to include the score and high score
 *             - Changed the file format of the sounds from .wav to .mp3 in 
 *               order to increase performance and decrease file size.
 * (Danny Ramirez)
 *             
 * 11/30/2019 - Created if statement to change displays depending on gameState variable to allow welcome
 *              screen before start of game. Only if statement container for welcome page for now. Added if
 *              to check if a key was pressed to change gameState to in game to start. Commented out 
 *              gameState variable change in reset() function to allow if statement for display change to work
 *              in draw() function.
 * (Rachael Schutzman)
 *
 * 12/01/2019 - Added if else statements to draw() for pause and over game states to show paused or stopped game 
 *              with box and text stating the state of the game (paused or game over) over top paused or stopped 
 *              game. Bug introduced due to removal of game state change in update(). Fixed with gameState change 
 *              to switch case for restart button (r) being pressed and added text to game over screen to prompt 
 *              user to select R to play again.
 *              Added placeholder title and text to welcome page.
 * (Rachael Schutzman)           
 * 
 * 12/02/2019 - Fixed paused game state from not showing grid
 *            - Changed resetGame with new game state check.
 * (Danny Ramirez)
 * 
 * 12/01/2019 - Added loaded new text file in preload() and changed font type and text for welcome screen.
 * (Rachael Schutzman)
 * 
 * 12/04/2019 - Disabled page scroll using keyboard to keep the canvas in
 *              view at all times while playing the game.
 * (Danny Ramirez)
 * 
 * 12/07/2019 - Created the initial database integration.
 * (Danny Ramirez)
 * 
 * 12/08/2019 - Set the background music to start after the users presses any
 *              key during the welcome screen.
 *            - Added a points pop up whenever the user collects a food item
 * (Danny Ramirez)
 * 
 * 12/11/2019 - Created new if statement within draw() to check whether highscore>score when gameState="over" and added window.prompt() for initials and insertData() function with initials and score parameters.
 * (Rachael Schutzman)
 * 
 * 12/13/2019 - Updated the if statement in the draw() with a page redirect 
 *              after getting user's initials
 * (Danny Ramirez)
 * 
 * 12/13/2019 - Updated draw() to stop window.prompt() for initial prompt from looping endlessly.
 *              New if loop created to check if initials were null or "". initial variable reset added to reset()
 *              Endless loop resolved.
 * (Rachael Schutzman)
 *
 * 12/14/2019 - Added if statement to check if user input included only three alphanumeric 
 *              characters.
 *            - Created error alert message if user did not enter valid initials and set
 *              initials to null so user would be prompted for initials again. Only entered into
 * 		          database if valid.
 * (Rachael Schutzman)
 */

// Declare variables
let canvas, database;
let snake, display, 
inputLeft, inputRight, inputUp, inputDown, inputDebug, inputRestart,inputMute, inputPause;
let score, highScore, points;


// Game state
let gameState = "welcome";

// Initialize game constants
const gameWidth = 800;
const gameHeight = 800;
const LEFT = 1;
const UP = 2;
const RIGHT = 3;
const DOWN = 4;
const borderRadius = 6;

// Initialize game variables
let heading = RIGHT;
let debugOn = true;

// Initialize music and sound
let music;
let soundTurn;
let soundCollect;
let soundOver;

// Initialize grid variables
let gridSize = 40;
let gridStartX = 0;
let gridStartY = 120;
let cellSize = 20;
const MAX_ROWS = 35;
const MAX_COLS = 40;

// Initialize food variables
let food = {
    position: {
        x: 0,
        y: 0
    },
    size: 20
};


function preload() {
    if (debugOn) {
        console.log("Debug Mode ON");
        console.log("Preloading assets...");
    }

    regFont = loadFont('assets/fonts/ka1.woff');
    music = loadSound("assets/bgMusic.mp3");
    music.setVolume(0.5);
    soundTurn = loadSound("assets/snakeTurn.mp3");
    soundCollect = loadSound("assets/collect.mp3");
    soundOver = loadSound("assets/gameOver.mp3");

    if (debugOn) {
        console.log("Preload complete!");
    }
}

function setup() {

    if (debugOn) {
        console.log("Loading game...");
        console.log("Game State =", gameState);
    }

    database = new Database();
    database.ref.on("value", database.gotData, database.errorData);

    preventScroll();

    canvas = createCanvas(gameWidth, gameHeight);
    canvas.id("game-canvas");
    canvas.class("cmsc495-group2");
    
    // Position the canvas inside of .canvas-container
    canvas.parent("#canvas-container");

    frameRate(10);

    resetGame();
    
}

function update() {

    if (gameState === "playing") {

        snake.move();


        if (snake.collides(food)) {
            if (debugOn) {
                console.log("Food collected!");
            }
            display.points(`+${points}`, food.position.x, food.position.y);
            soundCollect.play();
            snake.tailSize++;
            score += points;
            spawnFood();
        }
    
        for (let i = 0; i < snake.tail.length; i++) {
            if (snake.collides(snake.tail[i])) {
                console.log("Snake crashed!");
                soundOver.play();
                gameState = "over";
                console.log("Game State =", gameState);

            }
        }
    }

    if (gameState === "over") {
        music.stop();
        console.log("Game Over!");

    }

}

function keyPressed() {
    let keyWasPressed = false;

    switch (keyCode) {
        case inputLeft:
            if (heading !== RIGHT) {
                heading = LEFT;
                keyWasPressed = true;

            }
            break;
        case inputRight:
            if (heading !== LEFT) {
                heading = RIGHT;
                keyWasPressed = true;
            }
            break;
        case inputUp:
            if (heading !== DOWN) {
                heading = UP;
                keyWasPressed = true;
            }
            break;
        case inputDown:
            if (heading !== UP) {
                heading = DOWN;
                keyWasPressed = true;
            }
            break;
        
    }

    if (keyWasPressed) {
        soundTurn.play();

        if (debugOn) {
            console.log("Key pressed:", heading);
        }
    }

    if (key === inputPause) {
        if (gameState !== "pause") {
            console.log("Game paused!");
            gameState = "pause";
            console.log("Game State =", gameState);
            if (music.isPlaying()) {
                music.pause();
            }

        } else {
            console.log("Game unpaused!");
            gameState = "playing";
            console.log("Game State =", gameState);
            if (music.isPaused()) {
                music.play();
            }
        }
    }

    // Debug
    if (debugOn) {
        switch (key) {
            case inputRestart:
                console.log("Reset game!");
                resetGame();
                if (!music.isPlaying()) {
                    music.play();
                    music.setLoop(true);
                }
                gameState = "playing";
                break;
            case inputMute:
                if (music.isPaused()) {
                    console.log("Music unmuted!");
                    music.play();
                } else {
                    console.log("Music muted!");
                    music.pause();
                } 
        }
    }

    if (keyCode === inputDebug) {
        debugOn = !debugOn;
        console.log("Debug Mode ON:", debugOn);
    }
}

function draw() {
    background(22, 22, 22);

    
    // If statement to test gameState and display accordingly
    if (gameState === "welcome") {
       // placeholder text
       textFont(regFont);
       fill(255);
       textSize(26);
       text("Press Any Key", gameWidth / 3, gameWidth / 2);

       // if any button is pressed game starts
       if (keyIsPressed === true) {
           gameState = "playing";
           if (debugOn) {
               console.log("Game State =", gameState);
           }
           if (!music.isPlaying()) {
            music.play();
            music.setLoop(true);
           }
       }
    } else if (gameState === "pause") {
        // displays box with "Paused" text over paused game
        display.grid();
        display.score();
        display.highScore(); 
        display.snakeTail();
        display.snakeHead();
        display.food();
       
        fill(22, 22, 22);
        rect(cellSize * 12, cellSize * 18, cellSize * 16, cellSize * 6);
        textSize(26);
        fill(255);
        text("- Paused -", cellSize * 17, cellSize * 21);
   } else if (gameState === "over") {        
        // displays box with "Game Over" text over ended game and prompts user to press
        // "R" to restart
        display.grid();
	display.score();
        display.highScore(); 
        display.snakeTail();
        display.snakeHead();
        display.food();

        if (highScore > score) {
            fill(22, 22, 22);
            rect(cellSize * 12, cellSize * 18, cellSize * 16, cellSize * 6);
            textSize(26);
            fill(255);
            text("- Game Over! -", cellSize * 16, cellSize * 21);
            textSize(20);
            fill(255);
            text(" Press R to play again", cellSize *15, cellSize* 22);
            } else {
                // check if initials variable blank or null before prompting for initials
                if (initials == null || initials == ""){
                     initials = prompt("Congratulations! You beat the high score.\nPlease enter your initials:");
                    // checks if user entered invalid characters or number of characters
                     if (initials.match(/^[0-9a-zA-z]{1,3}$/)) {
                         database.insertData(initials, score);
                     } else {
		         alert("Error! Initials must be alphanumeric and no more than three characters");
                         initials = null;
                     }    
                }
                fill(22, 22, 22);
                rect(cellSize * 12, cellSize * 18, cellSize * 16, cellSize * 6);
                textSize(26);
                fill(255);
                text("- Game Over! -", cellSize * 16, cellSize * 21);
                textSize(20);
                fill(255);
                text(" Press R to play again", cellSize *15, cellSize* 22);
            }
   } else if (gameState ==="playing") {
       display.grid();
       display.score();
       display.highScore(); 
       display.snakeTail();
       display.snakeHead();
       display.food();
    }

    update();
}

function resetGame() {
    if (debugOn) {
        console.log("Resetting game...");
    }
    initControls();

    points = 5;

    if (highScore < score) {
        highScore = score;
    } else {
        highScore = 0;
    }
    score = 0;
    initials = null;

    if (gameState !== "welcome") {
        gameState = "playing";
    }
    spawnFood();

    display = new Display();
    snake = new Snake(floor(random(0, MAX_COLS)), floor(random(0, MAX_ROWS)));

    if (debugOn) {
        console.log("Game State =", gameState);
        console.log("Reset complete!");
    }
}

function initControls() {
    inputLeft = LEFT_ARROW;
    inputRight = RIGHT_ARROW;
    inputUp = UP_ARROW;
    inputDown = DOWN_ARROW;
    inputPause = "p";
    inputDebug = 192;
    inputRestart = "r";
    inputMute = "m";
}

function spawnFood() {
    food.position.x = floor(random(0, MAX_COLS));
    food.position.y = floor(random(0, MAX_ROWS - 1));
}

function preventScroll() {
    window.addEventListener("keydown", function(event) {
        let keys = [32, 37, 38, 39, 40];

        if(keys.indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }
    }, false);
}
