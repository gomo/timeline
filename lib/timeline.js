(function($, global){
global.Timeline = {};
//Compatibility for ecma3
if( Object.create === undefined ) {
    Object.create = function(o, props) {
        var newObj;

        if (typeof(o) !== "object" && o !== undefined) throw new TypeError();

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

if ( Object.keys === undefined ) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}

//Util
Timeline.Util = {};
Timeline.Util.inherits = function(childClass, superClass){
    childClass.super_ = superClass;
    childClass.prototype = Object.create(superClass.prototype);
};

Timeline.window = $(window);

//View
Timeline.View = function(){
    this._element = $('<div class="'+ this._getClassName() +'"></div>');
    this._element.appendTo('body').hide();

    var data = {};
    data.view = this;
    this._element.data('timeline', data);

    this._width;
    this._height;
    this._vars = {};
};

Timeline.View.prototype.getElement = function(){
    return this._element;
};

Timeline.View.prototype._build = function(){};

Timeline.View.prototype._postShow = function(){};

//TODO このメソッドはjQuery::width()と見間違うので早めに名前を変える。
//あるいはアプリケーションハンガリアンを導入する
Timeline.View.prototype.width = function(width){
    if(width === undefined){
        if(this._width === undefined){
            this._width = this._element.outerWidth();
        }
        return this._width;
    }
    this._width = width;
    this._element.outerWidth(width);
    return this;
};

Timeline.View.prototype.height = function(height){
    if(height === undefined){
        if(this._height === undefined){
            this._height = this._element.outerHeight();
        }
        return this._height;
    }
    this._height = height;
    this._element.outerHeight(height);
};

Timeline.View.prototype.render = function(){
    this._build();
    this._element.show();
    this._postShow();
    return this._element;
};

Timeline.View.prototype.containsTop = function(top){
    var up = this._element.offset().top;
    var down = up + this._element.outerHeight();
    return up <= top && top <= down;
};

Timeline.View.prototype.getBottom = function(){
    return this._element.offset().top + this._element.outerHeight();
};

Timeline.View.prototype.getTop = function(){
    return this._element.offset().top;
};

Timeline.View.prototype.setVar = function(name, value){
    this._vars[name] = value;
};

Timeline.View.prototype.getVar = function(name, defaultValue){
    if(this._vars[name] === undefined){
        return defaultValue;
    }

    return this._vars[name];
};

Timeline.View.prototype.hide = function(top){
  this._element.css({
    "visibility": 'hidden'
  });
}

Timeline.View.prototype.show = function(top){
  this._element.css({
    "visibility": 'visible'
  });
}
//EventView
Timeline.EventView = function(timeSpan){
    var self = this;
    Timeline.EventView.super_.call(self);
    self._timeSpan = timeSpan;
    self._lineView = undefined;
    self._nextLineView = undefined;
    self._element.css('position', 'absolute');

    self._element.draggable({
        create: function( event, ui ) {
        },
        start: function( event, ui ) {
            self.getFrameView().getTimeIndicator().show();
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

        var params = {eventView:self};
        if(self.isFloating()){
            e.stopPropagation();
            var time = self.getFrameView().getTimeIndicator().data('timeline').time;
            var newTimeSpan = self.getTimeSpan().shiftStartTime(time);
            params.check = self._nextLineView.checkTimeSpan(newTimeSpan);
            params.lineView = self._nextLineView;
            self.getFrameView().triggerEvent('didClickFloatingEventView', params);
        } else if(self.isFlexible()) {
            e.stopPropagation();
            self.getFrameView().triggerEvent('didClickFlexibleEventView', params);
        }
    });

    self._element.append('<div class="start time" />');

    self._displayElement = $('<div class="display" />');
    self._element.append(self._displayElement);

    self._element.append('<div class="end time" />');
    self._timesElement = self._element.find('.time');
    self._timesElement.css({cursor:'default'});
};

Timeline.Util.inherits(Timeline.EventView, Timeline.View);
Timeline.EventView.CLASS_ELEM = 'tlEventView';
Timeline.EventView.MARGIN_SIDE = 4;

Timeline.EventView.create = function(start, end){
    return new Timeline.EventView(Timeline.TimeSpan.create(start, end));
};

Timeline.EventView.prototype.moveTo = function(timeSpan, lineView){
    var size = lineView.getSizeByTimeSpan(timeSpan);
    var offset = this._element.offset();
    offset.top = size.top;
    offset.left = this._getPositionLeft(lineView);

    this._element.offset(offset).height(size.height);
    lineView.showTimeIndicator(offset.top);
};

Timeline.EventView.prototype.setBackgroundColor = function(color){
    this._element.css('backgroundColor', color);
    return this;
};

Timeline.EventView.prototype.setNextLineView = function(lineView){
    var oldLineView = this.getFrameView().swapCurrentDroppableLineView(lineView);
    if(oldLineView){
        oldLineView.getElement().removeClass('tlEventOver');
    }

    lineView.getElement().addClass('tlEventOver');
    lineView.showTimeIndicator(this._element.offset().top);
    this._nextLineView = lineView;
};

Timeline.EventView.prototype.isFlexible = function(){
    return this._element.hasClass('tlFlexible');
};

Timeline.EventView.prototype.toFlexible = function(){
    this.getFrameView().getFlexibleHandle().enable(this);
    this._element.addClass('tlFlexible');
};

Timeline.EventView.prototype.floatFix = function(timeSpan){
    if(this.isFloating()){
        this.setTimeSpan(timeSpan);
        this._nextLineView.addEventView(this);
        this._clearFloat();
        this.getFrameView().triggerEvent('didFixFloatingEventView', {eventView:this});
    }
};

Timeline.EventView.prototype.flexibleFix = function(timeSpan){
    if (this.isFlexible()) {
        this.getFrameView().getFlexibleHandle().fix();
        this._element.removeClass('tlFlexible');
        this.getFrameView().triggerEvent('didFixFlexibleEventView', {eventView:this});
    }
};

Timeline.EventView.prototype._clearFloat = function(){
    this._element.css('zIndex', 99);
    this._element.removeClass('tlFloating');
    this._element.draggable('disable');
    this._nextLineView.getElement().removeClass('tlEventOver');
    this._nextLineView = undefined;
    this.updateDisplay();
    this.getFrameView().getTimeIndicator().hide();
};

Timeline.EventView.prototype.isFloating = function(){
    return this._element.hasClass('tlFloating');
};

Timeline.EventView.prototype.floatCancel = function(){
    var self = this;
    if(self.isFloating()){
        self._lineView.addEventView(self);
        self._clearFloat();
    }
};

Timeline.EventView.prototype.flexibleCancel = function(){
    var self = this;
    if(self.isFlexible()){
        this.getFrameView().getFlexibleHandle().cancel();
        this._element.removeClass('tlFlexible');
    }
};

Timeline.EventView.prototype.toFloat = function(){
    if(this.isFloating()){
        return;
    }

    var offset = this._element.offset();
    this._element.width(this._element.width());
    this._element.css('zIndex', 999);
    this._element.offset({top: offset.top + 3, left: offset.left + 3});
    this._element.addClass('tlFloating');
    this._element.draggable('enable');
    this.getFrameView().getElement().append(this._element);

    this._lineView.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });

    this.setNextLineView(this._lineView);
    this.getFrameView().getTimeIndicator().show();
    this._nextLineView.showTimeIndicator(this._element.offset().top);
};

Timeline.EventView.prototype._getClassName = function(){
    return Timeline.EventView.CLASS_ELEM;
};

Timeline.EventView.prototype.getFrameView = function(){
    return this._lineView.getFrameView();
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

Timeline.EventView.prototype._build = function(){
    this._lineView.getLineElement().append(this._element);
};

Timeline.EventView.prototype.updateDisplay = function(){
    var size = this._lineView.getSizeByTimeSpan(this._timeSpan);
    var offset = this._element.offset();
    offset.top = size.top;
    offset.left = this._getPositionLeft(this._lineView) + (Timeline.EventView.MARGIN_SIDE / 2);
    this._element.offset(offset);
    this.height(size.height);
    this.width(this._lineView.getLineElement().width() - Timeline.EventView.MARGIN_SIDE);

    this._timesElement.filter('.start').html(this._timeSpan.getStartTime().getDisplayTime());
    this._timesElement.filter('.end').html(this._timeSpan.getEndTime().getDisplayTime());
    this.updateDisplayHeight();
};

Timeline.EventView.prototype.updateDisplayHeight = function(html){
    this._displayElement.outerHeight(this._element.height() - (this._timesElement.outerHeight() * 2) - 4);
};

Timeline.EventView.prototype._getPositionLeft = function(lineView){
    var lineOffset = lineView.getLineElement().offset();
    return lineOffset.left;
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
//FlexibleHandle
Timeline.FlexibleHandle = function(frameView){
    this._eventView = undefined;
    this._frameView = frameView;
    this._topElement = this._setupEventHandle($('<div class="tlEventTopHandle" />'));
    this._downElement = this._setupEventHandle($('<div class="tlEventDownHandle" />'));
};

Timeline.FlexibleHandle.MARGIN = 4;

Timeline.FlexibleHandle.prototype._setupEventHandle = function(handle){
    var self = this;
    handle
        .appendTo(this._frameView.getElement())
        .height('30px')
        .css({'position': 'absolute', 'zIndex': 99999})
        .hide()
        .data('timeline', {})
        .draggable({
            axis: "y",
            start: function(event, ui){
                self._frameView.getTimeIndicator().show();
            },
            stop: function( event, ui ) {
                var containment;
                if(handle.hasClass('tlEventTopHandle')){
                    containment = self._downElement.draggable( "option", "containment");
                    self._downElement.draggable('option', 'containment', self._calcDownContainment(containment));
                } else if(handle.hasClass('tlEventDownHandle')) {
                    containment = self._topElement.draggable( "option", "containment");
                    self._topElement.draggable('option', 'containment', self._calcTopContainment(containment));
                }
            },
            drag: function( event, ui ) {
                var offset = ui.helper.offset();
                var eventElem = self._eventView.getElement();
                var targetTop;
                if(handle.hasClass('tlEventTopHandle')){
                    targetTop = offset.top + ui.helper.outerHeight() + Timeline.FlexibleHandle.MARGIN;
                    eventElem.outerHeight(eventElem.outerHeight() + eventElem.offset().top - targetTop);
                    eventElem.offset({top: targetTop, left:offset.left});
                } else if(handle.hasClass('tlEventDownHandle')) {
                    targetTop = offset.top - Timeline.FlexibleHandle.MARGIN;
                    var height = eventElem.outerHeight();
                    eventElem.outerHeight(height + targetTop - (eventElem.offset().top + height));
                }

                self._eventView.getLineView().showTimeIndicator(targetTop);
                self._eventView.updateDisplayHeight();
                ui.helper.data('timeline').time = self._frameView.getTimeIndicator().data('timeline').time;
            }
        });
    return handle;
};

Timeline.FlexibleHandle.prototype.fix = function(){
    var newTimeSpan = new Timeline.TimeSpan(this._topElement.data('timeline').time, this._downElement.data('timeline').time);
    this._eventView.setTimeSpan(newTimeSpan);
    this._eventView.updateDisplay();
    this._topElement.hide();
    this._downElement.hide();
    this._frameView.getTimeIndicator().hide();
};

Timeline.FlexibleHandle.prototype.cancel = function(){
    this._eventView.updateDisplay();
    this._topElement.hide();
    this._downElement.hide();
    this._frameView.getTimeIndicator().hide();
};

Timeline.FlexibleHandle.prototype.enable = function(eventView){
    this._eventView = eventView;
    this._topElement.show();
    this._downElement.show();

    var eventElem = eventView.getElement();

    //place top handle element
    var topOffset = eventElem.offset();
    topOffset.top = topOffset.top - this._topElement.outerHeight() - Timeline.FlexibleHandle.MARGIN;
    this._topElement.outerWidth(eventElem.outerWidth());
    this._topElement.offset(topOffset);
    this._topElement.data('timeline').time = eventView.getTimeSpan().getStartTime();

    //place bottom handle element
    var downOffset = eventElem.offset();
    downOffset.top = downOffset.top + eventElem.outerHeight() + Timeline.FlexibleHandle.MARGIN;
    this._downElement.outerWidth(eventElem.outerWidth());
    this._downElement.offset(downOffset);
    this._downElement.data('timeline').time = eventView.getTimeSpan().getEndTime();

    //make containment for top
    var prevEvent = eventView.getLineView().getPrevEventView(eventView.getTimeSpan().getStartTime());
    var topLimit = prevEvent ? prevEvent.getBottom() : eventView.getLineView().getFirstHourView().getFirstMinView().getTop();
    this._topElement.draggable( "option", "containment", this._calcTopContainment([
        topOffset.left,
        topLimit - (this._topElement.outerHeight() + Timeline.FlexibleHandle.MARGIN),
        topOffset.left + this._topElement.outerWidth(),
        undefined
    ]));

    //make containment for bottom
    var nextEvent = eventView.getLineView().getNextEventView(eventView.getTimeSpan().getEndTime());
    var downLimit = nextEvent ? nextEvent.getTop() : eventView.getLineView().getLastHourView().getLastMinView().getBottom();
    this._downElement.draggable( "option", "containment", this._calcDownContainment([
        downOffset.left,
        undefined,
        downOffset.left + this._topElement.outerWidth(),
        downLimit + Timeline.FlexibleHandle.MARGIN
    ]));
};

Timeline.FlexibleHandle.prototype._calcTopContainment = function(containment){
    containment[3] = this._downElement.offset().top - this._downElement.outerHeight() - (Timeline.FlexibleHandle.MARGIN * 2);
    return containment;
};

Timeline.FlexibleHandle.prototype._calcDownContainment = function(containment){
    containment[1] = this._topElement.offset().top + this._topElement.outerHeight() + (Timeline.FlexibleHandle.MARGIN * 2);
    return containment;
};
//FrameView
Timeline.FrameView = function(timeSpan, linesData){
    Timeline.FrameView.super_.call(this);

    if($.isArray(linesData)){
        this._linesData = linesData;
    } else {
        this._linesData = [];
    }

    this._timeSpan = timeSpan;
    this._timeLines = {};
    this._rulers = [];

    this._timeIndicator = $('<div id="tlTimeIndicator" />').appendTo(this._element).css({position:'absolute', zIndex:9999}).hide();
    this._timeIndicator.data('timeline', {});

    this._flexibleHandle = new Timeline.FlexibleHandle(this);
    this._currentDroppableLineView = undefined;

    this._labelView = undefined;
    this._prevTimeline = undefined;

    this.width(0)
};

Timeline.Util.inherits(Timeline.FrameView, Timeline.View);
Timeline.FrameView.CLASS_ELEM = 'tlFrameView';
Timeline.FrameView.RULER_INTERVAL = 4;

Timeline.FrameView.prototype._getClassName = function(){
    return Timeline.FrameView.CLASS_ELEM;
};

Timeline.FrameView.prototype._build = function(){
    var self = this;
    this._labelView = new Timeline.LabelView();
    self._element.append(this._labelView.render());
};

Timeline.FrameView.prototype.getLabelView = function(){
    return this._labelView;
}

Timeline.FrameView.prototype.swapCurrentDroppableLineView = function(lineView){
    var current = this._currentDroppableLineView;
    this._currentDroppableLineView = lineView;
    return current;
};

Timeline.FrameView.prototype.addEventListener = function(name, callback){
    this._element.on(name, callback);
    return this;
};

Timeline.FrameView.prototype.triggerEvent = function(name, params){
    this._element.trigger(name, [params]);
    return this;
};

Timeline.FrameView.prototype.getFlexibleHandle = function(){
    return this._flexibleHandle;
};

Timeline.FrameView.prototype.getTimeIndicator = function(){
    return this._timeIndicator;
};

Timeline.FrameView.prototype.setMinFixInterval = function(value){
    Timeline.MinView.FIX_INTERVAL = value;
};

Timeline.FrameView.prototype.getMinFixInterval = function(){
    return Timeline.MinView.FIX_INTERVAL;
};

Timeline.FrameView.prototype.addEventView = function(id, eventView){
    this._timeLines[id].addEventView(eventView);
};

Timeline.FrameView.prototype.addLine = function(id, label){
    var self = this;
    var key = Object.keys(self._timeLines).length;
    var timeline = new Timeline.LineView(self._timeSpan.clone());
    var width = 0;

    timeline
        .setId(id)
        .setFrameView(self);

    if(self._timeLines[id]){
        throw 'Already exists timeline ' + id;
    }

    self._timeLines[id] = timeline;
    self._element.append(timeline.render());

    var labelElem = self._labelView.addLabel(label);
    timeline.setLabelElement(labelElem);
    if(key % Timeline.FrameView.RULER_INTERVAL === 0){
        var rulerView = new Timeline.RulerView();
        rulerView.setLineView(timeline);
        this._rulers.push(rulerView);
        timeline.getElement().before(rulerView.render());
        width += rulerView.width();

        timeline.getElement().addClass('tlHasRuler');
        timeline.getLabelElement().addClass('tlHasRuler');

        if(self._prevTimeline){
            self._prevTimeline.getElement().addClass('tlPrevRuler');
            self._prevTimeline.getLabelElement().addClass('tlPrevRuler');
        }
    }

    if(key % 2 === 0){
        timeline.getElement().addClass('even');
    }else{
        timeline.getElement().addClass('odd');
    }

    if(self._prevTimeline){
        self._prevTimeline.getElement().removeClass('tlLast');
        self._prevTimeline.getLabelElement().removeClass('tlLast');
    }

    timeline.getElement().addClass('tlLast');
    timeline.getLabelElement().addClass('tlLast');

    self._prevTimeline = timeline;

    width += timeline.width();
    self.width(self.width() + width);

    return timeline;
};

Timeline.FrameView.prototype._postShow = function(){
    var self = this;
    var totalWidth = 0;

    $.each(self._linesData, function(key, data){
        self.addLine(data.id, data.label);
    });
};
//Hour
Timeline.HourView = function(lineView, hour, minLimit){
    Timeline.HourView.super_.call(this);
    this._hour = hour;
    this._minLimit = minLimit;
    this._lineView = lineView;
    this._minViews = [];
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);
Timeline.HourView.CLASS_ELEM = 'tlHourView';

Timeline.HourView.prototype._getClassName = function(){
    return Timeline.HourView.CLASS_ELEM;
};


Timeline.HourView.prototype.getFirstMinView = function(){
    return this._minViews[0];
};

Timeline.HourView.prototype.getLastMinView = function(){
    return this._minViews[this._minViews.length - 1];
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - (24 * Math.floor(this._hour/24));
};

Timeline.HourView.prototype.getMinView = function(min){
    var result;
    $.each(this._minViews, function(key, minView){
        if(minView.containsMin(min))
        {
            result = minView;
            return false;
        }
    });

    return result;
};

Timeline.HourView.prototype.getMinViewByTop = function(top){
    var minView = undefined;
    $.each(this._minViews, function(){

        if(this.containsTop(top))
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
        var targetMin = i*minUnit;
        if(this._minLimit !== undefined && targetMin > this._minLimit){
            break;
        }
        var min = new Timeline.MinView(this, targetMin, minUnit);
        this._minViews.push(min);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);
};
//LabelView
Timeline.LabelView = function(){
    Timeline.LabelView.super_.call(this);
    this._fixedClone;
};

Timeline.Util.inherits(Timeline.LabelView, Timeline.View);
Timeline.LabelView.CLASS_ELEM = 'tlLabelView';

Timeline.LabelView.prototype._getClassName = function(){
    return Timeline.LabelView.CLASS_ELEM;
};

Timeline.LabelView.prototype._build = function(){
  var self = this;
  $(window).on("scroll", function(){
    self.top($(window).scrollTop());
  });
};

Timeline.LabelView.prototype.top = function(top){
  this._element.css({
    "-webkit-transform": 'translate3d(0px, '+ top +'px, 1000px)'
  });
}

Timeline.LabelView.prototype.addLabel = function(label){
  var self = this;
  var labelElem = $('<div class="tlLabel">' + label + '</div>');
  self._element.append(labelElem);
  return labelElem;
};
//Line
Timeline.LineView = function(timeSpan){
    Timeline.LineView.super_.call(this);
    this._timeSpan = timeSpan;
    this._hourViews = [];
    this._frameView = undefined;
    //display frame element
    this._lineElement = undefined;
    //HourView wrapper element(for culc height faster)
    this._hoursElement = undefined;
    this._rulerView = undefined;
    this._labelElement = undefined;
    this.width(Timeline.LineView.WIDTH);
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);
Timeline.LineView.CLASS_ELEM = 'tlLineView';
Timeline.LineView.WIDTH = 60;

Timeline.LineView.prototype._getClassName = function(){
    return Timeline.LineView.CLASS_ELEM;
};

Timeline.LineView.prototype.setFrameView = function(frameView){
    this._frameView = frameView;
    return this;
};

Timeline.LineView.prototype.getFrameView = function(){
    return this._frameView;
};

Timeline.LineView.prototype.checkTimeSpan = function(timeSpan){
    var result = {ok:true, requested:timeSpan, suggestion:timeSpan};

    //check overlap entire timeline
    if(!this.getTimeSpan().contains(timeSpan)){
        timeSpan = timeSpan.shiftEndTime(this.getTimeSpan().getEndTime());
        result.ok = false;
        result.suggestion = timeSpan;
    }

    //check start time overlaps with other
    this.eachEventView(function(key, eventView){
        if(eventView.getTimeSpan().contains(timeSpan)){
            result.ok = false;
            result.suggestion = undefined;
            return false;
        } else if(timeSpan.overlaps(eventView.getTimeSpan())){
            if(timeSpan.getStartTime().compare(eventView.getTimeSpan().getStartTime()) >= 0){
                timeSpan = timeSpan.shiftStartTime(eventView.getTimeSpan().getEndTime());
                result.ok = false;
                result.suggestion = timeSpan;
                return false;
            } else if(timeSpan.getEndTime().compare(eventView.getTimeSpan().getEndTime()) <= 0){
                timeSpan = timeSpan.shiftEndTime(eventView.getTimeSpan().getStartTime());
                result.ok = false;
                result.suggestion = timeSpan;
                return false;
            }
        }
    });

    //何かと重なっていたら
    this.eachEventView(function(key, eventView){
        if(timeSpan.overlaps(eventView.getTimeSpan())){
            result.ok = false;
            result.suggestion = undefined;
        }
    });

    return result;
};

Timeline.LineView.prototype.getNextEventView = function(time){
    var result;
    this.eachEventView(function(key, eventView){
        var stime = eventView.getTimeSpan().getStartTime();
        if(time.compare(stime) <= 0){
            if(!result || result.getTimeSpan().getStartTime().compare(stime) > 0){
                result = eventView;
            }
        }
    });

    return result;
};

Timeline.LineView.prototype.getPrevEventView = function(time){
    var result;
    this.eachEventView(function(key, eventView){
        var stime = eventView.getTimeSpan().getEndTime();
        if(time.compare(stime) >= 0){
            if(!result || result.getTimeSpan().getEndTime().compare(stime) < 0){
                result = eventView;
            }
        }
    });

    return result;
};

Timeline.LineView.prototype.setId = function(id){
    this._element.data('timeline').id = id;
    this._element.addClass(id);
    return this;
};

Timeline.LineView.prototype.hasRulerView = function(){
    return !!this._rulerView;
};

Timeline.LineView.prototype.eachHourView = function(callback){
    $.each(this._hourViews, callback);
};

Timeline.LineView.prototype.getLineElement = function(){
    return this._lineElement;
};

Timeline.LineView.prototype._build = function(){
    var self = this;

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

    self._timeSpan.eachHour(function(key, hour, minLimit){
        var hourView = new Timeline.HourView(self, hour, minLimit);
        self._hoursElement.append(hourView.render());
        self._hourViews.push(hourView);
    });

    self._lineElement.click(function(e){
        var time = self.getTimeByTop(e.pageY);
        var clickedEventView;
        self.eachEventView(function(){
            var eventView = this;
            if(eventView.getTimeSpan().containsTime(time)){
                clickedEventView = eventView;
                return;
            }
        });
        self._frameView.triggerEvent('didClickLineView', {
            minView: self._getMinView(time),
            eventView: clickedEventView,
            time: time
        });
    });
};

Timeline.LineView.prototype.showTimeIndicator = function(top){
    var time = this.getTimeByTop(top);
    if(time){
        var indicator = this.getFrameView().getTimeIndicator();
        indicator.data('timeline').time = time;

        var offset = this._hoursElement.offset();
        offset.top = top - (indicator.height() / 2);
        offset.left = offset.left - indicator.outerWidth();
        indicator.offset(offset);
        indicator.html(time.getDisplayTime());
    }
};

Timeline.LineView.prototype.getTimeSpan = function(){
    return this._timeSpan;
};

Timeline.LineView.prototype.getTimeByTop = function(top){
    var hourView = this.getHourViewByTop(top);
    if(hourView === undefined){
        return undefined;
    }

    var minView = hourView.getMinViewByTop(top);
    if(minView === undefined){
        return undefined;
    }

    return minView.getTimeByTop(top);
};

Timeline.LineView.prototype.getHourViewByTop = function(top){
    var hourView = undefined;

    $.each(this._hourViews, function(){
        if(this.containsTop(top)){
            hourView = this;
            return false;
        }
    });

    return hourView;
};

Timeline.LineView.prototype._postShow = function(){
    this._updateDisplay();
    // this.height(this._element.height());
};

Timeline.LineView.prototype.addEventView = function(eventView){
    eventView.setLineView(this);
    eventView.render();
    return this;
};

Timeline.LineView.prototype.getSizeByTimeSpan = function(timeSpan){
    var startMinView = this._getMinView(timeSpan.getStartTime());
    var endMinView = this._getMinView(timeSpan.getEndTime());
    var startTop = startMinView.getTopByMin(timeSpan.getStartTime().getMin());
    var endTop = endMinView.getTopByMin(timeSpan.getEndTime().getMin());
    return {top: startTop, height:endTop - startTop + 1};
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
    this.setLineWidth(this.width() + amount);
    return this;
};

Timeline.LineView.prototype.setLineWidth = function(width){
    var self = this;
    self.width(width);
    self._updateDisplay();
    self._updateEventsDisplay();
    if(self._labelElement){
        self._labelElement.outerWidth(width);
    }
    return self;
};

Timeline.LineView.prototype.getFirstHourView = function(){
    return this._hourViews[0];
};

Timeline.LineView.prototype.getLastHourView = function(){
    return this._hourViews[this._hourViews.length - 1];
};

Timeline.LineView.prototype.setLabelElement = function(labelElem){
    var self = this;
    self._labelElement = labelElem;
    self._labelElement.outerWidth(self.width());
};

Timeline.LineView.prototype.getLabelElement = function(){
    return this._labelElement;
};

Timeline.LineView.prototype._updateDisplay = function(){
    var self = this;
    self._lineElement.width(self.width());
};

Timeline.LineView.prototype.eachEventView = function(callback){
    this._element.find('.tlEventView:not(.ui-draggable-dragging)').each(function(key){
        var view = $(this).data('timeline').view;
        if(callback.call(view, key, view) === false){
            return;
        }
    });
};

Timeline.LineView.prototype._updateEventsDisplay = function(){
    var self = this;
    self.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });
};

//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
    this._heightPerMin = Timeline.MinView.HEIGHT;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tlMinView';
Timeline.MinView.FIX_INTERVAL = 5;
Timeline.MinView.HEIGHT = 1;

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype.containsMin = function(min){
    var less = this._min === 0 ? 0 : this._min;
    var max = this._min + this._minUnit - 1;
    return less <= min && min <= max;
};

Timeline.MinView.prototype.getMin = function(){
    return this._min;
};

Timeline.MinView.prototype.getHourView = function(){
    return this._hourView;
};

Timeline.MinView.prototype.getTopByMin = function(min){
    var offset = this._element.offset();
    var percent = (min % this._minUnit) / this._minUnit;
    return offset.top + (this.height() * percent) - 1;
};

Timeline.MinView.prototype.getTimeByTop = function(top){
    var min = this._min + ((top - this._element.offset().top) * (this._minUnit / this.height()));

    if(Timeline.MinView.FIX_INTERVAL > 1){
        var rem = min % Timeline.MinView.FIX_INTERVAL;
        if(rem > Timeline.MinView.FIX_INTERVAL / 2){
            min += Timeline.MinView.FIX_INTERVAL - rem;
        } else {
            min -= rem;
        }
    }

    return new Timeline.Time(this._hourView.getHour(), min);
};

Timeline.MinView.prototype._updateDisplay = function(){
    this.height(this._heightPerMin * this._minUnit);
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._updateDisplay();
};
//RulerView
Timeline.RulerView = function(){
    Timeline.RulerView.super_.call(this);
    this._lineView = undefined;
};

Timeline.Util.inherits(Timeline.RulerView, Timeline.View);
Timeline.RulerView.CLASS_ELEM = 'tlRulerView';

Timeline.RulerView.prototype._getClassName = function(){
    return Timeline.RulerView.CLASS_ELEM;
};

Timeline.RulerView.prototype._build = function(){
    var self = this;

    self._lineView.eachHourView(function(key, hourView){
        var hourRuler = $('<div class="hour">'+hourView.getDisplayHour()+'</div>');
        self._element.append(hourRuler);
        hourRuler.data('timeline', {hourView:hourView});
        hourRuler.css('cursor', 'default');
        self._adjustHeight(hourView, hourRuler);
    });
};

Timeline.RulerView.prototype._adjustHeight = function(hourView, hourRuler){
    var hourElem = hourView.getElement();
    var height = hourElem.outerHeight();
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
    this._lineView = lineView;
};
/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.Time = function(hour, min){
    this._hour = hour === undefined ? 0 : parseInt(hour, 10);
    this._min = min === undefined ? 0 : parseInt(min, 10);
    while(this._min < 0){
        --this._hour;
        this._min = 60 + this._min;
    }

    while(this._min > 59){
        ++this._hour;
        this._min = this._min - 60;
    }

    if(this._hour < 0)
    {
        throw this.toString()+' is not valid time.';
    }
};

Timeline.Time.create = function(time){
    return new Timeline.Time(time[0], time[1]);
};

Timeline.Time.prototype.getHour = function(){ return this._hour; };
Timeline.Time.prototype.getMin = function(){ return this._min; };

Timeline.Time.prototype.clone = function(){
    return new Timeline.Time(this.getHour(), this.getMin());
};

Timeline.Time.prototype.addMin = function(min){
    return new Timeline.Time(this.getHour(), this.getMin() + min);
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
    return this.getDisplayTime();
};

Timeline.Time.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - 24;
};

Timeline.Time.prototype.getDisplayMin = function(){
    return this._min < 10 ? '0'+this._min : this._min;
};

Timeline.Time.prototype.getDisplayTime = function(){
    return this.getDisplayHour() +':'+ this.getDisplayMin();
};






/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.TimeSpan = function(startTime, endTime){

    while(startTime.compare(endTime) >= 0){
        endTime = endTime.addMin(24 * 60);
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

Timeline.TimeSpan.prototype.equals = function(timeSpan){
    return this.getStartTime().equals(timeSpan.getStartTime()) && this.getEndTime().equals(timeSpan.getEndTime());
};

Timeline.TimeSpan.prototype.contains = function(timeSpan){
    return this.getStartTime().compare(timeSpan.getStartTime()) <= 0 && this.getEndTime().compare(timeSpan.getEndTime()) >= 0;
};

Timeline.TimeSpan.prototype.containsTime = function(time){
    return this.getStartTime().compare(time) < 0 && this.getEndTime().compare(time) > 0;
};

Timeline.TimeSpan.prototype.overlaps = function(timeSpan){
    if(timeSpan.contains(this)){
        return true;
    }

    if(this.containsTime(timeSpan.getStartTime())){
        return true;
    }

    if(this.containsTime(timeSpan.getEndTime())){
        return true;
    }

    return false;
};

Timeline.TimeSpan.prototype.eachHour = function(callback){
    var hour = this.getStartTime().getHour();
    var end = this.getEndTime().getHour();
    var key = 0;

    while(true){
        if(hour === end){
            callback.call(hour, key, hour, this.getEndTime().getMin());
            break;
        } else {
            callback.call(hour, key, hour);
        }

        hour += 1;
        ++key;
    }
};

Timeline.TimeSpan.prototype.eachTime = function(callback, minuteInterval){
    var key = 0;
    minuteInterval = minuteInterval ? minuteInterval : 60;

    var time = this.getStartTime();
    while(true){
        if(time.compare(this.getEndTime()) > 0){
            break;
        }

        callback.call(time, key, time);

        time = time.addMin(minuteInterval);
        ++key;
    }
};

Timeline.TimeSpan.prototype.toString = function(){
    return this._startTime + '~' + this._endTime;
};

})(jQuery, (function(){return this;})());