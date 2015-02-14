//FlexibleHandle
Timeline.FlexibleHandle = function(frameView){
    this._eventView = undefined;
    this._frameView = frameView;
    this._topElement = this._setupEventHandle($('<div class="tlEventTopHandle" />'));
    this._downElement = this._setupEventHandle($('<div class="tlEventDownHandle" />'));
};

Timeline.FlexibleHandle.MARGIN = 4;

Timeline.FlexibleHandle.prototype._setupEventHandle = function(handle){
    var self = this;
    handle
        .appendTo(this._frameView.getElement())
        .height('30px')
        .css({'position': 'absolute', 'zIndex': 99999})
        .hide()
        .data('timeline', {})
        .draggable({
            axis: "y",
            start: function(event, ui){
                self._frameView.getTimeIndicator().show();
            },
            stop: function( event, ui ) {
                var containment;
                if(handle.hasClass('tlEventTopHandle')){
                    containment = self._downElement.draggable( "option", "containment");
                    self._downElement.draggable('option', 'containment', self._calcDownContainment(containment));
                } else if(handle.hasClass('tlEventDownHandle')) {
                    containment = self._topElement.draggable( "option", "containment");
                    self._topElement.draggable('option', 'containment', self._calcTopContainment(containment));
                }
            },
            drag: function( event, ui ) {
                var offset = ui.helper.offset();
                var eventElem = self._eventView.getElement();
                var targetTop;
                if(handle.hasClass('tlEventTopHandle')){
                    targetTop = offset.top + ui.helper.outerHeight() + Timeline.FlexibleHandle.MARGIN;
                    eventElem.outerHeight(eventElem.outerHeight() + eventElem.offset().top - targetTop);
                    eventElem.offset({top: targetTop, left:offset.left});
                } else if(handle.hasClass('tlEventDownHandle')) {
                    targetTop = offset.top - Timeline.FlexibleHandle.MARGIN;
                    var height = eventElem.outerHeight();
                    eventElem.outerHeight(height + targetTop - (eventElem.offset().top + height));
                }

                self._eventView.getLineView().showTimeIndicator(targetTop);
                self._eventView.updateDisplayHeight();
                ui.helper.data('timeline').time = self._frameView.getTimeIndicator().data('timeline').time;
            }
        });
    return handle;
};

Timeline.FlexibleHandle.prototype.fix = function(){
    var newTimeSpan = new Timeline.TimeSpan(this._topElement.data('timeline').time, this._downElement.data('timeline').time);
    this._eventView.setTimeSpan(newTimeSpan);
    this._eventView.updateDisplay();
    this._topElement.hide();
    this._downElement.hide();
    this._frameView.getTimeIndicator().hide();
};

Timeline.FlexibleHandle.prototype.cancel = function(){
    this._eventView.updateDisplay();
    this._topElement.hide();
    this._downElement.hide();
    this._frameView.getTimeIndicator().hide();
};

Timeline.FlexibleHandle.prototype.enable = function(eventView){
    this._eventView = eventView;
    this._topElement.show();
    this._downElement.show();

    var eventElem = eventView.getElement();

    //place top handle element
    var topOffset = eventElem.offset();
    topOffset.top = topOffset.top - this._topElement.outerHeight() - Timeline.FlexibleHandle.MARGIN;
    this._topElement.outerWidth(eventElem.outerWidth());
    this._topElement.offset(topOffset);
    this._topElement.data('timeline').time = eventView.getTimeSpan().getStartTime();

    //place bottom handle element
    var downOffset = eventElem.offset();
    downOffset.top = downOffset.top + eventElem.outerHeight() + Timeline.FlexibleHandle.MARGIN;
    this._downElement.outerWidth(eventElem.outerWidth());
    this._downElement.offset(downOffset);
    this._downElement.data('timeline').time = eventView.getTimeSpan().getEndTime();

    //make containment for top
    var prevEvent = eventView.getLineView().getPrevEventView(eventView.getTimeSpan().getStartTime());
    var topLimit = prevEvent ? prevEvent.getBottom() : eventView.getLineView().getFirstHourView().getFirstMinView().getTop();
    this._topElement.draggable( "option", "containment", this._calcTopContainment([
        topOffset.left,
        topLimit - (this._topElement.outerHeight() + Timeline.FlexibleHandle.MARGIN),
        topOffset.left + this._topElement.outerWidth(),
        undefined
    ]));

    //make containment for bottom
    var nextEvent = eventView.getLineView().getNextEventView(eventView.getTimeSpan().getEndTime());
    var downLimit = nextEvent ? nextEvent.getTop() : eventView.getLineView().getLastHourView().getLastMinView().getBottom();
    this._downElement.draggable( "option", "containment", this._calcDownContainment([
        downOffset.left,
        undefined,
        downOffset.left + this._topElement.outerWidth(),
        downLimit + Timeline.FlexibleHandle.MARGIN
    ]));
};

Timeline.FlexibleHandle.prototype._calcTopContainment = function(containment){
    containment[3] = this._downElement.offset().top - this._downElement.outerHeight() - (Timeline.FlexibleHandle.MARGIN * 2);
    return containment;
};

Timeline.FlexibleHandle.prototype._calcDownContainment = function(containment){
    containment[1] = this._topElement.offset().top + this._topElement.outerHeight() + (Timeline.FlexibleHandle.MARGIN * 2);
    return containment;
};