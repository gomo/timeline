//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
    this._heightPerMin = 1;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tlMinView';

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype.isContainMin = function(min){
    var less = this._min === 0 ? 0 : this._min;
    var max = this._min + this._minUnit - 1;
    return less <= min && min <= max;
};

Timeline.MinView.prototype.getHourView = function(){
    return this._hourView;
};

Timeline.MinView.prototype.getTopPosition = function(min){
    var offset = this._element.offset();
    var percent = (min % this._minUnit) / this._minUnit;
    return offset.top + (this._element.outerHeight() * percent) - 1;
};

Timeline.MinView.prototype.getTimeUnderY = function(y){
    var min = this._min + ((y - this._element.offset().top) * (this._minUnit / this._element.outerHeight()));
    if(min < 0) min = 0;
    if(min > 59) min = 59;
    return new Timeline.Time(this._hourView.getHour(), min);
};

Timeline.MinView.prototype.addHeightPerMin = function(amount){
    var current = this._heightPerMin;
    current += amount;
    if(current < 0.1)
    {
        current = 0.1;
    }

    this.setHeightPerMin(current);

    return this;
};

Timeline.MinView.prototype.setHeightPerMin = function(height){

    if(this._heightPerMin == height)
    {
        return;
    }

    this._heightPerMin = height;
    this._updateDisplay();

    return this;
};

Timeline.MinView.prototype._updateDisplay = function(){
    this._element.height(this._heightPerMin * this._minUnit);
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._updateDisplay();
};