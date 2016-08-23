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
    p._enableHD = null;
    p._imageDirectory = null;
    p._preloading = null;
    p._frameDrawn = null;
    p._frames = null;
    p._cacheFrameIndex = null;
    p._cacheFrameTotal = null;
    p._width = null;
    p._height = null;

    p._parentInitialize = p.initialize;
    p.initialize = function(config)
    {
        var self = this;
        self._parentInitialize(config);

        self._element = config.element;
        self._context = self._element.toString() === '[object HTMLCanvasElement]' ? self._element.getContext('2d') : null;
        self._height = config.height || null;
        self._startFile = config.startFile || 0;
        self._prefixFile = config.prefixFile || '';
        self._extensionFile = config.extension || '.jpg';
        self._directory = config.directory;
        self._directoryHD = config.directoryHD || null;
        self._enableHD = config.enableHD || null !== self._directoryHD;
        self._imageDirectory = self._directory;
        self._prefixTotalNumber = config.prefixTotalNumber || 0;
        self._preloading = false;
        self._frameDrawn = false;
        self._frames = {};
        
        self._width = config.width || null;
        self._height = config.height || null;
        
        // Load images
        self._cacheFrameIndex = self._currentFrame;
        self._cacheFrameTotal = 0;
        
        if (config.preload !== false) {
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
            if (self._cacheFrameTotal < self._totalFrames) {
                if (self._state === s.REWIND) {
                    self._cacheFrameIndex--;

                    if (self._cacheFrameIndex > self._currentFrame) {
                        self._cacheFrameIndex = self._currentFrame - 1;
                    }

                    if (self._cacheFrameIndex < 0) {
                        self._cacheFrameIndex = self._totalFrames - 1;
                    }
                }
                else {
                    self._cacheFrameIndex++;

                    if (self._cacheFrameIndex < self._currentFrame) {
                        self._cacheFrameIndex = self._currentFrame + 1;
                    }

                    self._cacheFrameIndex %= self._totalFrames;
                }

                if (self._preloading && !self._destroy) {
                    self.preload(callback);
                }
            }
            else {
                self._preloading = false;
                self.trigger(s.PRELOAD_FINISHED);

                if (!self._destroy && callback) {
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

        if (from < 0) {
            from = 0;
        }

        if (to > self._totalFrames) {
            to = self._totalFrames;
        }

        if (from > to) {
            from = to;
        }

        self._loadImage(self._directory + self.getFile(from), function(image)
        {
            from++;

            if (from < to) {
                if (!self._destroy) {
                    self.loadRange(from, to, callback);
                }
            }
            else {
                if (!self._destroy && callback) {
                    callback();
                }
            }
        });
    };
    
    p.setWidth = function(value)
    {
        var self = this;
        
        self._width = value;
        self._draw();
    };
    
    p.getWidth = function()
    {
        var self = this;
        return self._width || self._context.canvas.width;
    };
    
    p.setHeight = function(value)
    {
        var self = this;
        
        self._height = value;
        self._draw();
    };
    
    p.getHeight = function()
    {
        var self = this;
        return self._height || self._context.canvas.height;
    };
    
    p._parentAnimationTick = p._onAnimationTick;
    p._onAnimationTick = function(e)
    {
        var self = e.data.self;

        if (!self._frameDrawn) {
            return;
        }

        self._parentAnimationTick(e);
    };

    p._parentSetState = p._setState;
    p._setState = function(state)
    {
        var self = this;
        self._parentSetState(state);

        if (self._state === self.STOP && self.isHD()) {
            // Load HD
            self._loadImageHD();
        }
        else if (null !== self._timerHD) {
            clearTimeout(self._timerHD);
            self._timerHD = null;
        }
    };

    p.enableHD = function(value)
    {
        var self = this;
        self._enableHD = value;

        if (!self._enableHD && null !== self._timerHD) {
            clearTimeout(self._timerHD);
            self._timerHD = null;
        }
    };

    p.isHD = function(value)
    {
        var self = this;
        return self._enableHD && null !== self._directoryHD;
    };

    p._loadImageHD = function()
    {
        var self = this;

        if (null === self._timerHD && null !== self._directoryHD && self._enableHD) {
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
        if (!self._frames.hasOwnProperty(src)) {
            self._frames[src] = {src: src, loaded: false, image: null, first: true};
        }

        var image;

        if (!self._frames[src].loaded) {
            image = new Image();

            image.onload = function()
            {
                self._frames[src].image = image;
                self._frames[src].loaded = true;

                if (self._frames[src].first) {
                    self._frames[src].first = false;
                    self._cacheFrameTotal++;
                }

                if (!self._destroy && callback) {
                    callback(image);
                }
            };

            image.src = src;
        }
        else if (!self._destroy && callback) {
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
                if (self._currentFrame !== frame) {
                    return;
                }

                if (null !== self._context) {
                    
                    var w = null !== self._width ? self._width : image.width;
                    var h = null !== self._height ? self._height : image.height;
                    
                    self._context.canvas.width = w;
                    self._context.canvas.height = h;

                    self._context.drawImage(
                        image,
                        0,
                        0,
                        w,
                        h
                    );
                }
                else {
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
