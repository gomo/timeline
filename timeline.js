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

    var data = {};
    data.view = this;
    this._element.data('timeline', data);
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

Timeline.View.prototype.isContainY = function(y){
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
    self._nextLineView = null;
    self._prevOffset = null;
    self._element.css('position', 'relative');
    self._element.addClass(color);
    self._startMinView = null;
    self._endMinView = null;

    var prevLineView = null;
    self._element.draggable({
        create: function( event, ui ) {
        },
        start: function( event, ui ) {
        },
        stop: function( event, ui ) {
        },
        drag: function( event, ui ){
            if(self._nextLineView){
                self._nextLineView.showTimeIndicator(ui.helper.offset().top);
            }
        }
    });

    self._element.draggable('disable');

    self._element.on('click', function(e){
        Timeline.frame.trigger('didClickEventView', [{eventView:self}]);
    });

    self._element.append('<div class="start time" />');

    self._displayElement = $('<div class="display" />');
    self._element.append(self._displayElement);

    self._element.append('<div class="end time" />');
    self._element.find('.time').css({cursor:'default'});
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tlEventView';

Timeline.EventView.create = function(start, end, type){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end), type);
};

Timeline.EventView.prototype.setNextLineView = function(lineView){
    if(this._nextLineView){
        this._nextLineView.getElement().removeClass('tlEventOver');
    }

    lineView.getElement().addClass('tlEventOver');
    lineView.showTimeIndicator(this._element.offset().top);
    this._nextLineView = lineView;
};

Timeline.EventView.prototype.isFloating = function(){
    return this._element.hasClass('tlFloating');
};

Timeline.EventView.prototype._clearFloat = function(){
    this._element.css('position', 'relative');
    this._element.removeClass('tlFloating');
    this._element.draggable('disable');
    this._nextLineView.getElement().removeClass('tlEventOver');
    this._nextLineView = null;
    Timeline.timeIndicator.hide();
};

Timeline.EventView.prototype.floatFix = function(){
    if(this.isFloating()){
        this._element.css('position', 'static');
        var time = Timeline.timeIndicator.data('timeline').time;
        var newTimeSpan = this.getTimeSpan().shiftStartTime(time);
        this.setTimeSpan(newTimeSpan);
        this._nextLineView.addEventView(this);
        this._clearFloat();
        Timeline.frame.trigger('didFloatFixEventView', [{eventView:this}]);
    }
};

Timeline.EventView.prototype.floatCancel = function(){
    var self = this;
    if(self.isFloating()){
        self._element.css('position', 'static');
        self._lineView.addEventView(self);
        self._clearFloat();
    }
};

Timeline.EventView.prototype.toFloat = function(){
    if(this.isFloating()){
        return;
    }

    var offset = this._element.offset();
    this._prevOffset = offset;
    this._element.width(this._element.width());
    this._element.css('position', 'absolute');
    this._element.offset({top: offset.top + 3, left: offset.left + 3});
    this._element.addClass('tlFloating');
    this._element.draggable('enable');

    this.setNextLineView(this._lineView);
    this._nextLineView = this._lineView;
    Timeline.timeIndicator.show();
    this._nextLineView.showTimeIndicator(this._element.offset().top);
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
    var startTop = this._startMinView.getTopPosition(this._timeSpan.getStartTime().getMin());
    var endTop = this._endMinView.getTopPosition(this._timeSpan.getEndTime().getMin());
    var offset = this._element.offset();
    offset.top = startTop;
    this._element.offset(offset);
    this._element.height(endTop - startTop -1);

    var times = this._element.find('.time');
    times.filter('.start').html(this._timeSpan.getStartTime().getDisplayTime());
    times.filter('.end').html(this._timeSpan.getEndTime().getDisplayTime());
    this._displayElement.outerHeight(this._element.height() - (times.outerHeight() * 2) - 4);
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

//FrameView
Timeline.FrameView = function(timeSpan, linesData){
    Timeline.FrameView.super_.call(this);
    this._linesData = linesData;
    this._timeSpan = timeSpan;
    this._timeLines = {};
    this._rulerInterval = 5;
    Timeline.frame = this._element;
};

Timeline.Util.inherits(Timeline.FrameView, Timeline.View);
Timeline.FrameView.CLASS_ELEM = 'tlFrameView';

Timeline.FrameView.prototype._getClassName = function(){
    return Timeline.FrameView.CLASS_ELEM;
};

Timeline.FrameView.prototype._build = function(){

};

Timeline.FrameView.prototype.addLineWidth = function(value){
    for(var key in this._timeLines){
        var lineView = this._timeLines[key];
        lineView.addLineWidth(value);
    }
};

Timeline.FrameView.prototype.addHeightPerMin = function(value){
    for(var key in this._timeLines){
        var lineView = this._timeLines[key];
        lineView.addHeightPerMin(value);
    }
};

Timeline.FrameView.prototype.addEventView = function(id, eventView){
    this._timeLines[id].addEventView(eventView);
};

Timeline.FrameView.prototype._postShow = function(){
    var self = this;
    var totalWidth = 0;
    $.each(self._linesData, function(key, data){
        var timeline = new Timeline.LineView(self._timeSpan.clone());
        timeline
            .setLabel(data.label)
            .setId(data.id);

        if(self._timeLines[data.id]){
            throw 'Already exists timeline ' + data.id;
        }

        self._timeLines[data.id] = timeline;
        self._element.append(timeline.render());

        if(key % self._rulerInterval === 0){
            timeline.setRulerView(new Timeline.RulerView());
        }

        if(key % 2 === 0){
            timeline.getElement().addClass('even');
        }else{
            timeline.getElement().addClass('odd');
        }

        totalWidth += timeline.getElement().outerWidth();
    });

    self._element.width(totalWidth);
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

Timeline.HourView.prototype.setLabel = function(label){
    if(label){
        var elem = $('<div class="tlLabel">'+label+'</div>');
        this._element.append(elem).addClass('tlHasLabel');
    }
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
        if(minView.isContainMin(min))
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

        if(this.isContainY(y))
        {
            minView = this;
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

Timeline.MinView.prototype.isContainMin = function(min){
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
    var min = this._min + ((y - this._element.offset().top) * (this._minUnit / this._element.outerHeight()));
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
    self._element.width(Timeline.RulerView.DEFAULT_WIDTH);

    self._lineView.eachHourView(function(key, hourView){
        var hourRuler = $('<div class="hour">'+hourView.getDisplayHour()+':00'+'</div>');
        self._element.append(hourRuler);
        hourRuler.data('timeline', {hourView:hourView});
        hourRuler.css('cursor', 'default');
        self._adjustHeight(hourView, hourRuler);
    });
};

Timeline.RulerView.prototype._adjustHeight = function(hourView, hourRuler){
    var hourElem = hourView.getElement();
    var height = hourElem.outerHeight();
    if(hourElem.hasClass('tlHasLabel')){
        var labelHeight = hourElem.find('.tlLabel').outerHeight();
        height -= labelHeight;
        hourRuler.css('paddingTop', labelHeight);
    }

    hourRuler.height(height);
};


Timeline.RulerView.prototype._postShow = function(){

};

Timeline.RulerView.prototype.updateDisplay = function(){
    var self = this;
    self._element.children().each(function(){
        var hourRuler = $(this);
        var hourView = hourRuler.data('timeline').hourView;
        self._adjustHeight(hourView, hourRuler);
    });
};

//methods
Timeline.RulerView.prototype.setLineView = function(lineView){
    lineView.getElement().addClass('hasRuler');
    this._lineView = lineView;
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

Timeline.Time.prototype.clone = function(){
    return new Timeline.Time(this.getHour(), this.getMin());
};

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

Timeline.Time.prototype.isEqual = function(time){
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

Timeline.TimeSpan.prototype.clone = function(){
    return new Timeline.TimeSpan(this.getStartTime().clone(), this.getEndTime().clone());
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

Timeline.TimeSpan.prototype.isOverlapTime = function(time, includeEquals){
    if(includeEquals)
    {
        return this._startTime.compare(time) <= 0 && this._endTime.compare(time) >= 0;
    }
    else
    {
        return this._startTime.compare(time) < 0 && this._endTime.compare(time) > 0;
    }
};

Timeline.TimeSpan.prototype.isContainTimeSpan = function(timeSpan){
    return this.isOverlapTime(timeSpan.getStartTime()) && this.isOverlapTime(timeSpan.getEndTime());
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