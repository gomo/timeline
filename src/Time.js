//Time
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

    if(newHour > 23)
    {
        newHour -= 24;
    }

    return new Timeline.Time(newHour, newMin);
};

Timeline.Time.prototype.getDistance = function(targetTime){
    var targetHour = targetTime.getHour();
    if(this._hour > targetHour)
    {
        targetHour += 24;
    }

    var hourDistance = targetHour - this._hour;

    return (hourDistance * 60) + (targetTime.getMin() - this._min);
};