//FlexibleHandle
Timeline.FlexibleHandle = function(frameView){
    this._eventView = null;
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
        .css('position', 'absolute')
        .hide()
        .data('timeline', {})
        .draggable({
            axis: "y",
            start: function(event, ui){
                self._eventView.getFrameView().getTimeIndicator().show();
            },
            stop: function( event, ui ) {
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
                ui.helper.data('timeline').time = self._eventView.getFrameView().getTimeIndicator().data('timeline').time;
            }
        });
    return handle;
};

Timeline.FlexibleHandle.prototype.disable = function(){
        var newTimeSpan = new Timeline.TimeSpan(this._topElement.data('timeline').time, this._downElement.data('timeline').time);
        this._eventView.setTimeSpan(newTimeSpan);
        this._eventView.updateDisplay();
        this._topElement.hide();
        this._downElement.hide();
        this._eventView.getFrameView().getTimeIndicator().hide();
};

Timeline.FlexibleHandle.prototype.enable = function(eventView){
    this._eventView = eventView;
    this._topElement.show();
    this._downElement.show();

    var eventElem = eventView.getElement();
    var offset = eventElem.offset();

    offset.top = offset.top - this._topElement.outerHeight() - Timeline.FlexibleHandle.MARGIN;
    this._topElement.outerWidth(eventElem.outerWidth());
    this._topElement.offset(offset);
    this._topElement.data('timeline').time = eventView.getTimeSpan().getStartTime();


    offset = eventElem.offset();
    offset.top = offset.top + eventElem.outerHeight() + Timeline.FlexibleHandle.MARGIN;
    this._downElement.outerWidth(eventElem.outerWidth());
    this._downElement.offset(offset);
    this._downElement.data('timeline').time = eventView.getTimeSpan().getEndTime();
};