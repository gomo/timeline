//EventView
Timeline.EventView = function(timeSpan){
    var self = this;
    Timeline.EventView.super_.call(self);
    self._timeSpan = timeSpan;
    self._lineView = undefined;
    self._nextLineView = undefined;
    self._element.css('position', 'relative');

    self._element.draggable({
        create: function( event, ui ) {
        },
        start: function( event, ui ) {
            self.getFrameView().getTimeIndicator().show();
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
            e.stopPropagation();
            var time = self.getFrameView().getTimeIndicator().data('timeline').time;
            var newTimeSpan = self.getTimeSpan().shiftStartTime(time);
            params.check = self._nextLineView.checkTimeSpan(newTimeSpan);
            params.lineView = self._nextLineView;
            self.getFrameView().triggerEvent('didClickFloatingEventView', params);
        } else if(self.isFlexible()) {
            e.stopPropagation();
            self.getFrameView().triggerEvent('didClickFlexibleEventView', params);
        }
    });

    self._element.append('<div class="start time" />');

    self._displayElement = $('<div class="display" />');
    self._element.append(self._displayElement);

    self._element.append('<div class="end time" />');
    self._timesElement = self._element.find('.time');
    self._timesElement.css({cursor:'default'});
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tlEventView';
Timeline.EventView.MARGIN_SIDE = 4;

Timeline.EventView.create = function(start, end){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end));
};

Timeline.EventView.prototype.moveTo = function(timeSpan, lineView){
    var size = lineView.getSizeByTimeSpan(timeSpan);
    var offset = this._element.offset();
    offset.top = size.top;
    offset.left = this._getPositionLeft(lineView);

    this._element.offset(offset).height(size.height);
    lineView.showTimeIndicator(offset.top);
    this.updateDisplayHeight();
};

Timeline.EventView.prototype.setBackgroundColor = function(color){
    this._element.css('backgroundColor', color);
    return this;
};

Timeline.EventView.prototype.setNextLineView = function(lineView){
    var oldLineView = this.getFrameView().swapCurrentDroppableLineView(lineView);
    if(oldLineView){
        oldLineView.getElement().removeClass('tlEventOver');
    }

    lineView.getElement().addClass('tlEventOver');
    lineView.showTimeIndicator(this._element.offset().top);
    this._nextLineView = lineView;
};

Timeline.EventView.prototype.isFlexible = function(){
    return this._element.hasClass('tlFlexible');
};

Timeline.EventView.prototype.toFlexible = function(){
    this.getFrameView().getFlexibleHandle().enable(this);
    this._lineView.enableFlexible(this);
    this._element.addClass('tlFlexible');
};

Timeline.EventView.prototype.floatFix = function(timeSpan){
    if(this.isFloating()){
        this.setTimeSpan(timeSpan);
        this._nextLineView.addEventView(this);
        this._clearFloat();
        this.getFrameView().triggerEvent('didFixFloatingEventView', {eventView:this});
    }
};

Timeline.EventView.prototype.flexibleFix = function(timeSpan){
    if (this.isFlexible()) {
        this.getFrameView().getFlexibleHandle().fix();
        this._lineView.disableFlexible(this);
        this._element.removeClass('tlFlexible');
        this.getFrameView().triggerEvent('didFixFlexibleEventView', {eventView:this});
    }
};

Timeline.EventView.prototype._clearFloat = function(){
    this._element.css({'position': 'relative'});
    this._element.removeClass('tlFloating');
    this._element.draggable('disable');
    this._nextLineView.getElement().removeClass('tlEventOver');
    this._nextLineView = undefined;
    this.updateDisplay();
    this.getFrameView().getTimeIndicator().hide();
};

Timeline.EventView.prototype.isFloating = function(){
    return this._element.hasClass('tlFloating');
};

Timeline.EventView.prototype.floatCancel = function(){
    var self = this;
    if(self.isFloating()){
        self._lineView.addEventView(self);
        self._clearFloat();
    }
};

Timeline.EventView.prototype.flexibleCancel = function(){
    var self = this;
    if(self.isFlexible()){
        this.getFrameView().getFlexibleHandle().cancel();
        self._lineView.disableFlexible(self);
        this._element.removeClass('tlFlexible');
    }
};

Timeline.EventView.prototype.toFloat = function(){
    if(this.isFloating()){
        return;
    }

    var offset = this._element.offset();
    this._element.width(this._element.width());
    this._element.css({'zIndex': 999, 'position': 'absolute'});
    this._element.offset({top: offset.top + 3, left: offset.left + 3});
    this._element.addClass('tlFloating');
    this._element.draggable('enable');
    this.getFrameView().getElement().append(this._element);

    this._lineView.detachEventView(this);

    this._lineView.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });

    this.setNextLineView(this._lineView);
    this.getFrameView().getTimeIndicator().show();
    this._nextLineView.showTimeIndicator(this._element.offset().top);
};

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.getFrameView = function(){
    return this._lineView.getFrameView();
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

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
};

Timeline.EventView.prototype.updateDisplay = function(){
    var size = this._lineView.getSizeByTimeSpan(this._timeSpan);
    var offset = this._element.offset();
    var lineOffset = this._lineView.getLineElement().offset();
    offset.top = size.top;
    offset.left = this._getPositionLeft(this._lineView) + (Timeline.EventView.MARGIN_SIDE / 2);
    this._element.offset(offset);
    this.height(size.height);
    this.width(this._lineView.getLineElement().width() - Timeline.EventView.MARGIN_SIDE);

    this._timesElement.filter('.start').html(this._timeSpan.getStartTime().getDisplayTime());
    this._timesElement.filter('.end').html(this._timeSpan.getEndTime().getDisplayTime());
    this.updateDisplayHeight();
};

Timeline.EventView.prototype.updateDisplayHeight = function(html){
    this._displayElement.outerHeight(this._element.height() - (this._timesElement.outerHeight() * 2) - 4);
};

Timeline.EventView.prototype._getPositionLeft = function(lineView){
    var lineOffset = lineView.getLineElement().offset();
    return lineOffset.left;
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

Timeline.EventView.prototype.remove = function(){
    this._lineView.detachEventView(this);
    this._lineView = undefined;
    this._element.remove();
};