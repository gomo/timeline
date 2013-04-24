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

Timeline.HourView.prototype.setLabel = function(label){
    if(label){
        var elem = $('<div class="tlLabel">'+label+'</div>');
        this._element.append(elem).addClass('tlHasLabel');
    }
};

Timeline.HourView.prototype.getHour = function(){
    return this._hour;
};

Timeline.HourView.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - 24;
};

Timeline.HourView.prototype.getMinView = function(min){
    var result;
    $.each(this._minViews, function(key, minView){
        if(minView.containsMin(min))
        {
            result = minView;
            return false;
        }
    });

    return result;
};

Timeline.HourView.prototype.addHeightPerMin = function(amount){
    $.each(this._minViews, function(key, minView){
        minView.addHeightPerMin(amount);
    });
    return this;
};

Timeline.HourView.prototype.setHeightPerMin = function(height){
    $.each(this._minViews, function(key, minView){
        minView.setHeightPerMin(height);
    });
    return this;
};

Timeline.HourView.prototype.getMinViewUnderY = function(y){
    var minView = null;
    $.each(this._minViews, function(){

        if(this.containsY(y))
        {
            minView = this;
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