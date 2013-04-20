Timeline = {};

//Compatibility for ecma3
if( Object.create === undefined ) {
    Object.create = function(o, props) {
        var newObj;

        if (typeof(o) !== "object" && o !== null) throw new TypeError();

        function F() {}
        F.prototype = o;
        newObj = new F();

        if (typeof(props) === "object") {
            for (var prop in props) {
                if (props.hasOwnProperty((prop))) {
                    newObj[prop] = props[prop];
                }
            }
        }

        return newObj;
    };
}

if ( Object.getPrototypeOf === undefined ) {
    if ( typeof "test".__proto__ === "object" ) {
        Object.getPrototypeOf = function(object){
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function(object){
            return object.constructor.prototype;
        };
    }
}

//Event
Timeline.events ={};
Timeline.addEventListener = function(key, callback){

    var keys = key.split('.');
    var eventName = keys[0];
    if(!Timeline.events[eventName]){
        Timeline.events[eventName] = [];
    }

    if(keys[1])
    {
        Timeline.events[eventName].push({callback: callback, ns:keys[1]});
    }
    else
    {
        Timeline.events[eventName].push({callback: callback});
    }
};

Timeline.fireEvent = function(eventName, params){
    if(Timeline.events[eventName]){
        $.each(Timeline.events[eventName], function(){
            this.callback(params);
        });
    }
};

Timeline.removeEventListener = function(key){

    var keys = key.split('.');
    var eventName = keys[0];

    if(Timeline.events[eventName]){
        var events = [];
        if(keys[1]){
            $.each(Timeline.events[eventName], function(){
                var data = this;
                if(!data.ns || data.ns != keys[1]){
                    events.push(data);
                }
            });
        }

        Timeline.events[eventName] = events;
    }
};

//Util
Timeline.Util = {};
Timeline.Util.inherits = function(childClass, superClass){
    childClass.super_ = superClass;
    childClass.prototype = Object.create(superClass.prototype);
};