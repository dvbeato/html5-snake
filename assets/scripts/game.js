var Snake = { modules:{} };

Snake.modules.render = (function(){
    var canvasContext;
    var canvasElement;

    function init(idCanvas, width, height) {
        canvasElement  = document.getElementById(idCanvas);
        canvasContext = canvasElement.getContext('2d');
        
        canvasElement.width  = width;
        canvasElement.height = height;
    } 

    return {
        init:init,
        canvas:canvasContext
    }   
})();

Snake.modules.joypad = (function(){
   var directions = {
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
    };
    
    function start(element) {
        window.addEventListener("keydown", function(e) {
            element.direction = directions[e.keyIdentifier];
        });
    }
    
    function stop() {
        window.removeEventListener("keydown");
        window.removeEventListener("keyup");
    }
    
    return {
        directions: directions,
        startControll:start, 
        stop: stop
    }
})();


var app = (function() {
    
    var WIDTH = 500;
    var HEIGHT = 500;

    var RUNNING = 'running';
    var STOPED  = 'stoped';

    var canvas, context;
    
    var snakeGame;

    var elements = {
        
        apple: {
            tag:"apple",
            color:"#333",
            onColision:function() {
                snakeGame.caugthApple();
            }
        },
        snake:{
            tag:"snake",
            size:3,
            trail:[],
            color:"#555",
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

    var gameState = {

        player:{},
        score:0,
        speed:500,
        status:STOPED,
        incrementScore: function(score) {
            this.score += score;
            document.getElementById('score').innerHTML = this.score;
        }
    }

    function load() {
        
        canvas  = document.getElementById('gamerender');
        context = canvas.getContext('2d');
        
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        
        snakeGame = new SnakeGame();

        snakeGame.draw();

        var startButton = document.getElementById('startgame');
        
        startButton.onclick = function() {

            startButton.style.webkitAnimationDuration="0.2s";
            
            var menu = document.getElementById('menu');
            
            menu.style.webkitAnimationPlayState="running";
            
            setTimeout(function() {
                
                startButton.style.webkitAnimationPlayState = "paused";

                snakeGame.startGame();

            }, 1000);
        }
    }
    
    function restart() {
        snakeGame.restart();
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
            gameState.status = RUNNING;

            map.addElementRandomPosition(snake);
            map.addElementRandomPosition(apple);
            
            JoyPad.startControll(snake);
            snake.direction = JoyPad.directions.Down;

            snakeWalk();
        }
        
        this.restart = function() {
            gameState.incrementScore(-1);
            gameState.speed = 500;
            snake.size = 3;
            map = new Map(WIDTH, HEIGHT);
            map.draw();
            notify.hidde();
            this.startGame();
        }

        this.gameOver = function() {
            gameState.status = STOPED;

            JoyPad.stop();
            
            notify.show("Your Score:"+ gameState.score);
        }

        this.caugthApple = function() {
            snake.size += 1;
            gameState.incrementScore(1);
            gameState.speed = ( (gameState.speed - 20) <= 40) ? 40 : (gameState.speed - 20);
            map.addElementRandomPosition(apple);
        }

        function snakeWalk() {

            if(gameState.status != RUNNING) return;

            var currentPosition = map.getPosition(snake);

            var nextRow = currentPosition.row + snake.direction.y;
            var nextCol = currentPosition.col + snake.direction.x;
            
            var nextElement = elements[map.getElement(nextRow, nextCol)];

            if(nextElement && nextElement.onColision) {
                nextElement.onColision();
            } 
            
            snake.trail.push(currentPosition); 
            
            if(snake.trail.length >= snake.size) {
                map.clearPosition(snake.trail[0].row, snake.trail[0].col);
                snake.trail = snake.trail.slice(1);
            } 

            map.addElement(snake, {row:nextRow, col:nextCol } );

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

    
    var notify = (function() {
        var notify;
        function create(message) {
            var doc = document;
            
            notify = doc.querySelector('#notify');

            var msg = doc.createElement("p");
            msg.id = "message";
            var restart = doc.createElement("button");
            
            restart.innerHTML = "Restart";
            restart.onclick = app.restart;

            msg.innerHTML = message;

            notify.appendChild(msg);
            notify.appendChild(restart);
        }
        
        function show(message) {
            
            var msg = document.querySelector('#notify #message');
            
            if(msg) {
                msg.innerHTML = message;
            } else {
                create(message);
            }
            
            notify.style.display = "block";
        }

        function hidde() {

            notify.style.display = "none";
        }
        return {
            show:show,
            hidde:hidde
        }
    })();


    /*
    REFACTOR
    */

   
    /* Matrix class */
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
                col: Math.floor((Math.random() * (this.cols-2) )+1)
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

    return {
        load:load,
        restart:restart
    }

})();


    
