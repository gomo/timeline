/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.Time = function(hour, min){
    this._hour = hour === undefined ? 0 : parseInt(hour, 10);
    this._min = min === undefined ? 0 : parseInt(min, 10);
};

Timeline.Time.prototype.getHour = function(){ return this._hour; };
Timeline.Time.prototype.getMin = function(){ return this._min; };

Timeline.Time.prototype.addMin = function(min){
    var newHour = this.getHour();
    var newMin = this.getMin();

    newMin += min;
    if(newMin > 59)
    {
        var plusHour = Math.floor(newMin / 60);
        newMin = newMin % 60;
        newHour += plusHour;
    }

    return new Timeline.Time(newHour, newMin);
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
    return this._hour +':'+ (this._min < 10 ? '0'+this._min : this._min);
};

Timeline.Time.prototype.getDisplayHour = function(){
    return this._hour < 24 ? this._hour : this._hour - 24;
};

Timeline.Time.prototype.getDisplayTime = function(){
    return this.getDisplayHour() +':'+ (this._min < 10 ? '0'+this._min : this._min);
};


