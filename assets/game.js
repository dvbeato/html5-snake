var app = new App();
app.init();

function App() {
    
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    
    var canvas, context;
    
    window.onresize = function() {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
    }
    
    this.init = function() {
        
        canvas = document.getElementById('gameview');
        context = canvas.getContext('2d');
        
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        
        setInterval(function(){
            
        }, 33)        
    }
}
