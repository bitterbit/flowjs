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
    var walker = new GraphWalker(this.graph);
    
    walker.forEach(function(node){
        usedSpots = this._drawNode(node, usedSpots);
    }, this);
    
    walker.forEach(this._fixLongConnections, this);
    walker.forEach(this._balancePoints, this);
    walker.forEach(this._drawNodeConnections, this);
    
    this.submitItems();
};

DiFlowChart.prototype._drawNode = function(node, usedSpots){
    var usedCount = usedSpots[node.rank] || 0;
    usedSpots[node.rank] = usedCount + 1;
    
    var flowItem = this._createItem(node, node.rank, this.graph.getRankSize(node.rank), usedCount);
    this.flowItems[node.id] = flowItem;
    return usedSpots;
};

DiFlowChart.prototype._drawNodeConnections = function(node){
    var currentFlowItem = this.flowItems[node.id];
        
    node.next.each(function(nextNodeId){
        var nextFlowItem = this.flowItems[nextNodeId].flowItem; 
        var connector = this._createConnector(currentFlowItem.flowItem, nextFlowItem);
        currentFlowItem.connectors = currentFlowItem.connectors || [];
        currentFlowItem.connectors.push(connector);
        
    }, this);
    
    this.flowItems[node.id] = currentFlowItem;
};


DiFlowChart.prototype._fixLongConnections = function(node){
    node.next.each(function(nextId){
        var nextNode = this.graph.getNode(nextId);
        var distance = nextNode.rank - node.rank;
        if (distance > 1){
            console.log("long distance reletaionship", node.id, nextNode.id, "how long?", distance);
            
            // how tall is this long connections?
            var startFlowItem = this.flowItems[node.id].flowItem;
            var endFlowItem = this.flowItems[nextNode.id].flowItem;
            var maxY = Math.max(startFlowItem.y, endFlowItem.y);
            var minY = Math.min(startFlowItem.y, endFlowItem.y);
            var height = maxY - minY;
            
            console.log("things", minY, maxY, height, startFlowItem, endFlowItem);
            
            
            // get all nodes in the effected x's (rank)
            var affectedNodes = [];
            for (var i=node.rank+1; i<nextNode.rank; i++){
                affectedNodes = affectedNodes.concat(this.graph.getNodesWithRank(i));
            }
            
            console.log("affected nodes", affectedNodes);
            
            // fix node positions
            affectedNodes.forEach(function(node){
                var flowItem = this.flowItems[node.id].flowItem;
                
                // above the long line, move up
                if (flowItem.y < maxY){
                    flowItem.y -= height*1.25;
                }
                // below the long line, move down
                else {
                    flowItem.y += height*0.75;
                }
                
            }, this);
        }
    }, this);
};

DiFlowChart.prototype._balancePoints = function(node){
    var that = this;
    
    var getFlowItem = function(nodeId){
        return that.flowItems[nodeId].flowItem;
    };
    
    var getNodeAvgPrevY = function(node){
        var avgPrevY = 0;
        node.callers.each(function(prevId){ avgPrevY = getFlowItem(prevId).y; }, that);    
        return avgPrevY / node.callers.size();
    };
    
    var shouldSwap = function(nodeA, nodeB){
        if (nodeA.id === nodeB.id){
            return false;
        }
        
        var yDiff =             Math.abs(getFlowItem(nodeA.id).y - getNodeAvgPrevY(nodeA));
        var potentialYDiff =    Math.abs(getFlowItem(nodeB.id).y - getNodeAvgPrevY(nodeA));
        
        // dont swap, not better
        if (yDiff <= potentialYDiff){
            return false;
        }
        
        return true;
    };
    
    
    var potentialSwappers = this.graph.getNodesWithRank(node.rank);
    
    potentialSwappers.forEach(function(potSwapperNode){
        if (!shouldSwap(node, potSwapperNode) || !shouldSwap(potSwapperNode, node)){
            return;
        }
                
        // swap the two items
        var flowItem = getFlowItem(node.id);
        var otherFlowItem = getFlowItem(potSwapperNode.id);
        
        var tmpY = otherFlowItem.y;
        otherFlowItem.y = flowItem.y;
        flowItem. y = tmpY;
        
    }, this);
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
        var flowItem = this.flowItems[key].flowItem;
        var flowShapes = flowItem.getDrawableItems();
        flowShapes.forEach(function(shape){
            pointShapes.push(shape);
        });
        
        flowItem.refresh();
        
        var connectors = this.flowItems[key].connectors;
        if(connectors !== undefined){
            connectors.forEach(function(conn){
                conn.refresh();
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
