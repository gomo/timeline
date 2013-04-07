//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    this._eventViews = [];
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
    this._updateSize();
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
    this._lineElement = $('<div class="tlTimeline" />').appendTo(this._element);
    this._hoursWrapper = $('<div class="inner" />').appendTo(this._lineElement);
    //分は無視する
    var time = this._timeSpan.getStartTime().getHour();
    var end = this._timeSpan.getEndTime().getHour();
    //TODO this._timeSpan.forEachHourに変える
    while(true)
    {
        var hourView = new Timeline.HourView(this, time);
        this._hoursWrapper.append(hourView.render());
        this._hourViews.push(hourView);

        if(time === end)
        {
            break;
        }

        time += 1;
        if(time == 24)
        {
            time = 0;
        }
    }
};

Timeline.LineView.prototype._position = function(){
    this._updateSize();
};

Timeline.LineView.prototype.addEventView = function(eventView){
    eventView.setLineView(this);
    var timeSpan = eventView.getTimeSpan();
    eventView.setStartMinView(this._getMinView(timeSpan.getStartTime()));
    eventView.setEndMinView(this._getMinView(timeSpan.getEndTime()));
    this._eventViews.push(eventView);
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

Timeline.LineView.prototype.updateLineWidth = function(amount){
    this._lineWidth += amount;
    this._updateSize();
    return this;
};

Timeline.LineView.prototype.setLineWidth = function(width){
    this._lineWidth = width;
    this._updateSize();
    return this;
};

Timeline.LineView.prototype.updateHeightPerMin = function(amount){
    this._hourViews.forEach(function(hourView){
        hourView.updateHeightPerMin(amount);
    });
    this._updateRulerHeight();
    this._updateEventsHeight();
    return this;
};

Timeline.LineView.prototype.setHeightPerMin = function(height){
    this._hourViews.forEach(function(hourView){
        hourView.setHeightPerMin(height);
    });
    this._updateRulerHeight();
    this._updateEventsHeight();
    return this;
};

Timeline.LineView.prototype._updateSize = function(){
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

Timeline.LineView.prototype._updateEventsHeight = function(){
    this._eventViews.forEach(function(eventView){
        eventView.updatePosition();
    });
};

Timeline.LineView.prototype._updateRulerHeight = function(){
    var self = this;
    if(self._rulerView === null)
    {
        self._updateSize();
        return;
    }

    self._rulerView.updateHeight();
    self._updateSize();
};