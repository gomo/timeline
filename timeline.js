(function($){

Timeline = {};

//Compatibility for ecma3
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
    this._element.data('view', this);
};

Timeline.View.prototype.getElement = function(){
    return this._element;
};

Timeline.View.prototype._build = function(){};

Timeline.View.prototype._postShow = function(){};

Timeline.View.prototype.render = function(){
    this._build();
    this._element.show();
    this._postShow();
    return this._element;
};

Timeline.View.prototype.isContainsY = function(y){
    var top = this._element.offset().top;
    var down = top + this._element.height();

    return top <= y && y <= down;
};

//EventView
Timeline.EventView = function(timeSpan, color){
    var self = this;
    Timeline.EventView.super_.call(self);
    self._timeSpan = timeSpan;
    self._lineView = null;
    self._element.css('position', 'relative');
    self._element.addClass(color);
    self._startMinView = null;
    self._endMinView = null;

    var prevLineView = null;
    self._element.draggable({
        helper: "clone",
        create: function( event, ui ) {
            Timeline.EventView.dragging = null;
            self._element.draggable( "option", "revertDuration", 150 );
        },
        start: function( event, ui ) {
            Timeline.EventView.dragging = {ui:ui, eventView:self};
            prevLineView = self.getLineView();
            ui.helper.width(self._element.width());
            self._element.draggable( "option", "revert", false );
        },
        stop: function( event, ui ) {
            Timeline.EventView.dragging = null;
            Timeline.timeIndicator.hide();
        },
        drag: function( event, ui ){
            Timeline.LineView.currentLineView.showTimeIndicator(ui.helper.offset().top);
        }
    });

    self._element.append('<div class="start time" />');

    self._displayElement = $('<div class="display" />');
    self._element.append(self._displayElement);

    self._element.append('<div class="end time" />');
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tlEventView';

Timeline.EventView.create = function(start, end, type){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end), type);
};

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.getTimeSpan = function(){
    return this._timeSpan;
};

Timeline.EventView.prototype.setTimeSpan = function(timeSpan){
    this._timeSpan = timeSpan;
    return this;
};

Timeline.EventView.prototype.setLineView = function(lineView){
    this._lineView = lineView;
    return this;
};

Timeline.EventView.prototype.getLineView = function(lineView){
    return this._lineView;
};

Timeline.EventView.prototype.setStartMinView = function(minView){
    this._startMinView = minView;
    return this;
};

Timeline.EventView.prototype.setEndMinView = function(minView){
    this._endMinView = minView;
    return this;
};

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
};

Timeline.EventView.prototype.updateDisplay = function(){
    var self = this;
    var startTop = self._startMinView.getTopPosition(self._timeSpan.getStartTime().getMin());
    var endTop = self._endMinView.getTopPosition(self._timeSpan.getEndTime().getMin());
    var offset = self._element.offset();
    offset.top = startTop;
    self._element.offset(offset);
    self._element.height(endTop - startTop -1);

    var times = self._element.find('.time');
    times.filter('.start').html(this._timeSpan.getStartTime().getDisplayTime());
    times.filter('.end').html(this._timeSpan.getEndTime().getDisplayTime());
    self._displayElement.outerHeight(this._element.height() - (times.outerHeight() * 2) - 4);
};

Timeline.EventView.prototype.setDisplayHtml = function(html){
    if(html instanceof jQuery){
        this._displayElement.children().remove().append(html);
    }else{
        this._displayElement.html(html);
    }
};

Timeline.EventView.prototype._postShow = function(){
    this.updateDisplay();
};

//Hour
Timeline.HourView = function(lineView, hour){
    Timeline.HourView.super_.call(this);
    this._hour = hour;
    this._lineView = lineView;
    this._minViews = [];
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);
Timeline.HourView.CLASS_ELEM = 'tlHourView';

Timeline.HourView.prototype._getClassName = function(){
    return Timeline.HourView.CLASS_ELEM;
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - 24;
};

Timeline.HourView.prototype.getMinView = function(min){
    var result;
    $.each(this._minViews, function(key, minView){
        if(minView.contains(min))
        {
            result = minView;
            return false;
        }
    });

    return result;
};

Timeline.HourView.prototype.addHeightPerMin = function(amount){
    $.each(this._minViews, function(key, minView){
        minView.addHeightPerMin(amount);
    });
    return this;
};

Timeline.HourView.prototype.setHeightPerMin = function(height){
    $.each(this._minViews, function(key, minView){
        minView.setHeightPerMin(height);
    });
    return this;
};

Timeline.HourView.prototype.getMinViewUnderY = function(y){
    var minView = null;
    $.each(this._minViews, function(){
        minView = this;
        if(minView.isContainsY(y))
        {
            return false;
        }
    });

    return minView;
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

//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
    this._heightPerMin = 1;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tlMinView';

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

Timeline.MinView.prototype.getTimeUnderY = function(y){
    var percent = (y - this._element.offset().top) / this._minUnit;
    var min = this._min + (this._minUnit * percent);

    if(min < 0)
    {
        min = 0;
    }

    return new Timeline.Time(this._hourView.getHour(), min);
};

Timeline.MinView.prototype.addHeightPerMin = function(amount){
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
    this._updateDisplay();

    return this;
};

Timeline.MinView.prototype._updateDisplay = function(){
    this._element.height(this._heightPerMin * this._minUnit);
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._updateDisplay();
};

//RulerView
Timeline.RulerView = function(){
    Timeline.RulerView.super_.call(this);
    this._lineView = null;
};

Timeline.Util.inherits(Timeline.RulerView, Timeline.View);
Timeline.RulerView.CLASS_ELEM = 'tlRulerView';
Timeline.RulerView.DEFAULT_WIDTH = 50;

Timeline.RulerView.prototype._getClassName = function(){
    return Timeline.RulerView.CLASS_ELEM;
};

Timeline.RulerView.prototype._build = function(){
    var self = this;

    self._lineView.getElement().prepend(self._element);
    self._element.width(Timeline.RulerView.DEFAULT_WIDTH);

    self._lineView.eachHourView(function(key, hourView){
        var hourRuler = $('<div class="hour">'+hourView.getDisplayHour()+':00'+'</div>');
        self._element.append(hourRuler);
        hourRuler.data('hourView', hourView);
        hourRuler.height(hourView.getElement().outerHeight());
    });
};


Timeline.RulerView.prototype._postShow = function(){

};

Timeline.RulerView.prototype.updateDisplay = function(){

    this._element.children().each(function(){
        var hourRuler = $(this);
        var hourView = hourRuler.data('hourView');
        setTimeout(function(){
            hourRuler.height(hourView.getElement().outerHeight());
        }, 0);
    });
};

//methods
Timeline.RulerView.prototype.setLineView = function(lineView){
    lineView.getElement().addClass('hasRuler');
    this._lineView = lineView;
};

//TemplateView
Timeline.TemplateView = function(){
    Timeline.TemplateView.super_.call(this);
};

Timeline.Util.inherits(Timeline.TemplateView, Timeline.View);
Timeline.TemplateView.CLASS_ELEM = 'tlTemplateView';

Timeline.TemplateView.prototype._getClassName = function(){
    return Timeline.TemplateView.CLASS_ELEM;
};

Timeline.TemplateView.prototype._build = function(){

};


Timeline.TemplateView.prototype._postShow = function(){

};

/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.Time = function(hour, min){
    this._hour = hour === undefined ? 0 : parseInt(hour, 10);
    this._min = min === undefined ? 0 : parseInt(min, 10);
    if(!(this._hour >= 0 && this._min >= 0 && this._min <= 59))
    {
        throw new Error(this.toString()+' is not valid time.');
    }
};

Timeline.Time.create = function(hour, min){
    return new Timeline.Time(hour, min);
};

Timeline.Time.prototype.getHour = function(){ return this._hour; };
Timeline.Time.prototype.getMin = function(){ return this._min; };

Timeline.Time.prototype.addMin = function(min){
    var newHour = this.getHour();
    var newMin = this.getMin();

    newMin += min;
    if(newMin > 59)
    {
        var plusHour = Math.floor(newMin / 60);
        newHour += plusHour;
        newMin = Math.abs(newMin % 60);
    }
    else if(newMin < 0)
    {
        var minusHour = Math.floor(newMin / 60);
        newHour += minusHour;
        newMin = 60 - Math.abs(newMin % 60);
        if(newMin === 60)
        {
            newMin = 0;
        }
    }

    return new Timeline.Time(newHour, newMin);
};

Timeline.Time.prototype.equals = function(time){
    return this.getHour() === time.getHour() && this.getMin() === time.getMin();
};

Timeline.Time.prototype.compare = function(time){
    if(this.getHour() > time.getHour())
    {
        return 1;
    }
    else if(this.getHour() < time.getHour())
    {
        return -1;
    }
    else
    {
        if(this.getMin() > time.getMin())
        {
            return 1;
        }
        else if(this.getMin() < time.getMin())
        {
            return -1;
        }
    }

    return 0;
};

Timeline.Time.prototype.getDistance = function(targetTime){
    var targetHour = targetTime.getHour();
    var hourDistance = targetHour - this._hour;
    return (hourDistance * 60) + (targetTime.getMin() - this._min);
};

Timeline.Time.prototype.toString = function(){
    return this._hour +':'+ (this._min < 10 ? '0'+this._min : this._min);
};

Timeline.Time.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - 24;
};

Timeline.Time.prototype.getDisplayTime = function(){
    return this.getDisplayHour() +':'+ (this._min < 10 ? '0'+this._min : this._min);
};







/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.TimeSpan = function(startTime, endTime){

    if(startTime.compare(endTime) > 0)
    {
        throw Error('The endTime is earlier than the startTime.');
    }

    this._startTime = startTime;
    this._endTime = endTime;
};

Timeline.TimeSpan.create = function(start, end){
    return new Timeline.TimeSpan(new Timeline.Time(start[0], start[1]), new Timeline.Time(end[0], end[1]));
};

Timeline.TimeSpan.prototype.getDistance = function(){
    return this._startTime.getDistance(this._endTime);
};

Timeline.TimeSpan.prototype.getStartTime = function(){ return this._startTime; };
Timeline.TimeSpan.prototype.getEndTime = function(){ return this._endTime; };

Timeline.TimeSpan.prototype.shiftEndTime = function(time){
    return new Timeline.TimeSpan(time.addMin(-this.getDistance()), time);
};

Timeline.TimeSpan.prototype.shiftStartTime = function(time){
    return new Timeline.TimeSpan(time, time.addMin(this.getDistance()));
};

Timeline.TimeSpan.prototype.isOverlapsTime = function(time, includeEquals){
    if(includeEquals)
    {
        return this._startTime.compare(time) <= 0 && this._endTime.compare(time) >= 0;
    }
    else
    {
        return this._startTime.compare(time) < 0 && this._endTime.compare(time) > 0;
    }
};

Timeline.TimeSpan.prototype.isContainsTimeSpan = function(timeSpan){
    return this.isOverlapsTime(timeSpan.getStartTime()) && this.isOverlapsTime(timeSpan.getEndTime());
};

Timeline.TimeSpan.prototype.eachHour = function(callback){
    var hour = this.getStartTime().getHour();
    var end = this.getEndTime().getHour();
    var key = 0;

    while(true)
    {
        callback.call(hour, key, hour);

        if(hour === end)
        {
            break;
        }

        hour += 1;
        ++key;
    }
};

Timeline.TimeSpan.prototype.toString = function(){
    return this._startTime + '~' + this._endTime;
};




})(jQuery);