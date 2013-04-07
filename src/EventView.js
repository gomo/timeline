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
Timeline.EventView.CLASS_ELEM = 'tlEvent';

Timeline.EventView.create = function(start, end, type){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end), type);
};

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
    minView.setEventView(this);
    return this;
};

Timeline.EventView.prototype.setEndMinView = function(minView){
    this._endMinView = minView;
    minView.setEventView(this);
    return this;
};

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
    return this._element;
};

Timeline.EventView.prototype.updatePosition = function(){
    var self = this;
    setTimeout(function(){
        var startTop = self._startMinView.getTopPosition(self._timeSpan.getStartTime().getMin());
        var endTop = self._endMinView.getTopPosition(self._timeSpan.getEndTime().getMin());
        var offset = self._element.offset();
        offset.top = startTop;
        self._element.offset(offset);
        self._element.height(endTop - startTop -1);
    }, 0);
};

Timeline.EventView.prototype._position = function(){
    this.updatePosition();
};