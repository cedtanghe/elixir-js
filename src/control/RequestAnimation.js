/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.Dispatcher
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
 |--------------------------------------------------------------------------
 | REQUEST ANIMATION
 |--------------------------------------------------------------------------
 */

(function($)
{
    'use strict';

    function RequestAnimation(delay, rep)
    {
        var self = this;
        self.initialize(delay, rep);
    }

    var s = RequestAnimation;
    s.ANIMATION_START = 'animation_start';
    s.ANIMATION_TICK = 'animation_tick';
    s.ANIMATION_COMPLETE = 'animation_complete';
    s.ANIMATION_CANCEL = 'animation_cancel';

    var p = Elixir.Util.extend(RequestAnimation, Elixir.Core.Dispatcher);
    p._id = null;
    p._callbacks = null;
    p._then = null;
    p._counter = null;
    p._delay = null;
    p._rep = null;
    p._isRun = null;

    p.initialize = function(delay, rep)
    {
        var self = this;

        self._id = null;
        self._callbacks = [];
        self._then = 0;
        self._delay = delay ? (delay > 1000 / 60 ? delay : false) : false;
        self._rep = rep || 0;
        self._counter = 0;
        self._isRun = false;

        Elixir.Util.polyfill('requestAnimationFrame');
        Elixir.Util.polyfill('Date.now');
    };

    p.getDelay = function()
    {
        var self = this;
        return self._delay;
    };

    p.getRep = function()
    {
        var self = this;
        return self._rep;
    };

    p.getCount = function()
    {
        var self = this;
        return self._counter;
    };

    p.isRun = function()
    {
        var self = this;
        return self._isRun;
    };

    p.isComplete = function()
    {
        var self = this;
        return self._rep > 0 && self._counter === self._rep;
    };

    p.add = function(callback, params)
    {
        var self = this;
        self._callbacks.push([callback, params]);
    };

    p.remove = function(callback)
    {
        var self = this;
        var i = self._callbacks.length;

        while (i--) {
            if (self._callbacks[i] === callback) {
                self._callbacks.splice(i, 1);
                break;
            }
        }
    };

    p.run = function()
    {
        var self = this;

        if (self.isRun()) {
            return;
        }

        if (null !== self._id) {
            self.cancel();
        }

        self._isRun = true;
        self._then = Date.now();
        self._counter = 0;

        self.trigger(s.ANIMATION_START);
        self._tick(self);
    };

    p._tick = function(self)
    {
        var i;
        var data;

        requestAnimationFrame(
                function()
                {
                    self._tick(self);
                }
        );

        var now = Date.now();
        var delta = now - self._then;

        if (false === self._delay || delta > self._delay) {
            self._then = now - (delta % self._delay);
            self._counter++;

            if (self._counter === Number.MAX_VALUE - 1) {
                self._counter = 0;
            }

            for (i in self._callbacks)
            {
                data = self._callbacks[i];
                data[0](data[1]);
            }

            self.trigger(s.ANIMATION_TICK);

            if (self._rep > 0 && self._counter === self._rep) {
                self.trigger(s.ANIMATION_COMPLETE);
                self.cancel();
            }
        }
    };

    p.cancel = function()
    {
        var self = this;

        if (null !== self._id) {
            cancelAnimationFrame(self._id);
            self._id = null;

            if (!self.isComplete()) {
                self.trigger(s.ANIMATION_CANCEL);
            }
        }
        
        self._isRun = false;
    };

    p.destroy = function()
    {
        var self = this;

        self.cancel();
        self._callbacks = null;
    };

    Elixir.Control.RequestAnimation = RequestAnimation;
})(jQuery);
