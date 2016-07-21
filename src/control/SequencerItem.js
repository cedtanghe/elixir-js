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
    p.item;
    p.status;
    p.launch;
    p.launchCallbackOrEvent;
    p.close;
    p.closeCallbackOrEvent;
    p._launchId;
    p._closeId;
    
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
    
    /**
     * @param {function} callback
     * @param {number} time
     */
    p.launchTime = function(callback, time)
    {
        var self = this;
        clearTimeout(self._launchId);
        
        self._launchId = setTimeout(
            function()
            {
                if(self.status == Elixir.Control.Sequencer.CLOSE_FINISHED)
                {
                    callback(self.item);
                }
            }, 
            time
        );
    };
    
    /**
     * @param {function} callback
     * @param {number} time
     */
    p.closeTime = function(callback, time)
    {
        var self = this;
        clearTimeout(self._closeId);
        
        self._closeId = setTimeout(
            function()
            {
                if(self.status == Elixir.Control.Sequencer.LAUNCH_FINISHED)
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
