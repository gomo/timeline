//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();
    this._element.data('view', this);
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

Timeline.View.prototype.isContainsY = function(y){
    var top = this._element.offset().top;
    var down = top + this._element.height();
    return top <= y && y <= down;
};