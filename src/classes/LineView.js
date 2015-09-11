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
    this._flexibleHolderElement = undefined;
    this.width(Timeline.LineView.WIDTH);
    this.eventViews = [];
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

Timeline.LineView.prototype.getFlexibleHolderElement = function(){
    return this._flexibleHolderElement;
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
            return false;
        }
    });

    return result;
};

Timeline.LineView.prototype.getFreeTimeSpan = function(startTime){
    var overlapsEventView = this.getEventView(startTime);
    if(overlapsEventView){
        return undefined;
    }

    var nextEventView = this.getNextEventView(startTime);
    if(nextEventView){
        return new Timeline.TimeSpan(startTime, nextEventView.getTimeSpan().getStartTime());
    }

    return new Timeline.TimeSpan(startTime, this.getTimeSpan().getEndTime());
};

Timeline.LineView.prototype.getEventView = function(time){
    var result;

    this.eachEventView(function(key, eventView){
        if(eventView.getTimeSpan().containsTime(time)){
            result = eventView;
            return false;
        }
    });

    return result;
};

Timeline.LineView.prototype.getNextEventView = function(time){
    var result;
    this.eachEventView(function(key, eventView){
        var timeSpan = eventView.getTimeSpan();
        if(timeSpan.getStartTime().compare(time) >= 0 && timeSpan.getEndTime().compare(time) >= 0){
            result = eventView;
            return false;
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
                return false;
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
        self._fireClickEvent(e);
    });

    self.height(self._element.outerHeight());

    self._flexibleHolderElement = $('<div class="tlFlexibleHolder">')
        .appendTo(self._element)
        .css({position:"relative", top:0, zIndex:'-1'})
        .outerWidth(this.width())
        .outerHeight(this.height())
        .click(function(e){//flexible中はholderが上にある。lineElementと同じイベントを発生させる
            self._fireClickEvent(e);
        })
        ;
};

Timeline.LineView.prototype._fireClickEvent = function(e){
    var time = this.getTimeByTop(e.pageY);
    var clickedEventView = this.getEventView(time);
    this._frameView.triggerEvent('didClickLineView', {
        minView: this._getMinView(time),
        eventView: clickedEventView,
        time: time
    });
};

//eventをrelativeにしたのでflexible中は_flexibleHolderElementに移動しないと他のイベントが動いてしまう
Timeline.LineView.prototype.enableFlexible = function(eventView){
    var self = this;
    self._flexibleHolderElement
        .css('zIndex', '')
        .append(eventView.getElement());

    self.updateEventsDisplay();
};

Timeline.LineView.prototype.disableFlexible = function(eventView){
    var self = this;
    self._flexibleHolderElement
        .css('zIndex', '-1');

    self.getLineElement().append(eventView.getElement());
    self.updateEventsDisplay();
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
};

Timeline.LineView.prototype.addEventView = function(eventView){
    eventView.setLineView(this);
    eventView.render();
    this.eventViews.push(eventView);
    this.eventViews.sort(function(a, b){
        return a.getTimeSpan().getStartTime().compare(b.getTimeSpan().getStartTime());
    });
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
    self.updateEventsDisplay();
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

Timeline.LineView.prototype.detachEventView = function(eventView){
    var key = -1;
    for (var i = 0; i < this.eventViews.length; i++) {
        if(this.eventViews[i] == eventView){
            key = i;
            break;
        }
    };

    if(key != -1){
        this.eventViews.splice(key, 1);
    }
};

Timeline.LineView.prototype.getLabelElement = function(){
    return this._labelElement;
};

Timeline.LineView.prototype._updateDisplay = function(){
    var self = this;
    self._lineElement.width(self.width());
};

Timeline.LineView.prototype.eachEventView = function(callback){
    $.each(this.eventViews, function(key, view){
        if(callback.call(view, key, view) === false){
            return false;
        }
    });
};

Timeline.LineView.prototype.updateEventsDisplay = function(){
    var self = this;
    self.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });

    //一列に４つ以上になると２回やらないとづれる。
    //取得するoffsetはあってるがセットした時に連れるのでjQuery側の問題か？これ以上の調査は断念
    //eventViewをabsoluteにすると起こらないためrelativeにしたのと関係がありそうではあるが、labelの動き的に今のほうが望ましい。
    //ひとまず２回やると回避できることがわかったのでこれで行く。
    self.eachEventView(function(key, eventView){
        eventView.updateDisplay();
    });
};
