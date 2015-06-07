<?php

class Timeline_TimeSpanTest extends PHPUnit_Framework_TestCase {
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

  public function testCreateIrregular(){
    $span = new Timeline_TimeSpan(new Timeline_Time(23, 0), new Timeline_Time(0, 0));
    $this->assertEquals(60, $span->getDistance());
    $this->assertEquals(24, $span->getEndTime()->getHour());

    $span = new Timeline_TimeSpan(new Timeline_Time(0, 0), new Timeline_Time(0, 0));
    $this->assertEquals(60 * 24, $span->getDistance());
    $this->assertEquals(24, $span->getEndTime()->getHour());

    $span = new Timeline_TimeSpan(new Timeline_Time(10, 0), new Timeline_Time(9, 0));
    $this->assertEquals(60 * 23, $span->getDistance());
    $this->assertEquals(33, $span->getEndTime()->getHour());
  }

  public function testRemove(){
    $timespan = Timeline_TimeSpan::create(array(10, 0), array(22, 0));

    $result = $timespan->remove(null);
    $this->assertSame(1, count($result));
    $this->assertSame($timespan, $result[0]);

    //重なっていない＋隣接＋後ろ
    $result = $timespan->remove(Timeline_TimeSpan::create(array(22, 0), array(23, 0)));
    $this->assertSame(1, count($result));
    $this->assertSame($timespan, $result[0]);

    //重なっていない＋後ろ
    $result = $timespan->remove(Timeline_TimeSpan::create(array(22, 10), array(23, 0)));
    $this->assertSame(1, count($result));
    $this->assertSame($timespan, $result[0]);

    //重なっていない＋隣接＋前
    $result = $timespan->remove(Timeline_TimeSpan::create(array(9, 0), array(10, 0)));
    $this->assertSame(1, count($result));
    $this->assertSame($timespan, $result[0]);

    //重なっていない＋前
    $result = $timespan->remove(Timeline_TimeSpan::create(array(9, 0), array(9, 50)));
    $this->assertSame(1, count($result));
    $this->assertSame($timespan, $result[0]);

    //重なる＋後ろ＋はみ出る
    $result = $timespan->remove(Timeline_TimeSpan::create(array(21, 0), array(23, 0)));
    $this->assertSame(1, count($result));
    $this->assertTrue(Timeline_TimeSpan::create(array(10, 0), array(21, 0))->equals($result[0]));

    //重なる＋後ろ＋はみ出でない
    $result = $timespan->remove(Timeline_TimeSpan::create(array(21, 0), array(22, 0)));
    $this->assertSame(1, count($result));
    $this->assertTrue(Timeline_TimeSpan::create(array(10, 0), array(21, 0))->equals($result[0]));

    //重なる＋前＋はみ出る
    $result = $timespan->remove(Timeline_TimeSpan::create(array(9, 0), array(12, 0)));
    $this->assertSame(1, count($result));
    $this->assertTrue(Timeline_TimeSpan::create(array(12, 0), array(22, 0))->equals($result[0]));

    //重なる＋前＋はみ出ない
    $result = $timespan->remove(Timeline_TimeSpan::create(array(10, 0), array(12, 0)));
    $this->assertSame(1, count($result));
    $this->assertTrue(Timeline_TimeSpan::create(array(12, 0), array(22, 0))->equals($result[0]));

    //含まれる
    $result = $timespan->remove(Timeline_TimeSpan::create(array(12, 0), array(15, 0)));
    $this->assertSame(2, count($result));
    $this->assertTrue(Timeline_TimeSpan::create(array(10, 0), array(12, 0))->equals($result[0]));
    $this->assertTrue(Timeline_TimeSpan::create(array(15, 0), array(22, 0))->equals($result[1]));
  }
}
