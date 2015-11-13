# FlowJS
Simple HTML5 flow chart using the canvas element.  
FlowJS allows you to render dynamic, animated flow charts using HTML5 canvas with the help of [CreateJs](http://createjs.com).  
No more complex graphs and endles zooming.

This library is still work in progress, any contribution will be welcomed

# Usage
![flow chart example](https://github.com/bitterbit/flowjs/blob/master/flowchartimg.png)


``` html
<script type="text/javascript" src="lib/createjs-2015.05.21.min.js"></script>
<script type="text/javascript" src="flow.min.js"></script>
```
``` html
<canvas id="canvasID" width="500" height="300"></canvas>
```

``` javascript
var graph = new flowjs.DiGraph();
graph.addPaths([
    ["Peter Q", "Gamora", "Nova Prime", "Rocket"],
    ["Drax", "Groot", "Rocket"],
    ["Merdith Q", "Groot"]
]);

new flowjs.DiFlowChart("canvasID", graph).draw();
```



# Advanced Usage
Here we show how to update a node after we draw it
We simulate an app the loads data about the node in the background and when its ready, updates the displayed chart

![flow chart loading example](https://github.com/bitterbit/flowjs/blob/master/flowchartloading.gif)


``` javascript
var graph = new flowjs.DiGraph();
// ... init the graph
new flowjs.DiFlowChart(graph, "canvasID").draw();


// this function simulates loading a flow chart and coloring parts of it
// we simulate loading using the setTimeout function 
function simuLoad(flowChart, graph){
    // helps walk over all the graphs nodes
    var walker = new flowjs.GraphWalker(graph);
    
    walker.forEach(function(node){
        var start = Math.random() * 1000 * 5;
        var dur = Math.random() * 1000 * 5;
        simulateLoading(node.id, start);
        simulateDoneLoading(node.id, start + dur);
    }, this);
    
    
    // start running an animation on the given iten
    function simulateLoading(itemId, timeout){
        setTimeout(function(){
            flowChart.updateItem(itemId, function(item){
                item.flowItem.toggleFlashing();
            });
        }, timeout);
        
    }
    
    // stop the animation on the item and color it
    function simulateDoneLoading(itemId, timeout){
        setTimeout(function(){
            flowChart.updateItem(itemId, function(item){
                item.flowItem.toggleFlashing();
                item.flowItem.color = "cyan";
                if (item.connectors === undefined){return;}
                item.connectors.forEach(function(conn){
                   conn.color = "cyan"; 
                });
            });
        }, timeout);
    }
}

```

# License
flowjs is available under the [MIT License](https://github.com/bitterbit/flowjs/blob/master/LICENSE.md)
