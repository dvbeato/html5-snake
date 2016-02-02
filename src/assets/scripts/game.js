var Engine = { modules:{} };

Engine.modules.Render = (function(){
    var canvasContext;
    var canvasElement;

    function init(idCanvas, width, height) {
        canvasElement  = document.getElementById(idCanvas);
        canvasContext = canvasElement.getContext('2d');
        
        canvasElement.width  = width;
        canvasElement.height = height;
    } 

    function draw(callback) {
        callback(canvasContext);
    }

    return {
        init:init,
        draw:draw
    }   
})();

Engine.modules.JoyPad = (function(){

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
    
    var keyListener;

    function getRandomDirection() {

        var result;
        var count = 0;

        for (var dir in directions)
            if (Math.random() < 1/++count)
               result = dir;

        return directions[result];

    }

    var listener = function(e) {
        
        if(!keyListener) return;
        
        var key = e.keyIdentifier || e.key;
        var direction = directions[key];

        if(!direction) return; //invalid direction
        
        keyListener(direction);
    }

    function init(callback) {
        keyListener = callback;
        window.addEventListener("keydown", listener, false);
    }
    
    return {
        directions: directions,
        init:init, 
        getRandomDirection:getRandomDirection
    }
})();

Engine.modules.Matrix = (function() {
    
    var elementsPosition = {};
    
    var matrix;
    
    function create(rows, cols) {
            
        matrix = new Array();
        
        for (var row = 0; row < rows; row++) {
            matrix[row] = new Array();
        }

        matrix.rows = rows;
        matrix.cols = cols;

        pushMethods(matrix);

        return matrix;
    }

    function pushMethods(matrix) {
        
         matrix.forEach = function(callback) {
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    callback(row, col);
                };
            };
        }

        matrix.getRandomEmptyPosition = function() {
            
            var row, col;
            
            do {    
            
                row = Math.floor((Math.random() * (this.rows-2) )+1),
                col = Math.floor((Math.random() * (this.cols-2) )+1)
            
            } while(matrix[row][col]);

            return {row:row, col:col};
        }

        matrix.getPosition = function(element) {
            return elementsPosition[element].position;
        }

        matrix.getMiddlePosition = function() {
            return {
                row:Math.floor(matrix.rows/2), 
                col:Math.floor(matrix.cols/2)
            };
        }

        matrix.addElement = function(element, position) {
            matrix[position.row][position.col] = element;
            elementsPosition[element] = {position:position};
        }

        matrix.clearPosition = function(row, col) {
            delete(matrix[row][col]);
        }
    }

    return {
        create:create
    }
})(); 


var Game = (function() {
    
    var joypad = Engine.modules.JoyPad;

    var ROWS = 25,
        COLS = 25;

    var WIDTH  = 500,
        HEIGHT = 500;

    var snakeGame = new SnakeGame();

    function init() {

        snakeGame.init();

        var startButton = document.getElementById('startgame');
        
        startButton.onclick = function() {

            startButton.style.webkitAnimationDuration="0.2s";
            startButton.style.MozAnimationDuration="0.2s";
            startButton.style.animationDuration="0.2s";

            var menu = document.getElementById('menu');
            
            menu.style.webkitAnimationPlayState="running";
            menu.style.MozAnimationPlayState="running";
            menu.style.animationPlayState="running";
           
            setTimeout(function() {
                
                startButton.style.webkitAnimationPlayState = "paused";
                startButton.style.MozAnimationPlayState = "paused";
                startButton.style.animationPlayState = "paused";
                
                snakeGame.startGame();

            }, 1000);
        }
    }

    function SnakeGame() {

        var self = this;
        
        var START_DELAY = 500;

        var RUNNING = 'running'
           ,STOPED  = 'stoped';

        var elements = {};

        var gameState = {
            score:0,
            status:STOPED,
            reset:function() {
                this.status = STOPED;
                this.score = 0;
                document.getElementById('score').innerHTML = this.score;
            },
            increaseScore:function() {
                this.score += 1;
                document.getElementById('score').innerHTML = this.score;
            }
        }
        
        var map   = new GameMap(ROWS, COLS);
        var snake = new Snake();

        var apple = {
            tag:"apple",
            color:"#333",
            onColision:function() {
                snake.size += 1;
                snake.increaseSpeed();
                gameState.increaseScore();
                map.addElementRandomPosition(apple);
            }
        };

        var brick = {
            tag:"brick",
            color:"#555",
            onColision: function () {
                snakeGame.gameOver();
            }
        };

        this.init = function() {
            loadElements();
            map.init();
            joypad.init(snake.controll);
        }

        this.startGame = function() {

            gameState.status = RUNNING;

            map.addElementCenterMap(snake);
            map.addElementRandomPosition(apple);
            
            snake.init(joypad.getRandomDirection(), START_DELAY);

            snake.walk();
        }
        
        this.restart = function() {
            gameState.reset();
            map.init();
            notify.hidde();
            self.startGame();
        }

        this.gameOver = function() {
            gameState.status = STOPED;
            notify.show("Your Score: " + gameState.score);
        }

        function loadElements() {
            elements["snake"] = snake;
            elements["apple"] = apple;
            elements["brick"] = brick;
        }

        function Snake() {
            
            var self = this;

            this.tag   = "snake";
            this.size  = 3;
            this.delay = 500;
            this.trail = [];
            this.color = "#555";
            this.direction = {x:0, y:0};

            this.init = function(direction, delay, size) {
                this.size  = size  || 3;
                this.delay = delay || 500;
                this.trail = [];
                this.direction = direction || {x:0, y:0};
            }

            this.onColision = function() {
                snakeGame.gameOver();
            }

            this.controll = function(direction) {

                if((Math.abs(self.direction.x) + Math.abs(direction.x)) > 1) return; //invalid reverse horizontal move
                if((Math.abs(self.direction.y) + Math.abs(direction.y)) > 1) return; //invalid reverse vertical move

                self.direction = direction;
            }

            this.walk = function() {

                if(gameState.status != RUNNING) return;

                var currentPosition = map.getPosition(self);

                var nextRow = currentPosition.row + self.direction.y;
                var nextCol = currentPosition.col + self.direction.x;
                
                var nextElement = elements[map.getElement(nextRow, nextCol)];

                if(nextElement && nextElement.onColision) {
                    nextElement.onColision();
                } 
                
                self.trail.push(currentPosition); 
                
                if(self.trail.length >= self.size) {
                    map.clearPosition(self.trail[0].row, self.trail[0].col);
                    self.trail = self.trail.slice(1);
                } 

                map.addElement(self, {row:nextRow, col:nextCol} );

                setTimeout(self.walk, self.delay);
            }

            this.increaseSpeed = function() {
                this.delay = ( (this.delay - 20) <= 40) ? 40 : (this.delay - 20);
            }
        }


        function GameMap(rows, cols) {
        
            var matrix = Engine.modules.Matrix
               ,render = Engine.modules.Render;

            var self = this;
            
            var size = getSize();

            var height = size
               ,width  = size;


            function getSize() {
                var gameview = document.querySelector("#gameview");

                var children = gameview.children;
                var length = children.length;
                
                var childrenSize = 0;
                var child;
                for (var i = 0; i < length; i++) {
                    child = children[i];
                    if(child.tagName.toLowerCase() == "canvas") continue;
                    childrenSize += child.clientHeight;
                };

                return (window.innerHeight - childrenSize);
            }   

            var tile = {
                size: size/rows,
                borderSize: 1,
                borderColor: "#aaa",
                color:"#D1D1D1",
                draw:function(row, col) {
                    
                    var element = elements[mtx[row][col]];
                    
                    render.draw(function(canvas) {
                        
                        canvas.fillStyle = (element) ? element.color : tile.color;
                    
                        canvas.fillRect(
                            col*tile.size,row*tile.size ,
                            tile.size, tile.size);

                        canvas.lineWidth   = tile.borderSize;
                        canvas.strokeStyle = tile.borderColor;

                        canvas.strokeRect(
                            col*tile.size,row*tile.size ,
                            tile.size, tile.size);  
                    });
                }
            }

            var mtx;

            this.init = function() {
                mtx = matrix.create(rows, cols);
                populateMatrix();
                self.draw();
            }

            this.getPosition = function(element) {
                return mtx.getPosition(element.tag);
            }

            this.addElement = function(element, position) {
                mtx.addElement(element.tag, position)
                tile.draw(position.row, position.col);
            }
            
            this.getElement = function(row, col) {
                return mtx[row][col];
            }

            this.addElementRandomPosition = function(element) {
                var randomPosition = mtx.getRandomEmptyPosition();
                self.addElement(element, randomPosition);
            }

            this.addElementCenterMap = function(element) {
                var middlePosition = mtx.getMiddlePosition();
                self.addElement(element, middlePosition);
            }

            this.clearPosition = function(row, col) {
                mtx.clearPosition(row, col);
                tile.draw(row, col);
            }

            this.draw = function () {
                mtx.forEach(function (row, col) {
                    tile.draw(row,col);
                });
            }

            function populateMatrix() {
                mtx.forEach(function(row, col) {
                    if(row == 0 || row == (mtx.rows-1) || 
                       col == 0 || col == (mtx.cols-1)) {
                        self.addElement(elements.brick, {row:row, col:col});
                    }
                });
            }

            render.init("gamerender", width, height);
        }
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
            restart.onclick = snakeGame.restart;

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

    return {
        init:init
    }

})();

Game.init();
