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
    
    function SpriteSheet(config)
    {
        var self = this;
        self.initialize(config);
    }
    
    var p = Elixir.Util.extend(SpriteSheet, Elixir.Core.FrameAbstract);
    p._first = null;
    p._element = null;
    p._width = null;
    p._height = null;
    p._source = null;
    p._cols = null;
    
    p._parent = p.initialize;
    p.initialize = function(config)
    {
        var self = this;
        self._parent(config);
        
        self._first = true;
        self._element = config.element;
        self._width = config.width || self._element.outerWidth();
        self._height = config.height || self._element.outerHeight();
        self._source = config.source || null;
        self._cols = config.cols || config.totalFrames;
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
    
    p._parent = p.destroy;
    p.destroy = function()
    {
        var self = this;
        self._element = null;
        
        self._parent();
    };
    
    Elixir.Control.SpriteSheet = SpriteSheet;
})(jQuery);
