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
    this.circle.x = this.getLocation().x;
    this.circle.y = this.getLocation().y;
    
    this.textShape.text = this.text;
    this.textShape.color = this.color;
    this.textShape.lineHeight = this.radius / 2.5;
    
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