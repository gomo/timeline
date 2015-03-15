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
    Timeline.window.observeScrollEvents();

    var labelOffset = self._element.offset();
    Timeline.window.on('warp-scroll-start', function(e, params){
      if(self._element.css('position') == 'relative'){
        self._element.css('visibility', 'hidden');        
      }
    });

    Timeline.window.on('scroll-stop', function(e, params){
      if(params.top > labelOffset.top){
        self._element.css('position', 'relative');
        self._element.css('top', params.top - labelOffset.top + 'px');
      } else {
        self._element.css('position', '');
        self._element.css('top', '');
      }

      if(self._element.css('visibility') == 'hidden'){
        self._element.fadeOut(0);
        self._element.css('visibility', 'visible');
        self._element.fadeIn(100); 
      }
    });  
  }, 100);
  
};

Timeline.LabelView.prototype.addLabel = function(label){
  var self = this;
  var labelElem = $('<div class="tlLabel">' + label + '</div>');
  self._element.append(labelElem);
  return labelElem;
};