//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    this._eventViews = [];
    this._lineElement = null;
    this._hoursWrapper = null;
    this._rulerElement = null;
    this._lineWidth = 60;
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);
Timeline.LineView.CLASS_ELEM = 'tmTimelineWrap';
Timeline.LineView.DEFAULT_RULER_WIDTH = 50;


Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.getLineElement = function(){
    return this._lineElement;
};

Timeline.LineView.prototype._build = function(){
    this._lineElement = $('<div class="tmTimeline" />').appendTo(this._element);
    this._hoursWrapper = $('<div class="inner" />').appendTo(this._lineElement);
    //分は無視する
    var time = this._timeSpan.getStartTime().getHour();
    var end = this._timeSpan.getEndTime().getHour();
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
    this.refreshRulerHeight();

    return this;
};

Timeline.LineView.prototype.setHeightPerMin = function(height){
    this._hourViews.forEach(function(hourView){
        hourView.setHeightPerMin(height);
    });
    this.refreshRulerHeight();
    return this;
};

Timeline.LineView.prototype._updateSize = function(){
    var self = this;
    self._lineElement.width(self._lineWidth);
    if(self._rulerElement)
    {
        self._element.width(self._lineWidth + Timeline.LineView.DEFAULT_RULER_WIDTH);
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

Timeline.LineView.prototype.enableRuler = function(){
    var self = this;
    self._element.addClass('hasRuler');

    self._rulerElement = $('<div class="tmRuler" />').prependTo(self._element);
    self._rulerElement.width(Timeline.LineView.DEFAULT_RULER_WIDTH);
    self._hourViews.forEach(function(hourView){
        var hourRuler = $('<div class="hour">'+hourView.getHour()+':00'+'</div>');
        self._rulerElement.append(hourRuler);
        hourRuler.data('hourView', hourView);
        hourRuler.height(hourView.getElement().outerHeight());
    });

    self._updateSize();
};

Timeline.LineView.prototype.refreshRulerHeight = function(){
    var self = this;
    if(self._rulerElement === null)
    {
        self._updateSize();
        return;
    }

    self._rulerElement.children().each(function(){
        var hourRuler = $(this);
        var hourView = hourRuler.data('hourView');
        setTimeout(function(){
            hourRuler.height(hourView.getElement().outerHeight());
        }, 0);
    });

    self._updateSize();
};