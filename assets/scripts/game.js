
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
            }, 1000);
        }
    }

    function SnakeGame() {
        
        var player;
        
        this.map = new MapTile(WIDTH, HEIGHT);

        this.startGame = function() {
            player = new Player();
        }

        this.draw = function(canvas) {
            this.map.draw(canvas);
        }
    }

    function Player() {
        var score;

        this.setScore = function (value) {
            score = value;
            document.getElementById('score').innerHTML = score;
        }

        this.setScore(0);
    }

    function MapTile (width, height) {
        
        var tile = {
            size: 20,
            borderSize: 1,
            borderColor: "#aaa",
            solid: {
                color: "#555"
            },
            normal: {
                color:"#D1D1D1"
            },
            apple: {
                color:"#555"
            }
        }

        var rows = height / tile.size;
        var cols = width / tile.size;
        var map  = new Matrix(rows, cols);

        this.draw = function (canvas) {
            eachTile(function (row, col) {

                 canvas.fillStyle = tile[map[row][col]].color;
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

        function eachTile(callback) {
            for (var row = 0; row < rows; row++) {

                for (var col = 0; col < cols; col++) {
                    
                    callback(row, col);
                };
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


    
