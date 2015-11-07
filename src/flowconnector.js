function flowConnector(xa, ya, xb, yb) {
    this.color = "blue";//"#"+((1<<24)*Math.random()|0).toString(16);
    this.opacity = 1;
    this.strokeWidth = 3;
    
    this.xa = xa;
    this.ya = ya;
    
    this.xb = xb;
    this.yb = yb;
    
    this.refresh();
}

flowConnector.prototype.generateLine = function(pointA, pointB){
    var line = new createjs.Graphics();
    line.setStrokeStyle(this.strokeWidth)
        .beginStroke(this.color)
        .moveTo(pointA.x, pointA.y)
        .lineTo(pointB.x, pointB.y);
    line = new createjs.Shape(line);
    line.opacity = this.opacity;
    return line;
};

flowConnector.prototype.refresh = function(){
    var height = Math.abs(this.yb - this.ya);
    var width = Math.abs(this.xb - this.xa);
    
    if (height > width){
        console.log("warning, too steep");
    }
 
    var start =   {x: this.xa,                       y: this.ya};
    var middleA = {x: this.xa + (width-height)/2,    y: this.ya};
    var middleB = {x: middleA.x+height,              y: this.yb};
    var end =     {x: this.xb,                       y: this.yb}; 
    
    this.lines = [
        this.generateLine(start, middleA),
        this.generateLine(middleA, middleB),
        this.generateLine(middleB, end)
    ];
}

flowConnector.prototype.getDrawableItems = function(){
    return this.lines;
};