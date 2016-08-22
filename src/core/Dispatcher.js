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

    p.initialize = function()
    {};

    p.has = function(e, callback)
    {
        e = e || null;
        callback = callback || null;

        var self = this;
        var events = $._data($(self)[0], 'events');

        if (events) {
            if (null === e) {
                return true;
            }

            var evs = events['event_' + e];

            if (evs) {
                if (null === callback) {
                    return true;
                }

                var i;

                for (i in evs)
                {
                    if (evs[i].handler === callback) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    p.on = function(e, paramsOrCallback, callback)
    {
        var self = this;

        $(self).on(
                'event_' + e,
                arguments.length === 3 ? paramsOrCallback : {},
                arguments.length === 3 ? callback : paramsOrCallback
                );
    };

    p.off = function(e, callback)
    {
        var self = this;
        $(self).off('event_' + e, callback);
    };

    p.trigger = function(e, params)
    {
        var self = this;
        params = params || {};

        $(self).trigger($.Event('event_' + e, params));
    };

    Elixir.Core.Dispatcher = Dispatcher;
})(jQuery);
