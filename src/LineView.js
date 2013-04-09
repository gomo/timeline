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


Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.setRulerView = function(rulerView){
    this._rulerView = rulerView;
    this._rulerView.setLineView(this);
    this._rulerView.render();
    this._updateDisplay();
};

Timeline.LineView.prototype.forEachHourView = function(callback){
    this._hourViews.forEach(function(hourView){
        callback(hourView);
    });
};

Timeline.LineView.prototype.getLineElement = function(){
    return this._lineElement;
};

Timeline.LineView.prototype._build = function(){
    var self = this;
    self._lineElement = $('<div class="tlTimeline" />').appendTo(self._element);
    self._hoursWrapper = $('<div class="tlHours" />').appendTo(self._lineElement);

    self._hoursWrapper.droppable({
        accept: ".tlEventView",
        drop: function( event, ui ) {
            var lineView = self._hoursWrapper.closest('.tlLineView').data('view');
            var eventView = ui.draggable.data('view');
            var targetY = ui.helper.offset().top;
            var time = lineView
                .getHourViewUnderY(targetY)
                .getMinViewUnderY(targetY)
                .getTimeUnderY(targetY);

            var prevLineView = eventView.getLineView();

            eventView.shiftStartTime(time);
            lineView.addEventView(eventView);

            prevLineView.eachEventView(function(key, eventView){
                eventView.updateDisplay();
            });
        }
    });

    self._timeSpan.forEachHour(function(hour){
        var hourView = new Timeline.HourView(self, hour);
        self._hoursWrapper.append(hourView.render());
        self._hourViews.push(hourView);
    });
};

Timeline.LineView.prototype.getHourViewUnderY = function(y){
    var self = this;
    var hourView = null;

    $.each(self._hourViews, function(){
        hourView = this;
        if(hourView.isContainsY(y))
        {
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
    this._hourViews.forEach(function(hourView){
        if(hourView.getHour() === time.getHour()){
            result = hourView.getMinView(time.getMin());
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
    this._hourViews.forEach(function(hourView){
        hourView.addHeightPerMin(amount);
    });
    this._updateRulerDisplay();
    this._updateEventsDisplay();
    this._updateDisplay();
    return this;
};

Timeline.LineView.prototype.setHeightPerMin = function(height){
    this._hourViews.forEach(function(hourView){
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
        callback.call(view, key, view);
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