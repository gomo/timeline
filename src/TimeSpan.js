/**
 * 一度生成したオブジェクトは変更しません。
 * 変更メソッドは新しいオブジェクトを帰します。
 */
Timeline.TimeSpan = function(startTime, endTime){
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

Timeline.TimeSpan.prototype.isContains = function(timeSpan){

    var selfRange = this.getRange();
    var targetRange = timeSpan.getRange();

    return selfRange[0] <= targetRange[0] && selfRange[1] >= targetRange[0];
};

Timeline.TimeSpan.prototype.getRange = function(){
    var start = this._startTime.getHour() * 60 + this._startTime.getMin();
    var endHour = this._endTime.getHour();
    if(this._startTime.getHour() > endHour)
    {
        endHour += 24;
    }
    var end = endHour * 60 + this._endTime.getMin();

    return [start, end];
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
        if(hour == 24)
        {
            hour = 0;
        }
    }
};
