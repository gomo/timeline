(function($){

Timeline = {};

//Util
Timeline.Util = {};
Timeline.Util.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    if(Object.create){
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    }
    else
    {
        var f = function (){};
        f.prototype = superCtor.prototype;
        ctor.prototype = new f();
        ctor.constructor = ctor;
    }
};

//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();
};

Timeline.View.prototype.getElement = function(){
    return this._element;
};

Timeline.View.prototype.render = function(){
    var elem = this._render();
    return elem.show();
};

//Hour
Timeline.HourView = function(timeLineView, hour){
    Timeline.HourView.super_.prototype.constructor.call(this);
    this._hour = hour;
    this._timeLineView = timeLineView;
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);

Timeline.HourView.prototype._getClassName = function(){
    return 'tmHour';
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype._render = function(){
    var minUnit = 15;
    var count = 60/minUnit;
    for (var i = 0; i < count; i++) {
        var min = new Timeline.MinView(this, i*minUnit, minUnit);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);

    return this._element;
};

//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.prototype.constructor.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);

Timeline.LineView.prototype._getClassName = function(){
    return 'tmTimelineWrap';
};

Timeline.LineView.prototype._render = function(){
    var timeLine = $('<div class="tmTimeline" />').appendTo(this._element);
    //分は無視する
    var time = this._timeSpan.getStartTime().getHour();
    var end = this._timeSpan.getEndTime().getHour();
    while(true)
    {
        var hourView = new Timeline.HourView(this, time);
        timeLine.append(hourView.render());
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

    return this._element;
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

//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.prototype.constructor.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);

Timeline.MinView.prototype._getClassName = function(){
    return 'tmMin';
};

Timeline.MinView.prototype._render = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._element.height(this._minUnit);
    return this._element;
};

//Time
Timeline.Time = function(hour, min){
    this._hour = hour === undefined ? 0 : parseInt(hour, 10);
    this._min = min === undefined ? 0 : parseInt(min, 10);
};

Timeline.Time.prototype.getHour = function(){ return this._hour; };
Timeline.Time.prototype.getMin = function(){ return this._min; };

Timeline.Time.prototype.getDistance = function(targetTime){
    var targetHour = targetTime.getHour();
    if(this._hour > targetHour)
    {
        targetHour += 24;
    }

    var hourDistance = targetHour - this._hour;

    return (hourDistance * 60) + (targetTime.getMin() - this._min);
};

//TimeSpan
Timeline.TimeSpan = function(startTime, endTime){
    this._startTime = startTime;
    this._endTime = endTime;
};

Timeline.TimeSpan.prototype.getDistance = function(){
    return this._startTime.calcMinDistance(this._endTime);
};

Timeline.TimeSpan.prototype.getStartTime = function(){ return this._startTime; };
Timeline.TimeSpan.prototype.getEndTime = function(){ return this._endTime; };



})(jQuery);