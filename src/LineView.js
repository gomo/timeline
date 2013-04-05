//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.prototype.constructor.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    this._eventViews = [];
    this._lineElement = null;
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);
Timeline.LineView.CLASS_LINE = 'tmTimeline';
Timeline.LineView.CLASS_ELEM = 'tmTimelineWrap';


Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.getLineElement = function(){
    return this._lineElement;
};

Timeline.LineView.prototype._build = function(){
    this._lineElement = $('<div class="'+ Timeline.LineView.CLASS_LINE +'" />').appendTo(this._element);
    //分は無視する
    var time = this._timeSpan.getStartTime().getHour();
    var end = this._timeSpan.getEndTime().getHour();
    while(true)
    {
        var hourView = new Timeline.HourView(this, time);
        this._lineElement.append(hourView.render());
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
    var height = this._element.height();
    this._element.css({
        height: height,
        overflow: "hidden"
    });
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

Timeline.LineView.prototype.refreshRuler = function(){
    var self = this;
    self._element.addClass('hasRuler');

    var rulerWrap = $('<div class="tmRuler" />').prependTo(self._element);

    this._hourViews.forEach(function(hourView){
        var hourRuler = $('<div class="hour">'+hourView.getHour()+':00'+'</div>');
        rulerWrap.append(hourRuler);
        hourRuler.height(hourView.getElement().outerHeight());
    });
};