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
        create: function( event, ui ) {
            Timeline.EventView.dragging = null;
            self._element.draggable( "option", "revertDuration", 150 );
        },
        start: function( event, ui ) {
            Timeline.EventView.dragging = {ui:ui, eventView:self};
            prevLineView = self.getLineView();
            ui.helper.width(self._element.width());
            self._element.draggable( "option", "revert", false );
        },
        stop: function( event, ui ) {
            Timeline.EventView.dragging = null;
            Timeline.timeIndicator.hide();
        },
        drag: function( event, ui ){
            Timeline.LineView.currentLineView.showTimeIndicator(ui.helper.offset().top);
        }
    });

    self._element.append('<div class="start time" />');

    self._displayElement = $('<div class="display" />');
    self._element.append(self._displayElement);

    self._element.append('<div class="end time" />');
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

Timeline.EventView.prototype.setTimeSpan = function(timeSpan){
    this._timeSpan = timeSpan;
    return this;
};

Timeline.EventView.prototype.setLineView = function(lineView){
    this._lineView = lineView;
    return this;
};

Timeline.EventView.prototype.getLineView = function(lineView){
    return this._lineView;
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

    var times = self._element.find('.time');
    times.filter('.start').html(this._timeSpan.getStartTime().getDisplayTime());
    times.filter('.end').html(this._timeSpan.getEndTime().getDisplayTime());
    self._displayElement.outerHeight(this._element.height() - (times.outerHeight() * 2) - 4);
};

Timeline.EventView.prototype.setDisplayHtml = function(html){
    if(html instanceof jQuery){
        this._displayElement.children().remove().append(html);
    }else{
        this._displayElement.html(html);
    }
};

Timeline.EventView.prototype._postShow = function(){
    this.updateDisplay();
};