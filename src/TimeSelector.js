Timeline.TimeSelector = function(hourElem, minElem, timeSpan, minInterval){
  var self = this;
  self._hourElem = hourElem;
  self._minElem = minElem;
  self._minTime = timeSpan.getStartTime();
  self._maxTime = timeSpan.getEndTime();
  self._minInterval = minInterval;

  timeSpan.eachTime(function(key, time){
    var option = '<option value="' + time.getHour() + '">' + time.getDisplayHour() + '</option>';
    self._hourElem.append(option);
  });

  $.each(Array.apply(null, {length: 60/minInterval}).map(function(value, key){return key * minInterval}), function(key, min){
    var displayMin = min < 10 ? '0'+min : min;
    var option = '<option value="' + min + '">' + displayMin + '</option>';
    self._minElem.append(option);
  });

  self._changeCallbacks = [];
  self._hourElem.change(function(e){
    self._checkMinDisabled();
    $.each(self._changeCallbacks, function(){
      this.call(self, e);
    });
  });

  self._minElem.change(function(e){
    $.each(self._changeCallbacks, function(){
      this.call(self, e);
    });
  });
};

Timeline.TimeSelector.prototype.change = function(callback){
  this._changeCallbacks.push(callback);
  return this;
};

Timeline.TimeSelector.prototype.getTime = function(){
  return Timeline.Time.create(this._hourElem.val(), this._minElem.val());
};

Timeline.TimeSelector.prototype.setTimeWithLesserMin = function(time){
  var self = this;

  self._hourElem.val(time.getHour());
  self._minElem.val(
    self._minInterval * Math.floor(time.getMin() / self._minInterval)
  );

  return self;
};

Timeline.TimeSelector.prototype.setTimeWithGreaterMin = function(time){
  var self = this;
  
  self._hourElem.val(time.getHour());
  self._minElem.val(
    self._minInterval * Math.ceil(time.getMin() / self._minInterval)
  );

  return self;
};

Timeline.TimeSelector.prototype._checkMinDisabled = function(){
  var self = this;
  var hour = self._hourElem.val();

  self._minElem.find('option').each(function(){
    var option = $(this);
    option.removeAttr('disabled');
  });

  if(self._minTime.getHour() == hour){
    var currentTime = self.getTime();

    self._minElem.find('option').each(function(){
      var option = $(this);
      if(option.val() < self._minTime.getMin()){
        option.attr('disabled', 'disabled');
      }
    });
    
    if(currentTime.compare(self._minTime) < 0){
      self.setTimeWithGreaterMin(self._minTime);
    }
  }

  if(self._maxTime.getHour() == hour){
    var currentTime = self.getTime();

    self._minElem.find('option').each(function(){
      var option = $(this);
      if(option.val() > self._maxTime.getMin()){
        option.attr('disabled', 'disabled');
      }
    });
    
    if(currentTime.compare(self._maxTime) > 0){
      self.setTimeWithLesserMin(self._maxTime);
    }
  }
};

Timeline.TimeSelector.prototype._checkHourDisabled = function(){
  var self = this;
  self._hourElem.find('option').each(function(){
    var option = $(this);
    var value = option.val();
    if(value < self._minTime.getHour() || value > self._maxTime.getHour()){
      option.attr('disabled', 'disabled');
    } else {
      option.removeAttr('disabled');
    }
  });
};

Timeline.TimeSelector.prototype.setMinTime = function(time){
  var self = this;
  self._minTime = time;

  var currentTime = self.getTime();
  if(currentTime.compare(time) < 0){
    self.setTimeWithGreaterMin(time);
  }

  self._checkHourDisabled();
  self._checkMinDisabled();
  
  return self;
}


Timeline.TimeSelector.prototype.setMaxTime = function(time){
  var self = this;
  self._maxTime = time;

  var currentTime = self.getTime();
  if(currentTime.compare(time) > 0){
    self.setTimeWithLesserMin(time);
  }

  self._checkHourDisabled();
  self._checkMinDisabled();
  
  return self;
}