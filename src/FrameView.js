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