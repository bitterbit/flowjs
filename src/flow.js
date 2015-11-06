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
    
    this.startX = (this.width/2) - ((this.flowStructure.length-1)*(this.jumpSize)/2);
    this.startY = this.height / 2;
    
    this.flowItems = {};
    
    var thatStage = this.stage;
    this.onItemUpdate = function(){
        thatStage.update();
    };
}


flowjs.prototype.draw = function(){
    var firstRow = this.flowStructure[0];
    var x = this.startX;
    
    for(var i=0; i<firstRow.length; i++){
        var offset = ((firstRow.length-1) * (this.jumpSize/2));
        var y = this.startY - this.itemRadius - offset;
        y += i * this.jumpSize;
        
        var item = firstRow[i];
        var flowItem = new flowjsItem(x, y, item.id, this.itemRadius);
        flowItem.refresh();
        this.flowItems[item.id] = {data: item, flowItem: flowItem};
        
        this.drawFlowPathRecursive(this.flowItems[item.id], 1);
    }
    
    this.submitItems();
};


flowjs.prototype.drawFlowPathRecursive = function(firstItem, rowNum){
    // breaking rule
    if (rowNum >= this.flowStructure.length){
        return;
    }
    
    var firstShape = firstItem.flowItem;
    var firstData = firstItem.data;
    var nextRow = this.flowStructure[rowNum];
    
    var usedSpots = 0;
    for (var i=0; i<nextRow.length; i++){
        var item=nextRow[i];
        if (this.flowItems[item.id] !== undefined){
            usedSpots++;
        }
    }
    
    for (var i=0; i<nextRow.length; i++){
        
        var item=nextRow[i];
        if (firstData.next.indexOf(item.id) == -1){
            // do nothing, not the next item
        } 
        
        // next item was already drawn, we shoud connect it but should not continue
        else if (this.flowItems[item.id] !== undefined){
        
            var flowItem = this.flowItems[item.id].flowItem;
            var start = firstShape.getLocation();
            var end = flowItem.getLocation();
            var connector = new flowConnector(start.x, start.y, end.x, end.y);
            var connectorId = firstData.id + "->" + item.id
            this.flowItems[connectorId] = {flowItem: connector};
            
            console.log("connected and stoped", connectorId);
        } 
        
        // found next item, draw it and continue
        else {
            var offset = ((nextRow.length-1) * (this.jumpSize/2));
            var nextY = this.startY - this.itemRadius - offset;
            nextY += usedSpots * this.jumpSize;
            usedSpots++;
            
            var nextX = this.startX + (rowNum*this.jumpSize);
            
            var flowItem = new flowjsItem(nextX, nextY, item.id, this.itemRadius);
            flowItem.refresh();
            this.flowItems[item.id] = {data: item, flowItem: flowItem};
            
            
            var start = firstShape.getLocation();
            var end = flowItem.getLocation();
            
            var connector = new flowConnector(start.x, start.y, end.x, end.y);
            var connectorId = firstData.id + "->" + item.id;
            this.flowItems[connectorId] = {flowItem: connector};
            console.log("connected and contineuing", connectorId);
            
            this.drawFlowPathRecursive(this.flowItems[item.id], rowNum+1);    
        }
    }
};


flowjs.prototype.submitItems = function(){
    // add all the flow items to the canvas
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

/*  Update a flow item properties. 
    The given function will be called and will be passed the flow item object */
flowjs.prototype.updateItem = function(itemId, func){
};
