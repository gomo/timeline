/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.Time = function(hour, min){
    this._hour = hour === undefined ? 0 : parseInt(hour, 10);
    this._min = min === undefined ? 0 : parseInt(min, 10);
    while(this._min < 0){
        --this._hour;
        this._min = 60 + this._min;
    }

    while(this._min > 59){
        ++this._hour;
        this._min = this._min - 60;
    }

    if(this._hour < 0)
    {
        throw this.toString()+' is not valid time.';
    }
};

Timeline.Time.eachMin = function(callback, minuteInterval){
    var count = 60 / minuteInterval;
    for (var i = 0; i < count; i++) {
        var min = i * minuteInterval;
        if(min < 60){
            var displayMin = min < 10 ? '0' + min : min + '';
            callback.call(min, i, min, displayMin);
        }
    };
};

Timeline.Time.create = function(time){
    return new Timeline.Time(time[0], time[1]);
};

Timeline.Time.prototype.getHour = function(){ return this._hour; };
Timeline.Time.prototype.getMin = function(){ return this._min; };

Timeline.Time.prototype.clone = function(){
    return new Timeline.Time(this.getHour(), this.getMin());
};

Timeline.Time.prototype.addMin = function(min){
    return new Timeline.Time(this.getHour(), this.getMin() + parseInt(min, 10));
};

Timeline.Time.prototype.equals = function(time){
    return this.getHour() === time.getHour() && this.getMin() === time.getMin();
};

Timeline.Time.prototype.compare = function(time){
    if(this.getHour() > time.getHour())
    {
        return 1;
    }
    else if(this.getHour() < time.getHour())
    {
        return -1;
    }
    else
    {
        if(this.getMin() > time.getMin())
        {
            return 1;
        }
        else if(this.getMin() < time.getMin())
        {
            return -1;
        }
    }

    return 0;
};

Timeline.Time.prototype.getDistance = function(targetTime){
    var targetHour = targetTime.getHour();
    var hourDistance = targetHour - this._hour;
    return (hourDistance * 60) + (targetTime.getMin() - this._min);
};

Timeline.Time.prototype.toString = function(){
    return this.getDisplayTime();
};

Timeline.Time.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - 24;
};

Timeline.Time.prototype.getDisplayMin = function(){
    return this._min < 10 ? '0'+this._min : this._min;
};

Timeline.Time.prototype.getDisplayTime = function(){
    return this.getDisplayHour() +':'+ this.getDisplayMin();
};
