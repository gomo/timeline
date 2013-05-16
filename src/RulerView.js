//RulerView
Timeline.RulerView = function(){
    Timeline.RulerView.super_.call(this);
    this._lineView = undefined;
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
    lineView.getElement().addClass('tlHasRuler');
    this._lineView = lineView;
};