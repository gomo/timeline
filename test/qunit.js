var tl = Timeline;

// test( "Some.test", function() {

// });

test( "TimeSpan.shiftStartTime", function() {
    var originTs, resultTs;
    originTs = tl.TimeSpan.create([10, 0], [12, 15]);

    resultTs = originTs.shiftStartTime(tl.Time.create(10, 15));
    equal(resultTs.getEndTime().getHour(), 12);
    equal(resultTs.getEndTime().getMin(), 30);

    resultTs = originTs.shiftStartTime(tl.Time.create(10, 45));
    equal(resultTs.getEndTime().getHour(), 13);
    equal(resultTs.getEndTime().getMin(), 0);

    resultTs = originTs.shiftStartTime(tl.Time.create(11, 15));
    equal(resultTs.getEndTime().getHour(), 13);
    equal(resultTs.getEndTime().getMin(), 30);
});

test( "TimeSpan.shiftStartTime", function() {
    var originTs, resultTs;
    originTs = tl.TimeSpan.create([11, 30], [13, 30]);

    resultTs = originTs.shiftEndTime(tl.Time.create(13, 15));
    equal(resultTs.getStartTime().getHour(), 11);
    equal(resultTs.getStartTime().getMin(), 15);

    resultTs = originTs.shiftEndTime(tl.Time.create(13, 0));
    equal(resultTs.getStartTime().getHour(), 11);
    equal(resultTs.getStartTime().getMin(), 0);

    resultTs = originTs.shiftEndTime(tl.Time.create(12, 24));
    equal(resultTs.getStartTime().getHour(), 10);
    equal(resultTs.getStartTime().getMin(), 24);
});

test( "Time.addMin", function() {
    var originT, resultT;
    originT = tl.Time.create(23, 0);

    resultT = originT.addMin(10);
    equal(resultT.getHour(), 23);
    equal(resultT.getMin(), 10);

    resultT = originT.addMin(60);
    equal(resultT.getHour(), 24);
    equal(resultT.getMin(), 0);

    resultT = originT.addMin(140);
    equal(resultT.getHour(), 25);
    equal(resultT.getMin(), 20);

    resultT = originT.addMin(-10);
    equal(resultT.getHour(), 22);
    equal(resultT.getMin(), 50);

    resultT = originT.addMin(-70);
    equal(resultT.getHour(), 21);
    equal(resultT.getMin(), 50);
});

test( "Line.create", function() {
    var wrapper = $('<div></div>').appendTo('body');
    var line;

    line = new tl.LineView(tl.TimeSpan.create([10, 0], [15, 0]));
    wrapper.append(line.render());
    line.setRulerView(new tl.RulerView());

    equal(line.getElement().find('.tlHourView').length, 6);
    equal(line.getElement().find('.tlHourView._15 .tlMinView').length, 1);


    line = new tl.LineView(tl.TimeSpan.create([10, 0], [15, 15]));
    wrapper.append(line.render());
    equal(line.getElement().find('.tlHourView._15 .tlMinView').length, 2);

    line = new tl.LineView(tl.TimeSpan.create([10, 0], [15, 30]));
    wrapper.append(line.render());
    equal(line.getElement().find('.tlHourView._15 .tlMinView').length, 3);

    line = new tl.LineView(tl.TimeSpan.create([10, 0], [15, 45]));
    wrapper.append(line.render());
    equal(line.getElement().find('.tlHourView._15 .tlMinView').length, 4);
});

test( "TimeSpan.overlapsTimeSpan", function() {
    var ts1, ts2;

    //check OVERLAP_START
    ts1 = tl.TimeSpan.create([10, 0], [15, 0]);
    ts2 = tl.TimeSpan.create([14, 59], [15, 10]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_START);

    ts2 = tl.TimeSpan.create([15, 0], [15, 10]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_NO);

    //check OVERLAP_END
    ts1 = tl.TimeSpan.create([10, 0], [15, 0]);
    ts2 = tl.TimeSpan.create([9, 0], [10, 1]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_END);

    ts2 = tl.TimeSpan.create([9, 0], [10, 0]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_NO);

    //check OVERLAP_CONTAIN
    ts1 = tl.TimeSpan.create([10, 0], [15, 0]);
    ts2 = tl.TimeSpan.create([10, 1], [14, 59]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_CONTAIN);

    ts2 = tl.TimeSpan.create([10, 0], [15, 0]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_EQUAL);
    ts2 = tl.TimeSpan.create([10, 0], [15, 1]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_START);
    ts2 = tl.TimeSpan.create([9, 59], [15, 0]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_END);
    ts2 = tl.TimeSpan.create([15, 1], [15, 20]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_NO);
    ts2 = tl.TimeSpan.create([9, 59], [15, 1]);
    equal(ts2.overlapsTimeSpan(ts1), Timeline.TimeSpan.OVERLAP_OVER);

});
