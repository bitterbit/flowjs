/**
 * Flow structure
 * [ [{id: a, next: [b]}, {id: c, next: [b]}],
 *   [{id: b, next: [d]}],
 *   [{id: e, next: [f,g]}],
 *   [{id: f, next: undefined}, {id: g, next: undefined}]
 * ]
 * */


function flowjs(canvasId, flowStructure){
    this.stage = new createjs.Stage(canvasId);
    this.stage.enableMouseOver(5);
    
    console.log("stage", this.stage);
    
    this.flowStructure = flowStructure;
    
    this.width = this.stage.canvas.width;
    this.height = this.stage.canvas.height;
    
    this.itemRadius = 15;
    this.jumpSize = this.itemRadius * 6;
    
    this.startX = this.width / 2;
    this.startY = this.height / 2;
    
    this.flowItems = {};
    
    var thatStage = this.stage;
    this.onItemUpdate = function(){
        thatStage.update();
    };
}


flowjs.prototype.draw = function(){
    var x = this.startX - this.itemRadius - ((this.flowStructure.length-1) * (this.jumpSize/2));

    // foreach row
    for(var i=0; i<this.flowStructure.length; i++){
        var row = this.flowStructure[i];
        this.drawRow(row, x);    
        x += this.jumpSize;
    }
    
    for(var key in this.flowItems){
        var item = this.flowItems[key];
        var shapes = item.flowItem.getDrawableItems();
        for(var i=0;i<shapes.length; i++){
            this.stage.addChild(shapes[i]);    
        }
    }
    this.stage.update();
};

flowjs.prototype.drawRow = function(row, x){
    var offset = ((row.length-1) * (this.jumpSize/2));
    var y = this.startY - this.itemRadius - offset;
    
    // foreach item in row
    for(var i=0; i<row.length; i++){
        var itemData = row[i];

        var item = new flowjsItem(x,y);
        item.radius = this.itemRadius;
        item.text = itemData.id;
        item.refresh();
        item.listener = this.onItemUpdate;
        
        this.flowItems[itemData.id] = {data: itemData, flowItem: item};
        y += this.jumpSize;
    }
};

/*  Update a flow item properties. 
    The given function will be called and will be passed the flow item object */
flowjs.prototype.updateItem = function(itemId, func){
    
};
