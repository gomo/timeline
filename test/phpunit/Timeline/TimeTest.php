<?php
class Timeline_TimeTest extends PHPUnit_Framework_TestCase {
  public function testTime(){
    $time  = new Timeline_Time(10, 0);
    $this->assertEquals(10, $time->getHour());
    $this->assertEquals(0, $time->getMin());

    $time  = new Timeline_Time(10, 60);
    $this->assertEquals(11, $time->getHour());
    $this->assertEquals(0, $time->getMin());

    $time  = new Timeline_Time(10, 125);
    $this->assertEquals(12, $time->getHour());
    $this->assertEquals(5, $time->getMin());

    $time  = new Timeline_Time(10, -1);
    $this->assertEquals(9, $time->getHour());
    $this->assertEquals(59, $time->getMin());

    $time  = new Timeline_Time(10, -65);
    $this->assertEquals(8, $time->getHour());
    $this->assertEquals(55, $time->getMin());
  }

  public function testDisplayTime(){
    $time  = new Timeline_Time(10, 0);
    $this->assertEquals('10', $time->getDisplayHour());
    $this->assertEquals('00', $time->getDisplayMin());
    $this->assertEquals(0, $time->getDayShift());

    $time  = new Timeline_Time(25, 0);
    $this->assertEquals('1', $time->getDisplayHour());
    $this->assertEquals('00', $time->getDisplayMin());
    $this->assertEquals(1, $time->getDayShift());

    $time  = new Timeline_Time(48, 0);
    $this->assertEquals('0', $time->getDisplayHour());
    $this->assertEquals('00', $time->getDisplayMin());
    $this->assertEquals(2, $time->getDayShift());
  }

  public function testDistance(){
    $time1  = new Timeline_Time(10, 0);
    $time2  = new Timeline_Time(10, 10);
    $this->assertEquals(10, $time1->getDistance($time2));
    $this->assertEquals(-10, $time2->getDistance($time1));

    $time1  = new Timeline_Time(10, 30);
    $time2  = new Timeline_Time(12, 20);
    $this->assertEquals(110, $time1->getDistance($time2));
    $this->assertEquals(-110, $time2->getDistance($time1));
  }

  public function testAddMin(){
    $time  = new Timeline_Time(10, 0);
    $time2 = $time->addMin(10);

    //元の時間は変わらない
    $this->assertEquals(0, $time->getMin());
    $this->assertEquals(10, $time2->getMin());

    $this->assertEquals('11:10', $time->addMin(70)->toString());
    $this->assertEquals('9:50', $time->addMin(-10)->toString());
    $this->assertEquals('8:50', $time->addMin(-70)->toString());
  }

  public function testCompare(){
    $this->assertEquals(0, Timeline_Time::create(10, 20)->compare(Timeline_Time::create(10, 20)));
    $this->assertEquals(-1, Timeline_Time::create(10, 10)->compare(Timeline_Time::create(10, 20)));
    $this->assertEquals(1, Timeline_Time::create(10, 30)->compare(Timeline_Time::create(10, 20)));

    $this->assertEquals(-1, Timeline_Time::create(8, 20)->compare(Timeline_Time::create(10, 20)));
    $this->assertEquals(1, Timeline_Time::create(20, 20)->compare(Timeline_Time::create(10, 20)));    
  }

  /**
   * @expectedException        Timeline_Exception
   * @expectedExceptionMessage is invalid time
   */
  public function testInvalidTimeException(){
    new Timeline_Time(-1, 0);
  }

  /**
   * @expectedException        Timeline_Exception
   * @expectedExceptionMessage is invalid time
   */
  public function testInvalidTimeException2(){
    new Timeline_Time(0, -1);
  }
}
