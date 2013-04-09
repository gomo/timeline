//Hour
Timeline.HourView = function(lineView, hour){
    Timeline.HourView.super_.call(this);
    this._hour = hour;
    this._lineView = lineView;
    this._minViews = [];
};

Timeline.Util.inherits(Timeline.HourView, Timeline.View);
Timeline.HourView.CLASS_ELEM = 'tlHourView';

Timeline.HourView.prototype._getClassName = function(){
    return Timeline.HourView.CLASS_ELEM;
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype.getMinView = function(min){
    var result;
    this._minViews.forEach(function(minView){
        if(minView.contains(min))
        {
            result = minView;
        }
    });

    return result;
};

Timeline.HourView.prototype.addHeightPerMin = function(amount){
    this._minViews.forEach(function(minView){
        minView.addHeightPerMin(amount);
    });
    return this;
};

Timeline.HourView.prototype.setHeightPerMin = function(height){
    this._minViews.forEach(function(minView){
        minView.setHeightPerMin(height);
    });
    return this;
};

Timeline.HourView.prototype.getMinViewUnderY = function(y){
    var minView = null;
    $.each(this._minViews, function(){
        minView = this;
        if(minView.isContainsY(y))
        {
            return false;
        }
    });

    return minView;
};

Timeline.HourView.prototype.getLineView = function(){
    return this._lineView;
};

Timeline.HourView.prototype._build = function(){
    var minUnit = 15;
    var count = 60/minUnit;
    for (var i = 0; i < count; i++) {
        var min = new Timeline.MinView(this, i*minUnit, minUnit);
        this._minViews.push(min);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);
};