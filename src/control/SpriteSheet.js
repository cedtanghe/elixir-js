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
    
    var p = Elixir.Util.extend(SpriteSheet, Elixir.Control.FrameAbstract);
    p._element = null;
    p._width = null;
    p._height = null;
    p._source = null;
    p._cols = null;
    
    p._parentInitialize = p.initialize;
    p.initialize = function(config)
    {
        var self = this;
        self._parentInitialize(config);
        
        self._element = config.element;
        self._width = config.width || self._element.outerWidth();
        self._height = config.height || self._element.outerHeight();
        self._source = config.source || null;
        self._cols = config.cols || config.totalFrames;
        
        // Render first image
        self._draw();
    };
    
    p._draw = function()
    {
        var self = this;
        
        var posX = - (self._currentFrame % self._cols) * self._width;
        var posY = - Math.floor(self._currentFrame / self._cols) * self._height;
        
        if (null !== self._source)
        {
            self._element.css('background-image', self._source);
        }
        
        self._element.css('background-position', posX + 'px ' + posY + 'px');
    };
    
    p._parentDestroy = p.destroy;
    p.destroy = function()
    {
        var self = this;
        self._element = null;
        
        self._parentDestroy();
    };
    
    Elixir.Control.SpriteSheet = SpriteSheet;
})(jQuery);
