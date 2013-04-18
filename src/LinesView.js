//LinesView
Timeline.LinesView = function(timeSpan, linesData){
    Timeline.LinesView.super_.call(this);
    this._linesData = linesData;
    this._timeSpan = timeSpan;
    this._timeLines = {};
    this._rulerInterval = 5;
};

Timeline.Util.inherits(Timeline.LinesView, Timeline.View);
Timeline.LinesView.CLASS_ELEM = 'tlLinesView';

Timeline.LinesView.prototype._getClassName = function(){
    return Timeline.LinesView.CLASS_ELEM;
};

Timeline.LinesView.prototype._build = function(){

};

Timeline.LinesView.prototype.addEventView = function(code, eventView){
    this._timeLines[code].addEventView(eventView);
};

Timeline.LinesView.prototype._postShow = function(){
    var self = this;
    var totalWidth = 0;
    $.each(self._linesData, function(key, data){
        var timeline = new Timeline.LineView(self._timeSpan.clone());
        timeline
            .setLabel(data.label)
            .setCode(data.code);

        if(self._timeLines[data.code]){
            throw 'Already exists timeline ' + data.code;
        }

        self._timeLines[data.code] = timeline;
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