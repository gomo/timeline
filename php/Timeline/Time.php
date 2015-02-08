<?php
class Timeline_Time{
  private $_hour;
  private $_min;

  public static function createFromString($string){
      list($hour, $min, ) = explode(':', $string);
      return new Timeline_Time($hour, $min);
  }

  public function __construct($hour, $min){
    $this->_hour = (int)$hour;
    $this->_min = (int)$min;

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

  public static function create(array $time){
    return new Timeline_Time($time[0], $time[1]);
  }


  public function equals(Timeline_Time $time){
    return $this->getHour() == $time->getHour() && $this->getMin() == $time->getMin();
  }

  public function getHour(){
    return $this->_hour;
  }

  public function getMin(){
    return $this->_min;
  }

  public function getDayShift(){
    return (int)floor($this->_hour / 24);
  }

  public function getDisplayHour(){
    $hour = $this->_hour;
    while($hour > 23){
      $hour -= 24;
    }

    return $hour.'';
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

    return 0;
  }

  public function getTime()
  {
    return sprintf('%s:%s', $this->getHour(), $this->getMin());
  }

  public function toString(){
    return sprintf('%s:%s', $this->getDisplayHour(), $this->getDisplayMin());
  }

  public function __toString(){
    return $this->toString();
  }

  public function toArray(){
    return array(
      'hour' => $this->getHour(),
      'min' => $this->getMin(),
    );
  }
}