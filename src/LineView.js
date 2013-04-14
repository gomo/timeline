//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    this._lineElement = null;
    this._hoursWrapper = null;
    this._rulerElement = null;
    this._rulerView = null;
    this._lineWidth = 60;
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);
Timeline.LineView.CLASS_ELEM = 'tlLineView';

Timeline.timeIndicator = null;

Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.setRulerView = function(rulerView){
    this._rulerView = rulerView;
    this._rulerView.setLineView(this);
    this._rulerView.render();
    this._updateDisplay();
};

Timeline.LineView.prototype.eachHourView = function(callback){
    $.each(this._hourViews, callback);
};

Timeline.LineView.prototype.getLineElement = function(){
    return this._lineElement;
};

Timeline.LineView.prototype._build = function(){
    var self = this;

    if(!Timeline.timeIndicator)
    {
        Timeline.timeIndicator = $('<div id="tlTimeIndicator" />').appendTo('body').css({position:'absolute'}).hide();
    }

    self._lineElement = $('<div class="tlTimeline" />').appendTo(self._element);
    self._hoursWrapper = $('<div class="tlHours" />').appendTo(self._lineElement);
    self._lineElement
        .bind('mouseover', function(e){
            if(Timeline.timeIndicator.is(':hidden'))
            {
                Timeline.timeIndicator.show();
            }
        })
        .bind('mouseout', function(){
            Timeline.timeIndicator.hide();
        })
        .bind('mousemove', function(e){
            var time = null;
            if(!Timeline.EventView.dragging)
            {
                self.showTimeIndicator(e.pageY);
            }
        });

    self._hoursWrapper.droppable({
        accept: ".tlEventView",
        drop: function( event, ui ) {
            var lineView = self._hoursWrapper.closest('.tlLineView').data('view');
            var eventView = ui.draggable.data('view');
            var time = Timeline.timeIndicator.data('time');
            if(!time)
            {
                ui.draggable.draggable( "option", "revert", true );
                return false;
            }

            var oldTimeSpan = eventView.getTimeSpan();
            var newTimeSpan = oldTimeSpan.shiftStartTime(time);

            if(!lineView.getTimeSpan().isOverlapsTime(newTimeSpan.getStartTime(), true))
            {
                newTimeSpan = newTimeSpan.shiftStartTime(lineView.getTimeSpan().getStartTime());
            }

            if(!lineView.getTimeSpan().isOverlapsTime(newTimeSpan.getEndTime()))
            {
                newTimeSpan = newTimeSpan.shiftEndTime(lineView.getTimeSpan().getEndTime());
            }

            var prevEventView = self.getEventViewAtTime(newTimeSpan.getStartTime(), eventView, true);
            if(prevEventView)
            {
                newTimeSpan = newTimeSpan.shiftStartTime(prevEventView.getTimeSpan().getEndTime());
            }

            var nextEventView = self.getEventViewAtTime(newTimeSpan.getEndTime(), eventView);
            if(prevEventView && nextEventView)
            {
                ui.draggable.draggable( "option", "revert", true );
                return false;
            }
            else if(nextEventView)
            {
                newTimeSpan = newTimeSpan.shiftEndTime(nextEventView.getTimeSpan().getStartTime());
            }

            eventView.setTimeSpan(newTimeSpan);

            var prevLineView = eventView.getLineView();
            lineView.addEventView(eventView);
            prevLineView.eachEventView(function(key, eventView){
                eventView.updateDisplay();
            });
        },
        over: function(event, ui) {
            Timeline.LineView.currentLineView = self;
        }
    });

    self._timeSpan.eachHour(function(key, hour){
        var hourView = new Timeline.HourView(self, hour);
        self._hoursWrapper.append(hourView.render());
        self._hourViews.push(hourView);
    });
};

Timeline.LineView.prototype.showTimeIndicator = function(y){
    //20px top allowance.
    var maxTop = this._element.offset().top;
    if(y < maxTop && maxTop - y < 20)
    {
        y = maxTop;
    }

    time = this.getTimeUnderY(y);
    Timeline.timeIndicator.data('time', time);
    if(time)
    {
        var offset = this._hoursWrapper.offset();
        offset.top = y - (Timeline.timeIndicator.height() / 2);
        offset.left = offset.left - Timeline.timeIndicator.width();
        Timeline.timeIndicator.offset(offset);
        Timeline.timeIndicator.html(time.getDisplayTime());
    }
};

Timeline.LineView.prototype.getTimeSpan = function(){
    return this._timeSpan;
};

Timeline.LineView.prototype.getTimeUnderY = function(y){
    var hourView = this.getHourViewUnderY(y);
    if(hourView === null)
    {
        return null;
    }

    return hourView.getMinViewUnderY(y).getTimeUnderY(y);
};

Timeline.LineView.prototype.getEventViewAtTime = function(time, exceptEventView, includeEquals){
    var result = null;
    this.eachEventView(function(key, eventView){
        if(eventView.getTimeSpan().isOverlapsTime(time, includeEquals))
        {
            result = eventView;
            return false;
        }
    });

    if(exceptEventView === result)
    {
        return null;
    }

    return result;
};

Timeline.LineView.prototype.getHourViewUnderY = function(y){
    var self = this;
    var hourView = null;

    $.each(self._hourViews, function(){
        if(this.isContainsY(y))
        {
            hourView = this;
            return false;
        }
    });

    return hourView;
};

Timeline.LineView.prototype._postShow = function(){
    this._updateDisplay();
};

Timeline.LineView.prototype.addEventView = function(eventView){
    eventView.setLineView(this);
    var timeSpan = eventView.getTimeSpan();
    eventView.setStartMinView(this._getMinView(timeSpan.getStartTime()));
    eventView.setEndMinView(this._getMinView(timeSpan.getEndTime()));
    eventView.render();
    return this;
};

Timeline.LineView.prototype._getMinView = function(time){
    var result;
    $.each(this._hourViews, function(key, hourView){
        if(hourView.getHour() === time.getHour()){
            result = hourView.getMinView(time.getMin());
            return false;
        }
    });

    return result;
};

Timeline.LineView.prototype.addLineWidth = function(amount){
    this._lineWidth += amount;
    this._updateDisplay();
    return this;
};

Timeline.LineView.prototype.setLineWidth = function(width){
    this._lineWidth = width;
    this._updateDisplay();
    return this;
};

Timeline.LineView.prototype.addHeightPerMin = function(amount){

    $.each(this._hourViews, function(key, hourView){
        hourView.addHeightPerMin(amount);
    });
    this._updateRulerDisplay();
    this._updateEventsDisplay();
    this._updateDisplay();
    return this;
};

Timeline.LineView.prototype.setHeightPerMin = function(height){
    $.each(this._hourViews, function(key, hourView){
        hourView.setHeightPerMin(height);
    });
    this._updateRulerDisplay();
    this._updateEventsDisplay();
    this._updateDisplay();
    return this;
};

Timeline.LineView.prototype._updateDisplay = function(){
    var self = this;
    self._lineElement.width(self._lineWidth);

    if(self._rulerView)
    {
        self._element.width(self._lineWidth + Timeline.RulerView.DEFAULT_WIDTH);
    }
    else
    {
        self._element.width(self._lineWidth);
    }

    setTimeout(function(){
        var height = self._hoursWrapper.height();

        self._lineElement.css({
            height: height,
            overflow: "hidden"
        });
    }, 0);
};

Timeline.LineView.prototype.eachEventView = function(callback){
    this._element.find('.tlEventView:not(.ui-draggable-dragging)').each(function(key){
        var view = $(this).data('view');
        if(callback.call(view, key, view) === false)
        {
            return;
        }
    });
};

Timeline.LineView.prototype._updateEventsDisplay = function(){
    this.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });
};

Timeline.LineView.prototype._updateRulerDisplay = function(){
    if(this._rulerView === null)
    {
        return;
    }

    this._rulerView.updateDisplay();
};