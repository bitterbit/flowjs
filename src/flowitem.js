function flowjsItem(x, y, text, radius, listener){
    this.x = x;
    this.y = y;
    
    this.color = "black";
    this.background = "blue";
    this.radius = radius || 40;
    this.text = text || "Hello";
    this.link = "#";
    this.font = "Arial";
    this.fontSize = "20px";
    
    this.circle = new createjs.Shape();
    this.textShape = new createjs.Text();
    
    
    this.listener = listener || function(){/*override this function*/};
    
    
    var that = this;
    var onclick = function(){
        console.log("click");    
    };
    
    var onmouseover = function(){
        that.originalColor = that.color;
        that.color = "green";
        that.updateShape();
    };
    
    var onmouseout = function(){
        that.color = that.originalColor || "black";
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
    
    this.circle.graphics.beginStroke(this.color).beginFill(this.background).drawCircle(0, 0, this.radius);
    this.circle.x = this.getLocation().x;
    this.circle.y = this.getLocation().y;
    
    this.textShape.text = this.text;
    this.textShape.color = this.color;
    this.textShape.font = this.fontSize + " " + this.font;
    
    var textWidth = this.textShape.getBounds().width;
    this.textShape.x = this.x + this.radius - (textWidth/2);
    this.textShape.y = this.y + (this.radius * 2.2);
};

flowjsItem.prototype.getLocation = function(){
    return {x: this.x + this.radius, y: this.y + this.radius};
}

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