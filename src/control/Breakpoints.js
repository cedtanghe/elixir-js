/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.Dispatcher
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| BREAKPOINTS
|--------------------------------------------------------------------------
*/

(function($)
{
    'use strict';
    
    /**
     * @param {object} breakpoints
     */
    function Breakpoints(breakpoints)
    {
        var self = this;
        self.initialize(breakpoints);
    }
    
    var s = Breakpoints;
    s.BREAKPOINT_CHANGE = 'breakpoint_change';
    s.BOOTSTRAP_BREAKPOINTS = {
        'xs': $('<div class="min-xs"></div>'),
        'sm': $('<div class="min-sm"></div>'),
        'md': $('<div class="min-md"></div>'),
        'lg': $('<div class="min-lg"></div>')
    };
    
    var p = Elixir.Util.extend(Breakpoints, Elixir.Core.Dispatcher);
    p._current;
    p._breakpoints;
    
    p.initialize = function(breakpoints)
    {
        var self = this;
        self._current = null;
        self._breakpoints = breakpoints || s.BOOTSTRAP_BREAKPOINTS;
        
        var i;
        
        for(i in self._breakpoints)
        {
            self._breakpoints[i].appendTo('body');
        }
        
        self.getCurrent(); 
    };
    
    p.startObserver = function()
    {
        var self = this;
        $(window).on('resize', {self:self}, self._onWindowResize);
    };
    
    p.stopObserver = function()
    {
        var self = this;
        $(window).off('resize', {self:self}, self._onWindowResize);
    };
    
    p._onWindowResize = function(e)
    {
        var self = e.data.self;
        self.getCurrent();
    };
    
    /**
     * @param {string} keyOrElement
     * @returns {string | $}
     */
    p.getCurrent = function(keyOrElement)
    {
        var self = this;
        var i;
        var key = null;
        var element = null;
        var breakpoint;
        
        for(i in self._breakpoints)
        {
            breakpoint = self._breakpoints[i];
            
            if (self.is(i))
            {
                key = i;
                element = breakpoint;
            }
        }
        
        if(null !== element && self._current != element)
        {
            self._current = element;
            self.trigger(s.BREAKPOINT_CHANGE, {current:element});
        }
        else
        {
            self._current = element;
        }
        
        if(keyOrElement == 'key')
        {
            return key;
        }
        else
        {    
            return element;
        }
    };
    
    /**
     * @param {string} key
     * @returns {boolean}
     */
    p.is = function(key)
    {
        var self = this;
        return self._breakpoints[key].is(':visible');
    };
    
    p.destroy = function()
    {
        var i;
        
        for(i in self._breakpoints)
        {
            self._breakpoints[i].remove();
        }
        
        self.stopObserver();
        self._current = null;
        self._breakpoints = null;
    };
    
    Elixir.Control.Breakpoints = Breakpoints;
})(jQuery);
