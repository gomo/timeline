//EventView
Timeline.EventView = function(timeSpan, color){
    Timeline.EventView.super_.call(this);
    this._timeSpan = timeSpan;
    this._lineView = null;
    this._element.css('position', 'relative');
    this._element.addClass(color);
    this._startMinView = null;
    this._endMinView = null;
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tmEvent';

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.getTimeSpan = function(){
    return this._timeSpan;
};

Timeline.EventView.prototype.setLineView = function(lineView){
    this._lineView = lineView;
    return this;
};

Timeline.EventView.prototype.setStartMinView = function(minView){
    this._startMinView = minView;
    return this;
};

Timeline.EventView.prototype.setEndMinView = function(minView){
    this._endMinView = minView;
    return this;
};

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
    this._element.outerWidth(this._lineView.getLineElement().width());
    return this._element;
};

Timeline.EventView.prototype._position = function(){
    var startTop = this._startMinView.getTopPosition(this._timeSpan.getStartTime().getMin());
    var endTop = this._endMinView.getTopPosition(this._timeSpan.getEndTime().getMin());
    var lineOffset = this._lineView.getLineElement().offset();
    lineOffset.top = startTop;
    this._element.offset(lineOffset);
    this._element.height(endTop - startTop);
};