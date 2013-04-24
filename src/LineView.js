//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    //display frame element
    this._lineElement = null;
    //HourView wrapper element(for culc height faster)
    this._hoursElement = null;
    this._rulerView = null;
    this._lineWidth = 60;
    this._label = undefined;
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);
Timeline.LineView.CLASS_ELEM = 'tlLineView';
Timeline.LineView.EVENT_TOP_ALLOWANCE = 20;

Timeline.timeIndicator = null;

Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.correctTimeSpan = function(timeSpan, eventView){
    //check overlap entire timeline
    if(this.getTimeSpan().isOverlapTimeSpan(timeSpan) === Timeline.TimeSpan.OVERLAP_END){
        timeSpan = timeSpan.shiftStartTime(this.getTimeSpan().getStartTime());
    }

    if(this.getTimeSpan().isOverlapTimeSpan(timeSpan) === Timeline.TimeSpan.OVERLAP_START){
        timeSpan = timeSpan.shiftEndTime(this.getTimeSpan().getEndTime());
    }

    //check start time overlaps with other
    var overlapStart = false;
    this.eachEventView(function(key, eventView){
        if(timeSpan.isOverlapTimeSpan(eventView.getTimeSpan()) === Timeline.TimeSpan.OVERLAP_START){
            overlapStart = true;
            timeSpan = timeSpan.shiftStartTime(eventView.getTimeSpan().getEndTime());
            return false;
        }
    });

    //check end time overlaps with other 
    var overlapEnd = false;
    this.eachEventView(function(key, eventView){
        if(timeSpan.isOverlapTimeSpan(eventView.getTimeSpan()) === Timeline.TimeSpan.OVERLAP_END){
            overlapEnd = true;
            timeSpan = timeSpan.shiftEndTime(eventView.getTimeSpan().getStartTime());
            return false;
        }
    });

    if(overlapStart && overlapEnd){
        return false;
    } else if(overlapEnd) {
        //check start time again when adjusted end time.
        var overlapStartAgain = false;
        this.eachEventView(function(key, eventView){
            if(timeSpan.isOverlapTimeSpan(eventView.getTimeSpan()) === Timeline.TimeSpan.OVERLAP_START){
                overlapStartAgain = true;
                return false;
            }
        });

        if(overlapStartAgain){
            return false;
        }
    }

    //check overlap all
    var overlapTotally = false;
    this.eachEventView(function(key, eventView){
        var overlap = timeSpan.isOverlapTimeSpan(eventView.getTimeSpan());
        if(
            overlap === Timeline.TimeSpan.OVERLAP_OVER ||
            overlap === Timeline.TimeSpan.OVERLAP_CONTAIN ||
            overlap === Timeline.TimeSpan.OVERLAP_EQUAL
        ){
            overlapTotally = true;
            return false;
        }
    });

    if(overlapTotally)
    {
        return false;
    }

    return timeSpan;
};

Timeline.LineView.prototype.setLabel = function(label){
    this._label = label;
    return this;
};

Timeline.LineView.prototype.setId = function(id){
    this._element.data('timeline').id = id;
    this._element.addClass(id);
    return this;
};

Timeline.LineView.prototype.hasRulerView = function(){
    return !!this._rulerView;
};

Timeline.LineView.prototype.setRulerView = function(rulerView){
    this._rulerView = rulerView;
    this._rulerView.setLineView(this);
    this._element.prepend(this._rulerView.render());
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
        Timeline.timeIndicator.data('timeline', {});
    }

    self._lineElement = $('<div class="tlTimeline" />').appendTo(self._element);
    self._hoursElement = $('<div class="tlHours" />').appendTo(self._lineElement);

    self._hoursElement.droppable({
        accept: ".tlEventView",
        drop: function( event, ui ) {
            var eventView = ui.draggable.data('timeline').view;
            eventView.setNextLineView(self);
        },
        over: function(event, ui) {
            var eventView = ui.draggable.data('timeline').view;
            eventView.setNextLineView(self);
        }
    });

    var hourView = null;
    self._timeSpan.eachHour(function(key, hour){
        hourView = new Timeline.HourView(self, hour);
        if(key === 0 || key % 5 === 0)
        {
            hourView.setLabel(self._label);
        }
        self._hoursElement.append(hourView.render());
        self._hourViews.push(hourView);
    });

    var selector = '.tlMinView';
    var lastMin = self._timeSpan.getEndTime().getMin();
    if(0 <= lastMin && lastMin < 15)
    {
        selector += ':not(._15)';
    }
    else if(15 <= lastMin && lastMin < 30)
    {
        selector += ':not(._15, ._30)';
    }
    else if(30 <= lastMin && lastMin < 45)
    {
        selector += ':not(._15, ._30, ._45)';
    }
    else if(45 <= lastMin && lastMin < 60)
    {
        selector += ':not(._15, ._30, ._45, ._60)';
    }

    hourView.getElement().children(selector).remove();
};

Timeline.LineView.prototype.showTimeIndicator = function(y){
    //top allowance.
    var maxTop = this._hourViews[0].getElement().find('.tlMinView:first').offset().top;
    if(y < maxTop && maxTop - y < Timeline.LineView.EVENT_TOP_ALLOWANCE)
    {
        y = maxTop;
    }

    var time = this.getTimeUnderY(y);

    if(time)
    {
        Timeline.timeIndicator.data('timeline').time = time;

        var offset = this._hoursElement.offset();
        offset.top = y - (Timeline.timeIndicator.height() / 2);
        offset.left = offset.left - Timeline.timeIndicator.outerWidth();
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

    var minView = hourView.getMinViewUnderY(y);
    if(minView === null)
    {
        return null;
    }

    return minView.getTimeUnderY(y);
};

Timeline.LineView.prototype.getEventViewAtTime = function(time, exceptEventView, includeEquals){
    var result = null;
    this.eachEventView(function(key, eventView){
        if(eventView.getTimeSpan().isOverlapTime(time, includeEquals))
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
    var hourView = null;

    $.each(this._hourViews, function(){
        if(this.isContainY(y))
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
        var height = self._hoursElement.height();

        self._lineElement.css({
            height: height,
            overflow: "hidden"
        });
    }, 0);
};

Timeline.LineView.prototype.eachEventView = function(callback){
    this._element.find('.tlEventView:not(.ui-draggable-dragging)').each(function(key){
        var view = $(this).data('timeline').view;
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