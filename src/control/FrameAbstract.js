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
