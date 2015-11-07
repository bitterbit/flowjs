function flowjs(canvasId, flowStructure){
    this.stage = new createjs.Stage(canvasId);
    this.stage.enableMouseOver(5);
    
    this.flowStructure = flowStructure;
    
    this.width = this.stage.canvas.width;
    this.height = this.stage.canvas.height;
    
    this.itemRadius = 15;
    this.yJumpSize = this.itemRadius * 4;
    this.xJumpSize = this.itemRadius * 9;
    
    this.lineWidth = 6;
    this.color = "purple";
    this.background = "white";
    
    this.startX = (this.width/2) - ((this.flowStructure.length-1)*(this.xJumpSize)/2);
    this.startY = this.height / 2;
    
    this.flowItems = {};
    this.flowConnectors = {};
    
    this.stage.canvas.style.background = this.background;
    
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.stage);
    
    // var thatStage = this.stage;
    // this.onItemUpdate = function(){
    //     thatStage.update();
    // };
}


flowjs.prototype.draw = function(){
    var firstRow = this.flowStructure[0];
    for(var i=0; i<firstRow.length; i++){
        var item = firstRow[i];
        this.flowItems[item.id] = this._createItem(item, 0, firstRow.length, i);
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
        var itemData=nextRow[i];
        if (this.flowItems[itemData.id] !== undefined){
            usedSpots++;
        }
    }
    
    for (var i=0; i<nextRow.length; i++){
        
        var itemData=nextRow[i];
        if (firstData.next === undefined || firstData.next.indexOf(itemData.id) == -1){
            // do nothing, not the next item
        } 
        
        // next item was already drawn, we shoud connect it but should not continue
        else if (this.flowItems[itemData.id] !== undefined){
            var nextFlowItem = this.flowItems[itemData.id].flowItem;
            var connector = this._createConnector(firstShape, nextFlowItem);
            var connectorId = firstData.id + "->" + itemData.id
            this.flowConnectors[connectorId] = connector;
            console.log("connected and stoped", connectorId);
        } 
        
        // found next item, draw it and continue
        else {
            var nextFlowItem = this._createItem(itemData, rowNum, nextRow.length, usedSpots);
            this.flowItems[itemData.id] = nextFlowItem;
            usedSpots++;
            
            var connectorId = firstData.id + "->" + itemData.id;
            this.flowConnectors[connectorId] = this._createConnector(firstShape, nextFlowItem.flowItem);
            
            console.log("connected and contineuing", connectorId);
            
            this.drawFlowPathRecursive(this.flowItems[itemData.id], rowNum+1);    
        }
    }
};


flowjs.prototype._createItem = function(data, rowNum, rowItemCount, rowUsedSpots){
    var offset = ((rowItemCount-1) * (this.yJumpSize/2));
    var y = this.startY - this.itemRadius - offset + (rowUsedSpots * this.yJumpSize);
    var x = this.startX + (rowNum*this.xJumpSize);
    
    if(data.empty !== undefined && data.empty === true){
        var flowItem = new flowjsItemEmpty(x, y, this.itemRadius);
    } else {
        var flowItem = new flowjsItem(x, y, data.id, this.itemRadius, this.onItemUpdate);
    }
    
    flowItem.color = this.color;
    flowItem.background = this.background;
    flowItem.refresh();
    return {data: data, flowItem: flowItem};
};

flowjs.prototype._createConnector = function(itemA, itemB){
    var start = itemA.getLocation();
    var end = itemB.getLocation();
    
    if((itemA.empty !== undefined && itemA.empty) || (itemB.empty !== undefined && itemB.empty)){
        var connector = new flowConnectorEmpty(start.x, start.y, end.x, end.y);
    } else {
        var connector = new flowConnector(start.x, start.y, end.x, end.y);
    }
    
    connector.color = this.color;
    connector.strokeWidth = this.lineWidth;
    connector.refresh();
    return {flowItem: connector};
};


flowjs.prototype.submitItems = function(){
    this.submitItemsFromMap(this.flowConnectors);
    this.submitItemsFromMap(this.flowItems);
    
    // publish the changes to the canvas
    this.stage.update();  
};


flowjs.prototype.submitItemsFromMap = function(map){
    // add all the flow items to the canvas
    for(var key in map){
        var item = map[key];
        var shapes = item.flowItem.getDrawableItems();
        for(var i=0;i<shapes.length; i++){
            this.stage.addChild(shapes[i]);
        }
    }
};

/*  Update a flow item properties. 
    The given function will be called and will be passed the flow item object */
flowjs.prototype.updateItem = function(itemId, func){
    var item = this.flowItems[itemId].flowItem;
    func(item);
    item.refresh();
    this.stage.update();
};
