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

Timeline.timeIndicator = null;

Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.correctTimeSpan = function(timeSpan){
    //check overlap entire timeline
    if(timeSpan.overlapsTimeSpan(this.getTimeSpan()) === Timeline.TimeSpan.OVERLAP_END){
        timeSpan = timeSpan.shiftStartTime(this.getTimeSpan().getStartTime());
    }

    if(timeSpan.overlapsTimeSpan(this.getTimeSpan()) === Timeline.TimeSpan.OVERLAP_START){
        timeSpan = timeSpan.shiftEndTime(this.getTimeSpan().getEndTime());
    }

    //check start time overlaps with other
    var overlapStart = false;
    this.eachEventView(function(key, eventView){
        if(timeSpan.overlapsTimeSpan(eventView.getTimeSpan()) === Timeline.TimeSpan.OVERLAP_START){
            overlapStart = true;
            timeSpan = timeSpan.shiftStartTime(eventView.getTimeSpan().getEndTime());
            return false;
        }
    });

    //search the next eventView and check fit in the gap.
    var nextEv = null;
    var startTime = timeSpan.getStartTime();
    this.eachEventView(function(key, eventView){
        var stime = eventView.getTimeSpan().getStartTime();
        if(startTime.compare(stime) <= 0){
            if(!nextEv || nextEv.getTimeSpan().getStartTime().compare(stime) > 0){
                nextEv = eventView;
            }
        }
    });

    if(nextEv){
        var emptyTimeSpan = new Timeline.TimeSpan(startTime, nextEv.getTimeSpan().getStartTime());
        var ol = timeSpan.overlapsTimeSpan(emptyTimeSpan);
        if(ol !== Timeline.TimeSpan.OVERLAP_CONTAIN && ol !== Timeline.TimeSpan.OVERLAP_EQUAL){
            return false;
        }
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

Timeline.LineView.prototype.showTimeIndicator = function(top){
    var time = this.getTimeByTop(top);
    if(time)
    {
        Timeline.timeIndicator.data('timeline').time = time;

        var offset = this._hoursElement.offset();
        offset.top = top - (Timeline.timeIndicator.height() / 2);
        offset.left = offset.left - Timeline.timeIndicator.outerWidth();
        Timeline.timeIndicator.offset(offset);
        Timeline.timeIndicator.html(time.getDisplayTime());
    }
};

Timeline.LineView.prototype.getTimeSpan = function(){
    return this._timeSpan;
};

Timeline.LineView.prototype.getTimeByTop = function(top){
    var hourView = this.getHourViewByTop(top);
    if(hourView === null)
    {
        return null;
    }

    var minView = hourView.getMinViewByTop(top);
    if(minView === null)
    {
        return null;
    }

    return minView.getTimeByTop(top);
};

Timeline.LineView.prototype.getHourViewByTop = function(top){
    var hourView = null;

    $.each(this._hourViews, function(){
        if(this.containsTop(top))
        {
            hourView = this;
            return false;
        }
    });

    return hourView;
};

Timeline.LineView.prototype.getTopByTime = function(time){
    return this._getMinView(time).getTopByMin(time.getMin());
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