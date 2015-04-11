//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();

    var data = {};
    data.view = this;
    this._element.data('timeline', data);

    this._width;
    this._height;
    this._vars = {};
};

Timeline.View.prototype.getElement = function(){
    return this._element;
};

Timeline.View.prototype._build = function(){};

Timeline.View.prototype._postShow = function(){};

Timeline.View.prototype.width = function(width){
    if(width === undefined){
        if(this._width === undefined){
            this._width = this._element.outerWidth();
        }
        return this._width;
    }
    this._width = width;
    this._element.outerWidth(width);
    return this;
};

Timeline.View.prototype.height = function(height){
    if(height === undefined){
        if(this._height === undefined){
            this._height = this._element.outerHeight();
        }
        return this._height;
    }
    this._height = height;
    this._element.outerHeight(height);
};

Timeline.View.prototype.render = function(){
    this._build();
    this._element.show();
    this._postShow();
    return this._element;
};

Timeline.View.prototype.containsTop = function(top){
    var up = this._element.offset().top;
    var down = up + this._element.outerHeight();
    return up <= top && top <= down;
};

Timeline.View.prototype.getBottom = function(){
    return this._element.offset().top + this._element.outerHeight();
};

Timeline.View.prototype.getTop = function(){
    return this._element.offset().top;
};

Timeline.View.prototype.setVar = function(name, value){
    this._vars[name] = value;
};

Timeline.View.prototype.getVar = function(name, defaultValue){
    if(this._vars[name] === undefined){
        return defaultValue;
    }

    return this._vars[name];
};