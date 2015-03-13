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
};

Timeline.Util.inherits(Timeline.LineView, Timeline.View);
Timeline.LineView.CLASS_ELEM = 'tlLineView';

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
    this.height(this._element.height());
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
    return {top: startTop, height:endTop - startTop -1};
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
