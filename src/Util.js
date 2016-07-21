/**
 * @use Jquery
 */

this.Elixir = this.Elixir || {};

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
    
    /**
     * @param {string} name
     * @returns {Boolean}
     */
    s.isPolyfilled = function(name)
    {
        return s._polyfill[name] === true;
    };
    
    /**
     * @param {string} name
     * @returns {Boolean}
     */
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
    
    /**
     * @param {string} childClass
     * @param {string} superClass
     * @returns {object}
     */
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
    
    /**
     * @param {number} value
     * @param {number} round
     * @returns {number}
     */
    s.round = function(value, round)
    {
        return Math.round(value / round) * round;
    };
    
    /**
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    s.random = function(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
      
    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
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
	
    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
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

    /**
     * @param {number} value
     * @param {number} min1
     * @param {number} max1
     * @param {number} min2
     * @param {number} max2
     * @returns {number}
     */
    s.map = function(value, min1, max1, min2, max2) 
    {
        return interpolate(normalize(value, min1, max1), min2, max2);
    };
    
    /**
     * @param {array} arr
     * @returns {array}
     */
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
    
    /**
     * @param {string} str
     * @returns {Boolean}
     */
    s.isNotEmpty = function(str)
    {
        var pattern = /^\s*$/;
        return !pattern.test(str);
    };
    
    /**
     * @param {string} mail
     * @returns {Boolean}
     */
    s.isEmail = function(mail)
    {
        var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return pattern.test(mail);
    };
    
    /**
     * @param {string} str
     * @param {RegExp} regex
     * @returns {Boolean}
     */
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
