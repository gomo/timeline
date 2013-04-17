//LinesView
Timeline.LinesView = function(timeSpan, linesData){
    Timeline.LinesView.super_.call(this);
    this._linesData = linesData;
    this._timeSpan = timeSpan;
    this._rulerInterval = 5;
    // this._labelsWrapper = null;
    // this._linesWrapper = null;
};

Timeline.Util.inherits(Timeline.LinesView, Timeline.View);
Timeline.LinesView.CLASS_ELEM = 'tlLinesView';

Timeline.LinesView.prototype._getClassName = function(){
    return Timeline.LinesView.CLASS_ELEM;
};

Timeline.LinesView.prototype._build = function(){
    this._labelsWrapper = $('<div class="tlLabelsWrapper" />').appendTo(this._element);
    this._linesWrapper = $('<div class="tlLinesWrapper" />').appendTo(this._element);
};


Timeline.LinesView.prototype._postShow = function(){
    var self = this;
    var totalWidth = 0;
    $.each(self._linesData, function(key, data){
        var timeline = new Timeline.LineView(self._timeSpan.clone());
        timeline
            .setLabel(data.label)
            .setCode(data.code);

        self._linesWrapper.append(timeline.render());

        if(key % self._rulerInterval === 0){
            timeline.setRulerView(new Timeline.RulerView());
        }

        if(key % 2 === 0){
            timeline.getElement().addClass('even');
        }else{
            timeline.getElement().addClass('odd');
        }

        var width = timeline.getElement().outerWidth();
        var label = $('<div class="tlLabel">'+data.label+'</div>');
        self._labelsWrapper.append(label);
        if(timeline.hasRulerView())
        {
            var lineWidth = timeline.getLineElement().outerWidth();
            var lmargin = width - lineWidth;
            label.outerWidth(lineWidth);
            label.css('marginLeft', lmargin);
        }
        else
        {
            label.outerWidth(width);
        }
        
        

        totalWidth += timeline.getElement().outerWidth();
    });
    self._labelsWrapper.width(totalWidth);
    self._element.width(totalWidth);

    $(window).scroll(function(){
        self._labelsWrapper.css({
            'top': $(this).scrollTop()
        });
    });
};