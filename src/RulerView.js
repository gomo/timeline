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
        var hourElem = hourView.getElement();
        var hourRuler = $('<div class="hour">'+hourView.getDisplayHour()+':00'+'</div>');
        self._element.append(hourRuler);
        hourRuler.data('hourView', hourView);

        var css = {cursor:'default'};
        var height = hourElem.outerHeight();
        if(hourElem.hasClass('tlHasLabel'))
        {
            var labelHeight = hourElem.find('.tlLabel').outerHeight();
            height -= labelHeight;
            css.paddingTop = labelHeight;
        }

        hourRuler.height(height);
        hourRuler.css(css);
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