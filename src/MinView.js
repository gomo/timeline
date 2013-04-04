//Min
Timeline.MinView = function(hourView, min, minUnit){
    Timeline.MinView.super_.prototype.constructor.call(this);
    this._hourView = hourView;
    this._min = min;
    this._minUnit = minUnit;
};

Timeline.Util.inherits(Timeline.MinView, Timeline.View);
Timeline.MinView.CLASS_ELEM = 'tmMin';

Timeline.MinView.prototype._getClassName = function(){
    return Timeline.MinView.CLASS_ELEM;
};

Timeline.MinView.prototype._build = function(){
    this._element.addClass('_'+ (this._min + this._minUnit));
    this._element.height(this._minUnit);
};