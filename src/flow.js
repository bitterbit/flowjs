/* global createjs */

var flowjs = flowjs || {};

flowjs.DiFlowChart = function DiFlowChart(canvasId, gGraph){
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
};


flowjs.DiFlowChart.prototype.draw = function(){
    var usedSpots = {};
    var walker = new flowjs.GraphWalker(this.graph);
    
    walker.forEach(function(node){
        usedSpots = this._drawNode(node, usedSpots);
    }, this);
    
    walker.forEach(this._fixLongConnections, this);
    walker.forEach(this._balancePoints, this);
    walker.forEach(this._drawNodeConnections, this);
    
    this.submitItems();
};

flowjs.DiFlowChart.prototype._drawNode = function(node, usedSpots){
    var usedCount = usedSpots[node.rank] || 0;
    usedSpots[node.rank] = usedCount + 1;
    
    var flowItem = this._createItem(node, node.rank, this.graph.getRankSize(node.rank), usedCount);
    this.flowItems[node.id] = flowItem;
    return usedSpots;
};

flowjs.DiFlowChart.prototype._drawNodeConnections = function(node){
    var currentFlowItem = this.flowItems[node.id];
        
    node.next.each(function(nextNodeId){
        var nextFlowItem = this.flowItems[nextNodeId].flowItem; 
        var connector = this._createConnector(currentFlowItem.flowItem, nextFlowItem);
        currentFlowItem.connectors = currentFlowItem.connectors || [];
        currentFlowItem.connectors.push(connector);
        
    }, this);
    
    this.flowItems[node.id] = currentFlowItem;
};


flowjs.DiFlowChart.prototype._fixLongConnections = function(node){
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

flowjs.DiFlowChart.prototype._balancePoints = function(node){
    var that = this;
    
    var shouldSwap = function(nodeA, nodeB){
        if (nodeA.id === nodeB.id || nodeA.getCallCount() === 0 || nodeB.getCallCount() === 0){
            return false;
        }
        
        var avgPrevYA = that._getNodeAvgPrevY(nodeA);
        var avgPrevYB = that._getNodeAvgPrevY(nodeB);
        var yA = that._getFlowItem(nodeA.id).y;
        var yB = that._getFlowItem(nodeB.id).y;
        
        if (yA > yB && avgPrevYB > avgPrevYA) {
            return true;
        } else if (yB > yA && avgPrevYA > avgPrevYB){
            return true;
        }
        
        return false;
    };
    
    var potentialSwappers = this.graph.getNodesWithRank(node.rank);
    
    potentialSwappers.forEach(function(potSwapperNode){
        // do somthing with unhuamful swaps on first nodes
        if (!shouldSwap(node, potSwapperNode)){
            return;
        }
        
        console.log("swapping", node.id, potSwapperNode.id);
                
        // swap the two items
        var flowItem = this._getFlowItem(node.id);
        var otherFlowItem = this._getFlowItem(potSwapperNode.id);
        
        var tmpY = otherFlowItem.y;
        otherFlowItem.y = flowItem.y;
        flowItem. y = tmpY;
        
    }, this);
};

flowjs.DiFlowChart.prototype._straighten_connections = function(x){
    var nodes = this.graph.getNodesWithRank(x);
    var flowItemBundles = [];
    
    nodes.forEach(function(node){
        flowItemBundles.push(this.flowItems[node.id]);
    }, this);
    
    flowItemBundles.sort(function(flowItemA, flowItemB){
        return flowItemA.flowItem.y - flowItemB.flowItem.y;
    });
    
    var moveFlowItemsBy = function(flowItemBundels, yDelta) {
        flowItemBundels.forEach(function(flowBundle){
            console.log("moving", flowBundle.node.id, "by", yDelta, "affectedNodes", flowItemBundels);
            flowBundle.flowItem.y += yDelta;
            var connectors = flowBundle.connectors || [];
            connectors.forEach(function(conn){conn.ya += yDelta; });
            
        }, this);
    };
    
    flowItemBundles.forEach(function(flowItemBundle, index){
        if (flowItemBundle.node.getCallCount() === 0){
            return;
        }
        
        var flowItem = flowItemBundle.flowItem;
        var avgPrevY = this._getNodeAvgPrevY(flowItemBundle.node);
        var diff = avgPrevY - flowItem.y;
        
        console.log("diff", diff, avgPrevY, flowItem.y);
        
        // almost in the middle, make it the middle (it wont hurt)
        // no need to move the others?
        if(Math.abs(diff) <= flowItem.radius){
            console.log("COOL", flowItemBundle.node.id);
            flowItem.y = avgPrevY;
            return;
        }
        
        // if diff positive: current item is above the avg of his callers. move it down!
        // else:             current item is below the avg of his callers. move it up!
        
        var itemsToMove = [];
        if (diff > 0){
            itemsToMove = flowItemBundles.slice(index); // current item and all the next items
        } else {
            itemsToMove = flowItemBundles.slice(0, index+1); // current item and all the next items
        }
        moveFlowItemsBy(itemsToMove, -diff);
        
    }, this);
};

flowjs.DiFlowChart.prototype._getFlowItem = function(nodeId){
    return this.flowItems[nodeId].flowItem;
};
    
flowjs.DiFlowChart.prototype._getNodeAvgPrevY = function(node){
    if (node.getCallCount() === 0){
        throw new Error("cant find the avarge previous y of no previous items. node="+node.id);
    }
    
    var avgPrevY = 0;
    node.callers.each(function(prevId){ avgPrevY += this._getFlowItem(prevId).y; }, this);    
    return avgPrevY / node.callers.size();
};


flowjs.DiFlowChart.prototype._createItem = function(node, rowNum, rowItemCount, rowUsedSpots){
    var offset = ((rowItemCount-1) * (this.yJumpSize/2));
    var y = this.startY - this.itemRadius - offset + (rowUsedSpots * this.yJumpSize);
    var x = this.startX + (rowNum*this.xJumpSize);

    var flowItem = new flowjs.flowItem(x, y, node.id, this.itemRadius, this.onItemUpdate);
    flowItem.color = this.color;
    flowItem.background = this.background;
    flowItem.refresh();
    
    return {node: node, flowItem: flowItem};
};

flowjs.DiFlowChart.prototype._createConnector = function(itemA, itemB){
    var start = itemA.getLocation();
    var end = itemB.getLocation();
    
    var connector = new flowjs.flowConnector(start.x, start.y, end.x, end.y);
    
    connector.color = this.color;
    connector.strokeWidth = this.lineWidth;
    connector.refresh();
    return connector;
};


flowjs.DiFlowChart.prototype.submitItems = function(){
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
                });
            });
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
flowjs.DiFlowChart.prototype.updateItem = function(itemId, func){
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
