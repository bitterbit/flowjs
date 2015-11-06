function flowConnector(xa, ya, xb, yb) {
    this.color = "#"+((1<<24)*Math.random()|0).toString(16);
    this.opacity = 0.2;
    this.strokeWidth = 3;
    
    
    var height = Math.abs(yb - ya);
    var width = Math.abs(xb - xa);
    
    if (height > width){
        console.log("warning, too steep");
    }
    
    var start =   {x: xa,                       y: ya};
    var middleA = {x: xa + (width-height)/2,    y: ya};
    var middleB = {x: middleA.x+height,         y: yb};
    var end =     {x: xb,                       y: yb}; 
    
    this.lines = [
        this.generateLine(start, middleA),
        this.generateLine(middleA, middleB),
        this.generateLine(middleB, end)
    ];
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

flowConnector.prototype.getDrawableItems = function(){
    return this.lines;
};