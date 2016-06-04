var flowjs = flowjs || {};


flowjs.DiGraph = function DiGraph(){
    this._nodes = {};
    this._cacheRankCount = {}; // a mapping between rank level to # of nodes in that rank
    this._longestPathLength = 0;
};

flowjs.DiGraph.prototype.addPaths = function(pathArray){
    pathArray.forEach(function(path){
        this._addPath(path);
    }, this);
    this._refreshMeta();
};

flowjs.DiGraph.prototype.addPath = function(path){
    this._addPath(path);
    this._refreshMeta();
};

flowjs.DiGraph.prototype.getNodes = function(){
    return this._nodes;  
};

flowjs.DiGraph.prototype.getNode = function(id){
    return this._nodes[id];
};

flowjs.DiGraph.prototype.getNodesWithRank = function(rank){
    var wantedNodes = [];
    var walker = new flowjs.GraphWalker(this);
    
    // nothing to look for here ...
    if (this.getRankSize(rank) === 0){
        return wantedNodes;
    }
    
    walker.forEach(function(node){
        if (node.rank == rank){
            wantedNodes.push(node);
        }
    }, this);
    
    return wantedNodes;
};

flowjs.DiGraph.prototype.getLongestLength = function(){
    return this._longestPathLength;
};

flowjs.DiGraph.prototype.getRankSize = function(rankNum){
    return this._cacheRankCount[rankNum] || 0;
};


flowjs.DiGraph.prototype._refreshMeta = function(){
    /**
     * 1. rank all nodes
     * 2. fix ranking (move unneseccery long items closer together)
     * 3. cache the mapping between rank level to # of nodes in that rank
    */
    this._longestPathLength = this._rankNodes();
    this._organize();
    this._cacheRankCount = this._getRankCount();
};

flowjs.DiGraph.prototype._addPath = function(path){
    var lastNode = undefined;
    
    // Init add add next items
    path.forEach(function(id){
        if (this._nodes[id] === undefined){
            this._nodes[id] = new flowjs.node(id);
        }
        
        var node = this._nodes[id];
        if (lastNode !== undefined){
            lastNode.addNext(node);
        }
        
        lastNode = node;
    }, this);
};

// Measure the max distance for each node from the beginning
flowjs.DiGraph.prototype._rankNodes = function(){
    
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
    for (var key in this._nodes){ tmpCallCount[key] = this._nodes[key].getCallCount(); }
    
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

// Calculate the number of nodes in each #rank 
flowjs.DiGraph.prototype._getRankCount = function(){
    var rankCount = {};
    for (var key in this._nodes){
        var node = this._nodes[key];
        rankCount[node.rank] = rankCount[node.rank] || 0;
        rankCount[node.rank] += 1;
    }
    return rankCount;
};

flowjs.DiGraph.prototype._organize = function(){
    
    var that = this;
    var walker = new flowjs.GraphWalker(this);
    
    // returns true if shifted the given node forward (ignores the shift status of the nodes before it)
    var tryShiftNodesForward = function(node){
        var minDiff;
        
        // get min diff from this node to all its next nodes
        node.next.each(function(nextId){
            var nextNode = that.getNode(nextId);
            var diff = nextNode.rank - node.rank;
            if (minDiff === undefined){
                minDiff = diff;
            } else {
                minDiff = Math.min(minDiff, diff); 
            }
        }, that);
        
        // there is a connection that has a diff of 1
        // nowhere to move this node forward 
        if (minDiff <= 1){
            return false;
        }
        
        // shift this node forawrd
        node.rank += minDiff - 1;
        
        // try to shift all of its children
        node.callers.each(function(prevNodeId){
            tryShiftNodesForward(that.getNode(prevNodeId));
        }, that);
        
        return true;
    };
    
    walker.forEach(function(node){
        
        node.next.each(function(nextNodeId){
            var nextNode = this.getNode(nextNodeId);
            var distance = nextNode.rank - node.rank;
            
            if (distance > 1){
                tryShiftNodesForward(node);
            }
        }, this);
        
    }, this);  
};



/* ----------------------------------------------------*/
/* ---------------------- WALKER ----------------------*/
/* ----------------------------------------------------*/



flowjs.GraphWalker = function GraphWalker(graph){
    this.graph = graph;
};

flowjs.GraphWalker.prototype.forEach = function(iteratorFunction, thisObj){
    var nodes = this.graph.getNodes();
    for (var key in nodes){
        var node = nodes[key];
        if (node !== undefined){
            iteratorFunction.call(thisObj, node);    
        }
    }
};

flowjs.GraphWalker.prototype.iterNext = function(iteratorFunction, node, thisObj){
    return this._iterNodeProperty(iteratorFunction, node, "next", thisObj);
};

flowjs.GraphWalker.prototype.iterPrev = function(iteratorFunction, node, thisObj){
    return this._iterNodeProperty(iteratorFunction, node, "callers", thisObj);
};

flowjs.GraphWalker.prototype._iterNodeProperty = function(iteratorFunction, node, propertyName, thisObj){
    var round = node[propertyName] || new flowjs.set();
    
    while (round.size() > 0){
        
        var nextRound = new flowjs.set();
        round.each(function(nextRoundId){
            var node = this.graph.getNode(nextRoundId);
            iteratorFunction.call(thisObj, node);
        }, this);
        round = nextRound;
    }
};


flowjs.GraphWalker.prototype.getForefathers = function(node){
    var forefathers = [];
    this.iterPrev(function(childNode){
        console.log("what is hiding here?", childNode);
        if(childNode.getCallCount() === 0){
            forefathers.push(childNode);
        }
    }, node, this);
    
    return forefathers;
};



/* ----------------------------------------------------*/
/* ----------------------- NODE -----------------------*/
/* ----------------------------------------------------*/



flowjs.node = function Node(id, data){
    this.id = id;                    // id
    this.next = new flowjs.set();    // the ids of the next nodes
    this.callers = new flowjs.set(); // the ids of all the nodes that call this node
    this.rank = 0;                   // longest distance from the beginning
};

flowjs.node.prototype = {
    getCallCount: function getCallCount(){
        return this.callers.size();
    },
    
    addNext: function addNext(node){
       if(this.next.add(node.id)){
            node._addCaller(this);
        } 
    },
    
    _addCaller: function _addCaller(node){
        this.callers.add(node.id);
    }
};



/* ----------------------------------------------------*/
/* ----------------------- SET ------------------------*/
/* ----------------------------------------------------*/



flowjs.set = function Set(hashFunction) {
	this._hashFunction = hashFunction || JSON.stringify;
	this._values = {};
	this._size = 0;
};

flowjs.set.prototype = {
    
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
