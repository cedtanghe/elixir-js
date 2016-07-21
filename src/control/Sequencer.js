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
    p._sequences;
    p._status;
    p._total;
    p._auto;
    
    p.initialize = function()
    {
        var self = this;
        self._sequences = [];
        self._status = s.CLOSE_FINISHED;
        self._total = 0;
        self._auto = false;
    };
    
    /**
     * @param {mixed} item
     * @param {function} launch
     * @param {function|string} launchCallbackOrEvent
     * @param {function} close
     * @param {function|string} closeCallbackOrEvent
     */
    p.addItem = function(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent)
    {
        var self = this;
        var i;
        
        for(i in self._sequences)
        {
            if (self._sequences[i].item == item)
            {
                return;
            }
        }
        
        self._sequences.push(
            new Elixir.Control.SequencerItem(item, launch, launchCallbackOrEvent, close, closeCallbackOrEvent)
        );
    };
    
    /**
     * @param {mixed} item
     */
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
                if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent != 'callback')
                {
                    sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
                }

                if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent != 'callback')
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
    
    /**
     * @param {boolean} trigger
     */
    p.removeItems = function(trigger)
    {
        trigger = trigger || true;
        
        var self = this;
        var sequence;
        var i;
        
        for(i in self._sequences)
        {
            sequence = self._sequences[i];
            
            if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent != 'callback')
            {
                sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
            }
            
            if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent != 'callback')
            {
                sequence.item.off(sequence.launchCallbackOrEvent, self._transitionItemEventFinished);
            }
            
            sequence.destroy();
        }
        
        self._sequences = [];
        self._checkSequence(trigger);
    };
    
    /**
     * @throws
     */
    p.reverse = function()
    {
        var self = this;
        
        if (self._status != s.CLOSE_FINISHED && self._status != s.LAUNCH_FINISHED)
        {
            throw 'You can not reverse the sequence during a transition';
        }
        
        self._sequences.reverse();
    };
    
    /**
     * @throws
     */
    p.shuffle = function()
    {
        var self = this;
        
        if (self._status != s.CLOSE_FINISHED && self._status != s.LAUNCH_FINISHED)
        {
            throw 'You can not shuffle the sequence during a transition';
        }
        
        Elixir.Util.shuffle(self._sequences);
    };
    
    /**
     * @returns {boolean}
     */
    p.inTransition = function()
    {
        var self = this;
        return self._status == s.LAUNCH || self._status == s.CLOSE;
    };
    
    /**
     * @param {mixed} item
     * @returns {string}
     */
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
    
    /**
     * @returns {string}
     */
    p.getStatus = function()
    {
        var self = this;
        return self._status;
    };
    
    /**
     * @param {string} value
     */
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
        
        if(self._sequences.length == 0)
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
    
    /**
     * @param {number} time
     */
    p.launch = function(time)
    {
        time = time || 0;
        
        var self = this;
        
        if(self._sequences.length == 0)
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
    
    /**
     * @param {mixed} item
     * @param {number} time
     */
    p.launchItem = function(item, time)
    {
        time = time || 0;
        item = item || null;
        
        var self = this;
        
        if(self._status == s.CLOSE)
        {
            throw 'A type transition is already underway "close"';
        }
        else if(self._status == s.CLOSE_FINISHED)
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
                    if(sequence.status != s.LAUNCH && sequence.status != s.LAUNCH_FINISHED)
                    {
                        found = true;
                    }
                    
                    break;
                }
            }
            else if(sequence.status != s.LAUNCH && sequence.status != s.LAUNCH_FINISHED)
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
            else if(sequence.launchCallbackOrEvent == 'callback')
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
        
        if(self._sequences.length == 0)
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
    
    /**
     * @param {number} time
     */
    p.close = function(time)
    {
        time = time || 0;
        
        var self = this;
        
        if(self._sequences.length == 0)
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
    
    /**
     * @param {mixed} item
     * @param {number} time
     */
    p.closeItem = function(item, time)
    {
        time = time || 0;
        item = item || null;
        
        var self = this;
        
        if(self._status == s.LAUNCH)
        {
            throw 'A type transition is already underway "launch"';
        }
        else if(self._status == s.LAUNCH_FINISHED)
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
                    if(sequence.status != s.CLOSE && sequence.status != s.CLOSE_FINISHED)
                    {
                        found = true;
                    }
                    
                    break;
                }
            }
            else if(sequence.status != s.CLOSE && sequence.status != s.CLOSE_FINISHED)
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
            else if(sequence.closeCallbackOrEvent == 'callback')
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
        
        if (self._status == s.LAUNCH)
        {
            if (self._total == self._sequences.length)
            {
                self._auto = false;
            }
            
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if(sequence.item === item)
                {
                    if(null !== sequence.launchCallbackOrEvent && sequence.launchCallbackOrEvent != 'callback')
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
            if(self._total == self._sequences.length)
            {
                self._auto = false;
            }

            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if(sequence.item === item)
                {
                    if(null !== sequence.closeCallbackOrEvent && sequence.closeCallbackOrEvent != 'callback')
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
	
        if(self._status == s.LAUNCH)
        {
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if (sequence.status != s.LAUNCH_FINISHED)
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
        else if(self._status == s.CLOSE)
        {
            for(i in self._sequences)
            {
                sequence = self._sequences[i];
                
                if (sequence.status != s.CLOSE_FINISHED)
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
