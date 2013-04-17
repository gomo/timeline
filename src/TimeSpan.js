/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.TimeSpan = function(startTime, endTime){

    if(startTime.compare(endTime) > 0)
    {
        throw Error('The endTime is earlier than the startTime.');
    }

    this._startTime = startTime;
    this._endTime = endTime;
};

Timeline.TimeSpan.create = function(start, end){
    return new Timeline.TimeSpan(new Timeline.Time(start[0], start[1]), new Timeline.Time(end[0], end[1]));
};

Timeline.TimeSpan.prototype.clone = function(){
    return new Timeline.TimeSpan(this.getStartTime().clone(), this.getEndTime().clone());
};

Timeline.TimeSpan.prototype.getDistance = function(){
    return this._startTime.getDistance(this._endTime);
};

Timeline.TimeSpan.prototype.getStartTime = function(){ return this._startTime; };
Timeline.TimeSpan.prototype.getEndTime = function(){ return this._endTime; };

Timeline.TimeSpan.prototype.shiftEndTime = function(time){
    return new Timeline.TimeSpan(time.addMin(-this.getDistance()), time);
};

Timeline.TimeSpan.prototype.shiftStartTime = function(time){
    return new Timeline.TimeSpan(time, time.addMin(this.getDistance()));
};

Timeline.TimeSpan.prototype.isOverlapTime = function(time, includeEquals){
    if(includeEquals)
    {
        return this._startTime.compare(time) <= 0 && this._endTime.compare(time) >= 0;
    }
    else
    {
        return this._startTime.compare(time) < 0 && this._endTime.compare(time) > 0;
    }
};

Timeline.TimeSpan.prototype.isContainTimeSpan = function(timeSpan){
    return this.isOverlapTime(timeSpan.getStartTime()) && this.isOverlapTime(timeSpan.getEndTime());
};

Timeline.TimeSpan.prototype.eachHour = function(callback){
    var hour = this.getStartTime().getHour();
    var end = this.getEndTime().getHour();
    var key = 0;

    while(true)
    {
        callback.call(hour, key, hour);

        if(hour === end)
        {
            break;
        }

        hour += 1;
        ++key;
    }
};

Timeline.TimeSpan.prototype.toString = function(){
    return this._startTime + '~' + this._endTime;
};
