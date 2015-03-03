//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();

    var data = {};
    data.view = this;
    this._element.data('timeline', data);

    this._width;
    this._height;
};

Timeline.View.prototype.getElement = function(){
    return this._element;
};

Timeline.View.prototype._build = function(){};

Timeline.View.prototype._postShow = function(){};

Timeline.View.prototype.width = function(width){
    if(width === undefined){
        return this._width;
    }
    this._width = width;
    this._element.outerWidth(width);
};

Timeline.View.prototype.height = function(height){
    if(height === undefined){
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