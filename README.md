# FLOWJS
a simple HTML5 flow chart using the canvas element. based on CreateJs



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



# License
flowjs is available under the [MIT License](https://github.com/bitterbit/flowjs/blob/master/LICENSE.md)
