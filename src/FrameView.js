//FrameView
Timeline.FrameView = function(timeSpan, linesData){
    Timeline.FrameView.super_.call(this);
    this._linesData = linesData;
    this._timeSpan = timeSpan;
    this._timeLines = {};
    this._rulerInterval = 5;

    this._timeIndicator = $('<div id="tlTimeIndicator" />').appendTo(this._element).css({position:'absolute', zIndex:9999}).hide();
    this._timeIndicator.data('timeline', {});

    this._flexibleHandle = new Timeline.FlexibleHandle(this);
};

Timeline.Util.inherits(Timeline.FrameView, Timeline.View);
Timeline.FrameView.CLASS_ELEM = 'tlFrameView';

Timeline.FrameView.prototype._getClassName = function(){
    return Timeline.FrameView.CLASS_ELEM;
};

Timeline.FrameView.prototype._build = function(){

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

    var prevTimeline;
    $.each(self._linesData, function(key, data){
        var timeline = new Timeline.LineView(self._timeSpan.clone());
        timeline
            .setLabel(data.label)
            .setId(data.id)
            .setFrameView(self);

        if(self._timeLines[data.id]){
            throw 'Already exists timeline ' + data.id;
        }

        self._timeLines[data.id] = timeline;
        self._element.append(timeline.render());

        if(key % self._rulerInterval === 0){
            timeline.setRulerView(new Timeline.RulerView());
            if(prevTimeline){
                prevTimeline.getElement().addClass('tlPrevRuler');
            }
        }

        if(key % 2 === 0){
            timeline.getElement().addClass('even');
        }else{
            timeline.getElement().addClass('odd');
        }

        totalWidth += timeline.getElement().outerWidth();
        prevTimeline = timeline;
    });

    self._element.width(totalWidth);
};