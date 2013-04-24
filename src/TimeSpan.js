/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.TimeSpan = function(startTime, endTime){

    if(startTime.compare(endTime) > 0)
    {
        throw 'The endTime is earlier than the startTime.';
    }

    this._startTime = startTime;
    this._endTime = endTime;
};

Timeline.TimeSpan.OVERLAP_NO = 0;
Timeline.TimeSpan.OVERLAP_START = 1;
Timeline.TimeSpan.OVERLAP_END = 2;
Timeline.TimeSpan.OVERLAP_CONTAIN = 3;
Timeline.TimeSpan.OVERLAP_OVER = 4;
Timeline.TimeSpan.OVERLAP_EQUAL = 5;

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

Timeline.TimeSpan.prototype.overlapsTimeSpan = function(timeSpan){
    var compStart = this._startTime.compare(timeSpan.getStartTime());
    var compEnd = this._endTime.compare(timeSpan.getEndTime());
    if(compStart === 0 && compEnd === 0){
        return Timeline.TimeSpan.OVERLAP_EQUAL;
    }

    if(compStart < 0 && compEnd > 0){
        return Timeline.TimeSpan.OVERLAP_OVER;
    }

    var overlapStartTime = (this._startTime.compare(timeSpan.getStartTime()) >= 0 && this._startTime.compare(timeSpan.getEndTime()) < 0);
    var overlapEndTime = (this._endTime.compare(timeSpan.getStartTime()) > 0 && this._endTime.compare(timeSpan.getEndTime()) <= 0);
    if(overlapStartTime && overlapEndTime){
        return Timeline.TimeSpan.OVERLAP_CONTAIN;
    } else if(overlapStartTime){
        return Timeline.TimeSpan.OVERLAP_START;
    } else if(overlapEndTime){
        return Timeline.TimeSpan.OVERLAP_END;
    } else {
        return Timeline.TimeSpan.OVERLAP_NO;
    }
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
