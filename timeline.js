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

Timeline.View.prototype._build = function(){};

Timeline.View.prototype._position = function(){};

Timeline.View.prototype.render = function(){
    this._build();
    this._element.show();
    this._position();
    return this._element;
};

//EventView
Timeline.EventView = function(timeSpan, color){
    Timeline.EventView.super_.prototype.constructor.call(this);
    this._timeSpan = timeSpan;
    this._lineView = null;
    this._element.css('position', 'relative');
    this._element.addClass(color);
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tmEvent';

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.setLineView = function(lineView){
    this._lineView = lineView;
    return this;
};

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
    this._element
        .outerWidth(this._lineView.getLineElement().width())
        .height(100)
        ;

    return this._element;
};

Timeline.EventView.prototype._position = function(){
    this._element.offset(this._lineView.getLineElement().offset());
};

//Hour
Timeline.HourView = function(timeLineView, hour){
    Timeline.HourView.super_.prototype.constructor.call(this);
    this._hour = hour;
    this._timeLineView = timeLineView;
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);
Timeline.HourView.CLASS_ELEM = 'tmHour';

Timeline.HourView.prototype._getClassName = function(){
    return Timeline.HourView.CLASS_ELEM;
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype._build = function(){
    var minUnit = 15;
    var count = 60/minUnit;
    for (var i = 0; i < count; i++) {
        var min = new Timeline.MinView(this, i*minUnit, minUnit);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);
};

//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.prototype.constructor.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    this._eventViews = [];
    this._lineElement;
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

Timeline.LineView.prototype.addEventView = function(eventView){
    eventView.setLineView(this);
    this._eventViews.push(eventView);
    eventView.render();
    return this;
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
Timeline.MinView.CLASS_ELEM = 'tmMin';

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._element.height(this._minUnit);
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