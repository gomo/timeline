//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();
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