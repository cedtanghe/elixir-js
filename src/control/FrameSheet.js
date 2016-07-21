/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.FrameAbstract
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| FRAME SHEET
|--------------------------------------------------------------------------
*/    
    
(function($)
{
    'use strict';
    
    function FrameSheet(config)
    {
        var self = this;
        self.initialize(config);
    }
    
    var p = Elixir.Util.extend(FrameSheet, Elixir.Core.FrameAbstract);
    p._context = null;
    p._element = null;
    p._width = null;
    p._height = null;
    p._startFile = null;
    p._prefixFile = null;
    p._extensionFile = null;
    p._prefixTotalNumber = null;
    p._loadPackageOf = null;
    p._directory = null;
    p._directoryHD = null;
    
    p._parent = p.initialize;
    p.initialize = function(config)
    {
        var self = this;
        self._parent(config);
        
        self._element = config.element;
        self._context = self._element.toString() === '[object HTMLCanvasElement]' ? self._element.getContext('2d') : null;
        self._width = config.width || self._element.outerWidth();
        self._height = config.height || self._element.outerHeight();
        self._startFile = config.startFile || 0;
        
        if (self._startFile > self._totalFrames)
        {
            self._startFile = self._totalFrames - 1;
        }
        
        self._prefixFile = config.prefixFile || '';
        self._extensionFile = config.extension || '.jpg';
        self._directory = config.directory;
        self._directoryHD = config.directoryHD || null;
        self._prefixTotalNumber = config.prefixTotalNumber || 0;
        self._loadPackageOf = config.loadPackageOf || 30;
        
        if (self._loadPackageOf > self._totalFrames)
        {
            self._loadPackageOf = Math.floor(self._totalFrames / 2);
        }
    };
    
    p.draw = function()
    {
        var self = this;
        var img = 'todo';
        
        self._context.drawImage(img, 0, 0, self._width, self._height);
    };
    
    p.getPrefix = function(index)
    {
        var self = this;
        return self._prefixFile + self.pad(index, self._prefixTotalNumber);
    };
    
    p.getFile = function(index)
    {
        var self = this;
        return self.getPrefix((index + self._startFile)) + self._extensionFile;
    };
    
    p._parent = p.destroy;
    p.destroy = function()
    {
        var self = this;
        self._element = null;
        self._context = null;
        
        self._parent();
    };
    
    Elixir.Control.FrameSheet = FrameSheet;
})(jQuery);
