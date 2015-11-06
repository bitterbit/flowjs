/**
 * Flow structure
 * [ [{id: a, next: [b]}, {id: c, next: [b]}],
 *   [{id: b, next: [d]}],
 *   [{id: e, next: [f,g]}],
 *   [{id: f, next: undefined}, {id: g, next: undefined}]
 * ]
 * */


function flowjs(canvasId, flowStructure){
    this.stage = new createjs.Stage(canvasId);
    this.stage.enableMouseOver(5);
    
    console.log("stage", this.stage);
    
    this.flowStructure = flowStructure;
    
    this.width = this.stage.canvas.width;
    this.height = this.stage.canvas.height;
    
    this.itemRadius = 15;
    this.jumpSize = this.itemRadius * 6;
    
    this.startX = this.width / 2;
    this.startY = this.height / 2;
    
    this.flowItems = {};
    
    var thatStage = this.stage;
    this.onItemUpdate = function(){
        thatStage.update();
    };
}


flowjs.prototype.draw = function(){
    var x = this.startX - this.itemRadius - ((this.flowStructure.length-1) * (this.jumpSize/2));

    // init all the flow points
    for(var i=0; i<this.flowStructure.length; i++){
        var row = this.flowStructure[i];
        this.drawRow(row, x);    
        x += this.jumpSize;
    }
    
    // connect all the points that should be connected
    var flowItemsCopy = {};
    for(var key in this.flowItems){flowItemsCopy[key]=this.flowItems[key]}
    console.log(this.flowItems, flowItemsCopy);
    
    for(var key in flowItemsCopy){
        var item = flowItemsCopy[key];
        if (item.data.next !== undefined && item.data.next.length > 0){
            for(var i=0; i<item.data.next.length; i++){
                var nextKey = item.data.next[i];
                var next = this.flowItems[nextKey];
                
                var connectorId = item.data.id+"->"+next.data.id;
                
                if (this.flowItems[connectorId] === undefined){
                    var start = item.flowItem.getLocation();
                    var end = next.flowItem.getLocation();
                    var connector = new flowConnector(start.x, start.y, end.x, end.y);
                    this.flowItems[connectorId] = {flowItem: connector, data: {id: connectorId}};
                }
            }
        }
    }
    
    console.log(this.flowItems, flowItemsCopy);
    
    // add all the flow points to the canvas
    for(var key in this.flowItems){
        var item = this.flowItems[key];
        var shapes = item.flowItem.getDrawableItems();
        for(var i=0;i<shapes.length; i++){
            this.stage.addChild(shapes[i]);
        }
    }
    
    // publish the changes to the canvas
    this.stage.update();
};

flowjs.prototype.drawRow = function(row, x){
    var offset = ((row.length-1) * (this.jumpSize/2));
    var y = this.startY - this.itemRadius - offset;
    
    // foreach item in row
    for(var i=0; i<row.length; i++){
        var itemData = row[i];

        var item = new flowjsItem(x,y);
        item.radius = this.itemRadius;
        item.text = itemData.id;
        item.refresh();
        item.listener = this.onItemUpdate;
        
        this.flowItems[itemData.id] = {data: itemData, flowItem: item};
        y += this.jumpSize;
    }
};

/*  Update a flow item properties. 
    The given function will be called and will be passed the flow item object */
flowjs.prototype.updateItem = function(itemId, func){
};

/* ------------------------------- FLOW CONNECTOR ------------------------------- */

function flowConnector(xa, ya, xb, yb) {
    this.color = "#"+((1<<24)*Math.random()|0).toString(16);
    this.opacity = 0.2;
    this.strokeWidth = 3;
    
    
    var height = Math.abs(yb - ya);
    var width = Math.abs(xb - xa);
    
    console.log("hXw", height, width)
    if (height > width){
        console.log("warning, too steep");
    }
    
    var start =   {x: xa,                       y: ya};
    var middleA = {x: xa + (width-height)/2,    y: ya};
    var middleB = {x: middleA.x+height,         y: yb};
    var end =     {x: xb,                       y: yb}; 
    
    console.log(start, middleA, middleB, end);
    
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