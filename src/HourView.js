//Hour
Timeline.HourView = function(lineView, hour, minLimit){
    Timeline.HourView.super_.call(this);
    this._hour = hour;
    this._minLimit = minLimit;
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

Timeline.HourView.prototype.getFirstMinView = function(){
    return this._minViews[0];
};

Timeline.HourView.prototype.getLastMinView = function(){
    return this._minViews[this._minViews.length - 1];
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

Timeline.HourView.prototype.getMinViewByTop = function(top){
    var minView = undefined;
    $.each(this._minViews, function(){

        if(this.containsTop(top))
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
        var targetMin = i*minUnit;
        if(this._minLimit !== undefined && targetMin > this._minLimit){
            break;
        }
        var min = new Timeline.MinView(this, targetMin, minUnit);
        this._minViews.push(min);
        this._element.append(min.render());
    }

    this._element.addClass('_'+this._hour);
};