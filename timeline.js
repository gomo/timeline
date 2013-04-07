(function($){

Timeline = {};

if ( Array.prototype.forEach === undefined ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}

if( Object.create === undefined ) {
    Object.create = function(o, props) {
        var newObj;

        if (typeof(o) !== "object" && o !== null) throw new TypeError();

        function F() {}
        F.prototype = o;
        newObj = new F();

        if (typeof(props) === "object") {
            for (var prop in props) {
                if (props.hasOwnProperty((prop))) {
                    newObj[prop] = props[prop];
                }
            }
        }

        return newObj;
    };
}

if ( Object.getPrototypeOf === undefined ) {
    if ( typeof "test".__proto__ === "object" ) {
        Object.getPrototypeOf = function(object){
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function(object){
            return object.constructor.prototype;
        };
    }
}

//Util
Timeline.Util = {};
Timeline.Util.inherits = function(childClass, superClass){
    childClass.super_ = superClass;
    childClass.prototype = Object.create(superClass.prototype);
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
    Timeline.EventView.super_.call(this);
    this._timeSpan = timeSpan;
    this._lineView = null;
    this._element.css('position', 'relative');
    this._element.addClass(color);
    this._startMinView = null;
    this._endMinView = null;
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tmEvent';

Timeline.EventView.create = function(start, end, type){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end), type);
};

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.getTimeSpan = function(){
    return this._timeSpan;
};

Timeline.EventView.prototype.setLineView = function(lineView){
    this._lineView = lineView;
    return this;
};

Timeline.EventView.prototype.setStartMinView = function(minView){
    this._startMinView = minView;
    minView.setEventView(this);
    return this;
};

Timeline.EventView.prototype.setEndMinView = function(minView){
    this._endMinView = minView;
    minView.setEventView(this);
    return this;
};

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
    return this._element;
};

Timeline.EventView.prototype.updatePosition = function(){
    var self = this;
    setTimeout(function(){
        var startTop = self._startMinView.getTopPosition(self._timeSpan.getStartTime().getMin());
        var endTop = self._endMinView.getTopPosition(self._timeSpan.getEndTime().getMin());
        var offset = self._element.offset();
        offset.top = startTop;
        self._element.offset(offset);
        self._element.height(endTop - startTop -1);
    }, 0);
};

Timeline.EventView.prototype._position = function(){
    this.updatePosition();
};

//Hour
Timeline.HourView = function(lineView, hour){
    Timeline.HourView.super_.call(this);
    this._hour = hour;
    this._lineView = lineView;
    this._minViews = [];
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);
Timeline.HourView.CLASS_ELEM = 'tmHour';

Timeline.HourView.prototype._getClassName = function(){
    return Timeline.HourView.CLASS_ELEM;
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype.getMinView = function(min){
    var result;
    this._minViews.forEach(function(minView){
        if(minView.contains(min))
        {
            result = minView;
        }
    });

    return result;
};

Timeline.HourView.prototype.updateHeightPerMin = function(amount){
    this._minViews.forEach(function(minView){
        minView.updateHeightPerMin(amount);
    });
    return this;
};

Timeline.HourView.prototype.setHeightPerMin = function(height){
    this._minViews.forEach(function(minView){
        minView.setHeightPerMin(height);
    });
    return this;
};

Timeline.HourView.prototype.getLineView = function(){
    return this._lineView;
};

Timeline.HourView.prototype._build = function(){
    var minUnit = 15;
    var count = 60/minUnit;
    for (var i = 0; i < count; i++) {
        var min = new Timeline.MinView(this, i*minUnit, minUnit);
        this._minViews.push(min);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);
};

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

//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
    this._heightPerMin = 1;
    this._relatedEventView = null;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tmMin';

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype.contains = function(min){
    var less = this._min === 0 ? 0 : this._min;
    var max = this._min + this._minUnit - 1;
    return less <= min && min <= max;
};

Timeline.MinView.prototype.getHourView = function(){
    return this._hourView;
};

Timeline.MinView.prototype.getTopPosition = function(min){
    var offset = this._element.offset();
    var percent = (min % this._minUnit) / this._minUnit;
    return offset.top + (this._element.outerHeight() * percent) - 1;
};

Timeline.MinView.prototype.setEventView = function(eventView){
    this._relatedEventView = eventView;
};

Timeline.MinView.prototype.updateHeightPerMin = function(amount){
    var current = this._heightPerMin;
    current += amount;
    if(current < 0.1)
    {
        current = 0.1;
    }

    this.setHeightPerMin(current);

    return this;
};

Timeline.MinView.prototype.setHeightPerMin = function(height){

    if(this._heightPerMin == height)
    {
        return;
    }

    this._heightPerMin = height;
    this._updateSize();

    if(this._relatedEventView)
    {
        this._relatedEventView.updatePosition();
    }

    return this;
};

Timeline.MinView.prototype._updateSize = function(){
    this._element.height(this._heightPerMin * this._minUnit);
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._updateSize();
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

Timeline.TimeSpan.create = function(start, end){
    return new Timeline.TimeSpan(new Timeline.Time(start[0], start[1]), new Timeline.Time(end[0], end[1]));
};

Timeline.TimeSpan.prototype.getDistance = function(){
    return this._startTime.calcMinDistance(this._endTime);
};

Timeline.TimeSpan.prototype.getStartTime = function(){ return this._startTime; };
Timeline.TimeSpan.prototype.getEndTime = function(){ return this._endTime; };



})(jQuery);