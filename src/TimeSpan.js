/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.TimeSpan = function(startTime, endTime){

    while(startTime.compare(endTime) >= 0){
        endTime = endTime.addMin(24 * 60);
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
    console.log(time);
    return new Timeline.TimeSpan(time, time.addMin(this.getDistance()));
};

Timeline.TimeSpan.prototype.equals = function(timeSpan){
    return this.getStartTime().equals(timeSpan.getStartTime()) && this.getEndTime().equals(timeSpan.getEndTime());
};

Timeline.TimeSpan.prototype.contains = function(timeSpan){
    return this.getStartTime().compare(timeSpan.getStartTime()) <= 0 && this.getEndTime().compare(timeSpan.getEndTime()) >= 0;
};

Timeline.TimeSpan.prototype.containsTime = function(time){
    return this.getStartTime().compare(time) < 0 && this.getEndTime().compare(time) > 0;
};

Timeline.TimeSpan.prototype.overlaps = function(timeSpan){
    if(timeSpan.contains(this)){
        return true;
    }

    if(this.containsTime(timeSpan.getStartTime())){
        return true;
    }

    if(this.containsTime(timeSpan.getEndTime())){
        return true;
    }

    return false;
};

Timeline.TimeSpan.prototype.eachHour = function(callback){
    var hour = this.getStartTime().getHour();
    var end = this.getEndTime().getHour();
    var key = 0;

    while(true){
        if(hour === end){
            callback.call(hour, key, hour, this.getEndTime().getMin());
            break;
        } else {
            callback.call(hour, key, hour);
        }

        hour += 1;
        ++key;
    }
};

Timeline.TimeSpan.prototype.eachTime = function(callback, minuteInterval){
    var key = 0;
    minuteInterval = minuteInterval ? minuteInterval : 60;

    var time = this.getStartTime();
    while(true){
        if(time.compare(this.getEndTime()) > 0){
            break;
        }

        callback.call(time, key, time);

        time = time.addMin(minuteInterval);
        ++key;
    }
};

Timeline.TimeSpan.prototype.toString = function(){
    return this._startTime + '~' + this._endTime;
};
