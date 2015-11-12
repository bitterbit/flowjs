# FLOWJS
Simple HTML5 flow chart using the canvas element. based on [CreateJs](http://createjs.com)
No more complex graphs and endles zooming

# Usage
``` javascript
var graph = new DiGraph();
graph.addPaths([
    ["Peter Q", "Gamora", "Nova Prime", "Rocket"],
    ["Drax", "Groot", "Rocket"],
    ["Merdith Q", "Groot"]
]);

new DiFlowChart("canvasID", graph).draw();
```

![](https://github.com/bitterbit/flowjs/blob/master/flowchartimg.png)

# License
flowjs is available under the [MIT License](https://github.com/bitterbit/flowjs/blob/master/LICENSE.md)
