<?php

class Timeline_TimeSpan{

  const OVERLAP_NO = 0;
  const OVERLAP_START = 1;
  const OVERLAP_END = 2;
  const OVERLAP_CONTAIN = 3;
  const OVERLAP_OVER = 4;
  const OVERLAP_EQUAL = 5;

  private $_start_time;
  private $_end_time;

  public static function create(array $start, array $end){
    return new Timeline_TimeSpan(new Timeline_Time($start[0], $start[1]), new Timeline_Time($end[0], $end[1]));
  }

  public function __construct(Timeline_Time $start, Timeline_Time $end){
    while($start->compare($end) >= 0){
      $end = $end->addMin(24 * 60);
    }

    $this->_start_time = $start;
    $this->_end_time = $end;
  }

  public function getStartTime(){
    return $this->_start_time;
  }

  public function getEndTime(){
    return $this->_end_time;
  }

  public function equals(Timeline_TimeSpan $time_span){
    return $this->getStartTime()->equals($time_span->getStartTime()) && $this->getEndTime()->equals($time_span->getEndTime());
  }

  public function contains(Timeline_TimeSpan $time_span){
    return $this->getStartTime()->compare($time_span->getStartTime()) <= 0 && $this->getEndTime()->compare($time_span->getEndTime()) >= 0;
  }

  public function containsTime(Timeline_Time $time){
    return $this->getStartTime()->compare($time) < 0 && $this->getEndTime()->compare($time) > 0;
  }

  public function overlaps(Timeline_TimeSpan $time_span){
    if($time_span->contains($this)){
        return true;
    }

    if($this->containsTime($time_span->getStartTime())){
        return true;
    }

    if($this->containsTime($time_span->getEndTime())){
        return true;
    }

    return false;
  }

  public function getDistance(){
    return $this->getStartTime()->getDistance($this->getEndTime());
  }

  public function toString(){
    return sprintf('%s ~ %s', $this->getStartTime(), $this->getEndTime());
  }

  public function __toString(){
    return $this->toString();
  }

  public function toArray(){
    return array(
      'start_time' => $this->getStartTime()->toArray(),
      'end_time' => $this->getEndTime()->toArray(),
    );
  }
}