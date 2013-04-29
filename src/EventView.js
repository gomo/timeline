//EventView
Timeline.EventView = function(timeSpan, color){
    var self = this;
    Timeline.EventView.super_.call(self);
    self._timeSpan = timeSpan;
    self._lineView = null;
    self._nextLineView = null;
    self._prevOffset = null;
    self._element.css('position', 'relative');
    self._element.addClass(color);
    self._startMinView = null;
    self._endMinView = null;
    self._element.width('85%');

    var prevLineView = null;
    self._element.draggable({
        create: function( event, ui ) {
        },
        start: function( event, ui ) {
        },
        stop: function( event, ui ) {
        },
        drag: function( event, ui ){
            if(self._nextLineView){
                self._nextLineView.showTimeIndicator(ui.helper.offset().top);
            }
        }
    });

    self._element.draggable('disable');

    self._element.on('click', function(e){
        var params = {eventView:self};
        if(self.isFloating()){
            var time = Timeline.timeIndicator.data('timeline').time;
            var newTimeSpan = self.getTimeSpan().shiftStartTime(time);
            params.check = self._nextLineView.checkTimeSpan(newTimeSpan);
            params.lineView = self._nextLineView;
        }
        Timeline.frame.trigger('didClickEventView', [params]);
    });

    self._element.append('<div class="start time" />');

    self._displayElement = $('<div class="display" />');
    self._element.append(self._displayElement);

    self._element.append('<div class="end time" />');
    self._element.find('.time').css({cursor:'default'});
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tlEventView';

Timeline.EventView.create = function(start, end, type){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end), type);
};

Timeline.EventView.prototype.moveTo = function(time, timeLine){
    var offset = this._element.offset();
    offset.top = timeLine.getTopByTime(time);
    //calc offset.left using dummy event elemnt
    var dummy = this._element.clone().appendTo(timeLine.getLineElement()).css('position', 'static');
    offset.left = dummy.offset().left;
    dummy.remove();
    this._element.offset(offset);
    timeLine.showTimeIndicator(offset.top);
};

Timeline.EventView.prototype.setNextLineView = function(lineView){
    if(this._nextLineView){
        this._nextLineView.getElement().removeClass('tlEventOver');
    }

    lineView.getElement().addClass('tlEventOver');
    lineView.showTimeIndicator(this._element.offset().top);
    this._nextLineView = lineView;
};

Timeline.EventView.prototype._clearFloat = function(){
    this._element.css({
        position:'relative',
        zIndex:1000
    });
    this._element.width('85%');
    this._element.removeClass('tlFloating');
    this._element.draggable('disable');
    this._nextLineView.getElement().removeClass('tlEventOver');
    this._nextLineView = null;
    Timeline.timeIndicator.hide();
};

Timeline.EventView.prototype.isFloating = function(){
    return this._element.hasClass('tlFloating');
};

Timeline.EventView.prototype.floatFix = function(timeSpan){
    if(this.isFloating()){
        this._element.css('position', 'static');
        this.setTimeSpan(timeSpan);
        this._nextLineView.addEventView(this);
        this._clearFloat();
        Timeline.frame.trigger('didFloatFixEventView', [{eventView:this}]);
    }
};

Timeline.EventView.prototype.floatCancel = function(){
    var self = this;
    if(self.isFloating()){
        self._element.css('position', 'static');
        self._lineView.addEventView(self);
        self._clearFloat();
    }
};

Timeline.EventView.prototype.toFloat = function(){
    if(this.isFloating()){
        return;
    }

    var offset = this._element.offset();
    this._prevOffset = offset;
    this._element.width(this._element.width());
    this._element.css({
        position:'absolute',
        zIndex:9999
    });
    this._element.offset({top: offset.top + 3, left: offset.left + 3});
    this._element.addClass('tlFloating');
    this._element.draggable('enable');
    Timeline.frame.append(this._element);

    this._lineView.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });

    this.setNextLineView(this._lineView);
    Timeline.timeIndicator.show();
    this._nextLineView.showTimeIndicator(this._element.offset().top);
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
    var startTop = this._startMinView.getTopByMin(this._timeSpan.getStartTime().getMin());
    var endTop = this._endMinView.getTopByMin(this._timeSpan.getEndTime().getMin());
    var offset = this._element.offset();
    offset.top = startTop;
    this._element.offset(offset);
    this._element.height(endTop - startTop -1);

    var times = this._element.find('.time');
    times.filter('.start').html(this._timeSpan.getStartTime().getDisplayTime());
    times.filter('.end').html(this._timeSpan.getEndTime().getDisplayTime());
    this._displayElement.outerHeight(this._element.height() - (times.outerHeight() * 2) - 4);
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