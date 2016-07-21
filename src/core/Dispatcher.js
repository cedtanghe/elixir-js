/**
 * @use Jquery
 */

this.Elixir = this.Elixir || {};
this.Elixir.Core = this.Elixir.Core || {};

/*
|--------------------------------------------------------------------------
| DISPATCHER
|--------------------------------------------------------------------------
*/

(function($)
{
    'use strict';
    
    function Dispatcher()
    {
        var self = this;
        self.initialize();
    }
    
    var p = Dispatcher.prototype;
    
    p.initialize = function(){};
    
    /**
     * @param {string|null} e
     * @param {function} callback
     * @returns {Boolean}
     */
    p.has = function(e, callback)
    {
        e = e || null;
        callback = callback || null;
        
        var self = this;
        var events = $._data($(self)[0], 'events');
        
        if(events)
        {
            if(null === e)
            {
                return true;
            }
            
            var evs = events['event_' + e];
            
            if(evs)
            {
                if(null === callback)
                {
                    return true;
                }
                
                var i;
                
                for(i in evs)
                {
                    if(evs[i].handler === callback)
                    {
                        return true;
                    }
                }
            }
        }
        
        return false;
    };
    
    /**
     * @param {string} e
     * @param {function|object} paramsOrCallback
     * @param {function} function
     */
    p.on = function(e, paramsOrCallback, callback)
    {
        var self = this;
        var params = arguments.length == 3 ? paramsOrCallback : {};
        var callback = arguments.length == 3 ? callback : paramsOrCallback;
        
        $(self).on('event_' + e, params, callback);
    };
    
    /**
     * @param {string} e
     * @param {function} callback
     */
    p.off = function(e, callback)
    {
        var self = this;
        $(self).off('event_' + e, callback);
    };
    
    /**
     * @param {string} e
     * @param {object} params
     */
    p.trigger = function(e, params)
    {
        var self = this;
        params = params || {};
        
        $(self).trigger($.Event('event_' + e, params));
    };
    
    Elixir.Core.Dispatcher = Dispatcher;
})(jQuery);
