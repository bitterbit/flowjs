
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


DiGraph.prototype.getNode = function(id){
    return this._nodes[id];
};

DiGraph.prototype.getBeginnings = function(){
    var begginnings = [];
    for (var key in this._nodes){
        var node = this._nodes[key];
        if (node.callCount === 0){
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

DiGraph.prototype.forEach = function(iteratorFunction, thisObj){
    for (var key in this._nodes){
        var node = this._nodes[key];
        if (node !== undefined){
            iteratorFunction.call(thisObj, node);    
        }
    }
};

DiGraph.prototype._refreshMeta = function(){
    this._longestPathLength = this._rankNodes();
    this._cacheRankCount = this._getRankCount();
};

DiGraph.prototype._addPath = function(path){
    var lastNode = undefined;
    
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
    for (var key in this._nodes){ tmpCallCount[key] = this._nodes[key].callCount }
    
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




// DiGraph.prototype._beautfiy = function(){
//     var nodeRankMap = {}; // mapping #rank -> set(nodes...)
    
//     for(var id in this._nodes){
//         var node = this._nodes[id];
//         nodeRankMap[node.rank] = nodeRankMap[node.rank] || new Set();
//         nodeRankMap[node.rank].add(node.id);
//     }
    
//     // for eah node, if the min diff from the rank of the next node is bigger than one:
//     // move that node farword 
//     // go from the end to the beginning ?
    
//     for (var i in nodeRankMap){
//         var nodeIds = nodeRankMap[i];
//         nodeIds.each(function(id){
//         }, this);
//     }
    
// };

/* ----------------------- NODE -----------------------*/


function Node(id, data){
    this.id = id;           // id
    this.next = new Set();  // the ids of the next nodes
    this.callCount = 0;     // number of times this node is refrenced by other nodes
    this.rank = 0;          // longest distance from the beginning
    //this.x = 0;             // if to be drawn on a chart, it would be the optimal x axis location 
}

Node.prototype._incrCaller = function(){
    this.callCount += 1;
};

Node.prototype.addNext = function(node){
    if(this.next.add(node.id)){
        node._incrCaller();    
    }
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
	}
};