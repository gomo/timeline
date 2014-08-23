<?php
class Timeline_Time{
  private $_hour;
  private $_min;
  public function __construct($hour, $min){
    $this->_hour = $hour;
    $this->_min = $min;

    while($this->_min < 0){
      --$this->_hour;
      $this->_min += 60;
    }

    while($this->_min > 59){
      ++$this->_hour;
      $this->_min -= 60;
    }

    if($this->_hour < 0){
      throw new Timeline_Exception($this->toString().' is invalid time');
    }
  }

  public static function create($hour, $min){
    return new Timeline_Time($hour, $min);
  }

  public function getHour(){
    return $this->_hour;
  }

  public function getMin(){
    return $this->_min;
  }

  public function getDayShift(){
    return floor($this->_hour / 24);
  }

  public function getDisplayHour(){
    $hour = $this->_hour;
    while($hour > 23){
      $hour -= 24;
    }

    return $hour;
  }

  public function getDisplayMin(){
    return sprintf('%02d', $this->_min);
  }

  public function getDistance(Timeline_Time $time){
    return ($time->getHour() - $this->getHour()) * 60 + ($time->getMin() - $this->getMin());
  }

  public function addMin($min){
    return new Timeline_Time($this->getHour(), $this->getMin() + $min);
  }

  public function compare(Timeline_Time $time){
    if($this->getHour() > $time->getHour())
    {
        return 1;
    }
    else if($this->getHour() < $time->getHour())
    {
        return -1;
    }
    else
    {
        if($this->getMin() > $time->getMin())
        {
            return 1;
        }
        else if($this->getMin() < $time->getMin())
        {
            return -1;
        }
    }
  }

  public function toString(){
    return sprintf('%s:%s', $this->getDisplayHour(), $this->getDisplayMin());
  }
}