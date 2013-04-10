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

Timeline.TimeSpan.prototype.getDistance = function(){
    return this._startTime.getDistance(this._endTime);
};

Timeline.TimeSpan.prototype.getStartTime = function(){ return this._startTime; };
Timeline.TimeSpan.prototype.getEndTime = function(){ return this._endTime; };

Timeline.TimeSpan.prototype.shiftStartTime = function(time){
    return new Timeline.TimeSpan(time, time.addMin(this.getDistance()));
};

Timeline.TimeSpan.prototype.isOverlapsTimeSpan = function(timeSpan){
    return (timeSpan.getStartTime().compare(this._startTime) >= 0 && timeSpan.getStartTime().compare(this._endTime) <= 0) || (timeSpan.getEndTime().compare(this._startTime) >= 0 && timeSpan.getEndTime().compare(this._endTime) <= 0);
};

Timeline.TimeSpan.prototype.isContainsTimeSpan = function(timeSpan){
    return this._startTime.compare(timeSpan.getStartTime()) <= 0 && this._endTime.compare(timeSpan.getEndTime()) >= 0;
};

Timeline.TimeSpan.prototype.forEachHour = function(callback){
    var hour = this.getStartTime().getHour();
    var end = this.getEndTime().getHour();

    while(true)
    {
        //TODO count up on try finally
        callback(hour);

        if(hour === end)
        {
            break;
        }

        hour += 1;
    }
};

Timeline.TimeSpan.prototype.toString = function(){
    return this._startTime + '~' + this._endTime;
};
