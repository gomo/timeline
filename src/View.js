//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();

    var data = {};
    data.view = this;
    this._element.data('timeline', data);
};

Timeline.View.prototype.getElement = function(){
    return this._element;
};

Timeline.View.prototype._build = function(){};

Timeline.View.prototype._postShow = function(){};

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