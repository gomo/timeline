//Compatibility for ecma3
if ( Array.prototype.forEach === undefined ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}

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

//Util
Timeline.Util = {};
Timeline.Util.inherits = function(childClass, superClass){
    childClass.super_ = superClass;
    childClass.prototype = Object.create(superClass.prototype);
};