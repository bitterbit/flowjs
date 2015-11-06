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


/* -------------------- FLOW JS ITEM -------------------- */

function flowjsItem(x,y){
    this.x = x;
    this.y = y;
    
    this.color = "black";
    this.radius = 40;
    this.text = "Hello";
    this.link = "#";
    
    this.circle = new createjs.Shape();
    this.textShape = new createjs.Text();
    
    
    this.listener = function(){/*override this function*/};
    
    
    var that = this;
    var onclick = function(){
        console.log("click");    
    };
    
    var onmouseover = function(){
        that.color = "green";
        that.updateShape();
    };
    
    var onmouseout = function(){
        that.color = "black";
        that.updateShape();
    };
    
    this.circle.addEventListener("click",           onclick);
    this.textShape.addEventListener("click",        onclick);
    this.circle.addEventListener("mouseout",        onmouseout);
    this.textShape.addEventListener("mouseout",     onmouseout);
    this.circle.addEventListener("mouseover",       onmouseover);
    this.textShape.addEventListener("mouseover",    onmouseover);
}

flowjsItem.prototype.refresh = function(){
    this.circle.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);
    this.circle.x = this.x + this.radius;
    this.circle.y = this.y + this.radius;
    
    this.textShape.text = this.text;
    this.textShape.color = this.color;
    this.textShape.lineHeight = this.radius / 2.5;
    
    var textWidth = this.textShape.getBounds().width;
    this.textShape.x = this.x + this.radius - (textWidth/2);
    this.textShape.y = this.y + (this.radius * 2.2);
};

flowjsItem.prototype.updateShape = function(){
    this.refresh();
    this.listener();
};

flowjsItem.prototype.getDrawableItems = function(){
    return [this.circle, this.textShape];
};

flowjsItem.prototype.toggleFlashing = function(){
  // TODO: how should i implement this???  
};