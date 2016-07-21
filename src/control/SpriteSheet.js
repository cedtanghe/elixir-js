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
| SPRITE SHEET
|--------------------------------------------------------------------------
*/    
    
(function($)
{
    'use strict';
    
    /**
     * @param {$} element
     * @param {object} config
     */
    function SpriteSheet(element, config)
    {
        var self = this;
        self.initialize(element, config);
    }
    
    var s = SpriteSheet;
    s.STOP = 'stop';
    s.PLAY = 'play';
    s.REWIND = 'rewind';
    s.UNTIL_FINISHED = 'until_finished';
    
    var p = Elixir.Util.extend(SpriteSheet, Elixir.Core.Dispatcher);
    p._element;
    p._cols;
    p._width;
    p._height;
    p._currentFrame;
    p._totalFrames;
    p._loop;
    p._requestAnimation;
    p._requestAnimationCreated;
    p._state;
    p._until;
    
    p.initialize = function(element, config)
    {
        var self = this;
        
        self._element = element;
        self._totalFrames = config.totalFrames;
        self._cols = config.cols || config.totalFrames;
        self._width = config.width || self._element.outerWidth();
        self._height = config.height || self._element.outerHeight();
        self._loop = config.loop === true ? true : false;
        self._state = s.STOP;
        self._until = null;
        
        self._currentFrame = 0;
        self.setCurrentFrame(config.currentFrame || 0);
        
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
    };
    
    p._onAnimationTick = function(e)
    {
        var self = e.data.self;
        
        switch(self._state)
        {
            case s.PLAY:
                self.nextFrame(true);
                
                if(!self._loop && self._currentFrame == self._totalFrames - 1)
                {
                    self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
                    
                    if(!self._requestAnimation.has())
                    {
                        self._requestAnimation.cancel();
                    }
                }
            break;
            case s.REWIND:
                self.prevFrame(true);
                
                if(!self._loop && self._currentFrame == 0)
                {
                    self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
                    
                    if(!self._requestAnimation.has())
                    {
                        self._requestAnimation.cancel();
                    }
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
        
        var posX = - (self._currentFrame % self._cols) * self._width;
        var posY = - Math.floor(self._currentFrame / self._cols) * self._height;
        
        self._element.css('background-position', posX + 'px ' + posY + 'px');
        
        if(null !== self._until && self._until == self._currentFrame)
        {
            self.stop();
            
            self.trigger(s.UNTIL_FINISHED, { frame:self._currentFrame });
            self._until = null;
        }
        else if(!preserveUntil)
        {
            self._until = null;
        }
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
    
    p.play = function(preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self._state = s.PLAY;
        
        if(!preserveUntil)
        {
            self._until = null;
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
    
    p.playUntil = function(until)
    {
        var self = this;
        
        self._until = until;
        self.play(true);
    };
    
    p.rewind = function(preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        self._state = s.REWIND;
        
        if(!preserveUntil)
        {
            self._until = null;
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
    
    p.rewindUntil = function(until)
    {
        var self = this;
        
        self._until = until;
        self.rewind(true);
    };
    
    p.stop = function(preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        
        self._requestAnimation.off(Elixir.Control.RequestAnimation.ANIMATION_TICK, self._onAnimationTick);
        self._state = s.STOP;
        
        if(!preserveUntil)
        {
            self._until = null;
        }
    };
    
    p.gotoAndPlay = function(frame, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        
        if(!preserveUntil)
        {
            self._until = null;
        }
        
        self.setCurrentFrame(frame);
        self.play();
    };
    
    p.gotoAndPlayUntil = function(frame, until)
    {
        var self = this;
        
        self._until = until;
        self.setCurrentFrame(frame);
        self.play(true);
    };
    
    p.gotoAndRewind = function(frame, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        
        if(!preserveUntil)
        {
            self._until = null;
        }
        
        self.setCurrentFrame(frame);
        self.rewind();
    };
    
    p.gotoAndRewindUntil = function(frame, until)
    {
        var self = this;
        
        self._until = until;
        self.setCurrentFrame(frame);
        self.rewind(true);
    };
    
    p.gotoAndStop = function(frame, preserveUntil)
    {
        preserveUntil = true === preserveUntil ? true : false;
        
        var self = this;
        
        if(!preserveUntil)
        {
            self._until = null;
        }
        
        self.setCurrentFrame(frame);
        self.stop();
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
        
        self._element = null;
    };
    
    Elixir.Control.SpriteSheet = SpriteSheet;
})(jQuery);