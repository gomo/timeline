<?php

class Timeline_TimeSpanTest extends PHPUnit_Framework_TestCase {
  /**
   * @expectedException        Timeline_Exception
   * @expectedExceptionMessage The end time is earlier than the start time.
   */
  public function testTimeSpan(){
    $span = new Timeline_TimeSpan(new Timeline_Time(10, 0), new Timeline_Time(9, 30));
  }

  public function testTimeSpanOverlaps(){
    $span = new Timeline_TimeSpan(new Timeline_Time(10, 0), new Timeline_Time(15, 0));

    //equals
    $this->assertEquals(
      true,
      $span->equals(Timeline_TimeSpan::create(array(10, 0), array(15, 0)))
    );

    $this->assertEquals(
      false,
      $span->equals(Timeline_TimeSpan::create(array(10, 1), array(15, 0)))
    );

    $this->assertEquals(
      false,
      $span->equals(Timeline_TimeSpan::create(array(10, 0), array(15, 1)))
    );

    //contains
    $this->assertEquals(
      true,
      $span->contains(Timeline_TimeSpan::create(array(10, 0), array(15, 0)))
    );

    $this->assertEquals(
      true,
      $span->contains(Timeline_TimeSpan::create(array(10, 1), array(14, 59)))
    );

    $this->assertEquals(
      false,
      $span->contains(Timeline_TimeSpan::create(array(9, 59), array(15, 0)))
    );

    $this->assertEquals(
      false,
      $span->contains(Timeline_TimeSpan::create(array(10, 0), array(15, 1)))
    );

    //overaps
    $this->assertEquals(
      true,
      $span->overlaps(Timeline_TimeSpan::create(array(9, 59), array(15, 0)))
    );

    $this->assertEquals(
      true,
      $span->overlaps(Timeline_TimeSpan::create(array(10, 0), array(15, 1)))
    );

    $this->assertEquals(
      true,
      $span->overlaps(Timeline_TimeSpan::create(array(9, 59), array(15, 1)))
    );

    $this->assertEquals(
      true,
      $span->overlaps(Timeline_TimeSpan::create(array(10, 1), array(14, 59)))
    );

    //隣接はfalse
    $this->assertEquals(
      false,
      $span->overlaps(Timeline_TimeSpan::create(array(9, 0), array(10, 0)))
    );

    $this->assertEquals(
      false,
      $span->overlaps(Timeline_TimeSpan::create(array(15, 0), array(16, 0)))
    );

  }
}
