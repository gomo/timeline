//EventView
Timeline.EventView = function(timeSpan, color){
    var self = this;
    Timeline.EventView.super_.call(self);
    self._timeSpan = timeSpan;
    self._lineView = null;
    self._element.css('position', 'relative');
    self._element.addClass(color);
    self._startMinView = null;
    self._endMinView = null;

    var prevLineView = null;
    self._element.draggable({
        helper: "clone",
        start: function( event, ui ) {
            var elem = $(this);
            prevLineView = self.getLineView();
            ui.helper.width(elem.width());
        },
        stop: function(event, ui){

        }
    });
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tlEventView';

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

Timeline.EventView.prototype.getLineView = function(lineView){
    return this._lineView;
};

Timeline.EventView.prototype.shiftStartTime = function(time){
    this._timeSpan.shiftStartTime(time);
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
};

Timeline.EventView.prototype.updateDisplay = function(){
    var self = this;
    var startTop = self._startMinView.getTopPosition(self._timeSpan.getStartTime().getMin());
    var endTop = self._endMinView.getTopPosition(self._timeSpan.getEndTime().getMin());
    var offset = self._element.offset();
    offset.top = startTop;
    self._element.offset(offset);
    self._element.height(endTop - startTop -1);
};

Timeline.EventView.prototype._postShow = function(){
    this.updateDisplay();
};