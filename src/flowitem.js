function flowjsItem(x, y, text, radius, listener){
    this.x = x;
    this.y = y;
    
    this.color = "black";
    this.background = "blue";
    this.alpha = 1;
    this.radius = radius || 40;
    this.text = text || "Hello";
    this.link = "#";
    this.font = "Arial";
    this.fontSize = "16px";
    this.strokeWidth = 2;
    
    this.circle = new createjs.Shape();
    this.textShape = new createjs.Text();
    
    
    this.listener = listener || function(){/*override this function*/};
    
    
    var that = this;
    var onclick = function(){
        console.log("click");   
        window.open(this.link);
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
    this.circle.graphics.clear()
    this.circle.graphics.setStrokeStyle(this.strokeWidth).beginStroke(this.color).beginFill(this.background).drawCircle(0, 0, this.radius);
    this.circle.x = this.getLocation().x;
    this.circle.y = this.getLocation().y;
    this.circle.alpha = this.alpha;
    
    this.textShape.text = this.text;
    this.textShape.color = this.color;
    this.textShape.font = this.fontSize + " " + this.font;
    
    var textWidth = this.textShape.getBounds().width;
    this.textShape.x = this.x + this.radius - (textWidth/2);
    this.textShape.y = this.y + (this.radius * 2.2);
    this.textShape.alpha = this.alpha;
    
    this.loadingAnimation = this.loadingAnimation || this._getLoadingAnimation();
};

flowjsItem.prototype.getLocation = function(){
    return {x: this.getX(), y: this.getY()};
};

flowjsItem.prototype.getX = function(){
    return this.x + this.radius;
};

flowjsItem.prototype.getY = function(){
    return this.y + this.radius;
};

flowjsItem.prototype.setX = function(x){
    this.x = x - this.radius;
};

flowjsItem.prototype.setY = function(y){
    this.y = y - this.radius;  
};

flowjsItem.prototype.updateShape = function(){
    this.refresh();
    this.listener();
};

flowjsItem.prototype.getDrawableItems = function(){
    return [this.circle, this.textShape];
};

flowjsItem.prototype.toggleFlashing = function(){
    var isPaused = this.loadingAnimation._paused;
    this.loadingAnimation.setPaused(!isPaused);
};

flowjsItem.prototype._getLoadingAnimation = function(){
    var y = this.getLocation().y;
    var distance = this.radius/2;

    var anim = createjs.Tween.get(this.circle, {loop: true, paused: true})
        // .to({ y: y}, 100,           createjs.Ease.getPowIn(2.2))
        .to({ y: y-distance}, 300,  createjs.Ease.getPowIn(2))
        .to({ y: y+distance}, 300,  createjs.Ease.getPowIn(2))
        .to({ y: y}, 100)
        // .wait(100);
    anim.setPaused(true);
    return anim;
};


function flowjsItemEmpty(x, y, radius){
    flowjsItem.call(this, x, y, undefined, radius);
    this.alpha = 0;
    this.empty = true;
}

flowjsItemEmpty.prototype = flowjsItem.prototype;