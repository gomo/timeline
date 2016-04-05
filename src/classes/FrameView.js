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
    this._linesWrapper = undefined;

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
    self._labelView = new Timeline.LabelView();
    self._element.append(this._labelView.render());

    self._linesWrapper = $('<div class="tlLinesWrapper">');
    self._element.append(this._linesWrapper);

    Timeline.window.resize(function(){
        self._linesWrapper.outerHeight(Timeline.window.height() - self._labelView.height());
    });
};

Timeline.FrameView.prototype.addWidth = function(value){
    this.width(this.width() + value);
};

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
    self._linesWrapper.append(timeline.render());

    var labelElem = self._labelView.addLabel(label, id);
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
    setTimeout(function(){
        self._linesWrapper.outerHeight(Timeline.window.height() - self._labelView.height());
    }, 0);

    //scrollbarの分広げる（Macは広げなくてもエレメントの上にスクロールバーが出るがwindowsは崩れる。Macは見た目的に少しずらした）
    if(navigator.platform.indexOf('Mac') > -1){
        self.width(self.width() + 11);
    } else {
        self.width(self.width() + 17);
    }
};


Timeline.FrameView.prototype.eachLineView = function(callback){
    var self = this;
    var noBreaked = true;
    $.each(this._timeLines, function(key, view){
        if(callback.call(view, key, view) === false){
            noBreaked = false;
            return false;
        }
    });

    return noBreaked;
};