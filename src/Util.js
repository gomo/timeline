//Util
Timeline.Util = {};
Timeline.Util.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    if(Object.create){
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    }
    else
    {
        var f = function (){};
        f.prototype = superCtor.prototype;
        ctor.prototype = new f();
        ctor.constructor = ctor;
    }
};