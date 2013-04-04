//Hour
Timeline.HourView = function(timeLineView, hour){
    Timeline.HourView.super_.prototype.constructor.call(this);
    this._hour = hour;
    this._timeLineView = timeLineView;
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);
Timeline.HourView.CLASS_ELEM = 'tmHour';

Timeline.HourView.prototype._getClassName = function(){
    return Timeline.HourView.CLASS_ELEM;
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype._build = function(){
    var minUnit = 15;
    var count = 60/minUnit;
    for (var i = 0; i < count; i++) {
        var min = new Timeline.MinView(this, i*minUnit, minUnit);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);
};