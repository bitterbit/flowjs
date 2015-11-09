function DiFlowChart(canvasId, gGraph){
    console.log("NEW FLOW CHART");
    
    this.stage = new createjs.Stage(canvasId);
    this.stage.enableMouseOver(5);
    this.graph = gGraph;
    this.flowItems = {};
    
    this.width = this.stage.canvas.width;
    this.height = this.stage.canvas.height;
    
    this.itemRadius = 15;
    this.yJumpSize = this.itemRadius * 4;
    this.xJumpSize = this.itemRadius * 9;
    
    this.lineWidth = 6;
    this.color = "purple";
    this.background = "white";
    
    this.startX = (this.width/2) - ((this.graph.getLongestLength()-1)*(this.xJumpSize)/2);
    this.startY = this.height / 2;

    this.stage.canvas.style.background = this.background;
    
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.stage);
}


DiFlowChart.prototype.draw = function(){
    
    var usedSpots = {};
    

  
    var drawNode = function(node){
        var usedCount = usedSpots[node.rank] || 0;
        usedSpots[node.rank] = usedCount + 1;
        
        var flowItem = this._createItem(node, node.rank, this.graph.getRankSize(node.rank), usedCount);
        this.flowItems[node.id] = flowItem;
    };
    
    var drawConnections = function(node){
        var currentFlowItem = this.flowItems[node.id];
        
        node.next.each(function(nextNodeId){
            var nextFlowItem = this.flowItems[nextNodeId].flowItem; 
            var connector = this._createConnector(currentFlowItem.flowItem, nextFlowItem);
            currentFlowItem.connectors = currentFlowItem.connectors || [];
            currentFlowItem.connectors.push(connector);
            
        }, this);
        
        this.flowItems[node.id] = currentFlowItem;
    };
    
    var walker = new GraphWalker(this.graph);
    walker.forEach(drawNode, this);
    walker.forEach(drawConnections, this);
    
    this.submitItems();
};


DiFlowChart.prototype._createItem = function(node, rowNum, rowItemCount, rowUsedSpots){
    var offset = ((rowItemCount-1) * (this.yJumpSize/2));
    var y = this.startY - this.itemRadius - offset + (rowUsedSpots * this.yJumpSize);
    var x = this.startX + (rowNum*this.xJumpSize);

    var flowItem = new flowjsItem(x, y, node.id, this.itemRadius, this.onItemUpdate);
    flowItem.color = this.color;
    flowItem.background = this.background;
    flowItem.refresh();
    
    return {node: node, flowItem: flowItem};
};

DiFlowChart.prototype._createConnector = function(itemA, itemB){
    var start = itemA.getLocation();
    var end = itemB.getLocation();
    
    var connector = new flowConnector(start.x, start.y, end.x, end.y);
    
    connector.color = this.color;
    connector.strokeWidth = this.lineWidth;
    connector.refresh();
    return connector;
};


DiFlowChart.prototype.submitItems = function(){
    var connetorShapes = [];
    var pointShapes = [];
    
    for (var key in this.flowItems){
        var flowShapes = this.flowItems[key].flowItem.getDrawableItems();
        flowShapes.forEach(function(shape){
            pointShapes.push(shape);
        });
        
        var connectors = this.flowItems[key].connectors;
        if(connectors !== undefined){
            connectors.forEach(function(conn){
                conn.getDrawableItems().forEach(function(shape){
                    connetorShapes.push(shape);
                })
            })
        }
    }
    
    var stage = this.stage;
    connetorShapes.forEach(function(shape){
        stage.addChild(shape);
    });
    
    pointShapes.forEach(function(shape){
        stage.addChild(shape); 
    });

    this.stage.update();  
};

/*  Update a flow item properties. 
    The given function will be called and will be passed the flow item object */
DiFlowChart.prototype.updateItem = function(itemId, func){
    var item = this.flowItems[itemId];
    if(item === undefined){
        return;
    }
    
    func(item);
    
    item.flowItem.refresh();
    if (item.connectors !== undefined){
        item.connectors.forEach(function(connector){
            connector.refresh();
        });
    }
    
    this.stage.update();
};
