/* global createjs */

var flowjs = flowjs || {};

flowjs.flowConnector = function flowConnector(xa, ya, xb, yb) {
    this.color = "blue";
    this.alpha = 1;
    this.strokeWidth = 3;
    
    this.xa = xa;
    this.ya = ya;
    
    this.xb = xb;
    this.yb = yb;
    
};

flowjs.flowConnector.prototype.generateLine = function(line, pointA, pointB){
    line.graphics.clear();
    line.graphics.setStrokeStyle(this.strokeWidth)
        .beginStroke(this.color)
        .moveTo(pointA.x, pointA.y)
        .lineTo(pointB.x, pointB.y);
    line.alpha = this.alpha;
    return line;
};

flowjs.flowConnector.prototype.generateDot = function(pointShape, point){
    pointShape.graphics.clear();
    pointShape.graphics.beginFill(this.color).drawCircle(point.x, point.y, this.strokeWidth/2);
    pointShape.alpha = this.alpha;
    return pointShape;
};

flowjs.flowConnector.prototype.refresh = function(){
    var height = Math.abs(this.yb - this.ya);
    var width = Math.abs(this.xb - this.xa);
    
    if (height > width){
        console.log("warning, too steep");
    }
 
    var start =   {x: this.xa,                       y: this.ya};
    var middleA = {x: this.xa + (width-height)/2,    y: this.ya};
    var middleB = {x: middleA.x+height,              y: this.yb};
    var end =     {x: this.xb,                       y: this.yb}; 
    
    if (this.lines === undefined || this.dots === undefined){
        this.lines = [
            this.generateLine(new createjs.Shape(), start, middleA),
            this.generateLine(new createjs.Shape(), middleA, middleB),
            this.generateLine(new createjs.Shape(), middleB, end)
        ];
        
        this.dots = [
            this.generateDot(new createjs.Shape(), middleA),
            this.generateDot(new createjs.Shape(), middleB)
        ];
    } else {
        this.generateLine(this.lines[0], start, middleA);
        this.generateLine(this.lines[1], middleA, middleB);
        this.generateLine(this.lines[2], middleB, end);
        
        this.generateDot(this.dots[0], middleA);
        this.generateDot(this.dots[1], middleB);
    }
};

flowjs.flowConnector.prototype.getDrawableItems = function(){
    return this.lines.concat(this.dots);
};
