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
  var self = this;
  $(window).on("scroll", function(){
    self.top($(window).scrollTop());
  });
};

Timeline.LabelView.prototype.top = function(top){
  this._element.css({
    "-webkit-transform": 'translate3d(0px, '+ top +'px, 1000px)'
  });
}

Timeline.LabelView.prototype.addLabel = function(label){
  var self = this;
  var labelElem = $('<div class="tlLabel">' + label + '</div>');
  self._element.append(labelElem);
  return labelElem;
};