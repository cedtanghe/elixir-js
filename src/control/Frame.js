/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.FrameAbstract
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| FRAME
|--------------------------------------------------------------------------
*/    
    
(function($)
{
    'use strict';
    
    function Frame(element, config)
    {
        var self = this;
        self.initialize(element, config);
    }
    
    var p = Elixir.Util.extend(Frame, Elixir.Core.FrameAbstract);
    
    p._parent = p.initialize;
    p.initialize = function(element, config)
    {
        var self = this;
        
        // Todo
        
        self._parent(element, config);
    };
    
    p.draw = function()
    {
        var self = this;
        
    };
    
    Elixir.Control.Frame = Frame;
})(jQuery);
