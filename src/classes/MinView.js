//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
    this._heightPerMin = Timeline.MinView.HEIGHT;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tlMinView';
Timeline.MinView.FIX_INTERVAL = 5;
Timeline.MinView.HEIGHT = 1;

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype.containsMin = function(min){
    var less = this._min === 0 ? 0 : this._min;
    var max = this._min + this._minUnit - 1;
    return less <= min && min <= max;
};

Timeline.MinView.prototype.getMin = function(){
    return this._min;
};

Timeline.MinView.prototype.getHourView = function(){
    return this._hourView;
};

Timeline.MinView.prototype.getTime = function(){
    return Timeline.Time.create([this.getHourView().getHour(), this.getMin()]);
};

Timeline.MinView.prototype.getTopByMin = function(min){
    var offset = this._element.offset();
    var percent = (min % this._minUnit) / this._minUnit;
    return offset.top + (this.height() * percent) - 1;
};

Timeline.MinView.prototype.getTimeByTop = function(top){
    var min = this._min + ((top - this._element.offset().top) * (this._minUnit / this.height()));

    if(Timeline.MinView.FIX_INTERVAL > 1){
        var rem = min % Timeline.MinView.FIX_INTERVAL;
        if(rem > Timeline.MinView.FIX_INTERVAL / 2){
            min += Timeline.MinView.FIX_INTERVAL - rem;
        } else {
            min -= rem;
        }
    }

    return new Timeline.Time(this._hourView.getHour(), min);
};

Timeline.MinView.prototype._updateDisplay = function(){
    this.height(this._heightPerMin * this._minUnit);
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._updateDisplay();
};