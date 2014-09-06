<?php
class Timeline_TimeTest extends PHPUnit_Framework_TestCase {
  public function testTime(){
    $time  = new Timeline_Time(10, 0);
    $this->assertSame(10, $time->getHour());
    $this->assertSame(0, $time->getMin());

    $time  = new Timeline_Time(10, 60);
    $this->assertSame(11, $time->getHour());
    $this->assertSame(0, $time->getMin());

    $time  = new Timeline_Time(10, 125);
    $this->assertSame(12, $time->getHour());
    $this->assertSame(5, $time->getMin());

    $time  = new Timeline_Time(10, -1);
    $this->assertSame(9, $time->getHour());
    $this->assertSame(59, $time->getMin());

    $time  = new Timeline_Time(10, -65);
    $this->assertSame(8, $time->getHour());
    $this->assertSame(55, $time->getMin());
  }

  public function testDisplayTime(){
    $time  = new Timeline_Time(10, 0);
    $this->assertSame('10', $time->getDisplayHour());
    $this->assertSame('00', $time->getDisplayMin());
    $this->assertSame(0, $time->getDayShift());

    $time  = new Timeline_Time(25, 0);
    $this->assertSame('1', $time->getDisplayHour());
    $this->assertSame('00', $time->getDisplayMin());
    $this->assertSame(1, $time->getDayShift());

    $time  = new Timeline_Time(48, 0);
    $this->assertSame('0', $time->getDisplayHour());
    $this->assertSame('00', $time->getDisplayMin());
    $this->assertSame(2, $time->getDayShift());
  }

  public function testDistance(){
    $time1  = new Timeline_Time(10, 0);
    $time2  = new Timeline_Time(10, 10);
    $this->assertSame(10, $time1->getDistance($time2));
    $this->assertSame(-10, $time2->getDistance($time1));

    $time1  = new Timeline_Time(10, 30);
    $time2  = new Timeline_Time(12, 20);
    $this->assertSame(110, $time1->getDistance($time2));
    $this->assertSame(-110, $time2->getDistance($time1));
  }

  public function testAddMin(){
    $time  = new Timeline_Time(10, 0);
    $time2 = $time->addMin(10);

    //元の時間は変わらない
    $this->assertSame(0, $time->getMin());
    $this->assertSame(10, $time2->getMin());

    $this->assertSame('11:10', $time->addMin(70)->toString());
    $this->assertSame('9:50', $time->addMin(-10)->toString());
    $this->assertSame('8:50', $time->addMin(-70)->toString());
  }

  public function testCompare(){
    $this->assertSame(0, Timeline_Time::create(10, 20)->compare(Timeline_Time::create(10, 20)));
    $this->assertSame(-1, Timeline_Time::create(10, 10)->compare(Timeline_Time::create(10, 20)));
    $this->assertSame(1, Timeline_Time::create(10, 30)->compare(Timeline_Time::create(10, 20)));

    $this->assertSame(-1, Timeline_Time::create(8, 20)->compare(Timeline_Time::create(10, 20)));
    $this->assertSame(1, Timeline_Time::create(20, 20)->compare(Timeline_Time::create(10, 20)));

    $this->assertSame(true, Timeline_Time::create(20, 20)->equals(Timeline_Time::create(20, 20)));
    $this->assertSame(false, Timeline_Time::create(20, 20)->equals(Timeline_Time::create(20, 21)));
    $this->assertSame(false, Timeline_Time::create(20, 20)->equals(Timeline_Time::create(21, 20)));
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
