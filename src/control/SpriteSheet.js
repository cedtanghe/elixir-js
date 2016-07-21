/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.FrameAbstract
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| SPRITE SHEET
|--------------------------------------------------------------------------
*/    
    
(function($)
{
    'use strict';
    
    function SpriteSheet(element, config)
    {
        var self = this;
        self.initialize(element, config);
    }
    
    var p = Elixir.Util.extend(SpriteSheet, Elixir.Core.FrameAbstract);
    p._first = null;
    p._source = null;
    p._cols = null;
    
    p._parent = p.initialize;
    p.initialize = function(element, config)
    {
        var self = this;
        self._first = true;
        self._source = config.source || null;
        self._cols = config.cols || config.totalFrames;
        
        self._parent(element, config);
    };
    
    p.draw = function()
    {
        var self = this;
        
        var posX = - (self._currentFrame % self._cols) * self._width;
        var posY = - Math.floor(self._currentFrame / self._cols) * self._height;
        
        if (null !== self._source && self._first)
        {
            self._element.css('background-image', self._source);
        }
        
        self._element.css('background-position', posX + 'px ' + posY + 'px');
        self._first = false;
    };
    
    Elixir.Control.SpriteSheet = SpriteSheet;
})(jQuery);
