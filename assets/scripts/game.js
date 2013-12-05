
function App() {
    
    var WIDTH = 500;
    var HEIGHT = 500;
    
    var canvas, context;
    
    var snakeGame;

    var elements = {
        normal: {
            tag:"normal",
            color:"#D1D1D1"
        },
        apple: {
            tag:"apple",
            color:"#333",
            onColision:function() {

            }
        },
        snake:{
            tag:"snake",
            size:3,
            color:"#555",
            direction:{
                x:0,
                y:0
            },
            onColision:function () {
                
            }
        },
        brick:{
            tag:"brick",
            color:"#555",
            onColision: function () {

            }
        }
    }

    var gameState = {
        player:{},
        score:0,

        updateScore: function(score) {
            gameState.score = score;
            document.getElementById('score').innerHTML = score;
        }
    }

    var currentMap;

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

    var KeyListner = {
        
        key: {},

        startListner: function() {
            window.addEventListner("keydown", function(e) {
                key[e.which] = true;
            });
            window.addEventListner("keyup", function(e) {
                delete(key[e.which]);
            });
        },

        stopListner: function() {
            window.removeEventListner("keydown");
            window.removeEventListner("keyup");
        }
    }

    function SnakeGame() {
        var self = this;

        var map = new Map(WIDTH, HEIGHT);

        this.startGame = function() {

            map.addElementRandomPosition(elements.snake);
            map.addElementRandomPosition(elements.apple);
            
            KeyListner.startListner();

            setInterval(function() {    

            }, 100);
        }
        
        function update() {
        
        }

        this.draw = function() {
            map.draw();
        }
    }

    function Map(width, height) {
        
        var tile = {
            size: 20,
            borderSize: 1,
            borderColor: "#aaa",
            draw:function(row, col) {
                context.fillStyle = elements[matrix[row][col]].color;
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

        var rows = height / tile.size;
        var cols = width / tile.size;
        var matrix  = new Matrix(rows, cols);

        this.updateSnakePosition = function(element) {

            matrix[element.position.row][element.position.col] = "normal";

            var nRow = element.position.row+element.direction.y;
            var nCol = element.position.col+element.direction.x;
            var nElm = elements[ matrix[nRow][nCol] ];

            if(nElm.onColision) {
                nElm.onColision();
            } 

            matrix[nRow][nCol] = element.tag;

            tile.draw(element.position.row, element.position.col);
            tile.draw(nRow, nCol);

            element.position.row = nRow;
            element.position.col = nCol;
        }

        this.draw = function () {
            matrix.forEach(function (row, col) {
                tile.draw(row,col);
            });
        }

    }

    function Matrix(rows, cols) {
            
        var matrix = new Array();
        
        for (var row = 0; row < rows; row++) {
            
            matrix[row] = new Array();
    
            for(var column = 0; column < cols; column++) {
                
                var tile = elements.normal.tag;
                
                if(row == 0 || row == (rows-1) || 
                   column == 0 || column == (cols-1))
                    tile = elements.brick.tag;
                
                matrix[row][column] = tile;
            }
        }

        matrix.rows = rows;
        matrix.cols = cols;

        matrix.addElementRandomPosition = function(element) {
            element.position = this.getRandomPosition();
            matrix[element.position.row][element.position.col] = element.tag;
        }

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


    
