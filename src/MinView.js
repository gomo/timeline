//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tmMin';

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype.contains = function(min){
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

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._element.height(this._minUnit);
};