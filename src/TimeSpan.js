//TimeSpan
Timeline.TimeSpan = function(startTime, endTime){
    this._startTime = startTime;
    this._endTime = endTime;
};

Timeline.TimeSpan.create = function(start, end){
    return new Timeline.TimeSpan(new Timeline.Time(start[0], start[1]), new Timeline.Time(end[0], end[1]));
};

Timeline.TimeSpan.prototype.getDistance = function(){
    return this._startTime.calcMinDistance(this._endTime);
};

Timeline.TimeSpan.prototype.getStartTime = function(){ return this._startTime; };
Timeline.TimeSpan.prototype.getEndTime = function(){ return this._endTime; };

Timeline.TimeSpan.prototype.forEachHour = function(callback){
    var hour = this.getStartTime().getHour();
    var end = this.getEndTime().getHour();

    while(true)
    {
        callback(hour);

        if(hour === end)
        {
            break;
        }

        hour += 1;
        if(hour == 24)
        {
            hour = 0;
        }
    }
};
