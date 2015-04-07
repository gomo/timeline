//LabelView
Timeline.LabelView = function(){
    Timeline.LabelView.super_.call(this);
    this._fixedClone;
};

Timeline.Util.inherits(Timeline.LabelView, Timeline.View);
Timeline.LabelView.CLASS_ELEM = 'tlLabelView';

Timeline.LabelView.prototype._getClassName = function(){
    return Timeline.LabelView.CLASS_ELEM;
};

Timeline.LabelView.prototype._build = function(){

};


Timeline.LabelView.prototype._postShow = function(){
  var self = this;

  //self._element.offset()が正しい値を返さないのでsetTimeoutをしています。
  setTimeout(function(){
    //https://github.com/gomo/scroll-events
    var wrapper = self._element.closest('.tlTimelineScrollWrapper');
    if(!wrapper.length){
      wrapper = Timeline.window;
    }
    wrapper.observeScrollEvents({
      warpAllowance: 5
    });

    var startPosition = self._element.position();
    wrapper.on('warp-scroll-start', function(e, params){
      if(self._element.css('position') == 'relative'){
        self._element.css('visibility', 'hidden');
      }
    });

    wrapper.on('scroll-stop', function(e, params){
      if(params.top > startPosition.top){
        self._element.css('position', 'relative');
        self._element.css('top', params.top - startPosition.top + 'px');
      } else {
        self._element.css('position', '');
        self._element.css('top', '');
      }

      if(self._element.css('visibility') == 'hidden'){
        self._element.css('visibility', 'visible');
      }
    });
  }, 0);

};

Timeline.LabelView.prototype.addLabel = function(label){
  var self = this;
  var labelElem = $('<div class="tlLabel">' + label + '</div>');
  self._element.append(labelElem);
  return labelElem;
};