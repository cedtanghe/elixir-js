/**
 * @use Jquery
 */

this.Elixir = this.Elixir || {};

/*
|--------------------------------------------------------------------------
| UTIL
|--------------------------------------------------------------------------
*/

(function($)
{
    'use strict';
    
    function Util()
    {
        var self = this;
        self.initialize();
    }
    
    var s = Util;
    s._polyfill = {};
    
    s.isPolyfilled = function(name)
    {
        return s._polyfill[name] === true;
    };
    
    s.polyfill = function(name)
    {
        if(!s.isPolyfilled(name))
        {
            switch(name)
            {
                case 'Object.create':
                    if(typeof Object.create !== 'function') 
                    {
                        Object.create = function(o, props) 
                        {
                            function F(){}
                            F.prototype = o;

                            if(typeof (props) === 'object') 
                            {
                                var prop;
                                
                                for(prop in props) 
                                {
                                    if(props.hasOwnProperty((prop))) 
                                    {
                                        F[prop] = props[prop];
                                    }
                                }
                            }

                            return new F();
                        };
                    }
                    
                    s._polyfill[name] = true;
                break;
                case 'requestAnimationFrame':
                    var lastTime = 0;
                    var vendors = ['ms', 'moz', 'webkit', 'o'];
                    var x;
                    
                    for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
                    {
                        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || 
                                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
                    }

                    if (!window.requestAnimationFrame)
                    {
                        window.requestAnimationFrame = function(callback, element)
                        {
                            var currTime = new Date().getTime();
                            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                            var id = window.setTimeout(
                                function() 
                                {
                                    callback(currTime + timeToCall);
                                },
                                timeToCall
                            );
                            
                            lastTime = currTime + timeToCall;
                            return id;
                        };
                    }

                    if (!window.cancelAnimationFrame)
                    {
                        window.cancelAnimationFrame = function(id)
                        {
                            clearTimeout(id);
                        };
                    }
                break;
                case 'Date.now':
                    if (!Date.now) 
                    {
                        Date.now = function now() 
                        {
                            return new Date().getTime();
                        };
                    }
                break;
                default:
                    return false;
            }
            
            return true;
        }
        
        return true;
    };
    
    s.extend = function(childClass, superClass)
    {
        s.polyfill('Object.create');
        
        var p;
        
        for(p in superClass)
        {
            childClass[p] = superClass[p];
        }
        
        childClass.prototype = Object.create(superClass.prototype);
        childClass.prototype.constructor = childClass;
        
        return childClass.prototype;
    };
    
    s.round = function(value, round)
    {
        return Math.round(value / round) * round;
    };
    
    s.random = function(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    s.normalize = function(value, min, max)
    {
        if(value < min)
        {
            value = min;
        }
        else if(value > max)
        {
            value = max;
        }

        return (value - min) / (max - min);
    };
    
    s.interpolate = function(value, min, max) 
    {
        if (value < 0)
        {
            value = 0;
        }
        else if (value > 1)
        {
            value = 1;
        }

        return min + (max - min) * value;
    };
    
    s.map = function(value, min1, max1, min2, max2) 
    {
        return interpolate(normalize(value, min1, max1), min2, max2);
    };
    
    s.pad = function(str, total)
    {
        while(str.length < total)
        {
           str = '0' + str;
        }
        
        return str;
    };
    
    s.shuffle = function(arr)
    {
        var n = arr.length;
        var i;
        var tmp;
        
        while (n--) {
            i = Math.floor(n * Math.random());
            tmp = arr[i];
            arr[i] = arr[n];
            arr[n] = tmp;
        }
        
        return arr;
    };
    
    s.isNotEmpty = function(str)
    {
        var pattern = /^\s*$/;
        return !pattern.test(str);
    };
    
    s.isEmail = function(mail)
    {
        var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return pattern.test(mail);
    };
    
    s.test = function(str, regex)
    {
        return regex.test(str);
    };
    
    var p = Util.prototype;
    
    p.initialize = function()
    {
        throw 'This class is not instantiable';
    };
    
    Elixir.Util = Util;
})(jQuery);

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
    p._current = null;
    p._breakpoints = null;
    
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
        
        if(null !== element && self._current !== element)
        {
            self._current = element;
            self.trigger(s.BREAKPOINT_CHANGE, {current:element});
        }
        else
        {
            self._current = element;
        }
        
        if(keyOrElement === 'key')
        {
            return key;
        }
        else
        {    
            return element;
        }
    };
    
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

/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.Dispatcher
 * @use Elixir.Control.RequestAnimation
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| FRAME ABSTRACT
|--------------------------------------------------------------------------
*/    
    
(function($)
{
    'use strict';
    
    function FrameAbstract(config)
    {
        var self = this;
        self.initialize(config);
    }
    
    var s = FrameAbstract;
    s.STOP = 'stop';
    s.PLAY = 'play';
    s.REWIND = 'rewind';
    s.ANIMATION_FINISHED = 'animation_finished';
    s.ANIMATION_FINISHED = 'animation_start';
    s.UNTIL_FINISHED = 'until_finished';
    
    var p = Elixir.Util.extend(FrameAbstract, Elixir.Core.Dispatcher);
    p._firstRender = null;
    p._currentFrame = null;
    p._totalFrames = null;
    p._loop = null;
    p._requestAnimation = null;
    p._requestAnimationCreated = null;
    p._state = null;
    p._until = null;
    p._startCallback = null;
    p._endCallback = null;
    p._untilCallback = null;
    p._destroy = null;
    
    p.initialize = function(config)
    {
        var self = this;
        
        self._currentFrame = config.currentFrame || 0;
        self._totalFrames = config.totalFrames;
        self._loop = config.loop === true ? true : false;
        self._until = null;
        self._startCallback = config.startCallback || null;
        self._endCallback = config.endCallback || null;
        self._untilCallback = null;
        self._firstRender = false;
        self._destroy = false;
        
        if(config.requestAnimation)
        {
            self._requestAnimation = config.requestAnimation;
            self._requestAnimationCreated = false;
            
            if(self._requestAnimation.getRep() > 0)
            {
                throw 'Invalid request animation';
            }
        }
        else
        {
            self._requestAnimation = new Elixir.Control.RequestAnimation(1000 / 24, 0);
            self._requestAnimationCreated = true;
        }
        
        self._state = s.STOP;
    };
    
    p._onAnimationTick = function(e)
    {
        var self = e.data.self;
        
        switch(self._state)
        {
            case s.PLAY:
                if(!self._loop && self._currentFrame === self._totalFrames - 1)
                {
                    self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
                    
                    if(!self._requestAnimation.has())
                    {
                        self._requestAnimation.cancel();
                    }
                    
                    self.nextFrame(true);
                    self.trigger(s.ANIMATION_FINISHED);
                    
                    if (!self._destroy && self._endCallback)
                    {
                        self._endCallback();
                    }
                }
                else
                {
                    self.nextFrame(true);
                }
            break;
            case s.REWIND:
                if(!self._loop && self._currentFrame === 0)
                {
                    self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
                    
                    if(!self._requestAnimation.has())
                    {
                        self._requestAnimation.cancel();
                    }
                    
                    self.prevFrame(true);
                    self.trigger(s.ANIMATION_FINISHED);
                    
                    if (!self._destroy && self._endCallback)
                    {
                        self._endCallback();
                    }
                }
                else
                {
                    self.prevFrame(true);
                }
            break;
        }
    };
    
    p.prevFrame = function(preserveUntil)
    {
        var self = this;
        self.setCurrentFrame(self.getCurrentFrame() - 1, preserveUntil);
    };
    
    p.nextFrame = function(preserveUntil)
    {
        var self = this;
        self.setCurrentFrame(self.getCurrentFrame() + 1, preserveUntil);
    };
    
    p.setCurrentFrame = function(value, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        
        if(value > self._totalFrames - 1)
        {
            if(self._loop)
            {
                value %= self._totalFrames;
            }
            else
            {
                value = self._totalFrames - 1;
            }
        }
        else if(value < 0)
        {
            if(self._loop)
            {
                while(value < 0)
                {
                    value += self._totalFrames;
                }
            }
            else
            {
                value = 0;
            }
        }
        
        self._currentFrame = value;
        self._draw();
        
        if (self._firstRender)
        {
            self._firstRender = false;
            self.trigger(s.ANIMATION_START);
            
            if (!self._destroy && self._startCallback)
            {
                self._startCallback();
            }
        }
        
        if(null !== self._until && self._until === self._currentFrame)
        {
            self.stop(true);
            
            self.trigger(s.UNTIL_FINISHED, { frame:self._currentFrame });
            
            if (!self._destroy && self._untilCallback)
            {
                self._untilCallback();
            }
            
            self._until = null;
            self._untilCallback = null;
        }
        else if (!preserveUntil)
        {
            self._until = null;
            self._untilCallback = null;
        }
    };
    
    p._draw = function()
    {
        throw 'This method is abstract';
    };
    
    p.getCurrentFrame = function()
    {
        var self = this;
        return self._currentFrame;
    };
    
    p.getTotalFrames = function()
    {
        var self = this;
        return self._totalFrames;
    };
    
    p._setState = function(state)
    {
        var self = this;
        self._state = state;
    };
    
    p.play = function(preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self._setState(s.PLAY);
        
        if(!preserveUntil)
        {
            self._until = null;
            self._untilCallback = null;
        }
        
        if(!self._requestAnimation.has(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick))
        {
            self._requestAnimation.on(Elixir.Control.RequestAnimation.ANIMATION_TICK, { self:self }, self._onAnimationTick);
        }
        
        if(!self._requestAnimation.isRun())
        {
            self._requestAnimation.run();
        }
    };
    
    p.playUntil = function(until, callback)
    {
        var self = this;
        
        self._until = until;
        self._untilCallback = callback;
        
        self.play(true);
    };
    
    p.rewind = function(preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self._setState(s.REWIND);
        
        if(!preserveUntil)
        {
            self._until = null;
            self._untilCallback = null;
        }
        
        if(!self._requestAnimation.has(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick))
        {
            self._requestAnimation.on(Elixir.Control.RequestAnimation.ANIMATION_TICK, { self:self }, self._onAnimationTick);
        }
        
        if(!self._requestAnimation.isRun())
        {
            self._requestAnimation.run();
        }
    };
    
    p.rewindUntil = function(until, callback)
    {
        var self = this;
        
        self._until = until;
        self._untilCallback = callback;
        
        self.rewind(true);
    };
    
    p.stop = function(preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        
        self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
        self._setState(s.STOP);
        
        if(!preserveUntil)
        {
            self._until = null;
            self._untilCallback = null;
        }
    };
    
    p.gotoAndPlay = function(frame, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self.setCurrentFrame(frame, preserveUntil);
        self.play(preserveUntil);
    };
    
    p.gotoAndPlayUntil = function(frame, until, callback)
    {
        var self = this;
        
        self._until = until;
        self._untilCallback = callback;
        
        self.setCurrentFrame(frame, true);
        self.play(true);
    };
    
    p.gotoAndRewind = function(frame, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self.setCurrentFrame(frame, preserveUntil);
        self.rewind(preserveUntil);
    };
    
    p.gotoAndRewindUntil = function(frame, until, callback)
    {
        var self = this;
        
        self._until = until;
        self._untilCallback = callback;
        
        self.setCurrentFrame(frame, true);
        self.rewind(true);
    };
    
    p.gotoAndStop = function(frame, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self.setCurrentFrame(frame, preserveUntil);
        self.stop(preserveUntil);
    };
    
    p.destroy = function()
    {
        var self = this;
        
        if(self._requestAnimationCreated)
        {
            self._requestAnimation.destroy();
        }
        
        self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
        self._requestAnimation = null;
        
        self._startCallback = null;
        self._endCallback = null;
        self._untilCallback = null;
        self._destroy = true;
    };
    
    Elixir.Control.FrameAbstract = FrameAbstract;
})(jQuery);

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
    
    var s = FrameSheet;
    s.PRELOAD_FINISHED = 'preload_finished';
    
    var p = Elixir.Util.extend(FrameSheet, Elixir.Control.FrameAbstract);
    p._context = null;
    p._element = null;
    p._startFile = null;
    p._prefixFile = null;
    p._extensionFile = null;
    p._prefixTotalNumber = null;
    p._directory = null;
    p._directoryHD = null;
    p._imageDirectory = null;
    p._preloading = null;
    p._frameDrawn = null;
    p._frames = null;
    p._cacheFrameIndex = null;
    p._cacheFrameTotal = null;
    
    p._parentInitialize = p.initialize;
    p.initialize = function(config)
    {
        var self = this;
        self._parentInitialize(config);
        
        self._element = config.element;
        self._context = self._element.toString() === '[object HTMLCanvasElement]' ? self._element.getContext('2d') : null;
        self._startFile = config.startFile || 0;
        
        if (self._startFile >= self._totalFrames)
        {
            self._startFile = self._totalFrames - 1;
        }
        
        self._prefixFile = config.prefixFile || '';
        self._extensionFile = config.extension || '.jpg';
        self._directory = config.directory;
        self._directoryHD = config.directoryHD || null;
        self._imageDirectory = self._directory;
        self._prefixTotalNumber = config.prefixTotalNumber || 0;
        self._preloading = false;
        self._frameDrawn = false;
        self._frames = {};
        
        // Load images
        self._cacheFrameIndex = self._currentFrame;
        self._cacheFrameTotal = 0;
        
        if (config.preload !== false)
        {
            self.preload(config.preloadCallback || null);
        }
        
        // Render first image
        self._draw();
    };
    
    p.preload = function(callback)
    {
        var self = this;
        self._preloading = true;
        
        self._loadImage(self._directory + self.getFile(self._cacheFrameIndex), function(image)
        {
            if (self._cacheFrameTotal < self._totalFrames)
            {
                if (self._state === s.REWIND)
                {
                    self._cacheFrameIndex--;
                    
                    if (self._cacheFrameIndex > self._currentFrame)
                    {
                        self._cacheFrameIndex = self._currentFrame - 1;
                    }
                    
                    if (self._cacheFrameIndex < 0)
                    {
                        self._cacheFrameIndex = self._totalFrames - 1;
                    }
                }
                else
                {
                    self._cacheFrameIndex++;
                    
                    if (self._cacheFrameIndex < self._currentFrame)
                    {
                        self._cacheFrameIndex = self._currentFrame + 1;
                    }
                    
                    self._cacheFrameIndex %= self._totalFrames;
                }
                
                if (self._preloading && !self._destroy)
                {
                    self.preload(callback);
                }
            }
            else
            {
                self._preloading = false;
                self.trigger(s.PRELOAD_FINISHED);
                
                if (!self._destroy && callback)
                {
                    callback();
                }
            }
        });
    };
    
    p.stopPreloading = function()
    {
        var self = this;
        self._preloading = false;
    };
    
    p.isInPreloading = function()
    {
        var self = this;
        return self._preloading;
    };
    
    p.loadRange = function(from, to, callback)
    {
        var self = this;
        
        if (from < 0)
        {
            from = 0;
        }
        
        if (to > self._totalFrames)
        {
            to = self._totalFrames;
        }
        
        if (from > to)
        {
            from = to;
        }
        
        self._loadImage(self._directory + self.getFile(from), function(image)
        {
            from++;
            
            if (from < to)
            {
                if (!self._destroy)
                {
                    self.loadRange(from, to, callback);
                }
            }
            else
            {
                if (!self._destroy && callback)
                {
                   callback();
                }
            }
        });
    };
    
    p._parentAnimationTick = p._onAnimationTick;
    p._onAnimationTick = function(e)
    {
        var self = e.data.self;
        
        if (!self._frameDrawn)
        {
            return;
        }
        
        self._parentAnimationTick(e);
    };
    
    p._parentSetState = p._setState;
    p._setState = function(state)
    {
        var self = this;
        self._parentSetState(state);
        
        if (self._state === self.STOP)
        {
            // Load HD
            self._loadImageHD();
        }
        else
        {
            clearTimeout(self._timerHD);
            self._timerHD = null;
        }
    };
    
    p._loadImageHD = function()
    {
        var self = this;
        
        if (null === self._timerHD && null !== self._directoryHD)
        {
            self._timerHD = setTimeout(function()
            {
                self._timerHD = null;
                self._imageDirectory = self._directoryHD;
                self._draw();
                self._imageDirectory = self._directory;
            }, 200);
        }
    };
    
    p._loadImage = function(src, callback)
    {
        var self = this;
        
        // Search in cache
        if(!self._frames.hasOwnProperty(src))
        {
            self._frames[src] = { src: src, loaded: false, image: null, first: true };
        }
        
        var image;
        
        if (!self._frames[src].loaded)
        {
            image = new Image();
            
            image.onload = function()
            {
                self._frames[src].image = image;
                self._frames[src].loaded = true;
                
                if (self._frames[src].first)
                {
                    self._frames[src].first = false;
                    self._cacheFrameTotal++;
                }

                if (!self._destroy && callback)
                {
                    callback(image);
                }
            };

            image.src = src;
        }
        else if (!self._destroy && callback)
        {
            image = self._frames[src].image;
            callback(image);
        }
    };
    
    p._draw = function()
    {
        var self = this;
        self._frameDrawn = false;
        
        (function(frame)
        {
            self._loadImage(self._imageDirectory + self.getFile(frame), function(image)
            {
                if (self._currentFrame !== frame)
                {
                    return;
                }

                if (null !== self._context)
                {
                    self._context.canvas.width = image.width;
                    self._context.canvas.height = image.height;

                    self._context.drawImage(
                        image, 
                        0,
                        0,
                        image.width,
                        image.height
                    );
                }
                else
                {
                    self._element.css('background-image', image.src);
                }

                self._frameDrawn = true;
            });
        })(self._currentFrame);
    };
    
    p.getPrefix = function(index)
    {
        var self = this;
        return self._prefixFile + Elixir.Util.pad(String(index), self._prefixTotalNumber);
    };
    
    p.getFile = function(index)
    {
        var self = this;
        return self.getPrefix((index + self._startFile)) + self._extensionFile;
    };
    
    p._parentDestroy = p.destroy;
    p.destroy = function()
    {
        var self = this;
        self._parentDestroy();
        
        clearTimeout(self._timerHD);
        
        var prop;
        
        for (prop in self._frames)
        {
            self._frames[prop].image = null;
        }
        
        self._frames = null;
        self._element = null;
        self._context = null;
    };
    
    Elixir.Control.FrameSheet = FrameSheet;
})(jQuery);

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
        
        while(i--)
        {
            if(self._callbacks[i] === callback)
            {
                self._callbacks.splice(i, 1);
                break;
            }
        }
    };
    
    p.run = function()
    {
        var self = this;
        
        if(self.isRun())
        {
            return;
        }
        
        if(null !== self._id)
        {
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
        
        if (false === self._delay || delta > self._delay) 
        {
            self._then = now - (delta % self._delay);
            self._counter++;
            
            if(self._counter === Number.MAX_VALUE - 1)
            {
                self._counter = 0;
            }
            
            for(i in self._callbacks)
            {
                data = self._callbacks[i];
                data[0](data[1]);
            }
            
            self.trigger(s.ANIMATION_TICK);
            
            if(self._rep > 0 && self._counter === self._rep)
            {
                self.trigger(s.ANIMATION_COMPLETE);
                self.cancel();
            }
        }
    };
    
    p.cancel = function()
    {
        var self = this;
        
        if(null !== self._id)
        {
            cancelAnimationFrame(self._id);
            self._id = null;
            
            if(!self.isComplete())
            {
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

/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.Dispatcher
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| SEQUENCER
|--------------------------------------------------------------------------
*/

(function($)
{
    'use strict';
    
    function Sequencer()
    {
        var self = this;
        self.initialize();
    }
    
    var s = Sequencer;
    s.LAUNCH = 'launch';
    s.LAUNCH_FINISHED = 'launch_finished';
    s.CLOSE = 'close';
    s.CLOSE_FINISHED = 'close_finished';
    s.ITEM_LAUNCH = 'item_launch';
    s.ITEM_LAUNCH_FINISHED = 'item_launch_finished';
    s.ITEM_CLOSE = 'item_close';
    s.ITEM_CLOSE_FINISHED = 'item_close_finished';
    
    var p = Elixir.Util.extend(Sequencer, Elixir.Core.Dispatcher);
    p._sequences = null;
    p._status = null;
    p._total = null;
    p._auto = null;
    
    p.initialize = function()
    {
        var self = this;
        self._sequences = [];
        self._status = s.CLOSE_FINISHED;
        self._total = 0;
        self._auto = false;
    };
    
    p.addItem = function(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent)
    {
        var self = this;
        var i;
        
        for(i in self._sequences)
        {
            if (self._sequences[i].item === item)
            {
                return;
            }
        }
        
        self._sequences.push(
            new Elixir.Control.SequencerItem(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent)
        );
    };
    
    p.removeItem = function(item)
    {
        var self = this;
        var i = self._sequences.length;
        var sequence;
        
        while(i--)
        {
            sequence = self._sequences[i];
            
            if(sequence.item === item)
            {
                if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent !== 'callback')
                {
                    sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
                }

                if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent !== 'callback')
                {
                    sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
                }
                
                sequence.destroy();
                
                self._sequences.splice(i, 1);
                self._checkSequence();
                
                return;
            }
        }
    };
    
    p.removeItems = function(trigger)
    {
        trigger = trigger || true;
        
        var self = this;
        var sequence;
        var i;
        
        for(i in self._sequences)
        {
            sequence = self._sequences[i];
            
            if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent !== 'callback')
            {
                sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
            }
            
            if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent !== 'callback')
            {
                sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
            }
            
            sequence.destroy();
        }
        
        self._sequences = [];
        self._checkSequence(trigger);
    };
    
    p.reverse = function()
    {
        var self = this;
        
        if (self._status !== s.CLOSE_FINISHED && self._status !== s.LAUNCH_FINISHED)
        {
            throw 'You can not reverse the sequence during a transition';
        }
        
        self._sequences.reverse();
    };
    
    p.shuffle = function()
    {
        var self = this;
        
        if (self._status !== s.CLOSE_FINISHED && self._status !== s.LAUNCH_FINISHED)
        {
            throw 'You can not shuffle the sequence during a transition';
        }
        
        Elixir.Util.shuffle(self._sequences);
    };
    
    p.inTransition = function()
    {
        var self = this;
        return self._status === s.LAUNCH || self._status === s.CLOSE;
    };
    
    p.getItemStatus = function(item)
    {
        var self = this;
        var i;
        var sequence;

        for(i in self._sequences)
        {
            sequence = self._sequences[i];
            
            if(sequence.item === item)
            {
                return item.status;
            }
        }
        
        return null;
    };
    
    p.getStatus = function()
    {
        var self = this;
        return self._status;
    };
    
    p.setStatus = function(value)
    {
        var self = this;
        
        switch(value)
        {
            case s.LAUNCH:
            case s.LAUNCH_FINISHED:
            case s.CLOSE:
            case s.CLOSE_FINISHED:
                self._status = value;
                var i;
                var sequence;

                for(i in self._sequences)
                {
                    sequence = self._sequences[i];
                    sequence.status = self._status;
                }
            break;
        }
    };
    
    p.autoLaunch = function()
    {
        var self = this;
        
        if(self._sequences.length === 0)
        {
            self._status = s.LAUNCH;
            self._checkSequence();
        }
        else
        {
            self._auto = true;
            self.launchItem();
        }
    };
    
    p.launch = function(time)
    {
        time = time || 0;
        
        var self = this;
        
        if(self._sequences.length === 0)
        {
            self._status = s.LAUNCH;
            self._checkSequence();
        }
        else
        {
            var c = 0;
            var i;
            var sequence;
            
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                self.launchItem(sequence.item, time * c);
                c++;
            }
        }
    };
    
    p.launchItem = function(item, time)
    {
        time = time || 0;
        item = item || null;
        
        var self = this;
        
        if(self._status === s.CLOSE)
        {
            throw 'A type transition is already underway "close"';
        }
        else if(self._status === s.CLOSE_FINISHED)
        {
            self._total = 0;
            self.trigger(s.LAUNCH);
        }
        
        self._status = s.LAUNCH;
        
        var i;
        var sequence;
        var found = false;
        
        for(i in self._sequences)
        {
            sequence = self._sequences[i];
            
            if(null !== item)
            {
                if(sequence.item === item)
                {
                    if(sequence.status !== s.LAUNCH && sequence.status !== s.LAUNCH_FINISHED)
                    {
                        found = true;
                    }
                    
                    break;
                }
            }
            else if(sequence.status !== s.LAUNCH && sequence.status !== s.LAUNCH_FINISHED)
            {
                found = true;
                break;
            }
        }
        
        if(found)
        {
            if(time > 0)
            {
                sequence.launchTime(function(item){self.launchItem(item);}, time);
                return;
            }

            self.trigger(s.ITEM_LAUNCH, {item:sequence.item});
            sequence.status = s.LAUNCH;
            
            if(null === sequence.launchCallbackOrEvent)
            {
                sequence.launch(sequence.item);
                self._transitionItemFinished(sequence.item);
            }
            else if(sequence.launchCallbackOrEvent === 'callback')
            {
                sequence.launch(
                    sequence.item,
                    function() 
                    {
                        self._transitionItemFinished(sequence.item);
                    }
                );
            }
            else
            {
                sequence.item.on(sequence.launchCallbackOrEvent, {self:self}, self._transitionItemEventFinished);
                sequence.launch(sequence.item);
            }
        }
    };
    
    p.autoClose = function()
    {
        var self = this;
        
        if(self._sequences.length === 0)
        {
            self._status = s.CLOSE;
            self._checkSequence();
        }
        else
        {
            self._auto = true;
            self.closeItem();
        }
    };
    
    p.close = function(time)
    {
        time = time || 0;
        
        var self = this;
        
        if(self._sequences.length === 0)
        {
            self._status = s.CLOSE;
            self._checkSequence();
        }
        else
        {
            var c = 0;
            var i;
            var sequence;
            
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                self.closeItem(sequence.item, time * c);
                
                c++;
            }
        }
    };
    
    p.closeItem = function(item, time)
    {
        time = time || 0;
        item = item || null;
        
        var self = this;
        
        if(self._status === s.LAUNCH)
        {
            throw 'A type transition is already underway "launch"';
        }
        else if(self._status === s.LAUNCH_FINISHED)
        {
            self._total = 0;
            self.trigger(s.CLOSE);
        }
        
        self._status = s.CLOSE;
        
        var i;
        var sequence;
        var found = false;
        
        for(i in self._sequences)
        {
            sequence = self._sequences[i];
            
            if(null !== item)
            {
                if(sequence.item === item)
                {
                    if(sequence.status !== s.CLOSE && sequence.status !== s.CLOSE_FINISHED)
                    {
                        found = true;
                    }
                    
                    break;
                }
            }
            else if(sequence.status !== s.CLOSE && sequence.status !== s.CLOSE_FINISHED)
            {
                found = true;
                break;
            }
        }
        
        if(found)
        {
            if(time > 0)
            {
                sequence.closeTime(function(item){ self.closeItem(item); }, time);
                return;
            }

            self.trigger(s.ITEM_CLOSE, {item:sequence.item});
            sequence.status = s.CLOSE;
            
            if(null === sequence.closeCallbackOrEvent)
            {
                sequence.close(sequence.item);
                self._transitionItemFinished(sequence.item);
            }
            else if(sequence.closeCallbackOrEvent === 'callback')
            {
                sequence.close(
                    sequence.item,
                    function() 
                    {
                        self._transitionItemFinished(sequence.item);
                    }
                );
            }
            else
            {
                sequence.item.on(sequence.closeCallbackOrEvent, {self:self}, self._transitionItemEventFinished);
                sequence.close(sequence.item);
            }
        }
    };
    
    p._transitionItemEventFinished = function(e)
    {
        var self = e.data.self;
        self._transitionItemFinished(e.currentTarget);
    };
    
    p._transitionItemFinished = function(item)
    {
        var self = this;
        var sequence;
        var i;
        
        self._total++;
        
        if (self._status === s.LAUNCH)
        {
            if (self._total === self._sequences.length)
            {
                self._auto = false;
            }
            
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if(sequence.item === item)
                {
                    if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent !== 'callback')
                    {
                        sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
                    }
                    
                    sequence.status = s.LAUNCH_FINISHED;
                    self.trigger(s.ITEM_LAUNCH_FINISHED, {item:sequence.item});
                    
                    break;
                }
            }
            
            if(true === self._auto)
            {
                self.launchItem();
            }
            else
            {
                self._checkSequence();
            }
        }
        else
        {
            if(self._total === self._sequences.length)
            {
                self._auto = false;
            }

            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if(sequence.item === item)
                {
                    if(null !== sequence.closeCallbackOrEvent && sequence.closeCallbackOrEvent !== 'callback')
                    {
                        sequence.item.off(sequence.closeCallbackOrEvent, self._transitionItemEventFinished);
                    }
                    
                    sequence.status = s.CLOSE_FINISHED;
                    self.trigger(s.ITEM_CLOSE_FINISHED, {item:sequence.item});
                    
                    break;
                }
            }

            if(true === self._auto)
            {
                self.closeItem();
            }
            else
            {
                self._checkSequence();
            }
        }
    };
    
    p._checkSequence = function(trigger)
    {
        trigger = trigger || true;
        
        var self = this;
        var sequence;
        var i;
	
        if(self._status === s.LAUNCH)
        {
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if (sequence.status !== s.LAUNCH_FINISHED)
                {
                    return;
                }
            }

            self._status = s.LAUNCH_FINISHED;
            
            if(trigger)
            {
                self.trigger(s.LAUNCH_FINISHED);
            }
        }
        else if(self._status === s.CLOSE)
        {
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if (sequence.status !== s.CLOSE_FINISHED)
                {
                    return;
                }
            }

            self._status = s.CLOSE_FINISHED;
            
            if(trigger)
            {
                self.trigger(s.CLOSE_FINISHED);
            }
        }
    };
    
    p.destroy = function()
    {
        var self = this;
        
        self.removeItems(false);
        self._sequences = null;
    };
    
    Elixir.Control.Sequencer = Sequencer;
})(jQuery);

/**
 * @use Jquery
 * @use Elixir.Util
 * @use Elixir.Core.Dispatcher
 * @use Elixir.Control.Sequencer
 */

this.Elixir = this.Elixir || {};
this.Elixir.Control = this.Elixir.Control || {};

/*
|--------------------------------------------------------------------------
| SEQUENCER ITEM
|--------------------------------------------------------------------------
*/    
    
(function($)
{
    'use strict';
    
    /**
     * @internal
     * @see Elixir.Control.Sequencer#addItem
     */
    function SequencerItem(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent)
    {
        var self = this;
        self.initialize(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent);
    }
    
    var p = SequencerItem.prototype;
    p.item = null;
    p.status = null;
    p.launch = null;
    p.launchCallbackOrEvent = null;
    p.close = null;
    p.closeCallbackOrEvent = null;
    p._launchId = null;
    p._closeId = null;
    
    p.initialize = function(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent)
    {
        var self = this;
        
        self.item = item || null;
        self.status = Elixir.Control.Sequencer.CLOSE_FINISHED;
        self.launch = launch || null;
        self.launchCallbackOrEvent = launchCallbackOrEvent || null;
        self.close = close || null;
        self.closeCallbackOrEvent = closeCallbackOrEvent || null;
        self._launchId = null;
        self._closeId = null;
    };
    
    p.launchTime = function(callback, time)
    {
        var self = this;
        clearTimeout(self._launchId);
        
        self._launchId = setTimeout(
            function()
            {
                if(self.status === Elixir.Control.Sequencer.CLOSE_FINISHED)
                {
                    callback(self.item);
                }
            }, 
            time
        );
    };
    
    p.closeTime = function(callback, time)
    {
        var self = this;
        clearTimeout(self._closeId);
        
        self._closeId = setTimeout(
            function()
            {
                if(self.status === Elixir.Control.Sequencer.LAUNCH_FINISHED)
                {
                    callback(self.item);
                }
            }, 
            time
        );
    };
    
    p.destroy = function()
    {
        var self = this;
        
        clearTimeout(self._launchId);
        clearTimeout(self._closeId);
        
        self.item = null;
        self.launch = null;
        self.launchCallbackOrEvent = null;
        self.close = null;
        self.closeCallbackOrEvent = null;
    };
    
    Elixir.Control.SequencerItem = SequencerItem;
})(jQuery);

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
