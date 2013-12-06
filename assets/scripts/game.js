
function App() {
    
    var WIDTH = 500;
    var HEIGHT = 500;

    var canvas, context;
    
    var snakeGame;

    this.load = function() {
        
        canvas  = document.getElementById('gamerender');
        context = canvas.getContext('2d');
        
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        
        snakeGame = new SnakeGame();

        snakeGame.draw(context);

        var startButton = document.getElementById('startgame');
        
        startButton.onclick = function() {

            startButton.style.webkitAnimationDuration="0.2s";
            
            var notify = document.getElementById('notify');
            
            notify.style.webkitAnimationPlayState="running";
            
            setTimeout(function() {
                
                startButton.style.webkitAnimationPlayState = "paused";

                snakeGame.startGame();

            }, 1000);
        }
    }

    var JoyPad = {
        
        directions : {
            Right:{
                x:1,
                y:0
            },
            Left:{
                x:-1,
                y:0
            },
            Up:{
                x:0,
                y:-1
            },
            Down:{
                x:0,
                y:1
            }
        },

        start: function() {
            window.addEventListener("keydown", function(e) {
                elements.snake.direction = JoyPad.directions[e.keyIdentifier];
            });
        },

        stop: function() {
            window.removeEventListener("keydown");
            window.removeEventListener("keyup");
        }
    }

    var elements = {
        
            apple: {
                tag:"apple",
                color:"#333",
                onColision:function() {
                   snakeGame.caughtApple();
                }
            },
            snake:{
                tag:"snake",
                size:3,
                color:"#555",
                direction:{
                    x:0,
                    y:1
                },
                onColision:function () {
                    snakeGame.gameOver();
                }
            },
            brick:{
                tag:"brick",
                color:"#555",
                onColision: function () {
                    snakeGame.gameOver();
                }
            }
        }

    function SnakeGame() {

        var self = this;

        var gameState = {
            player:{},
            score:0,
            speed:500,
            incrementScore: function(score) {
                this.score += score;
                document.getElementById('score').innerHTML = this.score;
            }
        }

        var gameLoop;

        var map = new Map(WIDTH, HEIGHT);

        var snake = elements.snake;
        var apple = elements.apple;

        this.startGame = function() {

            map.addElementRandomPosition(snake);
            map.addElementRandomPosition(apple);
            
            JoyPad.start();

            snakeWalk();
        }
        
        this.gameOver = function() {
            JoyPad.stop();
            alert("Your Score:"+ gameState.score);
        }

        this.caughtApple = function() {
            gameState.incrementScore(1);
            gameState.speed = ( (gameState.speed - 20) <= 40) ? 40 : (gameState.speed - 20);
            map.addElementRandomPosition(apple);
            Logger.debug("Speed: "+gameState.speed);
        }

        function snakeWalk() {

            var currentPosition = map.getPosition(snake);

            var nextRow = currentPosition.row + snake.direction.y;
            var nextCol = currentPosition.col + snake.direction.x;
            
            var nextElement = elements[map.getElement(nextRow, nextCol)];

            if(nextElement && nextElement.onColision) {
                nextElement.onColision();
            } 

            map.addElement(snake, {row:nextRow, col:nextCol } );

            map.clearPosition(currentPosition.row, currentPosition.col);


            setTimeout(snakeWalk, gameState.speed);
        }

        this.draw = function() {
            map.draw();
        }
    }

    function Map(width, height) {
        var self = this;

        var tile = {
            size: 20,
            borderSize: 1,
            borderColor: "#aaa",
            color:"#D1D1D1",
            draw:function(row, col) {
                
                var element = elements[matrix[row][col]];

                context.fillStyle = (element) ? element.color : tile.color;
                
                context.fillRect(
                    col*tile.size,row*tile.size ,
                    tile.size, tile.size);

                context.lineWidth   = tile.borderSize;
                context.strokeStyle = tile.borderColor;

                context.strokeRect(
                    col*tile.size,row*tile.size ,
                    tile.size, tile.size);  
            }
        }

        var elementsPosition = {};

        var matrix = new Matrix(
                 (height / tile.size) //rows 
                ,(width / tile.size ) //cols
            );

        this.getPosition = function(element) {
            return elementsPosition[element.tag].position;
        }

        this.addElement = function(element, position) {
            matrix[position.row][position.col] = element.tag;
            elementsPosition[element.tag] = {position:position};
            tile.draw(position.row, position.col);
            Logger.debug(element.tag+": "+position.row+", "+position.col);
        }
        
        this.getElement = function(row, col) {
            return matrix[row][col];
        }

        this.addElementRandomPosition = function(element) {
            var randomPosition = matrix.getRandomPosition();
            self.addElement(element, randomPosition);
        }

        this.clearPosition = function(row, col) {
            delete(matrix[row][col]);
            tile.draw(row, col);
        }

        this.draw = function () {
            matrix.forEach(function (row, col) {
                tile.draw(row,col);
            });
        }

        function populateMatrix() {
            
            matrix.forEach(function(row, col) {
                
                if(row == 0 || row == (matrix.rows-1) || 
                   col == 0 || col == (matrix.cols-1)) {
                    self.addElement(elements.brick, {row:row, col:col});
                }
                
            });
        }

        populateMatrix();

    }

    function Matrix(rows, cols) {
            
        var matrix = new Array();
        
        for (var row = 0; row < rows; row++) {
            
            matrix[row] = new Array();
        }

        matrix.rows = rows;
        matrix.cols = cols;

        matrix.getRandomPosition = function() {
            return {
                row: Math.floor((Math.random() * (this.rows-2) )+1),
                col: Math.floor((Math.random()*  (this.cols-2) )+1)
            };
        }

        matrix.forEach = function(callback) {
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    callback(row, col);
                };
            };
        }

        return matrix;
    }
}

var app = new App();
document.onreadystatechange = app.load;


    
