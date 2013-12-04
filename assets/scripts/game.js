
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

    function SnakeGame() {
        var self = this;
        var player;
        
        var map = new MapTile(WIDTH, HEIGHT);

        var snake = {
            tag:"snake",
            size: 3, 
            direction:{x:1, y:0}
        };

        var apple = {
            tag:"apple"
        }

        this.startGame = function() {
            player = new Player();

            map.addElementRandomPosition(snake);
            map.addElementRandomPosition(apple);

            setInterval(function() {    
                map.updateSnakePosition(snake);
                }, 100);
        }
        
        this.draw = function() {
            map.draw();
        }
    }

    function Player() {
        var score;

        this.setScore = function (value) {
            score = value;
            document.getElementById('score').innerHTML = score;
        }
    }

    function MapTile (width, height) {
        
        var tile = {
            size: 20,
            borderSize: 1,
            borderColor: "#aaa",
            solid: {
                color: "#555",
                colides:true,
                onColision:function() {
                    //gameOver
                }
            },
            normal: {
                color:"#D1D1D1"
            },
            apple: {
                color:"#333",
                colides:true
            },
            snake :{
                color:"#555",
                colides: true
            },
            draw:function(row, col) {
                context.fillStyle = tile[matrix[row][col]].color;
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
        
        this.addElementRandomPosition = function(element) {
            element.position = this.getRandomPosition();
            matrix[element.position.row][element.position.col] = element.tag;
            tile.draw(element.position.row, element.position.col);
        }

        this.updateSnakePosition = function(element) {

            matrix[element.position.row][element.position.col] = "normal";

            var nRow = element.position.row+element.direction.y;
            var nCol = element.position.col+element.direction.x;
            var nElm = tile[ matrix[nRow][nCol] ];

            if(nElm.colides) {
                nElm.onColision();
            } 

            matrix[nRow][nCol] = element.tag;

            tile.draw(element.position.row, element.position.col);
            tile.draw(nRow, nCol);

            element.position.row = nRow;
            element.position.col = nCol;
        }

        this.draw = function () {
            eachTile(function (row, col) {
                tile.draw(row,col);
            });
        }

        function eachTile(callback) {
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    callback(row, col);
                };
            };
        }

        this.getRandomPosition = function() {
            return {
                row: Math.floor((Math.random() * (rows-2) )+1),
                col: Math.floor((Math.random()*  (cols-2) )+1)
            };
        }
    }

    function Matrix(rows, cols) {
            
        var matrix = new Array();
        
        for (var row = 0; row < rows; row++) {
            
            matrix[row] = new Array();
    
            for(var column = 0; column < cols; column++) {
                
                var value = 'normal';
                
                if(row == 0 || row == (rows-1) || 
                   column == 0 || column == (cols-1))
                    value = 'solid';
                
                matrix[row][column] = value;
            }
        }

        return matrix;
    }
}

var app = new App();
document.onreadystatechange = app.load;


    
