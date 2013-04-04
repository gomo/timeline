/**
 * sdx.rectUtil
 */
(function($){
	
	$.sdxRectUtil = {
		create:function(top, left, width, height)
		{
			return {origin: {top:top, left:left}, size:{width:width, height:height}};
		},
		createWithElement: function(elem)
		{
			if($.isWindow(elem.get(0)))
			{
				return $.sdxRectUtil.create(elem.scrollTop(), elem.scrollLeft(), elem.width(), elem.height());
			}
			
			var offset = elem.offset();
			if(offset)
			{
				return $.sdxRectUtil.create(offset.top, offset.left, elem.innerWidth(), elem.innerHeight());
			}
			else//document
			{
				return $.sdxRectUtil.create(0, 0, elem.innerWidth(), elem.innerHeight()); 
			}
		},
		
		/**
		 * rectがparentRectにはみ出ないで完全に含まれているか返す
		 */
		inParentRect:function(rect, parentRect) {
			return (
				rect.origin.top >= parentRect.origin.top &&
				rect.origin.left >= parentRect.origin.left &&
				(rect.origin.top + rect.size.height) <= (parentRect.origin.top + parentRect.size.height) &&
				(rect.origin.left + rect.size.width) <= (parentRect.origin.left + parentRect.size.width)
			);
		},
		
		/**
		 * 少しでも重なっていたらtrue
		 */
		intersectsRect: function(rect1, rect2)
		{
			var intersectsRect = $.sdxRectUtil.createIntersectsRect(rect1, rect2);
			
			return !(intersectsRect.size.width == 0 && intersectsRect.size.height == 0);
		},
		
		/**
		 * 2つのrectが重なっている部分を取得
		 */
		createIntersectsRect:function(a, b)
		{
			var startLeft = Math.max(a.origin.left, b.origin.left);
		    var startTop = Math.max(a.origin.top, b.origin.top);
		    var endLeft = Math.min(a.origin.left + a.size.width, b.origin.left + b.size.width﻿);
		    var endTop = Math.min(a.origin.top + a.size.height, b.origin.top + b.size.height);
		    
		    var width = endLeft - startLeft;
		    var height = endTop - startTop;
		    if (width > 0 && height > 0) {
		        return $.sdxRectUtil.create(startTop, startLeft, width, height);
		    }
		    else
		    {
		    	return $.sdxRectUtil.create(0,0,0,0);
		    }
		    
		},
		setRectToElement:function(rect, elem)
		{
			elem.css({position:'absolute'})
			.offset(rect.origin)
			.width(rect.size.width)
			.height(rect.size.height);
		},
		createElementWithRect:function(rect, tagName)
		{
			tagName = tagName ? tagName : 'div';
			var elem = $("<"+tagName+" />").appendTo('body');
			$.sdxRectUtil.setRectToElement(rect, elem);
			
			return elem;
		}
	};

})(jQuery);