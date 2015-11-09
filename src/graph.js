
function DiGraph(){
    this._nodes = {};
    this._cacheRankCount = {};
    this._longestPathLength = 0;
}

DiGraph.prototype.addPaths = function(pathArray){
    pathArray.forEach(function(path){
        this._addPath(path);
    }, this);
    this._refreshMeta();
};

DiGraph.prototype.addPath = function(path){
    this._addPath(path);
    this._refreshMeta();
};

DiGraph.prototype.getNodes = function(){
    return this._nodes;  
};

DiGraph.prototype.getNode = function(id){
    return this._nodes[id];
};

DiGraph.prototype.getBeginnings = function(){
    var begginnings = [];
    for (var key in this._nodes){
        var node = this._nodes[key];
        if (node.getCallCount() === 0){
            begginnings.push(node);
        }
    }
    
    return begginnings;
};

DiGraph.prototype.getLongestLength = function(){
    return this._longestPathLength;
};

DiGraph.prototype.getRankSize = function(rankNum){
    return this._cacheRankCount[rankNum] || 0;
};


DiGraph.prototype._refreshMeta = function(){
    this._longestPathLength = this._rankNodes();
    this._cacheRankCount = this._getRankCount();
    this._organize();
};

DiGraph.prototype._addPath = function(path){
    var lastNode = undefined;
    
    // Init add add next items
    path.forEach(function(id){
        if (this._nodes[id] === undefined){
            this._nodes[id] = new Node(id);
        }
        
        var node = this._nodes[id];
        if (lastNode !== undefined){
            lastNode.addNext(node);
        }
        
        lastNode = node;
    }, this);
};

// Measure the max distance for each node from the beginning
DiGraph.prototype._rankNodes = function(){
    
    // returns all the ids of the keys of the items that their call count is 0 (in tmpCallCount)
    var getZeroCallNodes = function(){
        var ids = [];
        for (var key in tmpCallCount){
            if (tmpCallCount[key] === 0){
                ids.push(key);
            }
        }
        return ids;
    };
    
    // Copy the call count to a temporary map
    var tmpCallCount = {};
    for (var key in this._nodes){ tmpCallCount[key] = this._nodes[key].getCallCount() }
    
    // An array that allways contains all the ids of the nodes that have a call count of 0 (at the time)
    var currentStage;
    var counter = 0;
    do {
        currentStage = getZeroCallNodes();
        
        currentStage.forEach(function(id){
            var node = this.getNode(id);
            node.rank = counter;
            tmpCallCount[node.id] -= 1;
            
            node.next.each(function(id){
                if (tmpCallCount[id] < 0){
                    console.log("strange next item, maybe a loop?", id, tmpCallCount[id]);
                } else {
                    tmpCallCount[id] -= 1;
                }
            }, this);
            
        }, this);
  
        counter ++;
    } while (currentStage.length > 0);
    
    return counter-1;
};

DiGraph.prototype._getRankCount = function(){
    var rankCount = {};
    for (var key in this._nodes){
        var node = this._nodes[key];
        rankCount[node.rank] = rankCount[node.rank] || 0;
        rankCount[node.rank] += 1;
    }
    return rankCount;
};

DiGraph.prototype._organize = function(){
    
    var that = this;
    var walker = new GraphWalker(this);
    
    var tryShiftNodesForward = function(node){
        var forefathers = walker.getForefathers(node);
        if (forefathers.length === 0){
            console.log("CAN DO!");
            return true;
            // can do!
        }
        return false;
        
    };
    
    var makeUpForLongLine = function(startRank, endRank){
        console.log("making up for long line", startRank, endRank);
        for(var i=startRank+1; i < endRank; i++){
            var count = that._cacheRankCount[i] || 0;
            console.log("index", i, "before", that._cacheRankCount[i]);
            that._cacheRankCount[i] = count*2;
            console.log("index", i, "count", that._cacheRankCount[i]);
        }
    };
    
    
    walker.forEach(function(node){
        
        node.next.each(function(nextNodeId){
            var nextNode = this.getNode(nextNodeId);
            var distance = nextNode.rank - node.rank;
            
            if (distance > 1){
                var successful = tryShiftNodesForward(node);
                if (!successful){
                    console.log("making up for nodes: ", node, nextNode);
                    makeUpForLongLine(node.rank, nextNode.rank);
                }
            }
        }, this);
        
    }, this);  
};

/* ---------------------- WALKER ----------------------*/

function GraphWalker(graph){
    this.graph = graph;
}

GraphWalker.prototype.forEach = function(iteratorFunction, thisObj){
    var nodes = this.graph.getNodes();
    for (var key in nodes){
        var node = nodes[key];
        if (node !== undefined){
            iteratorFunction.call(thisObj, node);    
        }
    }
};

GraphWalker.prototype.iterNext = function(iteratorFunction, node, thisObj){
    return this._iterNodeProperty(iteratorFunction, node, "next", thisObj);
};

GraphWalker.prototype.iterPrev = function(iteratorFunction, node, thisObj){
    return this._iterNodeProperty(iteratorFunction, node, "callers", thisObj);
};

GraphWalker.prototype._iterNodeProperty = function(iteratorFunction, node, propertyName, thisObj){
    var round = node[propertyName] || new Set();
    
    while (round.size() > 0){
        
        var nextRound = new Set();
        round.each(function(nextRoundId){
            var node = this.graph.getNode(nextRoundId);
            iteratorFunction.call(thisObj, node);
        }, this);
        round = nextRound;
    }
};


GraphWalker.prototype.getForefathers = function(node){
    var forefathers = [];
    this.iterPrev(function(childNode){
        console.log("what is hiding here?", childNode);
        if(childNode.getCallCount() === 0){
            forefathers.push(childNode);
        }
    }, node, this);
    
    return forefathers;
};


/* ----------------------- NODE -----------------------*/


function Node(id, data){
    this.id = id;               // id
    this.next = new Set();      // the ids of the next nodes
    this.callers = new Set();   // the ids of all the nodes that call this node
    this.rank = 0;              // longest distance from the beginning
    //this.x = 0;               // if to be drawn on a chart, it would be the optimal x axis location 
}

Node.prototype.getCallCount = function(){
    return this.callers.size();
};

Node.prototype.addNext = function(node){
    if(this.next.add(node.id)){
        node._addCaller(this);
    }
};

Node.prototype._addCaller = function(node){
    this.callers.add(node.id);
};


/* ----------------------- SET -----------------------*/



function Set(hashFunction) {
	this._hashFunction = hashFunction || JSON.stringify;
	this._values = {};
	this._size = 0;
}

Set.prototype = {
    
    // Return true if added, else false
	add: function add(value) {
		if (!this.contains(value)) {
			this._values[this._hashFunction(value)] = value;
			this._size++;
			return true;
		}
		return false;
	},
	
	remove: function remove(value) {
		if (this.contains(value)) {
			delete this._values[this._hashFunction(value)];
			this._size--;
		}
	},
	
	contains: function contains(value) {
		return typeof this._values[this._hashFunction(value)] !== "undefined";
	},
	
	size: function size() {
		return this._size;
	},
	
	each: function each(iteratorFunction, thisObj) {
		for (var hash in this._values) {
		    var value = this._values[hash];
		    if (value !== undefined){
		        iteratorFunction.call(thisObj, this._values[hash]);    
		    }
		}
	},
	
	append: function append(set){
	    set.each(function(value){
	        this.add(value);
	    }, this);
	}
};