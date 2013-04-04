//EventView
Timeline.EventView = function(timeSpan, color){
    Timeline.EventView.super_.prototype.constructor.call(this);
    this._timeSpan = timeSpan;
    this._lineView = null;
    this._element.css('position', 'relative');
    this._element.addClass(color);
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tmEvent';

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.setLineView = function(lineView){
    this._lineView = lineView;
    return this;
};

Timeline.EventView.prototype._build = function(){
    this._lineView.getElement().append(this._element);
    this._element
        .width(this._lineView.getLineElement().width())
        .height(100)
        ;

    return this._element;
};

Timeline.EventView.prototype._position = function(){
    this._element.offset(this._lineView.getLineElement().offset());
};