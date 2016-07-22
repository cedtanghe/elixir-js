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
