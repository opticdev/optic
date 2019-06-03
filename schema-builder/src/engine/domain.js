/* eslint-disable */

'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;




// Where to send exports

var $e = exports;





$env["exportsNamespace"] = $e;


// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "envInfo": $env,
  "semantics": {




    "asInstanceOfs": 1,








    "arrayIndexOutOfBounds": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false,

  "linkerVersion": "0.6.27",
  "globalThis": this
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields




















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};



var $throwArrayIndexOutOfBoundsException = function(i) {
  var msg = (i === null) ? null : ("" + i);



  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ArrayIndexOutOfBoundsException().init___T(msg));

};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};


var $moduleDefault = function(m) {
  return (m && (typeof m === "object") && "default" in m) ? m["default"] : m;
};


var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;


  if (srcPos < 0 || destPos < 0 || length < 0 ||
      (srcPos > ((srcu.length - length) | 0)) ||
      (destPos > ((destu.length - length) | 0))) {
    $throwArrayIndexOutOfBoundsException(null);
  }


  if (srcu !== destu || destPos < srcPos || (((srcPos + length) | 0) < destPos)) {
    for (var i = 0; i < length; i = (i + 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  } else {
    for (var i = (length - 1) | 0; i >= 0; i = (i - 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return typeof v === "number" && (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return typeof v === "number" && (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return typeof v === "number" && (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;


  ArrayClass.prototype.get = function(i) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    return this.u[i];
  };
  ArrayClass.prototype.set = function(i, v) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    this.u[i] = v;
  };


  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };






































  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

function $is_F1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F1)))
}
function $as_F1(obj) {
  return (($is_F1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function1"))
}
function $isArrayOf_F1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F1)))
}
function $asArrayOf_F1(obj, depth) {
  return (($isArrayOf_F1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function1;", depth))
}
function $is_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType)))
}
function $as_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.package$Primitives$PrimitiveType"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.package$Primitives$PrimitiveType;", depth))
}
function $is_Lcom_seamless_contexts_rfc_Events$RfcEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_rfc_Events$RfcEvent)))
}
function $as_Lcom_seamless_contexts_rfc_Events$RfcEvent(obj) {
  return (($is_Lcom_seamless_contexts_rfc_Events$RfcEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.rfc.Events$RfcEvent"))
}
function $isArrayOf_Lcom_seamless_contexts_rfc_Events$RfcEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_rfc_Events$RfcEvent)))
}
function $asArrayOf_Lcom_seamless_contexts_rfc_Events$RfcEvent(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_rfc_Events$RfcEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.rfc.Events$RfcEvent;", depth))
}
function $f_Lcom_seamless_ddd_EventSourcedAggregate__noEffect__Lcom_seamless_ddd_Effects($thiz) {
  return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector($as_sci_Vector($m_s_package$().Vector$1.apply__sc_Seq__sc_GenTraversable($m_sci_Nil$())))
}
/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable($thiz) {
  var this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call($thiz)
  } else {
    return $as_jl_Throwable($thiz)
  }
}
function $is_sc_GenTraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
}
function $as_sc_GenTraversableOnce(obj) {
  return (($is_sc_GenTraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
}
function $isArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
}
function $asArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (($isArrayOf_sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
}
function $f_sci_VectorPointer__copyOf__AO__AO($thiz, a) {
  var copy = $newArrayObject($d_O.getArrayOf(), [a.u.length]);
  $systemArraycopy(a, 0, copy, 0, a.u.length);
  return copy
}
function $f_sci_VectorPointer__gotoNextBlockStart__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
  } else if ((xor < 32768)) {
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 1048576)) {
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 33554432)) {
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get(0), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 1073741824)) {
    $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & ((index >>> 25) | 0))), 1));
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get(0), 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get(0), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__gotoFreshPosWritable1__I__I__I__V($thiz, oldIndex, newIndex, xor) {
  $f_sci_VectorPointer__stabilize__I__V($thiz, oldIndex);
  $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V($thiz, oldIndex, newIndex, xor)
}
function $f_sci_VectorPointer__getElem__I__I__O($thiz, index, xor) {
  if ((xor < 32)) {
    return $thiz.display0__AO().get((31 & index))
  } else if ((xor < 1024)) {
    return $asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 32768)) {
    return $asArrayOf_O($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 1048576)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1).get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 33554432)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1).get((31 & ((index >>> 15) | 0))), 1).get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 1073741824)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display5__AO().get((31 & ((index >>> 25) | 0))), 1).get((31 & ((index >>> 20) | 0))), 1).get((31 & ((index >>> 15) | 0))), 1).get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V($thiz, oldIndex, newIndex, xor) {
  if ((!(xor < 32))) {
    if ((xor < 1024)) {
      if (($thiz.depth__I() === 1)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display1__AO().set((31 & ((oldIndex >>> 5) | 0)), $thiz.display0__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 32768)) {
      if (($thiz.depth__I() === 2)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display2__AO().set((31 & ((oldIndex >>> 10) | 0)), $thiz.display1__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((newIndex >>> 10) | 0))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1048576)) {
      if (($thiz.depth__I() === 3)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display3__AO().set((31 & ((oldIndex >>> 15) | 0)), $thiz.display2__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((newIndex >>> 15) | 0))), 1));
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((newIndex >>> 10) | 0))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 33554432)) {
      if (($thiz.depth__I() === 4)) {
        $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display4__AO().set((31 & ((oldIndex >>> 20) | 0)), $thiz.display3__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((newIndex >>> 20) | 0))), 1));
      if (($thiz.display3__AO() === null)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((newIndex >>> 15) | 0))), 1));
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((newIndex >>> 10) | 0))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1073741824)) {
      if (($thiz.depth__I() === 5)) {
        $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display5__AO().set((31 & ((oldIndex >>> 25) | 0)), $thiz.display4__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & ((newIndex >>> 25) | 0))), 1));
      if (($thiz.display4__AO() === null)) {
        $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((newIndex >>> 20) | 0))), 1));
      if (($thiz.display3__AO() === null)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((newIndex >>> 15) | 0))), 1));
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((newIndex >>> 10) | 0))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $f_sci_VectorPointer__gotoPosWritable1__I__I__I__V($thiz, oldIndex, newIndex, xor) {
  if ((xor < 32)) {
    var a = $thiz.display0__AO();
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a))
  } else if ((xor < 1024)) {
    var a$1 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
    $thiz.display1__AO().set((31 & ((oldIndex >>> 5) | 0)), $thiz.display0__AO());
    var array = $thiz.display1__AO();
    var index = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index))
  } else if ((xor < 32768)) {
    var a$2 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
    var a$3 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
    $thiz.display1__AO().set((31 & ((oldIndex >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((oldIndex >>> 10) | 0)), $thiz.display1__AO());
    var array$1 = $thiz.display2__AO();
    var index$1 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$1, index$1));
    var array$2 = $thiz.display1__AO();
    var index$2 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$2, index$2))
  } else if ((xor < 1048576)) {
    var a$4 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
    var a$5 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
    var a$6 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
    $thiz.display1__AO().set((31 & ((oldIndex >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((oldIndex >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((oldIndex >>> 15) | 0)), $thiz.display2__AO());
    var array$3 = $thiz.display3__AO();
    var index$3 = (31 & ((newIndex >>> 15) | 0));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$3, index$3));
    var array$4 = $thiz.display2__AO();
    var index$4 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$4, index$4));
    var array$5 = $thiz.display1__AO();
    var index$5 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$5, index$5))
  } else if ((xor < 33554432)) {
    var a$7 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
    var a$8 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
    var a$9 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
    var a$10 = $thiz.display4__AO();
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
    $thiz.display1__AO().set((31 & ((oldIndex >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((oldIndex >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((oldIndex >>> 15) | 0)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & ((oldIndex >>> 20) | 0)), $thiz.display3__AO());
    var array$6 = $thiz.display4__AO();
    var index$6 = (31 & ((newIndex >>> 20) | 0));
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$6, index$6));
    var array$7 = $thiz.display3__AO();
    var index$7 = (31 & ((newIndex >>> 15) | 0));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$7, index$7));
    var array$8 = $thiz.display2__AO();
    var index$8 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$8, index$8));
    var array$9 = $thiz.display1__AO();
    var index$9 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$9, index$9))
  } else if ((xor < 1073741824)) {
    var a$11 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
    var a$12 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
    var a$13 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
    var a$14 = $thiz.display4__AO();
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
    var a$15 = $thiz.display5__AO();
    $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$15));
    $thiz.display1__AO().set((31 & ((oldIndex >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((oldIndex >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((oldIndex >>> 15) | 0)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & ((oldIndex >>> 20) | 0)), $thiz.display3__AO());
    $thiz.display5__AO().set((31 & ((oldIndex >>> 25) | 0)), $thiz.display4__AO());
    var array$10 = $thiz.display5__AO();
    var index$10 = (31 & ((newIndex >>> 25) | 0));
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$10, index$10));
    var array$11 = $thiz.display4__AO();
    var index$11 = (31 & ((newIndex >>> 20) | 0));
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$11, index$11));
    var array$12 = $thiz.display3__AO();
    var index$12 = (31 & ((newIndex >>> 15) | 0));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$12, index$12));
    var array$13 = $thiz.display2__AO();
    var index$13 = (31 & ((newIndex >>> 10) | 0));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$13, index$13));
    var array$14 = $thiz.display1__AO();
    var index$14 = (31 & ((newIndex >>> 5) | 0));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$14, index$14))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__copyRange__AO__I__I__AO($thiz, array, oldLeft, newLeft) {
  var elems = $newArrayObject($d_O.getArrayOf(), [32]);
  $systemArraycopy(array, oldLeft, elems, newLeft, ((32 - ((newLeft > oldLeft) ? newLeft : oldLeft)) | 0));
  return elems
}
function $f_sci_VectorPointer__gotoPos__I__I__V($thiz, index, xor) {
  if ((!(xor < 32))) {
    if ((xor < 1024)) {
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 32768)) {
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 1048576)) {
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 33554432)) {
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 1073741824)) {
      $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & ((index >>> 25) | 0))), 1));
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $f_sci_VectorPointer__gotoPosWritable0__I__I__V($thiz, newIndex, xor) {
  var x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      var array = $thiz.display5__AO();
      var index = (31 & ((newIndex >>> 25) | 0));
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index));
      var array$1 = $thiz.display4__AO();
      var index$1 = (31 & ((newIndex >>> 20) | 0));
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$1, index$1));
      var array$2 = $thiz.display3__AO();
      var index$2 = (31 & ((newIndex >>> 15) | 0));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$2, index$2));
      var array$3 = $thiz.display2__AO();
      var index$3 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$3, index$3));
      var array$4 = $thiz.display1__AO();
      var index$4 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$4, index$4));
      break
    }
    case 4: {
      var a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      var array$5 = $thiz.display4__AO();
      var index$5 = (31 & ((newIndex >>> 20) | 0));
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$5, index$5));
      var array$6 = $thiz.display3__AO();
      var index$6 = (31 & ((newIndex >>> 15) | 0));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$6, index$6));
      var array$7 = $thiz.display2__AO();
      var index$7 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$7, index$7));
      var array$8 = $thiz.display1__AO();
      var index$8 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$8, index$8));
      break
    }
    case 3: {
      var a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      var array$9 = $thiz.display3__AO();
      var index$9 = (31 & ((newIndex >>> 15) | 0));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$9, index$9));
      var array$10 = $thiz.display2__AO();
      var index$10 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$10, index$10));
      var array$11 = $thiz.display1__AO();
      var index$11 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$11, index$11));
      break
    }
    case 2: {
      var a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      var array$12 = $thiz.display2__AO();
      var index$12 = (31 & ((newIndex >>> 10) | 0));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$12, index$12));
      var array$13 = $thiz.display1__AO();
      var index$13 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$13, index$13));
      break
    }
    case 1: {
      var a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      var array$14 = $thiz.display1__AO();
      var index$14 = (31 & ((newIndex >>> 5) | 0));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$14, index$14));
      break
    }
    case 0: {
      var a$5 = $thiz.display0__AO();
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__stabilize__I__V($thiz, index) {
  var x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      var a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      var a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      var a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      var a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      $thiz.display5__AO().set((31 & ((index >>> 25) | 0)), $thiz.display4__AO());
      $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO());
      $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 4: {
      var a$5 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      var a$6 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
      var a$7 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
      var a$8 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
      $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO());
      $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 3: {
      var a$9 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
      var a$10 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
      var a$11 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
      $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 2: {
      var a$12 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
      var a$13 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 1: {
      var a$14 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index) {
  var x = array.get(index);
  array.set(index, null);
  var a = $asArrayOf_O(x, 1);
  return $f_sci_VectorPointer__copyOf__AO__AO($thiz, a)
}
function $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V($thiz, that, depth) {
  $thiz.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $thiz.display5$und$eq__AO__V(that.display5__AO());
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    if (($thiz.depth__I() === 1)) {
      $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display1__AO().set(0, $thiz.display0__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO())
  } else if ((xor < 32768)) {
    if (($thiz.depth__I() === 2)) {
      $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display2__AO().set(0, $thiz.display1__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO())
  } else if ((xor < 1048576)) {
    if (($thiz.depth__I() === 3)) {
      $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display3__AO().set(0, $thiz.display2__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO())
  } else if ((xor < 33554432)) {
    if (($thiz.depth__I() === 4)) {
      $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display4__AO().set(0, $thiz.display3__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO())
  } else if ((xor < 1073741824)) {
    if (($thiz.depth__I() === 5)) {
      $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display5__AO().set(0, $thiz.display4__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO());
    $thiz.display5__AO().set((31 & ((index >>> 25) | 0)), $thiz.display4__AO())
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
var $d_scm_HashEntry = new $TypeData().initClass({
  scm_HashEntry: 0
}, true, "scala.collection.mutable.HashEntry", {
  scm_HashEntry: 1
});
function $f_scm_HashTable$HashUtils__improve__I__I__I($thiz, hcode, seed) {
  var i = $m_s_util_hashing_package$().byteswap32__I__I(hcode);
  return (((i >>> seed) | 0) | (i << ((-seed) | 0)))
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$() {
  $c_O.call(this);
  this.primitivesMap$1 = null;
  this.primitiveArray$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype = $c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.init___ = (function() {
  $n_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$ = this;
  var this$5 = $m_sjs_js_JSConverters$JSRichGenMap$();
  var jsx$2 = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$().all__sc_Seq();
  var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(i$2) {
      var i = $as_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(i$2);
      var self = i.id__T();
      return new $c_T2().init___O__O(self, i)
    })
  })(this));
  var this$3 = $m_sc_Seq$();
  var map = $as_sc_TraversableOnce(jsx$2.map__F1__scg_CanBuildFrom__O(jsx$1, this$3.ReusableCBFInstance$2)).toMap__s_Predef$$less$colon$less__sci_Map($m_s_Predef$().singleton$und$less$colon$less$2);
  var result = {};
  map.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, result$1) {
    return (function(x0$1$2) {
      var x0$1 = $as_T2(x0$1$2);
      if ((x0$1 !== null)) {
        var key = $as_T(x0$1.$$und1$f);
        var value = x0$1.$$und2$f;
        result$1[key] = value
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    })
  })(this$5, result)));
  this.primitivesMap$1 = result;
  var jsx$3 = $m_sjs_js_JSConverters$JSRichGenTraversableOnce$();
  var col = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$().all__sc_Seq();
  this.primitiveArray$1 = jsx$3.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array(col);
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.newId__T = (function() {
  var this$1 = $m_s_util_Random$().alphanumeric__sci_Stream().take__I__sci_Stream(10);
  return ("shape_" + this$1.mkString__T__T__T__T("", "", ""))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.$$js$exported$meth$newId__O = (function() {
  return this.newId__T()
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.newConceptId__T = (function() {
  var this$1 = $m_s_util_Random$().alphanumeric__sci_Stream().take__I__sci_Stream(10);
  return ("concept_" + this$1.mkString__T__T__T__T("", "", ""))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.$$js$exported$prop$primitiveArray__O = (function() {
  return this.primitiveArray$1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.$$js$exported$meth$newConceptId__O = (function() {
  return this.newConceptId__T()
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.$$js$exported$prop$primitivesMap__O = (function() {
  return this.primitivesMap$1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.$$js$exported$meth$refTo__T__O = (function(string) {
  return new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT().init___T(string)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.refTo = (function(arg$1) {
  var prep0 = $as_T(arg$1);
  return this.$$js$exported$meth$refTo__T__O(prep0)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype, "primitiveArray", {
  "get": (function() {
    return this.$$js$exported$prop$primitiveArray__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype, "primitivesMap", {
  "get": (function() {
    return this.$$js$exported$prop$primitivesMap__O()
  }),
  "configurable": true
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.newConceptId = (function() {
  return this.$$js$exported$meth$newConceptId__O()
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.newId = (function() {
  return this.$$js$exported$meth$newId__O()
});
var $d_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$: 0
}, false, "com.seamless.contexts.data_types.DataTypesServiceHelper$", {
  Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$: 1,
  O: 1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$;
var $n_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$)) {
    $n_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$ = new $c_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$
}
function $is_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$DataTypesEvent"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$DataTypesEvent;", depth))
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Validators$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Validators$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Validators$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Validators$.prototype = $c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(id, schemaId, state) {
  var this$1 = state.components$1;
  var this$2 = this$1.iterator__sc_Iterator();
  var res = false;
  while (((!res) && this$2.hasNext__Z())) {
    var arg1 = this$2.next__O();
    var i = $as_T2(arg1);
    if (($as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(i.$$und2$f).conceptId$1 === schemaId)) {
      var x = i.$$und1$f;
      res = ((x === null) ? (id === null) : $objectEquals(x, id))
    } else {
      res = false
    }
  };
  var requirement = res;
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + (("Id " + id) + " does not exist in schema ")) + schemaId))
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.requireIdType__T__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(id, enforceType, reason, state) {
  var this$1 = state.components$1.get__O__s_Option(id);
  if ((!this$1.isEmpty__Z())) {
    var arg1 = this$1.get__O();
    var i = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(arg1);
    var x = i.type$1;
    var isValid = ((x === null) ? (enforceType === null) : x.equals__O__Z(enforceType))
  } else {
    var isValid = false
  };
  if ((!isValid)) {
    throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + (((id + " must be type ") + enforceType) + " to ")) + reason))
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.idIsUnused__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(id, idType, state) {
  var this$1 = state.components$1;
  if ((!this$1.contains__O__Z(id))) {
    var this$2 = state.concepts$1;
    var this$3 = this$2.iterator__sc_Iterator();
    var res = false;
    while (((!res) && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var x$1 = $as_T2(arg1);
      var x = x$1.$$und1$f;
      res = ((x === null) ? (id === null) : $objectEquals(x, id))
    };
    var isValid = (!res)
  } else {
    var isValid = false
  };
  if ((!isValid)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: ${idType} ${id} is not unique")
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.refTypeExists__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__Lcom_seamless_contexts_data$undtypes_DataTypesState__Z = (function(newType, state) {
  return ((!newType.isRef__Z()) || state.concepts$1.contains__O__Z($as_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(newType).conceptId$1))
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.isValidField__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(fieldId, state) {
  var fieldOption = state.components$1.get__O__s_Option(fieldId);
  var requirement = fieldOption.isDefined__Z();
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + ("Field " + fieldId)) + " not found"))
  };
  var field = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(fieldOption.get__O());
  if (field.key$1.isDefined__Z()) {
    var this$2 = state.components$1.get__O__s_Option(field.parentId$1);
    if ((!this$2.isEmpty__Z())) {
      var arg1 = this$2.get__O();
      var i = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(arg1);
      var isValid = (i.type$1.hasFields__Z() && $as_sc_SeqLike(i.fields$1.get__O()).contains__O__Z(fieldId))
    } else {
      var isValid = false
    }
  } else {
    var isValid = false
  };
  if ((!isValid)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Field no longer valid")
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.isValidTypeParameter__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(typeParamId, state) {
  var typeParamOption = state.components$1.get__O__s_Option(typeParamId);
  var requirement = typeParamOption.isDefined__Z();
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + ("Type parameter " + typeParamId)) + " not found"))
  };
  var typeParam = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(typeParamOption.get__O());
  if (typeParam.key$1.isEmpty__Z()) {
    var this$2 = state.components$1.get__O__s_Option(typeParam.parentId$1);
    if ((!this$2.isEmpty__Z())) {
      var arg1 = this$2.get__O();
      var i = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(arg1);
      var isValid = (i.type$1.hasTypeParameters__Z() && $as_sc_SeqLike(i.typeParameters$1.get__O()).contains__O__Z(typeParamId))
    } else {
      var isValid = false
    }
  } else {
    var isValid = false
  };
  if ((!isValid)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Type Param no longer valid")
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.requireIdTakesTypeParameters__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(id, reason, state) {
  var this$1 = state.components$1.get__O__s_Option(id);
  if ((!this$1.isEmpty__Z())) {
    var arg1 = this$1.get__O();
    var i = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(arg1);
    var isValid = i.type$1.hasTypeParameters__Z()
  } else {
    var isValid = false
  };
  if ((!isValid)) {
    throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + (id + " must support type parameters to ")) + reason))
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.isValidField__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState__V = (function(field, state) {
  if (field.key$1.isDefined__Z()) {
    var this$1 = state.components$1.get__O__s_Option(field.parentId$1);
    if ((!this$1.isEmpty__Z())) {
      var arg1 = this$1.get__O();
      var i = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(arg1);
      var x = i.type$1;
      var x$2 = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$();
      var isValid = ((x !== null) && x.equals__O__Z(x$2))
    } else {
      var isValid = false
    }
  } else {
    var isValid = false
  };
  if ((!isValid)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Field no longer valid")
  }
});
var $d_Lcom_seamless_contexts_data$undtypes_Validators$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Validators$: 0
}, false, "com.seamless.contexts.data_types.Validators$", {
  Lcom_seamless_contexts_data$undtypes_Validators$: 1,
  O: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Validators$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Validators$;
var $n_Lcom_seamless_contexts_data$undtypes_Validators$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_Validators$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_Validators$)) {
    $n_Lcom_seamless_contexts_data$undtypes_Validators$ = new $c_Lcom_seamless_contexts_data$undtypes_Validators$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_Validators$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype.all__sc_Seq = (function() {
  var jsx$1 = $m_sc_Seq$();
  var array = [$m_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$(), $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$(), $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$(), $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$(), $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$(), $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$()];
  return $as_sc_Seq(jsx$1.apply__sc_Seq__sc_GenTraversable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(array)))
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$: 1,
  O: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$
}
function $is_Lcom_seamless_contexts_rfc_Commands$RfcCommand(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_rfc_Commands$RfcCommand)))
}
function $as_Lcom_seamless_contexts_rfc_Commands$RfcCommand(obj) {
  return (($is_Lcom_seamless_contexts_rfc_Commands$RfcCommand(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.rfc.Commands$RfcCommand"))
}
function $isArrayOf_Lcom_seamless_contexts_rfc_Commands$RfcCommand(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_rfc_Commands$RfcCommand)))
}
function $asArrayOf_Lcom_seamless_contexts_rfc_Commands$RfcCommand(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_rfc_Commands$RfcCommand(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.rfc.Commands$RfcCommand;", depth))
}
/** @constructor */
function $c_Lcom_seamless_contexts_rfc_Composition$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_rfc_Composition$.prototype = new $h_O();
$c_Lcom_seamless_contexts_rfc_Composition$.prototype.constructor = $c_Lcom_seamless_contexts_rfc_Composition$;
/** @constructor */
function $h_Lcom_seamless_contexts_rfc_Composition$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_rfc_Composition$.prototype = $c_Lcom_seamless_contexts_rfc_Composition$.prototype;
$c_Lcom_seamless_contexts_rfc_Composition$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_rfc_Composition$.prototype.forwardTo__Lcom_seamless_ddd_EventSourcedAggregate__O__O__Lcom_seamless_ddd_Effects = (function(aggregate, command, state) {
  return (aggregate.handleCommand__O__s_PartialFunction(state).isDefinedAt__O__Z(command) ? $as_Lcom_seamless_ddd_Effects(aggregate.handleCommand__O__s_PartialFunction(state).apply__O__O(command)) : new $c_Lcom_seamless_ddd_Effects().init___sci_Vector($as_sci_Vector($m_s_package$().Vector$1.apply__sc_Seq__sc_GenTraversable($m_sci_Nil$()))))
});
var $d_Lcom_seamless_contexts_rfc_Composition$ = new $TypeData().initClass({
  Lcom_seamless_contexts_rfc_Composition$: 0
}, false, "com.seamless.contexts.rfc.Composition$", {
  Lcom_seamless_contexts_rfc_Composition$: 1,
  O: 1
});
$c_Lcom_seamless_contexts_rfc_Composition$.prototype.$classData = $d_Lcom_seamless_contexts_rfc_Composition$;
var $n_Lcom_seamless_contexts_rfc_Composition$ = (void 0);
function $m_Lcom_seamless_contexts_rfc_Composition$() {
  if ((!$n_Lcom_seamless_contexts_rfc_Composition$)) {
    $n_Lcom_seamless_contexts_rfc_Composition$ = new $c_Lcom_seamless_contexts_rfc_Composition$().init___()
  };
  return $n_Lcom_seamless_contexts_rfc_Composition$
}
/** @constructor */
function $c_Lcom_seamless_ddd_EventSourcedRepository() {
  $c_O.call(this);
  this.aggregate$1 = null;
  this.eventStore$1 = null
}
$c_Lcom_seamless_ddd_EventSourcedRepository.prototype = new $h_O();
$c_Lcom_seamless_ddd_EventSourcedRepository.prototype.constructor = $c_Lcom_seamless_ddd_EventSourcedRepository;
/** @constructor */
function $h_Lcom_seamless_ddd_EventSourcedRepository() {
  /*<skip>*/
}
$h_Lcom_seamless_ddd_EventSourcedRepository.prototype = $c_Lcom_seamless_ddd_EventSourcedRepository.prototype;
$c_Lcom_seamless_ddd_EventSourcedRepository.prototype.save__T__sci_Vector__V = (function(id, events) {
  this.eventStore$1.append__T__sci_Vector__V(id, events)
});
$c_Lcom_seamless_ddd_EventSourcedRepository.prototype.findById__T__O = (function(id) {
  var events = this.eventStore$1.listEvents__T__sci_Vector(id);
  var z = this.aggregate$1.initialState__O();
  var elem$1 = null;
  elem$1 = z;
  var this$2 = events.iterator__sci_VectorIterator();
  while (this$2.$$undhasNext$2) {
    var arg1 = this$2.next__O();
    var arg1$1 = elem$1;
    elem$1 = this.aggregate$1.applyEvent__O__O__O(arg1, arg1$1)
  };
  return elem$1
});
$c_Lcom_seamless_ddd_EventSourcedRepository.prototype.init___Lcom_seamless_ddd_EventSourcedAggregate__Lcom_seamless_ddd_EventStore = (function(aggregate, eventStore) {
  this.aggregate$1 = aggregate;
  this.eventStore$1 = eventStore;
  return this
});
var $d_Lcom_seamless_ddd_EventSourcedRepository = new $TypeData().initClass({
  Lcom_seamless_ddd_EventSourcedRepository: 0
}, false, "com.seamless.ddd.EventSourcedRepository", {
  Lcom_seamless_ddd_EventSourcedRepository: 1,
  O: 1
});
$c_Lcom_seamless_ddd_EventSourcedRepository.prototype.$classData = $d_Lcom_seamless_ddd_EventSourcedRepository;
/** @constructor */
function $c_Lcom_seamless_ddd_EventStore() {
  $c_O.call(this)
}
$c_Lcom_seamless_ddd_EventStore.prototype = new $h_O();
$c_Lcom_seamless_ddd_EventStore.prototype.constructor = $c_Lcom_seamless_ddd_EventStore;
/** @constructor */
function $h_Lcom_seamless_ddd_EventStore() {
  /*<skip>*/
}
$h_Lcom_seamless_ddd_EventStore.prototype = $c_Lcom_seamless_ddd_EventStore.prototype;
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1.isInstance(obj))
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1.getFakeInstance()
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1.isArrayClass)
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_ju_Arrays$() {
  $c_O.call(this)
}
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
function $h_ju_Arrays$() {
  /*<skip>*/
}
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.init___ = (function() {
  return this
});
$c_ju_Arrays$.prototype.java$util$Arrays$$insertionSortAnyRef__AO__I__I__s_math_Ordering__V = (function(a, start, end, ord) {
  var n = ((end - start) | 0);
  if ((n >= 2)) {
    if ((ord.compare__O__O__I(a.get(start), a.get(((1 + start) | 0))) > 0)) {
      var temp = a.get(start);
      a.set(start, a.get(((1 + start) | 0)));
      a.set(((1 + start) | 0), temp)
    };
    var m = 2;
    while ((m < n)) {
      var next = a.get(((start + m) | 0));
      if ((ord.compare__O__O__I(next, a.get((((-1) + ((start + m) | 0)) | 0))) < 0)) {
        var iA = start;
        var iB = (((-1) + ((start + m) | 0)) | 0);
        while ((((iB - iA) | 0) > 1)) {
          var ix = ((((iA + iB) | 0) >>> 1) | 0);
          if ((ord.compare__O__O__I(next, a.get(ix)) < 0)) {
            iB = ix
          } else {
            iA = ix
          }
        };
        var ix$2 = ((iA + ((ord.compare__O__O__I(next, a.get(iA)) < 0) ? 0 : 1)) | 0);
        var i = ((start + m) | 0);
        while ((i > ix$2)) {
          a.set(i, a.get((((-1) + i) | 0)));
          i = (((-1) + i) | 0)
        };
        a.set(ix$2, next)
      };
      m = ((1 + m) | 0)
    }
  }
});
$c_ju_Arrays$.prototype.fill__AI__I__V = (function(a, value) {
  var toIndex = a.u.length;
  var i = 0;
  while ((i !== toIndex)) {
    a.set(i, value);
    i = ((1 + i) | 0)
  }
});
$c_ju_Arrays$.prototype.sort__AO__ju_Comparator__V = (function(array, comparator) {
  var ord = new $c_ju_Arrays$$anon$3().init___ju_Comparator(comparator);
  var end = array.u.length;
  if ((end > 16)) {
    this.java$util$Arrays$$stableSplitMergeAnyRef__AO__AO__I__I__s_math_Ordering__V(array, $newArrayObject($d_O.getArrayOf(), [array.u.length]), 0, end, ord)
  } else {
    this.java$util$Arrays$$insertionSortAnyRef__AO__I__I__s_math_Ordering__V(array, 0, end, ord)
  }
});
$c_ju_Arrays$.prototype.java$util$Arrays$$stableSplitMergeAnyRef__AO__AO__I__I__s_math_Ordering__V = (function(a, temp, start, end, ord) {
  var length = ((end - start) | 0);
  if ((length > 16)) {
    var middle = ((start + ((length / 2) | 0)) | 0);
    this.java$util$Arrays$$stableSplitMergeAnyRef__AO__AO__I__I__s_math_Ordering__V(a, temp, start, middle, ord);
    this.java$util$Arrays$$stableSplitMergeAnyRef__AO__AO__I__I__s_math_Ordering__V(a, temp, middle, end, ord);
    var outIndex = start;
    var leftInIndex = start;
    var rightInIndex = middle;
    while ((outIndex < end)) {
      if ((leftInIndex < middle)) {
        if ((rightInIndex >= end)) {
          var jsx$1 = true
        } else {
          var x = a.get(leftInIndex);
          var y = a.get(rightInIndex);
          var jsx$1 = $f_s_math_Ordering__lteq__O__O__Z(ord, x, y)
        }
      } else {
        var jsx$1 = false
      };
      if (jsx$1) {
        temp.set(outIndex, a.get(leftInIndex));
        leftInIndex = ((1 + leftInIndex) | 0)
      } else {
        temp.set(outIndex, a.get(rightInIndex));
        rightInIndex = ((1 + rightInIndex) | 0)
      };
      outIndex = ((1 + outIndex) | 0)
    };
    $systemArraycopy(temp, start, a, start, length)
  } else {
    this.java$util$Arrays$$insertionSortAnyRef__AO__I__I__s_math_Ordering__V(a, start, end, ord)
  }
});
var $d_ju_Arrays$ = new $TypeData().initClass({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
$c_ju_Arrays$.prototype.$classData = $d_ju_Arrays$;
var $n_ju_Arrays$ = (void 0);
function $m_ju_Arrays$() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$().init___()
  };
  return $n_ju_Arrays$
}
/** @constructor */
function $c_s_FallbackArrayBuilding() {
  $c_O.call(this)
}
$c_s_FallbackArrayBuilding.prototype = new $h_O();
$c_s_FallbackArrayBuilding.prototype.constructor = $c_s_FallbackArrayBuilding;
/** @constructor */
function $h_s_FallbackArrayBuilding() {
  /*<skip>*/
}
$h_s_FallbackArrayBuilding.prototype = $c_s_FallbackArrayBuilding.prototype;
/** @constructor */
function $c_s_LowPriorityImplicits() {
  $c_O.call(this)
}
$c_s_LowPriorityImplicits.prototype = new $h_O();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
function $h_s_LowPriorityImplicits() {
  /*<skip>*/
}
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
function $f_s_PartialFunction__runWith__F1__F1($thiz, action) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, action$1) {
    return (function(x$2) {
      var z = $this.applyOrElse__O__F1__O(x$2, $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f);
      return ((!$m_s_PartialFunction$().scala$PartialFunction$$fallbackOccurred__O__Z(z)) && (action$1.apply__O__O(z), true))
    })
  })($thiz, action))
}
function $f_s_PartialFunction__applyOrElse__O__F1__O($thiz, x, $default) {
  return ($thiz.isDefinedAt__O__Z(x) ? $thiz.apply__O__O(x) : $default.apply__O__O(x))
}
/** @constructor */
function $c_s_PartialFunction$() {
  $c_O.call(this);
  this.scala$PartialFunction$$fallback$undpf$f = null;
  this.scala$PartialFunction$$constFalse$f = null;
  this.empty$undpf$1 = null
}
$c_s_PartialFunction$.prototype = new $h_O();
$c_s_PartialFunction$.prototype.constructor = $c_s_PartialFunction$;
/** @constructor */
function $h_s_PartialFunction$() {
  /*<skip>*/
}
$h_s_PartialFunction$.prototype = $c_s_PartialFunction$.prototype;
$c_s_PartialFunction$.prototype.init___ = (function() {
  $n_s_PartialFunction$ = this;
  this.scala$PartialFunction$$fallback$undpf$f = new $c_s_PartialFunction$$anonfun$1().init___();
  this.scala$PartialFunction$$constFalse$f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      return false
    })
  })(this));
  this.empty$undpf$1 = new $c_s_PartialFunction$$anon$1().init___();
  return this
});
$c_s_PartialFunction$.prototype.scala$PartialFunction$$fallbackOccurred__O__Z = (function(x) {
  return (this.scala$PartialFunction$$fallback$undpf$f === x)
});
var $d_s_PartialFunction$ = new $TypeData().initClass({
  s_PartialFunction$: 0
}, false, "scala.PartialFunction$", {
  s_PartialFunction$: 1,
  O: 1
});
$c_s_PartialFunction$.prototype.$classData = $d_s_PartialFunction$;
var $n_s_PartialFunction$ = (void 0);
function $m_s_PartialFunction$() {
  if ((!$n_s_PartialFunction$)) {
    $n_s_PartialFunction$ = new $c_s_PartialFunction$().init___()
  };
  return $n_s_PartialFunction$
}
/** @constructor */
function $c_s_Predef$any2stringadd$() {
  $c_O.call(this)
}
$c_s_Predef$any2stringadd$.prototype = new $h_O();
$c_s_Predef$any2stringadd$.prototype.constructor = $c_s_Predef$any2stringadd$;
/** @constructor */
function $h_s_Predef$any2stringadd$() {
  /*<skip>*/
}
$h_s_Predef$any2stringadd$.prototype = $c_s_Predef$any2stringadd$.prototype;
$c_s_Predef$any2stringadd$.prototype.init___ = (function() {
  return this
});
$c_s_Predef$any2stringadd$.prototype.$$plus$extension__O__T__T = (function($$this, other) {
  return (("" + $$this) + other)
});
var $d_s_Predef$any2stringadd$ = new $TypeData().initClass({
  s_Predef$any2stringadd$: 0
}, false, "scala.Predef$any2stringadd$", {
  s_Predef$any2stringadd$: 1,
  O: 1
});
$c_s_Predef$any2stringadd$.prototype.$classData = $d_s_Predef$any2stringadd$;
var $n_s_Predef$any2stringadd$ = (void 0);
function $m_s_Predef$any2stringadd$() {
  if ((!$n_s_Predef$any2stringadd$)) {
    $n_s_Predef$any2stringadd$ = new $c_s_Predef$any2stringadd$().init___()
  };
  return $n_s_Predef$any2stringadd$
}
/** @constructor */
function $c_s_math_Ordered$() {
  $c_O.call(this)
}
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
function $h_s_math_Ordered$() {
  /*<skip>*/
}
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
$c_s_math_Ordered$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
function $m_s_math_Ordered$() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
}
/** @constructor */
function $c_s_package$() {
  $c_O.call(this);
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
}
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
function $h_s_package$() {
  /*<skip>*/
}
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Traversable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sc_Seq$();
  this.IndexedSeq$1 = $m_sc_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_$plus$colon$();
  this.$$colon$plus$1 = $m_sc_$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
function $m_s_package$() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
}
/** @constructor */
function $c_s_reflect_ClassManifestFactory$() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
}
$c_s_reflect_ClassManifestFactory$.prototype = new $h_O();
$c_s_reflect_ClassManifestFactory$.prototype.constructor = $c_s_reflect_ClassManifestFactory$;
/** @constructor */
function $h_s_reflect_ClassManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ClassManifestFactory$.prototype = $c_s_reflect_ClassManifestFactory$.prototype;
$c_s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = $m_s_reflect_ManifestFactory$ByteManifest$();
  this.Short$1 = $m_s_reflect_ManifestFactory$ShortManifest$();
  this.Char$1 = $m_s_reflect_ManifestFactory$CharManifest$();
  this.Int$1 = $m_s_reflect_ManifestFactory$IntManifest$();
  this.Long$1 = $m_s_reflect_ManifestFactory$LongManifest$();
  this.Float$1 = $m_s_reflect_ManifestFactory$FloatManifest$();
  this.Double$1 = $m_s_reflect_ManifestFactory$DoubleManifest$();
  this.Boolean$1 = $m_s_reflect_ManifestFactory$BooleanManifest$();
  this.Unit$1 = $m_s_reflect_ManifestFactory$UnitManifest$();
  this.Any$1 = $m_s_reflect_ManifestFactory$AnyManifest$();
  this.Object$1 = $m_s_reflect_ManifestFactory$ObjectManifest$();
  this.AnyVal$1 = $m_s_reflect_ManifestFactory$AnyValManifest$();
  this.Nothing$1 = $m_s_reflect_ManifestFactory$NothingManifest$();
  this.Null$1 = $m_s_reflect_ManifestFactory$NullManifest$();
  return this
});
var $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
var $n_s_reflect_ClassManifestFactory$ = (void 0);
function $m_s_reflect_ClassManifestFactory$() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$() {
  $c_O.call(this)
}
$c_s_reflect_ManifestFactory$.prototype = new $h_O();
$c_s_reflect_ManifestFactory$.prototype.constructor = $c_s_reflect_ManifestFactory$;
/** @constructor */
function $h_s_reflect_ManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$.prototype = $c_s_reflect_ManifestFactory$.prototype;
$c_s_reflect_ManifestFactory$.prototype.init___ = (function() {
  return this
});
var $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
var $n_s_reflect_ManifestFactory$ = (void 0);
function $m_s_reflect_ManifestFactory$() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
}
/** @constructor */
function $c_s_reflect_package$() {
  $c_O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
}
$c_s_reflect_package$.prototype = new $h_O();
$c_s_reflect_package$.prototype.constructor = $c_s_reflect_package$;
/** @constructor */
function $h_s_reflect_package$() {
  /*<skip>*/
}
$h_s_reflect_package$.prototype = $c_s_reflect_package$.prototype;
$c_s_reflect_package$.prototype.init___ = (function() {
  $n_s_reflect_package$ = this;
  this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
  this.Manifest$1 = $m_s_reflect_ManifestFactory$();
  return this
});
var $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
var $n_s_reflect_package$ = (void 0);
function $m_s_reflect_package$() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
}
/** @constructor */
function $c_s_util_control_Breaks() {
  $c_O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
}
$c_s_util_control_Breaks.prototype = new $h_O();
$c_s_util_control_Breaks.prototype.constructor = $c_s_util_control_Breaks;
/** @constructor */
function $h_s_util_control_Breaks() {
  /*<skip>*/
}
$h_s_util_control_Breaks.prototype = $c_s_util_control_Breaks.prototype;
$c_s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
  return this
});
var $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new $c_sr_IntRef().init___I(0);
  var b = new $c_sr_IntRef().init___I(0);
  var n = new $c_sr_IntRef().init___I(0);
  var c = new $c_sr_IntRef().init___I(1);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, b$1, c$1, n$1) {
    return (function(x$2) {
      var h = $m_sr_Statics$().anyHash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = $imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, c, n)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new $c_sr_IntRef().init___I(0);
  var h = new $c_sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, h$1, n$1) {
    return (function(x$2) {
      h$1.elem$1 = $this.mix__I__I__I(h$1.elem$1, $m_sr_Statics$().anyHash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, h, n)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
function $c_s_util_hashing_package$() {
  $c_O.call(this)
}
$c_s_util_hashing_package$.prototype = new $h_O();
$c_s_util_hashing_package$.prototype.constructor = $c_s_util_hashing_package$;
/** @constructor */
function $h_s_util_hashing_package$() {
  /*<skip>*/
}
$h_s_util_hashing_package$.prototype = $c_s_util_hashing_package$.prototype;
$c_s_util_hashing_package$.prototype.init___ = (function() {
  return this
});
$c_s_util_hashing_package$.prototype.byteswap32__I__I = (function(v) {
  var hc = $imul((-1640532531), v);
  hc = $m_jl_Integer$().reverseBytes__I__I(hc);
  return $imul((-1640532531), hc)
});
var $d_s_util_hashing_package$ = new $TypeData().initClass({
  s_util_hashing_package$: 0
}, false, "scala.util.hashing.package$", {
  s_util_hashing_package$: 1,
  O: 1
});
$c_s_util_hashing_package$.prototype.$classData = $d_s_util_hashing_package$;
var $n_s_util_hashing_package$ = (void 0);
function $m_s_util_hashing_package$() {
  if ((!$n_s_util_hashing_package$)) {
    $n_s_util_hashing_package$ = new $c_s_util_hashing_package$().init___()
  };
  return $n_s_util_hashing_package$
}
/** @constructor */
function $c_sc_$colon$plus$() {
  $c_O.call(this)
}
$c_sc_$colon$plus$.prototype = new $h_O();
$c_sc_$colon$plus$.prototype.constructor = $c_sc_$colon$plus$;
/** @constructor */
function $h_sc_$colon$plus$() {
  /*<skip>*/
}
$h_sc_$colon$plus$.prototype = $c_sc_$colon$plus$.prototype;
$c_sc_$colon$plus$.prototype.init___ = (function() {
  return this
});
var $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
var $n_sc_$colon$plus$ = (void 0);
function $m_sc_$colon$plus$() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
}
/** @constructor */
function $c_sc_$plus$colon$() {
  $c_O.call(this)
}
$c_sc_$plus$colon$.prototype = new $h_O();
$c_sc_$plus$colon$.prototype.constructor = $c_sc_$plus$colon$;
/** @constructor */
function $h_sc_$plus$colon$() {
  /*<skip>*/
}
$h_sc_$plus$colon$.prototype = $c_sc_$plus$colon$.prototype;
$c_sc_$plus$colon$.prototype.init___ = (function() {
  return this
});
var $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
var $n_sc_$plus$colon$ = (void 0);
function $m_sc_$plus$colon$() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
}
/** @constructor */
function $c_sc_Iterator$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
  /*<skip>*/
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
  return this
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
}
function $f_sc_TraversableOnce__to__scg_CanBuildFrom__O($thiz, cbf) {
  var b = cbf.apply__scm_Builder();
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.seq__sc_TraversableOnce());
  return b.result__O()
}
function $f_sc_TraversableOnce__mkString__T__T__T__T($thiz, start, sep, end) {
  var this$1 = $thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  return this$1.underlying$5.java$lang$StringBuilder$$content$f
}
function $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, first$1, b$1, sep$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($thiz, first, b, sep)));
  b.append__T__scm_StringBuilder(end);
  return b
}
function $f_sc_TraversableOnce__nonEmpty__Z($thiz) {
  return (!$thiz.isEmpty__Z())
}
function $is_sc_TraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
}
function $as_sc_TraversableOnce(obj) {
  return (($is_sc_TraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableOnce"))
}
function $isArrayOf_sc_TraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
}
function $asArrayOf_sc_TraversableOnce(obj, depth) {
  return (($isArrayOf_sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
}
/** @constructor */
function $c_scg_GenMapFactory() {
  $c_O.call(this)
}
$c_scg_GenMapFactory.prototype = new $h_O();
$c_scg_GenMapFactory.prototype.constructor = $c_scg_GenMapFactory;
/** @constructor */
function $h_scg_GenMapFactory() {
  /*<skip>*/
}
$h_scg_GenMapFactory.prototype = $c_scg_GenMapFactory.prototype;
$c_scg_GenMapFactory.prototype.apply__sc_Seq__sc_GenMap = (function(elems) {
  return $as_sc_GenMap($as_scm_Builder(this.newBuilder__scm_Builder().$$plus$plus$eq__sc_TraversableOnce__scg_Growable(elems)).result__O())
});
$c_scg_GenMapFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_MapBuilder().init___sc_GenMap(this.empty__sc_GenMap())
});
/** @constructor */
function $c_scg_GenericCompanion() {
  $c_O.call(this)
}
$c_scg_GenericCompanion.prototype = new $h_O();
$c_scg_GenericCompanion.prototype.constructor = $c_scg_GenericCompanion;
/** @constructor */
function $h_scg_GenericCompanion() {
  /*<skip>*/
}
$h_scg_GenericCompanion.prototype = $c_scg_GenericCompanion.prototype;
$c_scg_GenericCompanion.prototype.apply__sc_Seq__sc_GenTraversable = (function(elems) {
  if (elems.isEmpty__Z()) {
    return this.empty__sc_GenTraversable()
  } else {
    var b = this.newBuilder__scm_Builder();
    b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(elems);
    return $as_sc_GenTraversable(b.result__O())
  }
});
$c_scg_GenericCompanion.prototype.empty__sc_GenTraversable = (function() {
  return $as_sc_GenTraversable(this.newBuilder__scm_Builder().result__O())
});
function $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs) {
  _loop: while (true) {
    var this$1 = xs;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
      $thiz.$$plus$eq__O__scg_Growable(xs.head__O());
      xs = $as_sc_LinearSeq(xs.tail__O());
      continue _loop
    };
    break
  }
}
function $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz, xs) {
  if ($is_sc_LinearSeq(xs)) {
    var x2 = $as_sc_LinearSeq(xs);
    var xs$1 = x2;
    $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs$1)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(elem$2) {
        return $this.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($thiz)))
  };
  return $thiz
}
/** @constructor */
function $c_sci_HashMap$Merger() {
  $c_O.call(this)
}
$c_sci_HashMap$Merger.prototype = new $h_O();
$c_sci_HashMap$Merger.prototype.constructor = $c_sci_HashMap$Merger;
/** @constructor */
function $h_sci_HashMap$Merger() {
  /*<skip>*/
}
$h_sci_HashMap$Merger.prototype = $c_sci_HashMap$Merger.prototype;
/** @constructor */
function $c_sci_Stream$$hash$colon$colon$() {
  $c_O.call(this)
}
$c_sci_Stream$$hash$colon$colon$.prototype = new $h_O();
$c_sci_Stream$$hash$colon$colon$.prototype.constructor = $c_sci_Stream$$hash$colon$colon$;
/** @constructor */
function $h_sci_Stream$$hash$colon$colon$() {
  /*<skip>*/
}
$h_sci_Stream$$hash$colon$colon$.prototype = $c_sci_Stream$$hash$colon$colon$.prototype;
$c_sci_Stream$$hash$colon$colon$.prototype.init___ = (function() {
  return this
});
var $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
var $n_sci_Stream$$hash$colon$colon$ = (void 0);
function $m_sci_Stream$$hash$colon$colon$() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
}
/** @constructor */
function $c_sci_Stream$ConsWrapper() {
  $c_O.call(this);
  this.tl$1 = null
}
$c_sci_Stream$ConsWrapper.prototype = new $h_O();
$c_sci_Stream$ConsWrapper.prototype.constructor = $c_sci_Stream$ConsWrapper;
/** @constructor */
function $h_sci_Stream$ConsWrapper() {
  /*<skip>*/
}
$h_sci_Stream$ConsWrapper.prototype = $c_sci_Stream$ConsWrapper.prototype;
$c_sci_Stream$ConsWrapper.prototype.init___F0 = (function(tl) {
  this.tl$1 = tl;
  return this
});
$c_sci_Stream$ConsWrapper.prototype.$$hash$colon$colon__O__sci_Stream = (function(hd) {
  var tl = this.tl$1;
  return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
});
var $d_sci_Stream$ConsWrapper = new $TypeData().initClass({
  sci_Stream$ConsWrapper: 0
}, false, "scala.collection.immutable.Stream$ConsWrapper", {
  sci_Stream$ConsWrapper: 1,
  O: 1
});
$c_sci_Stream$ConsWrapper.prototype.$classData = $d_sci_Stream$ConsWrapper;
/** @constructor */
function $c_sci_StreamIterator$LazyCell() {
  $c_O.call(this);
  this.v$1 = null;
  this.st$1 = null;
  this.bitmap$0$1 = false;
  this.$$outer$1 = null
}
$c_sci_StreamIterator$LazyCell.prototype = new $h_O();
$c_sci_StreamIterator$LazyCell.prototype.constructor = $c_sci_StreamIterator$LazyCell;
/** @constructor */
function $h_sci_StreamIterator$LazyCell() {
  /*<skip>*/
}
$h_sci_StreamIterator$LazyCell.prototype = $c_sci_StreamIterator$LazyCell.prototype;
$c_sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
var $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
function $f_scm_HashTable__calcSizeMapSize__I__I($thiz, tableLength) {
  return ((1 + (tableLength >> 5)) | 0)
}
function $f_scm_HashTable__tableSizeSeed__I($thiz) {
  return $m_jl_Integer$().bitCount__I__I((((-1) + $thiz.table$5.u.length) | 0))
}
function $f_scm_HashTable__findEntry0__pscm_HashTable__O__I__scm_HashEntry($thiz, key, h) {
  var e = $thiz.table$5.get(h);
  while (true) {
    if ((e !== null)) {
      var key1 = e.key$1;
      var jsx$1 = (!$m_sr_BoxesRunTime$().equals__O__O__Z(key1, key))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var this$1 = e;
      e = this$1.next$1
    } else {
      break
    }
  };
  return e
}
function $f_scm_HashTable__addEntry__scm_HashEntry__V($thiz, e) {
  var key = e.key$1;
  var hcode = $m_sr_Statics$().anyHash__O__I(key);
  var h = $f_scm_HashTable__index__I__I($thiz, hcode);
  $f_scm_HashTable__addEntry0__pscm_HashTable__scm_HashEntry__I__V($thiz, e, h)
}
function $f_scm_HashTable__initWithContents__scm_HashTable$Contents__V($thiz, c) {
  if ((c !== null)) {
    $thiz.$$undloadFactor$5 = c.loadFactor__I();
    $thiz.table$5 = c.table__Ascm_HashEntry();
    $thiz.tableSize$5 = c.tableSize__I();
    $thiz.threshold$5 = c.threshold__I();
    $thiz.seedvalue$5 = c.seedvalue__I();
    $thiz.sizemap$5 = c.sizemap__AI()
  }
}
function $f_scm_HashTable__index__I__I($thiz, hcode) {
  var ones = (((-1) + $thiz.table$5.u.length) | 0);
  var exponent = $clz32(ones);
  var seed = $thiz.seedvalue$5;
  return ((($f_scm_HashTable$HashUtils__improve__I__I__I($thiz, hcode, seed) >>> exponent) | 0) & ones)
}
function $f_scm_HashTable__$$init$__V($thiz) {
  $thiz.$$undloadFactor$5 = 750;
  var this$1 = $m_scm_HashTable$();
  $thiz.table$5 = $newArrayObject($d_scm_HashEntry.getArrayOf(), [this$1.nextPositivePowerOfTwo__I__I(16)]);
  $thiz.tableSize$5 = 0;
  var _loadFactor = $thiz.$$undloadFactor$5;
  var jsx$1 = $m_scm_HashTable$();
  var this$2 = $m_scm_HashTable$();
  $thiz.threshold$5 = jsx$1.newThreshold__I__I__I(_loadFactor, this$2.nextPositivePowerOfTwo__I__I(16));
  $thiz.sizemap$5 = null;
  $thiz.seedvalue$5 = $f_scm_HashTable__tableSizeSeed__I($thiz)
}
function $f_scm_HashTable__removeEntry__O__scm_HashEntry($thiz, key) {
  var hcode = $m_sr_Statics$().anyHash__O__I(key);
  var h = $f_scm_HashTable__index__I__I($thiz, hcode);
  var e = $thiz.table$5.get(h);
  if ((e !== null)) {
    var key1 = e.key$1;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key1, key)) {
      var jsx$1 = $thiz.table$5;
      var this$1 = e;
      jsx$1.set(h, this$1.next$1);
      $thiz.tableSize$5 = (((-1) + $thiz.tableSize$5) | 0);
      $f_scm_HashTable__nnSizeMapRemove__I__V($thiz, h);
      var this$2 = e;
      this$2.next$1 = null;
      return e
    } else {
      var this$3 = e;
      var e1 = this$3.next$1;
      while (true) {
        if ((e1 !== null)) {
          var key1$1 = e1.key$1;
          var jsx$2 = (!$m_sr_BoxesRunTime$().equals__O__O__Z(key1$1, key))
        } else {
          var jsx$2 = false
        };
        if (jsx$2) {
          e = e1;
          var this$4 = e1;
          e1 = this$4.next$1
        } else {
          break
        }
      };
      if ((e1 !== null)) {
        var this$6 = e;
        var this$5 = e1;
        var x$1 = this$5.next$1;
        this$6.next$1 = x$1;
        $thiz.tableSize$5 = (((-1) + $thiz.tableSize$5) | 0);
        $f_scm_HashTable__nnSizeMapRemove__I__V($thiz, h);
        var this$7 = e1;
        this$7.next$1 = null;
        return e1
      }
    }
  };
  return null
}
function $f_scm_HashTable__scala$collection$mutable$HashTable$$lastPopulatedIndex__I($thiz) {
  var idx = (((-1) + $thiz.table$5.u.length) | 0);
  while ((($thiz.table$5.get(idx) === null) && (idx > 0))) {
    idx = (((-1) + idx) | 0)
  };
  return idx
}
function $f_scm_HashTable__findOrAddEntry__O__O__scm_HashEntry($thiz, key, value) {
  var hcode = $m_sr_Statics$().anyHash__O__I(key);
  var h = $f_scm_HashTable__index__I__I($thiz, hcode);
  var e = $f_scm_HashTable__findEntry0__pscm_HashTable__O__I__scm_HashEntry($thiz, key, h);
  if ((e !== null)) {
    return e
  } else {
    var e$1 = new $c_scm_DefaultEntry().init___O__O(key, value);
    $f_scm_HashTable__addEntry0__pscm_HashTable__scm_HashEntry__I__V($thiz, e$1, h);
    return null
  }
}
function $f_scm_HashTable__findEntry__O__scm_HashEntry($thiz, key) {
  var hcode = $m_sr_Statics$().anyHash__O__I(key);
  var h = $f_scm_HashTable__index__I__I($thiz, hcode);
  return $f_scm_HashTable__findEntry0__pscm_HashTable__O__I__scm_HashEntry($thiz, key, h)
}
function $f_scm_HashTable__addEntry0__pscm_HashTable__scm_HashEntry__I__V($thiz, e, h) {
  var x$1 = $thiz.table$5.get(h);
  e.next$1 = $as_scm_DefaultEntry(x$1);
  $thiz.table$5.set(h, e);
  $thiz.tableSize$5 = ((1 + $thiz.tableSize$5) | 0);
  $f_scm_HashTable__nnSizeMapAdd__I__V($thiz, h);
  if (($thiz.tableSize$5 > $thiz.threshold$5)) {
    var newSize = ($thiz.table$5.u.length << 1);
    $f_scm_HashTable__resize__pscm_HashTable__I__V($thiz, newSize)
  }
}
function $f_scm_HashTable__nnSizeMapRemove__I__V($thiz, h) {
  if (($thiz.sizemap$5 !== null)) {
    var ev$1 = $thiz.sizemap$5;
    var ev$2 = (h >> 5);
    ev$1.set(ev$2, (((-1) + ev$1.get(ev$2)) | 0))
  }
}
function $f_scm_HashTable__nnSizeMapReset__I__V($thiz, tableLength) {
  if (($thiz.sizemap$5 !== null)) {
    var nsize = $f_scm_HashTable__calcSizeMapSize__I__I($thiz, tableLength);
    if (($thiz.sizemap$5.u.length !== nsize)) {
      $thiz.sizemap$5 = $newArrayObject($d_I.getArrayOf(), [nsize])
    } else {
      $m_ju_Arrays$().fill__AI__I__V($thiz.sizemap$5, 0)
    }
  }
}
function $f_scm_HashTable__nnSizeMapAdd__I__V($thiz, h) {
  if (($thiz.sizemap$5 !== null)) {
    var ev$1 = $thiz.sizemap$5;
    var ev$2 = (h >> 5);
    ev$1.set(ev$2, ((1 + ev$1.get(ev$2)) | 0))
  }
}
function $f_scm_HashTable__resize__pscm_HashTable__I__V($thiz, newSize) {
  var oldTable = $thiz.table$5;
  $thiz.table$5 = $newArrayObject($d_scm_HashEntry.getArrayOf(), [newSize]);
  var tableLength = $thiz.table$5.u.length;
  $f_scm_HashTable__nnSizeMapReset__I__V($thiz, tableLength);
  var i = (((-1) + oldTable.u.length) | 0);
  while ((i >= 0)) {
    var e = oldTable.get(i);
    while ((e !== null)) {
      var key = e.key$1;
      var hcode = $m_sr_Statics$().anyHash__O__I(key);
      var h = $f_scm_HashTable__index__I__I($thiz, hcode);
      var this$1 = e;
      var e1 = this$1.next$1;
      var this$2 = e;
      var x$1 = $thiz.table$5.get(h);
      this$2.next$1 = $as_scm_DefaultEntry(x$1);
      $thiz.table$5.set(h, e);
      e = e1;
      $f_scm_HashTable__nnSizeMapAdd__I__V($thiz, h)
    };
    i = (((-1) + i) | 0)
  };
  $thiz.threshold$5 = $m_scm_HashTable$().newThreshold__I__I__I($thiz.$$undloadFactor$5, newSize)
}
/** @constructor */
function $c_scm_HashTable$() {
  $c_O.call(this)
}
$c_scm_HashTable$.prototype = new $h_O();
$c_scm_HashTable$.prototype.constructor = $c_scm_HashTable$;
/** @constructor */
function $h_scm_HashTable$() {
  /*<skip>*/
}
$h_scm_HashTable$.prototype = $c_scm_HashTable$.prototype;
$c_scm_HashTable$.prototype.init___ = (function() {
  return this
});
$c_scm_HashTable$.prototype.nextPositivePowerOfTwo__I__I = (function(target) {
  return (1 << ((-$clz32((((-1) + target) | 0))) | 0))
});
$c_scm_HashTable$.prototype.newThreshold__I__I__I = (function(_loadFactor, size) {
  var hi = (size >> 31);
  var hi$1 = (_loadFactor >> 31);
  var a0 = (65535 & size);
  var a1 = ((size >>> 16) | 0);
  var b0 = (65535 & _loadFactor);
  var b1 = ((_loadFactor >>> 16) | 0);
  var a0b0 = $imul(a0, b0);
  var a1b0 = $imul(a1, b0);
  var a0b1 = $imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi$2 = (((((((($imul(size, hi$1) + $imul(hi, _loadFactor)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo$1 = this$1.divideImpl__I__I__I__I__I(lo, hi$2, 1000, 0);
  return lo$1
});
var $d_scm_HashTable$ = new $TypeData().initClass({
  scm_HashTable$: 0
}, false, "scala.collection.mutable.HashTable$", {
  scm_HashTable$: 1,
  O: 1
});
$c_scm_HashTable$.prototype.$classData = $d_scm_HashTable$;
var $n_scm_HashTable$ = (void 0);
function $m_scm_HashTable$() {
  if ((!$n_scm_HashTable$)) {
    $n_scm_HashTable$ = new $c_scm_HashTable$().init___()
  };
  return $n_scm_HashTable$
}
/** @constructor */
function $c_sjs_js_JSConverters$JSRichGenMap$() {
  $c_O.call(this)
}
$c_sjs_js_JSConverters$JSRichGenMap$.prototype = new $h_O();
$c_sjs_js_JSConverters$JSRichGenMap$.prototype.constructor = $c_sjs_js_JSConverters$JSRichGenMap$;
/** @constructor */
function $h_sjs_js_JSConverters$JSRichGenMap$() {
  /*<skip>*/
}
$h_sjs_js_JSConverters$JSRichGenMap$.prototype = $c_sjs_js_JSConverters$JSRichGenMap$.prototype;
$c_sjs_js_JSConverters$JSRichGenMap$.prototype.init___ = (function() {
  return this
});
var $d_sjs_js_JSConverters$JSRichGenMap$ = new $TypeData().initClass({
  sjs_js_JSConverters$JSRichGenMap$: 0
}, false, "scala.scalajs.js.JSConverters$JSRichGenMap$", {
  sjs_js_JSConverters$JSRichGenMap$: 1,
  O: 1
});
$c_sjs_js_JSConverters$JSRichGenMap$.prototype.$classData = $d_sjs_js_JSConverters$JSRichGenMap$;
var $n_sjs_js_JSConverters$JSRichGenMap$ = (void 0);
function $m_sjs_js_JSConverters$JSRichGenMap$() {
  if ((!$n_sjs_js_JSConverters$JSRichGenMap$)) {
    $n_sjs_js_JSConverters$JSRichGenMap$ = new $c_sjs_js_JSConverters$JSRichGenMap$().init___()
  };
  return $n_sjs_js_JSConverters$JSRichGenMap$
}
/** @constructor */
function $c_sjs_js_JSConverters$JSRichGenTraversableOnce$() {
  $c_O.call(this)
}
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype = new $h_O();
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.constructor = $c_sjs_js_JSConverters$JSRichGenTraversableOnce$;
/** @constructor */
function $h_sjs_js_JSConverters$JSRichGenTraversableOnce$() {
  /*<skip>*/
}
$h_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype = $c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype;
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.init___ = (function() {
  return this
});
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array = (function($$this) {
  if ($is_sjs_js_ArrayOps($$this)) {
    var x2 = $as_sjs_js_ArrayOps($$this);
    return x2.scala$scalajs$js$ArrayOps$$array$f
  } else if ($is_sjs_js_WrappedArray($$this)) {
    var x3 = $as_sjs_js_WrappedArray($$this);
    return x3.array$6
  } else {
    var result = [];
    $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
      return (function(x$2) {
        return $uI(result$1.push(x$2))
      })
    })(this, result)));
    return result
  }
});
var $d_sjs_js_JSConverters$JSRichGenTraversableOnce$ = new $TypeData().initClass({
  sjs_js_JSConverters$JSRichGenTraversableOnce$: 0
}, false, "scala.scalajs.js.JSConverters$JSRichGenTraversableOnce$", {
  sjs_js_JSConverters$JSRichGenTraversableOnce$: 1,
  O: 1
});
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.$classData = $d_sjs_js_JSConverters$JSRichGenTraversableOnce$;
var $n_sjs_js_JSConverters$JSRichGenTraversableOnce$ = (void 0);
function $m_sjs_js_JSConverters$JSRichGenTraversableOnce$() {
  if ((!$n_sjs_js_JSConverters$JSRichGenTraversableOnce$)) {
    $n_sjs_js_JSConverters$JSRichGenTraversableOnce$ = new $c_sjs_js_JSConverters$JSRichGenTraversableOnce$().init___()
  };
  return $n_sjs_js_JSConverters$JSRichGenTraversableOnce$
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var t = this.doubleToLongBits__D__J(value);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return (lo ^ hi)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var twoPowE = $uD($g.Math.pow(2.0, b));
      if ((twoPowE > av)) {
        e = (((-1) + e) | 0);
        twoPowE = (twoPowE / 2)
      };
      var n = ((av / twoPowE) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    var value$1 = $uI(this.int32Array$1[this.highOffset$1]);
    var value$2 = $uI(this.int32Array$1[this.lowOffset$1]);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ($is_jl_Character(y)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ($is_sjsr_RuntimeLong(x3)) {
      var t = $uJ(x3);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = xc.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ($is_jl_Character(y)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ($is_sjsr_RuntimeLong(xn)) {
      var t = $uJ(xn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = x3.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ($is_jl_Character(x)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ($is_sjsr_RuntimeLong(yn)) {
      var t = $uJ(yn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return (x2 === $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi))
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ($is_sjsr_RuntimeLong(xn)) {
    var t$1 = $uJ(xn);
    var lo$1 = t$1.lo$2;
    var hi$1 = t$1.hi$2;
    if ($is_sjsr_RuntimeLong(yn)) {
      var t$2 = $uJ(yn);
      var lo$2 = t$2.lo$2;
      var hi$2 = t$2.hi$2;
      return ((lo$1 === lo$2) && (hi$1 === hi$2))
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo$1, hi$1) === x3$3)
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1))
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u.length
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u.length
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u.length
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u.length
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u.length
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    return x7.u.length
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u.length
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u.length
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u.length
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u.length
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.set(idx, value)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.set(idx, $uI(value))
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.set(idx, $uD(value))
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.set(idx, $uJ(value))
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.set(idx, $uF(value))
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.set(idx, jsx$1)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.set(idx, $uB(value))
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.set(idx, $uS(value))
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.set(idx, $uZ(value))
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.set(idx, (void 0))
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.get(idx)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.get(idx)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.get(idx)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.get(idx)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.get(idx)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.get(idx);
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.get(idx)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.get(idx)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.get(idx)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.get(idx)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_sr_Statics$() {
  $c_O.call(this)
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
  /*<skip>*/
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.init___ = (function() {
  return this
});
$c_sr_Statics$.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv
  } else {
    var this$1 = $m_sjsr_RuntimeLong$();
    var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
    var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
  }
});
$c_sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if (((typeof x) === "number")) {
    var x3 = $uD(x);
    return this.doubleHash__D__I(x3)
  } else if ($is_sjsr_RuntimeLong(x)) {
    var t = $uJ(x);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return this.longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  } else {
    return $objectHashCode(x)
  }
});
$c_sr_Statics$.prototype.avalanche__I__I = (function(h0) {
  var h = h0;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_sr_Statics$.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_sr_Statics$.prototype.longHash__J__I = (function(lv) {
  var lo = lv.lo$2;
  var lo$1 = lv.hi$2;
  return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
});
$c_sr_Statics$.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__I__I((hash ^ length))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
}
function $is_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$DataTypesCommand"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$DataTypesCommand;", depth))
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype = $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.initialState__Lcom_seamless_contexts_data$undtypes_DataTypesState = (function() {
  return new $c_Lcom_seamless_contexts_data$undtypes_DataTypesState().init___sci_Map__sci_Map__sc_Seq($as_sci_Map($m_s_Predef$().Map$2.apply__sc_Seq__sc_GenMap($m_sci_Nil$())), $as_sci_Map($m_s_Predef$().Map$2.apply__sc_Seq__sc_GenMap($m_sci_Nil$())), $m_Lcom_seamless_contexts_data$undtypes_DataTypesState$().apply$default$3__sc_Seq())
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.handleCommand__Lcom_seamless_contexts_data$undtypes_DataTypesState__s_PartialFunction = (function(_state) {
  return new $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1().init___Lcom_seamless_contexts_data$undtypes_DataTypesState(_state)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.initialState__O = (function() {
  return this.initialState__Lcom_seamless_contexts_data$undtypes_DataTypesState()
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.applyEvent__O__O__O = (function(event, state) {
  return this.applyEvent__Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_DataTypesState($as_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(event), $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(state))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.applyEvent__Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(event, state) {
  if ($is_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(event)) {
    var x2 = $as_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(event);
    var name = x2.name$1;
    var rootId = x2.root$1;
    var conceptId = x2.id$1;
    var array = [new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, conceptId$1, name$1, rootId$1) {
      return (function(s$2) {
        var s = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$2);
        return s.putConceptId__T__Lcom_seamless_contexts_data$undtypes_ConceptDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(conceptId$1, new $c_Lcom_seamless_contexts_data$undtypes_ConceptDescription().init___T__T__Z(name$1, rootId$1, false))
      })
    })(this, conceptId, name, rootId)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, rootId$2, conceptId$2) {
      return (function(s$3$2) {
        var s$3 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$3$2);
        return s$3.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(rootId$2, new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option($m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$(), null, conceptId$2, $m_s_None$(), new $c_s_Some().init___O($m_sc_Seq$().apply__sc_Seq__sc_GenTraversable($m_sci_Nil$())), $m_s_None$()))
      })
    })(this, rootId, conceptId))];
    var start = 0;
    var end = $uI(array.length);
    var z = state;
    var start$1 = start;
    var z$1 = z;
    var jsx$1;
    _foldl: while (true) {
      if ((start$1 !== end)) {
        var temp$start = ((1 + start$1) | 0);
        var arg1 = z$1;
        var index = start$1;
        var arg2 = array[index];
        var c = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(arg1);
        var updater = $as_F1(arg2);
        var temp$z = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(updater.apply__O__O(c));
        start$1 = temp$start;
        z$1 = temp$z;
        continue _foldl
      };
      var jsx$1 = z$1;
      break
    };
    return $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(jsx$1)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(event)) {
    var x3 = $as_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(event);
    var parentId = x3.parentId$1;
    var id = x3.id$1;
    var conceptId$2$1 = x3.conceptId$1;
    var array$1 = [new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3$1, id$1, parentId$1, conceptId$2$2) {
      return (function(s$4$2) {
        var s$4 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$4$2);
        return s$4.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(id$1, new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option($m_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$(), parentId$1, conceptId$2$2, new $c_s_Some().init___O(""), $m_s_None$(), $m_s_None$()))
      })
    })(this, id, parentId, conceptId$2$1)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1, state$1, parentId$2, id$2) {
      return (function(s$5$2) {
        var s$5 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$5$2);
        var parentObj = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state$1.components$1.apply__O__O(parentId$2)).appendField__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription(id$2);
        return s$5.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(parentId$2, parentObj)
      })
    })(this, state, parentId, id))];
    var start$2 = 0;
    var end$1 = $uI(array$1.length);
    var z$2 = state;
    var start$3 = start$2;
    var z$3 = z$2;
    var jsx$2;
    _foldl$1: while (true) {
      if ((start$3 !== end$1)) {
        var temp$start$1 = ((1 + start$3) | 0);
        var arg1$1 = z$3;
        var index$1 = start$3;
        var arg2$1 = array$1[index$1];
        var c$1 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(arg1$1);
        var updater$1 = $as_F1(arg2$1);
        var temp$z$1 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(updater$1.apply__O__O(c$1));
        start$3 = temp$start$1;
        z$3 = temp$z$1;
        continue _foldl$1
      };
      var jsx$2 = z$3;
      break
    };
    return $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(jsx$2)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(event)) {
    var x4 = $as_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(event);
    var fieldId = x4.id$1;
    var newName = x4.newName$1;
    var this$9 = state.components$1;
    var this$10 = this$9.iterator__sc_Iterator();
    inlinereturn$35: {
      while (this$10.hasNext__Z()) {
        var a = this$10.next__O();
        var i = $as_T2(a);
        var x = i.$$und1$f;
        if (((x === null) ? (fieldId === null) : $objectEquals(x, fieldId))) {
          var fieldOption = new $c_s_Some().init___O(a);
          break inlinereturn$35
        }
      };
      var fieldOption = $m_s_None$()
    };
    var requirement = fieldOption.isDefined__Z();
    if ((!requirement)) {
      throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + ("Field " + fieldId)) + " not found"))
    };
    var x1 = $as_T2(fieldOption.get__O());
    if ((x1 === null)) {
      throw new $c_s_MatchError().init___O(x1)
    };
    var id$3 = $as_T(x1.$$und1$f);
    var field = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f);
    var x$1 = new $c_s_Some().init___O(newName);
    var x$2 = field.type$1;
    var x$3 = field.parentId$1;
    var x$4 = field.conceptId$1;
    var x$5 = field.fields$1;
    var x$6 = field.typeParameters$1;
    var updated = new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(x$2, x$3, x$4, x$1, x$5, x$6);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().isValidField__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(updated, state);
    return state.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(id$3, updated)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(event)) {
    var x5 = $as_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(event);
    var id$2$1 = x5.id$1;
    var newType = x5.to$1;
    var pastFields = state.getPastFields__T__sc_Seq(id$2$1);
    return state.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(id$2$1, $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state.components$1.apply__O__O(id$2$1)).updateType__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__sc_Seq__Lcom_seamless_contexts_data$undtypes_ShapeDescription(newType, pastFields))
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(event)) {
    var x6 = $as_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(event);
    var fieldId$2 = x6.id$1;
    var description = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state.components$1.apply__O__O(fieldId$2));
    var array$2 = [new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$6$1, fieldId$2$1) {
      return (function(s$6$2) {
        var s$6 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$6$2);
        return s$6.deleteId__T__Lcom_seamless_contexts_data$undtypes_DataTypesState(fieldId$2$1)
      })
    })(this, fieldId$2)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$7$1, description$1, fieldId$2$2) {
      return (function(s$7$2) {
        var s$7 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$7$2);
        var parentObj$1 = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(s$7.components$1.apply__O__O(description$1.parentId$1)).removeField__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription(fieldId$2$2);
        return s$7.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(description$1.parentId$1, parentObj$1)
      })
    })(this, description, fieldId$2))];
    var start$4 = 0;
    var end$2 = $uI(array$2.length);
    var z$4 = state;
    var start$5 = start$4;
    var z$5 = z$4;
    var jsx$3;
    _foldl$2: while (true) {
      if ((start$5 !== end$2)) {
        var temp$start$2 = ((1 + start$5) | 0);
        var arg1$2 = z$5;
        var index$2 = start$5;
        var arg2$2 = array$2[index$2];
        var c$2 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(arg1$2);
        var updater$2 = $as_F1(arg2$2);
        var temp$z$2 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(updater$2.apply__O__O(c$2));
        start$5 = temp$start$2;
        z$5 = temp$z$2;
        continue _foldl$2
      };
      var jsx$3 = z$5;
      break
    };
    return $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(jsx$3)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(event)) {
    var x7 = $as_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(event);
    var parentId$2$1 = x7.parentId$1;
    var id$3$1 = x7.id$1;
    var conceptId$3 = x7.conceptId$1;
    var array$3 = [new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$8$1, id$3$2, parentId$2$2, conceptId$3$1) {
      return (function(s$8$2) {
        var s$8 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$8$2);
        return s$8.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(id$3$2, new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option($m_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$(), parentId$2$2, conceptId$3$1, $m_s_None$(), $m_s_None$(), $m_s_None$()))
      })
    })(this, id$3$1, parentId$2$1, conceptId$3)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$9$1, state$2, parentId$2$3, id$3$3) {
      return (function(s$9$2) {
        var s$9 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$9$2);
        var parentObj$2 = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state$2.components$1.apply__O__O(parentId$2$3)).appendTypeParameter__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription(id$3$3);
        return s$9.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(parentId$2$3, parentObj$2)
      })
    })(this, state, parentId$2$1, id$3$1))];
    var start$6 = 0;
    var end$3 = $uI(array$3.length);
    var z$6 = state;
    var start$7 = start$6;
    var z$7 = z$6;
    var jsx$4;
    _foldl$3: while (true) {
      if ((start$7 !== end$3)) {
        var temp$start$3 = ((1 + start$7) | 0);
        var arg1$3 = z$7;
        var index$3 = start$7;
        var arg2$3 = array$3[index$3];
        var c$3 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(arg1$3);
        var updater$3 = $as_F1(arg2$3);
        var temp$z$3 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(updater$3.apply__O__O(c$3));
        start$7 = temp$start$3;
        z$7 = temp$z$3;
        continue _foldl$3
      };
      var jsx$4 = z$7;
      break
    };
    return $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(jsx$4)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(event)) {
    var x8 = $as_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(event);
    var id$4 = x8.id$1;
    var description$2 = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state.components$1.apply__O__O(id$4));
    var array$4 = [new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$10$1, id$4$1) {
      return (function(s$10$2) {
        var s$10 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$10$2);
        return s$10.deleteId__T__Lcom_seamless_contexts_data$undtypes_DataTypesState(id$4$1)
      })
    })(this, id$4)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$11$1, description$2$1, id$4$2) {
      return (function(s$11$2) {
        var s$11 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(s$11$2);
        var parentObj$3 = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(s$11.components$1.apply__O__O(description$2$1.parentId$1)).removeTypeParameter__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription(id$4$2);
        return s$11.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState(description$2$1.parentId$1, parentObj$3)
      })
    })(this, description$2, id$4))];
    var start$8 = 0;
    var end$4 = $uI(array$4.length);
    var z$8 = state;
    var start$9 = start$8;
    var z$9 = z$8;
    var jsx$5;
    _foldl$4: while (true) {
      if ((start$9 !== end$4)) {
        var temp$start$4 = ((1 + start$9) | 0);
        var arg1$4 = z$9;
        var index$4 = start$9;
        var arg2$4 = array$4[index$4];
        var c$4 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(arg1$4);
        var updater$4 = $as_F1(arg2$4);
        var temp$z$4 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(updater$4.apply__O__O(c$4));
        start$9 = temp$start$4;
        z$9 = temp$z$4;
        continue _foldl$4
      };
      var jsx$5 = z$9;
      break
    };
    return $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(jsx$5)
  } else {
    throw new $c_s_MatchError().init___O(event)
  }
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.handleCommand__O__s_PartialFunction = (function(state) {
  return this.handleCommand__Lcom_seamless_contexts_data$undtypes_DataTypesState__s_PartialFunction($as_Lcom_seamless_contexts_data$undtypes_DataTypesState(state))
});
var $d_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$: 0
}, false, "com.seamless.contexts.data_types.DataTypesAggregate$", {
  Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$: 1,
  O: 1,
  Lcom_seamless_ddd_EventSourcedAggregate: 1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$;
var $n_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$)) {
    $n_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$ = new $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$
}
/** @constructor */
function $c_Lcom_seamless_contexts_rfc_RfcAggregate$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype = new $h_O();
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.constructor = $c_Lcom_seamless_contexts_rfc_RfcAggregate$;
/** @constructor */
function $h_Lcom_seamless_contexts_rfc_RfcAggregate$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype = $c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype;
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.applyEvent__Lcom_seamless_contexts_rfc_Events$RfcEvent__Lcom_seamless_contexts_rfc_RfcState__Lcom_seamless_contexts_rfc_RfcState = (function(event, state) {
  if ($is_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(event)) {
    var x2 = $as_Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent(event);
    var dataTypes = $m_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$().applyEvent__Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_DataTypesState(x2, state.dataTypes$1);
    return new $c_Lcom_seamless_contexts_rfc_RfcState().init___Lcom_seamless_contexts_data$undtypes_DataTypesState(dataTypes)
  } else {
    return state
  }
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.initialState__O = (function() {
  return new $c_Lcom_seamless_contexts_rfc_RfcState().init___Lcom_seamless_contexts_data$undtypes_DataTypesState($m_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$().initialState__Lcom_seamless_contexts_data$undtypes_DataTypesState())
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.applyEvent__O__O__O = (function(event, state) {
  return this.applyEvent__Lcom_seamless_contexts_rfc_Events$RfcEvent__Lcom_seamless_contexts_rfc_RfcState__Lcom_seamless_contexts_rfc_RfcState($as_Lcom_seamless_contexts_rfc_Events$RfcEvent(event), $as_Lcom_seamless_contexts_rfc_RfcState(state))
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.handleCommand__O__s_PartialFunction = (function(state) {
  var state$1 = $as_Lcom_seamless_contexts_rfc_RfcState(state);
  return new $c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1().init___Lcom_seamless_contexts_rfc_RfcState(state$1)
});
var $d_Lcom_seamless_contexts_rfc_RfcAggregate$ = new $TypeData().initClass({
  Lcom_seamless_contexts_rfc_RfcAggregate$: 0
}, false, "com.seamless.contexts.rfc.RfcAggregate$", {
  Lcom_seamless_contexts_rfc_RfcAggregate$: 1,
  O: 1,
  Lcom_seamless_ddd_EventSourcedAggregate: 1
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$.prototype.$classData = $d_Lcom_seamless_contexts_rfc_RfcAggregate$;
var $n_Lcom_seamless_contexts_rfc_RfcAggregate$ = (void 0);
function $m_Lcom_seamless_contexts_rfc_RfcAggregate$() {
  if ((!$n_Lcom_seamless_contexts_rfc_RfcAggregate$)) {
    $n_Lcom_seamless_contexts_rfc_RfcAggregate$ = new $c_Lcom_seamless_contexts_rfc_RfcAggregate$().init___()
  };
  return $n_Lcom_seamless_contexts_rfc_RfcAggregate$
}
/** @constructor */
function $c_Lcom_seamless_contexts_rfc_RfcService() {
  $c_O.call(this);
  this.eventStore$1 = null;
  this.repository$1 = null
}
$c_Lcom_seamless_contexts_rfc_RfcService.prototype = new $h_O();
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.constructor = $c_Lcom_seamless_contexts_rfc_RfcService;
/** @constructor */
function $h_Lcom_seamless_contexts_rfc_RfcService() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_rfc_RfcService.prototype = $c_Lcom_seamless_contexts_rfc_RfcService.prototype;
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.init___ = (function() {
  this.eventStore$1 = new $c_Lcom_seamless_ddd_InMemoryEventStore().init___();
  this.repository$1 = new $c_Lcom_seamless_ddd_EventSourcedRepository().init___Lcom_seamless_ddd_EventSourcedAggregate__Lcom_seamless_ddd_EventStore($m_Lcom_seamless_contexts_rfc_RfcAggregate$(), this.eventStore$1);
  return this
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.currentShapeProjection__T__T__Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection = (function(id, conceptId) {
  return $m_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$().fromState__Lcom_seamless_contexts_data$undtypes_DataTypesState__T__Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection($as_Lcom_seamless_contexts_rfc_RfcState(this.repository$1.findById__T__O(id)).dataTypes$1, conceptId)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.$$js$exported$meth$commandHandlerForAggregate__T__O = (function(id) {
  return this.commandHandlerForAggregate__T__sjs_js_Function1(id)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.handleCommand__T__Lcom_seamless_contexts_rfc_Commands$RfcCommand__V = (function(id, command) {
  var state = $as_Lcom_seamless_contexts_rfc_RfcState(this.repository$1.findById__T__O(id));
  var this$2 = new $c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1().init___Lcom_seamless_contexts_rfc_RfcState(state);
  var $default = $m_s_PartialFunction$().empty$undpf$1;
  var effects = $as_Lcom_seamless_ddd_Effects(this$2.applyOrElse__Lcom_seamless_contexts_rfc_Commands$RfcCommand__F1__O(command, $default));
  this.repository$1.save__T__sci_Vector__V(id, effects.eventsToPersist$1)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.$$js$exported$meth$handleCommand__T__O__O = (function(id, command) {
  this.handleCommand__T__Lcom_seamless_contexts_rfc_Commands$RfcCommand__V(id, $as_Lcom_seamless_contexts_rfc_Commands$RfcCommand(command))
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.$$js$exported$meth$currentState__T__O = (function(id) {
  return $as_Lcom_seamless_contexts_rfc_RfcState(this.repository$1.findById__T__O(id))
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.commandHandlerForAggregate__T__sjs_js_Function1 = (function(id) {
  return (function(arg$outer, id$1) {
    return (function(arg1$2) {
      var arg1 = $as_Lcom_seamless_contexts_rfc_Commands$RfcCommand(arg1$2);
      arg$outer.handleCommand__T__Lcom_seamless_contexts_rfc_Commands$RfcCommand__V(id$1, arg1)
    })
  })(this, id)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.$$js$exported$meth$currentShapeProjection__T__T__O = (function(id, conceptId) {
  return this.currentShapeProjection__T__T__Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(id, conceptId)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.currentState = (function(arg$1) {
  var prep0 = $as_T(arg$1);
  return this.$$js$exported$meth$currentState__T__O(prep0)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.handleCommand = (function(arg$1, arg$2) {
  var prep0 = $as_T(arg$1);
  var prep1 = arg$2;
  return this.$$js$exported$meth$handleCommand__T__O__O(prep0, prep1)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.currentShapeProjection = (function(arg$1, arg$2) {
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  return this.$$js$exported$meth$currentShapeProjection__T__T__O(prep0, prep1)
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.commandHandlerForAggregate = (function(arg$1) {
  var prep0 = $as_T(arg$1);
  return this.$$js$exported$meth$commandHandlerForAggregate__T__O(prep0)
});
var $d_Lcom_seamless_contexts_rfc_RfcService = new $TypeData().initClass({
  Lcom_seamless_contexts_rfc_RfcService: 0
}, false, "com.seamless.contexts.rfc.RfcService", {
  Lcom_seamless_contexts_rfc_RfcService: 1,
  O: 1,
  Lcom_seamless_ddd_EventSourcedService: 1
});
$c_Lcom_seamless_contexts_rfc_RfcService.prototype.$classData = $d_Lcom_seamless_contexts_rfc_RfcService;
/** @constructor */
function $c_Lcom_seamless_ddd_InMemoryEventStore() {
  $c_Lcom_seamless_ddd_EventStore.call(this);
  this.$$undstore$2 = null
}
$c_Lcom_seamless_ddd_InMemoryEventStore.prototype = new $h_Lcom_seamless_ddd_EventStore();
$c_Lcom_seamless_ddd_InMemoryEventStore.prototype.constructor = $c_Lcom_seamless_ddd_InMemoryEventStore;
/** @constructor */
function $h_Lcom_seamless_ddd_InMemoryEventStore() {
  /*<skip>*/
}
$h_Lcom_seamless_ddd_InMemoryEventStore.prototype = $c_Lcom_seamless_ddd_InMemoryEventStore.prototype;
$c_Lcom_seamless_ddd_InMemoryEventStore.prototype.init___ = (function() {
  this.$$undstore$2 = $as_scm_HashMap($m_scm_HashMap$().apply__sc_Seq__sc_GenMap($m_sci_Nil$()));
  return this
});
$c_Lcom_seamless_ddd_InMemoryEventStore.prototype.listEvents__T__sci_Vector = (function(id) {
  var this$1 = this.$$undstore$2;
  var x1 = this$1.get__O__s_Option(id);
  if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var v = x2.value$2;
    var jsx$1 = v
  } else {
    var x = $m_s_None$();
    if ((!(x === x1))) {
      throw new $c_s_MatchError().init___O(x1)
    };
    var jsx$1 = $as_scm_ListBuffer($m_scm_ListBuffer$().apply__sc_Seq__sc_GenTraversable($m_sci_Nil$()))
  };
  return $as_sc_TraversableOnce(jsx$1).toVector__sci_Vector()
});
$c_Lcom_seamless_ddd_InMemoryEventStore.prototype.append__T__sci_Vector__V = (function(id, newEvents) {
  var this$1 = this.$$undstore$2;
  var hash = $m_sr_Statics$().anyHash__O__I(id);
  var i = $f_scm_HashTable__index__I__I(this$1, hash);
  var firstEntry = this$1.findEntry__p5__O__I__scm_DefaultEntry(id, i);
  if ((firstEntry !== null)) {
    var jsx$1 = firstEntry.value$1
  } else {
    var table0 = this$1.table$5;
    var $default = $as_scm_ListBuffer($m_scm_ListBuffer$().apply__sc_Seq__sc_GenTraversable($m_sci_Nil$()));
    var newEntryIndex = ((table0 === this$1.table$5) ? i : $f_scm_HashTable__index__I__I(this$1, hash));
    var e = new $c_scm_DefaultEntry().init___O__O(id, $default);
    var secondEntry = this$1.findEntry__p5__O__I__scm_DefaultEntry(id, newEntryIndex);
    if ((secondEntry === null)) {
      this$1.addEntry__p5__scm_DefaultEntry__I__O(e, newEntryIndex)
    } else {
      secondEntry.value$1 = $default
    };
    var jsx$1 = $default
  };
  var events = $as_scm_ListBuffer(jsx$1);
  events.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(newEvents)
});
var $d_Lcom_seamless_ddd_InMemoryEventStore = new $TypeData().initClass({
  Lcom_seamless_ddd_InMemoryEventStore: 0
}, false, "com.seamless.ddd.InMemoryEventStore", {
  Lcom_seamless_ddd_InMemoryEventStore: 1,
  Lcom_seamless_ddd_EventStore: 1,
  O: 1
});
$c_Lcom_seamless_ddd_InMemoryEventStore.prototype.$classData = $d_Lcom_seamless_ddd_InMemoryEventStore;
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.enableSuppression$1 = false;
  this.writableStackTrace$1 = false;
  this.stackTrace$1 = null;
  this.suppressed$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z = (function(s, e, enableSuppression, writableStackTrace) {
  this.s$1 = s;
  this.e$1 = e;
  this.enableSuppression$1 = enableSuppression;
  this.writableStackTrace$1 = writableStackTrace;
  if (writableStackTrace) {
    this.fillInStackTrace__jl_Throwable()
  };
  return this
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_ju_Random() {
  $c_O.call(this);
  this.seedHi$1 = 0;
  this.seedLo$1 = 0;
  this.nextNextGaussian$1 = 0.0;
  this.haveNextNextGaussian$1 = false
}
$c_ju_Random.prototype = new $h_O();
$c_ju_Random.prototype.constructor = $c_ju_Random;
/** @constructor */
function $h_ju_Random() {
  /*<skip>*/
}
$h_ju_Random.prototype = $c_ju_Random.prototype;
$c_ju_Random.prototype.init___ = (function() {
  $c_ju_Random.prototype.init___J.call(this, $m_ju_Random$().java$util$Random$$randomSeed__J());
  return this
});
$c_ju_Random.prototype.init___J = (function(seed_in) {
  this.haveNextNextGaussian$1 = false;
  this.setSeed__J__V(seed_in);
  return this
});
$c_ju_Random.prototype.nextInt__I__I = (function(n) {
  if ((n <= 0)) {
    throw new $c_jl_IllegalArgumentException().init___T("n must be positive")
  } else {
    return (((n & ((-n) | 0)) === n) ? (this.next__I__I(31) >> $clz32(n)) : this.loop$1__p1__I__I(n))
  }
});
$c_ju_Random.prototype.next__I__I = (function(bits) {
  var oldSeedHi = this.seedHi$1;
  var oldSeedLo = this.seedLo$1;
  var loProd = (11 + (15525485 * oldSeedLo));
  var hiProd = ((1502 * oldSeedLo) + (15525485 * oldSeedHi));
  var x = (loProd / 16777216);
  var newSeedHi = (16777215 & (($uI((x | 0)) + (16777215 & $uI((hiProd | 0)))) | 0));
  var newSeedLo = (16777215 & $uI((loProd | 0)));
  this.seedHi$1 = newSeedHi;
  this.seedLo$1 = newSeedLo;
  var result32 = ((newSeedHi << 8) | (newSeedLo >> 16));
  return ((result32 >>> ((32 - bits) | 0)) | 0)
});
$c_ju_Random.prototype.loop$1__p1__I__I = (function(n$1) {
  _loop: while (true) {
    var bits = this.next__I__I(31);
    var value = ((bits % n$1) | 0);
    if ((((((bits - value) | 0) + (((-1) + n$1) | 0)) | 0) < 0)) {
      continue _loop
    } else {
      return value
    }
  }
});
$c_ju_Random.prototype.setSeed__J__V = (function(seed_in) {
  var lo = ((-554899859) ^ seed_in.lo$2);
  var hi = (5 ^ seed_in.hi$2);
  var hi$1 = (65535 & hi);
  var lo$1 = (((lo >>> 24) | 0) | (hi$1 << 8));
  this.seedHi$1 = lo$1;
  this.seedLo$1 = (16777215 & lo);
  this.haveNextNextGaussian$1 = false
});
var $d_ju_Random = new $TypeData().initClass({
  ju_Random: 0
}, false, "java.util.Random", {
  ju_Random: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Random.prototype.$classData = $d_ju_Random;
/** @constructor */
function $c_s_Predef$$anon$1() {
  $c_O.call(this)
}
$c_s_Predef$$anon$1.prototype = new $h_O();
$c_s_Predef$$anon$1.prototype.constructor = $c_s_Predef$$anon$1;
/** @constructor */
function $h_s_Predef$$anon$1() {
  /*<skip>*/
}
$h_s_Predef$$anon$1.prototype = $c_s_Predef$$anon$1.prototype;
$c_s_Predef$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$1.prototype.apply__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_s_Predef$$anon$1.prototype.apply__O__scm_Builder = (function(from) {
  $as_T(from);
  return new $c_scm_StringBuilder().init___()
});
var $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
function $f_s_Product2__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1$f;
      break
    }
    case 1: {
      return $thiz.$$und2$f;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
/** @constructor */
function $c_s_package$$anon$1() {
  $c_O.call(this)
}
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
function $h_s_package$$anon$1() {
  /*<skip>*/
}
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sci_List(xs)) {
    var x2 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
function $f_sc_Iterator__exists__F1__Z($thiz, p) {
  var res = false;
  while (((!res) && $thiz.hasNext__Z())) {
    res = $uZ(p.apply__O__O($thiz.next__O()))
  };
  return res
}
function $f_sc_Iterator__isEmpty__Z($thiz) {
  return (!$thiz.hasNext__Z())
}
function $f_sc_Iterator__forall__F1__Z($thiz, p) {
  var res = true;
  while ((res && $thiz.hasNext__Z())) {
    res = $uZ(p.apply__O__O($thiz.next__O()))
  };
  return res
}
function $f_sc_Iterator__foreach__F1__V($thiz, f) {
  while ($thiz.hasNext__Z()) {
    f.apply__O__O($thiz.next__O())
  }
}
function $f_sc_Iterator__toStream__sci_Stream($thiz) {
  if ($thiz.hasNext__Z()) {
    var hd = $thiz.next__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.toStream__sci_Stream()
      })
    })($thiz));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  }
}
function $f_sc_Iterator__drop__I__sc_Iterator($thiz, n) {
  var j = 0;
  while (((j < n) && $thiz.hasNext__Z())) {
    $thiz.next__O();
    j = ((1 + j) | 0)
  };
  return $thiz
}
/** @constructor */
function $c_scg_GenSetFactory() {
  $c_scg_GenericCompanion.call(this)
}
$c_scg_GenSetFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenSetFactory.prototype.constructor = $c_scg_GenSetFactory;
/** @constructor */
function $h_scg_GenSetFactory() {
  /*<skip>*/
}
$h_scg_GenSetFactory.prototype = $c_scg_GenSetFactory.prototype;
/** @constructor */
function $c_scg_GenSetFactory$$anon$1() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_scg_GenSetFactory$$anon$1.prototype = new $h_O();
$c_scg_GenSetFactory$$anon$1.prototype.constructor = $c_scg_GenSetFactory$$anon$1;
/** @constructor */
function $h_scg_GenSetFactory$$anon$1() {
  /*<skip>*/
}
$h_scg_GenSetFactory$$anon$1.prototype = $c_scg_GenSetFactory$$anon$1.prototype;
$c_scg_GenSetFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  var this$1 = this.$$outer$1;
  return new $c_scm_SetBuilder().init___sc_Set(this$1.emptyInstance__sci_Set())
});
$c_scg_GenSetFactory$$anon$1.prototype.apply__O__scm_Builder = (function(from) {
  return this.apply__sc_GenSet__scm_Builder($as_sc_GenSet(from))
});
$c_scg_GenSetFactory$$anon$1.prototype.init___scg_GenSetFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_scg_GenSetFactory$$anon$1.prototype.apply__sc_GenSet__scm_Builder = (function(from) {
  if ($is_sc_Set(from)) {
    return from.companion__scg_GenericCompanion().newBuilder__scm_Builder()
  } else {
    var this$1 = this.$$outer$1;
    return new $c_scm_SetBuilder().init___sc_Set(this$1.emptyInstance__sci_Set())
  }
});
var $d_scg_GenSetFactory$$anon$1 = new $TypeData().initClass({
  scg_GenSetFactory$$anon$1: 0
}, false, "scala.collection.generic.GenSetFactory$$anon$1", {
  scg_GenSetFactory$$anon$1: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenSetFactory$$anon$1.prototype.$classData = $d_scg_GenSetFactory$$anon$1;
/** @constructor */
function $c_scg_GenTraversableFactory() {
  $c_scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
}
$c_scg_GenTraversableFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenTraversableFactory.prototype.constructor = $c_scg_GenTraversableFactory;
/** @constructor */
function $h_scg_GenTraversableFactory() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory.prototype = $c_scg_GenTraversableFactory.prototype;
$c_scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
function $c_scg_GenTraversableFactory$GenericCanBuildFrom() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new $h_O();
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = $c_scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
function $h_scg_GenTraversableFactory$GenericCanBuildFrom() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$1.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = $as_sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_scg_MapFactory() {
  $c_scg_GenMapFactory.call(this)
}
$c_scg_MapFactory.prototype = new $h_scg_GenMapFactory();
$c_scg_MapFactory.prototype.constructor = $c_scg_MapFactory;
/** @constructor */
function $h_scg_MapFactory() {
  /*<skip>*/
}
$h_scg_MapFactory.prototype = $c_scg_MapFactory.prototype;
/** @constructor */
function $c_sci_HashMap$$anon$1() {
  $c_sci_HashMap$Merger.call(this);
  this.invert$2 = null;
  this.mergef$1$f = null
}
$c_sci_HashMap$$anon$1.prototype = new $h_sci_HashMap$Merger();
$c_sci_HashMap$$anon$1.prototype.constructor = $c_sci_HashMap$$anon$1;
/** @constructor */
function $h_sci_HashMap$$anon$1() {
  /*<skip>*/
}
$h_sci_HashMap$$anon$1.prototype = $c_sci_HashMap$$anon$1.prototype;
$c_sci_HashMap$$anon$1.prototype.init___F2 = (function(mergef$1) {
  this.mergef$1$f = mergef$1;
  this.invert$2 = new $c_sci_HashMap$$anon$1$$anon$2().init___sci_HashMap$$anon$1(this);
  return this
});
$c_sci_HashMap$$anon$1.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return $as_T2(this.mergef$1$f.apply__O__O__O(kv1, kv2))
});
var $d_sci_HashMap$$anon$1 = new $TypeData().initClass({
  sci_HashMap$$anon$1: 0
}, false, "scala.collection.immutable.HashMap$$anon$1", {
  sci_HashMap$$anon$1: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$1.prototype.$classData = $d_sci_HashMap$$anon$1;
/** @constructor */
function $c_sci_HashMap$$anon$1$$anon$2() {
  $c_sci_HashMap$Merger.call(this);
  this.$$outer$2 = null
}
$c_sci_HashMap$$anon$1$$anon$2.prototype = new $h_sci_HashMap$Merger();
$c_sci_HashMap$$anon$1$$anon$2.prototype.constructor = $c_sci_HashMap$$anon$1$$anon$2;
/** @constructor */
function $h_sci_HashMap$$anon$1$$anon$2() {
  /*<skip>*/
}
$h_sci_HashMap$$anon$1$$anon$2.prototype = $c_sci_HashMap$$anon$1$$anon$2.prototype;
$c_sci_HashMap$$anon$1$$anon$2.prototype.init___sci_HashMap$$anon$1 = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
$c_sci_HashMap$$anon$1$$anon$2.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return $as_T2(this.$$outer$2.mergef$1$f.apply__O__O__O(kv2, kv1))
});
var $d_sci_HashMap$$anon$1$$anon$2 = new $TypeData().initClass({
  sci_HashMap$$anon$1$$anon$2: 0
}, false, "scala.collection.immutable.HashMap$$anon$1$$anon$2", {
  sci_HashMap$$anon$1$$anon$2: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$1$$anon$2.prototype.$classData = $d_sci_HashMap$$anon$1$$anon$2;
/** @constructor */
function $c_sci_List$$anon$1() {
  $c_O.call(this)
}
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
function $h_sci_List$$anon$1() {
  /*<skip>*/
}
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
function $f_scm_Builder__sizeHint__sc_TraversableLike__V($thiz, coll) {
  var x1 = coll.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(x1)
    }
  }
}
function $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V($thiz, size, boundingColl) {
  var x1 = boundingColl.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(((size < x1) ? size : x1))
    }
  }
}
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
}
/** @constructor */
function $c_sr_AbstractFunction0() {
  $c_O.call(this)
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
  /*<skip>*/
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
function $c_sr_AbstractFunction1() {
  $c_O.call(this)
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
  /*<skip>*/
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_sr_AbstractFunction2() {
  $c_O.call(this)
}
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
function $h_sr_AbstractFunction2() {
  /*<skip>*/
}
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
function $c_sr_AbstractFunction3() {
  $c_O.call(this)
}
$c_sr_AbstractFunction3.prototype = new $h_O();
$c_sr_AbstractFunction3.prototype.constructor = $c_sr_AbstractFunction3;
/** @constructor */
function $h_sr_AbstractFunction3() {
  /*<skip>*/
}
$h_sr_AbstractFunction3.prototype = $c_sr_AbstractFunction3.prototype;
/** @constructor */
function $c_sr_BooleanRef() {
  $c_O.call(this);
  this.elem$1 = false
}
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
function $h_sr_BooleanRef() {
  /*<skip>*/
}
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var b = this.elem$1;
  return ("" + b)
});
$c_sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
function $isArrayOf_sr_BoxedUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
}
function $asArrayOf_sr_BoxedUnit(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_IntRef() {
  $c_O.call(this);
  this.elem$1 = 0
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
  /*<skip>*/
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var i = this.elem$1;
  return ("" + i)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
function $c_sr_ObjectRef() {
  $c_O.call(this);
  this.elem$1 = null
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
  /*<skip>*/
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  var obj = this.elem$1;
  return ("" + obj)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype.fromComponent$1__p1__Lcom_seamless_contexts_data$undtypes_ShapeDescription__T__I__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_projections_Shape = (function(description, id, lastDepth, state$1) {
  var depth = ((1 + lastDepth) | 0);
  var x1 = description.type$1;
  var x = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$();
  if ((x === x1)) {
    var jsx$3 = $as_sc_TraversableLike(description.fields$1.get__O());
    var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, state$1$1, depth$1) {
      return (function(i$2) {
        var i = $as_T(i$2);
        var this$1 = state$1$1.components$1;
        var this$2 = this$1.iterator__sc_Iterator();
        inlinereturn$5: {
          while (this$2.hasNext__Z()) {
            var a = this$2.next__O();
            var c = $as_T2(a);
            var x$1 = c.$$und1$f;
            if (((x$1 === null) ? (i === null) : $objectEquals(x$1, i))) {
              var jsx$2 = new $c_s_Some().init___O(a);
              break inlinereturn$5
            }
          };
          var jsx$2 = $m_s_None$()
        };
        var x1$1 = $as_T2(jsx$2.get__O());
        if ((x1$1 === null)) {
          throw new $c_s_MatchError().init___O(x1$1)
        };
        var fieldId = $as_T(x1$1.$$und1$f);
        var fDesc = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1$1.$$und2$f);
        return new $c_Lcom_seamless_contexts_data$undtypes_projections_Field().init___T__Lcom_seamless_contexts_data$undtypes_projections_Shape__T__I($as_T(fDesc.key$1.get__O()), $this.fromComponent$1__p1__Lcom_seamless_contexts_data$undtypes_ShapeDescription__T__I__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_projections_Shape(fDesc, fieldId, depth$1, state$1$1), fieldId, ((1 + depth$1) | 0))
      })
    })(this, state$1, depth));
    var this$3 = $m_sc_Seq$();
    var this$4 = $as_sc_SeqLike(jsx$3.map__F1__scg_CanBuildFrom__O(jsx$1, this$3.ReusableCBFInstance$2));
    var f$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, state$1$2) {
      return (function(f$2) {
        var f = $as_Lcom_seamless_contexts_data$undtypes_projections_Field(f$2);
        return state$1$2.creationOrder$1.indexOf__O__I(f)
      })
    })(this, state$1));
    var ord = $m_s_math_Ordering$Int$();
    var fields = $as_sc_TraversableOnce($f_sc_SeqLike__sortBy__F1__s_math_Ordering__O(this$4, f$1, ord)).toVector__sci_Vector();
    return new $c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__sci_Vector__T__I(description.type$1, fields, id, depth)
  } else if (x1.hasTypeParameters__Z()) {
    var this$5 = description.typeParameters$1;
    if (this$5.isEmpty__Z()) {
      var this$6 = $m_s_package$().Vector$1;
      var jsx$6 = this$6.NIL$6
    } else {
      var jsx$6 = this$5.get__O()
    };
    var jsx$5 = $as_sc_TraversableLike(jsx$6);
    var jsx$4 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1, state$1$3, depth$2) {
      return (function(id$2$2) {
        var id$2 = $as_T(id$2$2);
        var desc = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state$1$3.components$1.apply__O__O(id$2));
        return new $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter().init___Lcom_seamless_contexts_data$undtypes_projections_Shape__T__I(this$4$1.fromComponent$1__p1__Lcom_seamless_contexts_data$undtypes_ShapeDescription__T__I__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_projections_Shape(desc, id$2, depth$2, state$1$3), id$2, ((1 + depth$2) | 0))
      })
    })(this, state$1, depth));
    var this$7 = $m_sc_Seq$();
    var parameters = $as_sc_TraversableOnce(jsx$5.map__F1__scg_CanBuildFrom__O(jsx$4, this$7.ReusableCBFInstance$2)).toVector__sci_Vector();
    return new $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__sci_Vector__T__I(description.type$1, parameters, id, depth)
  } else {
    return new $c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__I(description.type$1, id, depth)
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype.fromState__Lcom_seamless_contexts_data$undtypes_DataTypesState__T__Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection = (function(state, conceptId) {
  var concept = $as_Lcom_seamless_contexts_data$undtypes_ConceptDescription(state.concepts$1.apply__O__O(conceptId));
  var rootComponent = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(state.conceptComponents__T__sci_Map(conceptId).apply__O__O(concept.root$1));
  var this$2 = state.concepts$1;
  var pf = new $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1().init___Lcom_seamless_contexts_data$undtypes_DataTypesState(state);
  var this$1 = $m_sci_Iterable$();
  var bf = this$1.ReusableCBFInstance$2;
  var this$3 = $as_sc_TraversableOnce($f_sc_TraversableLike__collect__s_PartialFunction__scg_CanBuildFrom__O(this$2, pf, bf)).toVector__sci_Vector();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2$2) {
      var x$2 = $as_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(x$2$2);
      return $uI(x$2.dependents__sjs_js_Array().length)
    })
  })(this));
  var ord = $m_s_math_Ordering$Int$();
  var allowedTypeReferences = $as_sci_Vector($as_sc_SeqLike($f_sc_SeqLike__sortBy__F1__s_math_Ordering__O(this$3, f, ord)).reverse__O());
  return new $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection().init___Lcom_seamless_contexts_data$undtypes_projections_Shape__sci_Vector(this.fromComponent$1__p1__Lcom_seamless_contexts_data$undtypes_ShapeDescription__T__I__Lcom_seamless_contexts_data$undtypes_DataTypesState__Lcom_seamless_contexts_data$undtypes_projections_Shape(rootComponent, concept.root$1, (-1), state), allowedTypeReferences)
});
var $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$: 0
}, false, "com.seamless.contexts.data_types.projections.ShapeProjection$", {
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$;
var $n_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$)) {
    $n_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$ = new $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$
}
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Character() {
  $c_O.call(this);
  this.value$1 = 0
}
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
function $h_jl_Character() {
  /*<skip>*/
}
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ($is_jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g.String.fromCharCode(c))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
function $is_jl_Character(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
}
function $as_jl_Character(obj) {
  return (($is_jl_Character(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
}
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.doubleStrPat$1 = null;
  this.doubleStrHexPat$1 = null;
  this.bitmap$0$1 = 0
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
/** @constructor */
function $c_jl_Integer$() {
  $c_O.call(this)
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
  /*<skip>*/
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.init___ = (function() {
  return this
});
$c_jl_Integer$.prototype.reverseBytes__I__I = (function(i) {
  var byte3 = ((i >>> 24) | 0);
  var byte2 = (65280 & ((i >>> 8) | 0));
  var byte1 = (16711680 & (i << 8));
  var byte0 = (i << 24);
  return (((byte0 | byte1) | byte2) | byte3)
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
}
/** @constructor */
function $c_ju_Random$() {
  $c_O.call(this)
}
$c_ju_Random$.prototype = new $h_O();
$c_ju_Random$.prototype.constructor = $c_ju_Random$;
/** @constructor */
function $h_ju_Random$() {
  /*<skip>*/
}
$h_ju_Random$.prototype = $c_ju_Random$.prototype;
$c_ju_Random$.prototype.init___ = (function() {
  return this
});
$c_ju_Random$.prototype.java$util$Random$$randomSeed__J = (function() {
  var value = this.randomInt__p1__I();
  var value$1 = this.randomInt__p1__I();
  return new $c_sjsr_RuntimeLong().init___I__I(value$1, value)
});
$c_ju_Random$.prototype.randomInt__p1__I = (function() {
  var a = (4.294967296E9 * $uD($g.Math.random()));
  return $doubleToInt(((-2.147483648E9) + $uD($g.Math.floor(a))))
});
var $d_ju_Random$ = new $TypeData().initClass({
  ju_Random$: 0
}, false, "java.util.Random$", {
  ju_Random$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Random$.prototype.$classData = $d_ju_Random$;
var $n_ju_Random$ = (void 0);
function $m_ju_Random$() {
  if ((!$n_ju_Random$)) {
    $n_ju_Random$ = new $c_ju_Random$().init___()
  };
  return $n_ju_Random$
}
/** @constructor */
function $c_s_Predef$() {
  $c_s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
}
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
function $h_s_Predef$() {
  /*<skip>*/
}
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.init___ = (function() {
  $n_s_Predef$ = this;
  $m_s_package$();
  $m_sci_List$();
  this.Map$2 = $m_sci_Map$();
  this.Set$2 = $m_sci_Set$();
  this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
  this.NoManifest$2 = $m_s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$1().init___();
  this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$2().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$3().init___();
  return this
});
$c_s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed")
  }
});
var $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
var $n_s_Predef$ = (void 0);
function $m_s_Predef$() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
}
/** @constructor */
function $c_s_math_Fractional$() {
  $c_O.call(this)
}
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
function $h_s_math_Fractional$() {
  /*<skip>*/
}
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
$c_s_math_Fractional$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
function $m_s_math_Fractional$() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
}
/** @constructor */
function $c_s_math_Integral$() {
  $c_O.call(this)
}
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
function $h_s_math_Integral$() {
  /*<skip>*/
}
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
$c_s_math_Integral$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
function $m_s_math_Integral$() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
}
/** @constructor */
function $c_s_math_Numeric$() {
  $c_O.call(this)
}
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
function $h_s_math_Numeric$() {
  /*<skip>*/
}
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
$c_s_math_Numeric$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
function $m_s_math_Numeric$() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
}
function $is_s_math_ScalaNumber(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
}
function $as_s_math_ScalaNumber(obj) {
  return (($is_s_math_ScalaNumber(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
}
/** @constructor */
function $c_s_util_Either$() {
  $c_O.call(this)
}
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
function $h_s_util_Either$() {
  /*<skip>*/
}
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
$c_s_util_Either$.prototype.init___ = (function() {
  return this
});
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
function $m_s_util_Either$() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
}
/** @constructor */
function $c_s_util_Left$() {
  $c_O.call(this)
}
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
function $h_s_util_Left$() {
  /*<skip>*/
}
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.init___ = (function() {
  return this
});
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
function $m_s_util_Left$() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
}
/** @constructor */
function $c_s_util_Random() {
  $c_O.call(this);
  this.self$1 = null
}
$c_s_util_Random.prototype = new $h_O();
$c_s_util_Random.prototype.constructor = $c_s_util_Random;
/** @constructor */
function $h_s_util_Random() {
  /*<skip>*/
}
$h_s_util_Random.prototype = $c_s_util_Random.prototype;
$c_s_util_Random.prototype.init___ju_Random = (function(self) {
  this.self$1 = self;
  return this
});
$c_s_util_Random.prototype.nextAlphaNum$1__p1__C = (function() {
  var index = this.self$1.nextInt__I__I($uI("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".length));
  return (65535 & $uI("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charCodeAt(index)))
});
$c_s_util_Random.prototype.alphanumeric__sci_Stream = (function() {
  return $m_sci_Stream$().continually__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      var c = $this.nextAlphaNum$1__p1__C();
      return new $c_jl_Character().init___C(c)
    })
  })(this)))
});
/** @constructor */
function $c_s_util_Right$() {
  $c_O.call(this)
}
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
function $h_s_util_Right$() {
  /*<skip>*/
}
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.init___ = (function() {
  return this
});
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
function $m_s_util_Right$() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
}
/** @constructor */
function $c_s_util_control_NoStackTrace$() {
  $c_O.call(this);
  this.$$undnoSuppression$1 = false
}
$c_s_util_control_NoStackTrace$.prototype = new $h_O();
$c_s_util_control_NoStackTrace$.prototype.constructor = $c_s_util_control_NoStackTrace$;
/** @constructor */
function $h_s_util_control_NoStackTrace$() {
  /*<skip>*/
}
$h_s_util_control_NoStackTrace$.prototype = $c_s_util_control_NoStackTrace$.prototype;
$c_s_util_control_NoStackTrace$.prototype.init___ = (function() {
  this.$$undnoSuppression$1 = false;
  return this
});
var $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
var $n_s_util_control_NoStackTrace$ = (void 0);
function $m_s_util_control_NoStackTrace$() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
}
/** @constructor */
function $c_sc_IndexedSeq$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sc_IndexedSeq$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sc_IndexedSeq$$anon$1.prototype.constructor = $c_sc_IndexedSeq$$anon$1;
/** @constructor */
function $h_sc_IndexedSeq$$anon$1() {
  /*<skip>*/
}
$h_sc_IndexedSeq$$anon$1.prototype = $c_sc_IndexedSeq$$anon$1.prototype;
$c_sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
  return this
});
$c_sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
/** @constructor */
function $c_scg_GenSeqFactory() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_scg_GenSeqFactory.prototype = new $h_scg_GenTraversableFactory();
$c_scg_GenSeqFactory.prototype.constructor = $c_scg_GenSeqFactory;
/** @constructor */
function $h_scg_GenSeqFactory() {
  /*<skip>*/
}
$h_scg_GenSeqFactory.prototype = $c_scg_GenSeqFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
}
$c_scg_GenTraversableFactory$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_scg_GenTraversableFactory$$anon$1.prototype.constructor = $c_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $h_scg_GenTraversableFactory$$anon$1() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$$anon$1.prototype = $c_scg_GenTraversableFactory$$anon$1.prototype;
$c_scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
var $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $c_scg_ImmutableMapFactory() {
  $c_scg_MapFactory.call(this)
}
$c_scg_ImmutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_ImmutableMapFactory.prototype.constructor = $c_scg_ImmutableMapFactory;
/** @constructor */
function $h_scg_ImmutableMapFactory() {
  /*<skip>*/
}
$h_scg_ImmutableMapFactory.prototype = $c_scg_ImmutableMapFactory.prototype;
/** @constructor */
function $c_scg_MutableMapFactory() {
  $c_scg_MapFactory.call(this)
}
$c_scg_MutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_MutableMapFactory.prototype.constructor = $c_scg_MutableMapFactory;
/** @constructor */
function $h_scg_MutableMapFactory() {
  /*<skip>*/
}
$h_scg_MutableMapFactory.prototype = $c_scg_MutableMapFactory.prototype;
$c_scg_MutableMapFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_HashMap().init___()
});
/** @constructor */
function $c_sci_$colon$colon$() {
  $c_O.call(this)
}
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
function $h_sci_$colon$colon$() {
  /*<skip>*/
}
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.init___ = (function() {
  return this
});
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
function $m_sci_$colon$colon$() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
}
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  this.MAX$undPRINT$1 = 512;
  return this
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
/** @constructor */
function $c_sci_Stream$StreamCanBuildFrom() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sci_Stream$StreamCanBuildFrom.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sci_Stream$StreamCanBuildFrom.prototype.constructor = $c_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $h_sci_Stream$StreamCanBuildFrom() {
  /*<skip>*/
}
$h_sci_Stream$StreamCanBuildFrom.prototype = $c_sci_Stream$StreamCanBuildFrom.prototype;
$c_sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
  return this
});
var $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $c_scm_StringBuilder$() {
  $c_O.call(this)
}
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
function $h_scm_StringBuilder$() {
  /*<skip>*/
}
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
$c_scm_StringBuilder$.prototype.init___ = (function() {
  return this
});
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
function $m_scm_StringBuilder$() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
}
/** @constructor */
function $c_sjsr_AnonFunction0() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
function $h_sjsr_AnonFunction0() {
  /*<skip>*/
}
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
function $c_sjsr_AnonFunction1() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
function $h_sjsr_AnonFunction1() {
  /*<skip>*/
}
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
function $c_sjsr_AnonFunction2() {
  $c_sr_AbstractFunction2.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction2.prototype = new $h_sr_AbstractFunction2();
$c_sjsr_AnonFunction2.prototype.constructor = $c_sjsr_AnonFunction2;
/** @constructor */
function $h_sjsr_AnonFunction2() {
  /*<skip>*/
}
$h_sjsr_AnonFunction2.prototype = $c_sjsr_AnonFunction2.prototype;
$c_sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
var $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
  this.Zero$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.toUnsignedString__p1__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    return $as_T(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2))
  }
});
$c_sjsr_RuntimeLong$.prototype.divideImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if (((alo === (-2147483648)) && (blo === (-1)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return (-2147483648)
      } else {
        var lo = ((alo / blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
      return (-1)
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if ((neg === neg$1)) {
      return absRLo
    } else {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D = (function(lo, hi) {
  if ((hi < 0)) {
    var x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    var jsx$1 = $uD((x >>> 0));
    var x$1 = ((-lo) | 0);
    return (-((4.294967296E9 * jsx$1) + $uD((x$1 >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  var lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
    return 0
  } else if ((value >= 9.223372036854776E18)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
    return (-1)
  } else {
    var rawLo = $uI((value | 0));
    var x = (value / 4.294967296E9);
    var rawHi = $uI((x | 0));
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
    return rawLo
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$div__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
    return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return ((ahi >>> pow$2) | 0)
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toString__I__I__T = (function(lo, hi) {
  return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
});
$c_sjsr_RuntimeLong$.prototype.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  var lo = (((32 & n) === 0) ? (blo << n) : 0);
  var hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
  var bShiftLo = lo;
  var bShiftHi = hi;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var lo$1 = remLo;
      var hi$1 = remHi;
      var lo$2 = bShiftLo;
      var hi$2 = bShiftHi;
      var lo$3 = ((lo$1 - lo$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
      remLo = lo$3;
      remHi = hi$3;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$4 = bShiftLo;
    var hi$4 = bShiftHi;
    var lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
    var hi$5 = ((hi$4 >>> 1) | 0);
    bShiftLo = lo$5;
    bShiftHi = hi$5
  };
  var alo$2 = remLo;
  var ahi$2 = remHi;
  if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
    var lo$6 = remLo;
    var hi$6 = remHi;
    var remDouble = ((4.294967296E9 * hi$6) + $uD((lo$6 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var x = (remDouble / bDouble);
      var lo$7 = $uI((x | 0));
      var x$1 = (x / 4.294967296E9);
      var hi$7 = $uI((x$1 | 0));
      var lo$8 = quotLo;
      var hi$8 = quotHi;
      var lo$9 = ((lo$8 + lo$7) | 0);
      var hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
      quotLo = lo$9;
      quotHi = hi$9
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$2 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$2 | 0))
    }
  };
  if ((ask === 0)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
    var a = quotLo;
    return a
  } else if ((ask === 1)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
    var a$1 = remLo;
    return a$1
  } else {
    var lo$10 = quotLo;
    var hi$10 = quotHi;
    var quot = ((4.294967296E9 * hi$10) + $uD((lo$10 >>> 0)));
    var this$25 = remLo;
    var remStr = ("" + this$25);
    var a$2 = ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr);
    return a$2
  }
});
$c_sjsr_RuntimeLong$.prototype.remainderImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if ((blo !== (-1))) {
        var lo = ((alo % blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if (neg) {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    } else {
      return absRLo
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$percent__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return (alo & (((-1) + blo) | 0))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
    return alo
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
/** @constructor */
function $c_sr_AbstractPartialFunction() {
  $c_O.call(this)
}
$c_sr_AbstractPartialFunction.prototype = new $h_O();
$c_sr_AbstractPartialFunction.prototype.constructor = $c_sr_AbstractPartialFunction;
/** @constructor */
function $h_sr_AbstractPartialFunction() {
  /*<skip>*/
}
$h_sr_AbstractPartialFunction.prototype = $c_sr_AbstractPartialFunction.prototype;
$c_sr_AbstractPartialFunction.prototype.apply__O__O = (function(x) {
  return this.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().empty$undpf$1)
});
$c_sr_AbstractPartialFunction.prototype.runWith__F1__F1 = (function(action) {
  return $f_s_PartialFunction__runWith__F1__F1(this, action)
});
$c_sr_AbstractPartialFunction.prototype.toString__T = (function() {
  return "<function1>"
});
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
/** @constructor */
function $c_jl_AssertionError() {
  $c_jl_Error.call(this)
}
$c_jl_AssertionError.prototype = new $h_jl_Error();
$c_jl_AssertionError.prototype.constructor = $c_jl_AssertionError;
/** @constructor */
function $h_jl_AssertionError() {
  /*<skip>*/
}
$h_jl_AssertionError.prototype = $c_jl_AssertionError.prototype;
$c_jl_AssertionError.prototype.init___O = (function(detailMessage) {
  var message = ("" + detailMessage);
  if ($is_jl_Throwable(detailMessage)) {
    var x2 = $as_jl_Throwable(detailMessage);
    var cause = x2
  } else {
    var cause = null
  };
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, message, cause, true, true);
  return this
});
var $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_jl_StringBuilder() {
  $c_O.call(this);
  this.java$lang$StringBuilder$$content$f = null
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
  /*<skip>*/
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  this.java$lang$StringBuilder$$content$f = "";
  return this
});
$c_jl_StringBuilder.prototype.init___jl_CharSequence = (function(seq) {
  $c_jl_StringBuilder.prototype.init___T.call(this, $objectToString(seq));
  return this
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.java$lang$StringBuilder$$content$f
});
$c_jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  $c_jl_StringBuilder.prototype.init___.call(this);
  if ((initialCapacity < 0)) {
    throw new $c_jl_NegativeArraySizeException().init___()
  };
  return this
});
$c_jl_StringBuilder.prototype.length__I = (function() {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return $uI(thiz.length)
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  var str = $as_T($g.String.fromCharCode(c));
  this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + str);
  return this
});
$c_jl_StringBuilder.prototype.init___T = (function(str) {
  $c_jl_StringBuilder.prototype.init___.call(this);
  if ((str === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  this.java$lang$StringBuilder$$content$f = str;
  return this
});
$c_jl_StringBuilder.prototype.charAt__I__C = (function(index) {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return (65535 & $uI(thiz.charCodeAt(index)))
});
$c_jl_StringBuilder.prototype.reverse__jl_StringBuilder = (function() {
  var original = this.java$lang$StringBuilder$$content$f;
  var result = "";
  var i = (((-1) + $uI(original.length)) | 0);
  while ((i > 0)) {
    var index = i;
    var c = (65535 & $uI(original.charCodeAt(index)));
    if (((64512 & c) === 56320)) {
      var index$1 = (((-1) + i) | 0);
      var c2 = (65535 & $uI(original.charCodeAt(index$1)));
      if (((64512 & c2) === 55296)) {
        result = ((("" + result) + $as_T($g.String.fromCharCode(c2))) + $as_T($g.String.fromCharCode(c)));
        i = (((-2) + i) | 0)
      } else {
        result = (("" + result) + $as_T($g.String.fromCharCode(c)));
        i = (((-1) + i) | 0)
      }
    } else {
      result = (("" + result) + $as_T($g.String.fromCharCode(c)));
      i = (((-1) + i) | 0)
    }
  };
  if ((i === 0)) {
    var jsx$1 = result;
    var c$1 = (65535 & $uI(original.charCodeAt(0)));
    result = (("" + jsx$1) + $as_T($g.String.fromCharCode(c$1)))
  };
  this.java$lang$StringBuilder$$content$f = result;
  return this
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
/** @constructor */
function $c_s_Array$() {
  $c_s_FallbackArrayBuilding.call(this)
}
$c_s_Array$.prototype = new $h_s_FallbackArrayBuilding();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
  /*<skip>*/
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  return this
});
$c_s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
}
/** @constructor */
function $c_s_Predef$$eq$colon$eq() {
  $c_O.call(this)
}
$c_s_Predef$$eq$colon$eq.prototype = new $h_O();
$c_s_Predef$$eq$colon$eq.prototype.constructor = $c_s_Predef$$eq$colon$eq;
/** @constructor */
function $h_s_Predef$$eq$colon$eq() {
  /*<skip>*/
}
$h_s_Predef$$eq$colon$eq.prototype = $c_s_Predef$$eq$colon$eq.prototype;
$c_s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_s_Predef$$less$colon$less() {
  $c_O.call(this)
}
$c_s_Predef$$less$colon$less.prototype = new $h_O();
$c_s_Predef$$less$colon$less.prototype.constructor = $c_s_Predef$$less$colon$less;
/** @constructor */
function $h_s_Predef$$less$colon$less() {
  /*<skip>*/
}
$h_s_Predef$$less$colon$less.prototype = $c_s_Predef$$less$colon$less.prototype;
$c_s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_s_math_Equiv$() {
  $c_O.call(this)
}
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
function $h_s_math_Equiv$() {
  /*<skip>*/
}
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
function $m_s_math_Equiv$() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
}
/** @constructor */
function $c_s_math_Ordering$() {
  $c_O.call(this)
}
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
function $h_s_math_Ordering$() {
  /*<skip>*/
}
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
function $m_s_math_Ordering$() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
}
/** @constructor */
function $c_s_reflect_NoManifest$() {
  $c_O.call(this)
}
$c_s_reflect_NoManifest$.prototype = new $h_O();
$c_s_reflect_NoManifest$.prototype.constructor = $c_s_reflect_NoManifest$;
/** @constructor */
function $h_s_reflect_NoManifest$() {
  /*<skip>*/
}
$h_s_reflect_NoManifest$.prototype = $c_s_reflect_NoManifest$.prototype;
$c_s_reflect_NoManifest$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
var $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
var $n_s_reflect_NoManifest$ = (void 0);
function $m_s_reflect_NoManifest$() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
}
/** @constructor */
function $c_s_util_Random$() {
  $c_s_util_Random.call(this)
}
$c_s_util_Random$.prototype = new $h_s_util_Random();
$c_s_util_Random$.prototype.constructor = $c_s_util_Random$;
/** @constructor */
function $h_s_util_Random$() {
  /*<skip>*/
}
$h_s_util_Random$.prototype = $c_s_util_Random$.prototype;
$c_s_util_Random$.prototype.init___ = (function() {
  $c_s_util_Random.prototype.init___ju_Random.call(this, new $c_ju_Random().init___());
  return this
});
var $d_s_util_Random$ = new $TypeData().initClass({
  s_util_Random$: 0
}, false, "scala.util.Random$", {
  s_util_Random$: 1,
  s_util_Random: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Random$.prototype.$classData = $d_s_util_Random$;
var $n_s_util_Random$ = (void 0);
function $m_s_util_Random$() {
  if ((!$n_s_util_Random$)) {
    $n_s_util_Random$ = new $c_s_util_Random$().init___()
  };
  return $n_s_util_Random$
}
/** @constructor */
function $c_sc_AbstractIterator() {
  $c_O.call(this)
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
  /*<skip>*/
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return "<iterator>"
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_Iterator__foreach__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.toVector__sci_Vector = (function() {
  $m_sci_Vector$();
  var cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
  return $as_sci_Vector($f_sc_TraversableOnce__to__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return $f_sc_Iterator__toStream__sci_Stream(this)
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractIterator.prototype.toSeq__sc_Seq = (function() {
  return this.toStream__sci_Stream()
});
$c_sc_AbstractIterator.prototype.toSet__sci_Set = (function() {
  var this$1 = $m_sci_Set$();
  var cbf = new $c_scg_GenSetFactory$$anon$1().init___scg_GenSetFactory(this$1);
  return $as_sci_Set($f_sc_TraversableOnce__to__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractIterator.prototype.toMap__s_Predef$$less$colon$less__sci_Map = (function(ev) {
  var b = new $c_scm_MapBuilder().init___sc_GenMap($m_sci_Map$EmptyMap$());
  while (this.hasNext__Z()) {
    var arg1 = this.next__O();
    b.$$plus$eq__T2__scm_MapBuilder($as_T2(arg1))
  };
  return $as_sci_Map(b.elems$1)
});
$c_sc_AbstractIterator.prototype.drop__I__sc_Iterator = (function(n) {
  return $f_sc_Iterator__drop__I__sc_Iterator(this, n)
});
/** @constructor */
function $c_scg_SetFactory() {
  $c_scg_GenSetFactory.call(this)
}
$c_scg_SetFactory.prototype = new $h_scg_GenSetFactory();
$c_scg_SetFactory.prototype.constructor = $c_scg_SetFactory;
/** @constructor */
function $h_scg_SetFactory() {
  /*<skip>*/
}
$h_scg_SetFactory.prototype = $c_scg_SetFactory.prototype;
/** @constructor */
function $c_sci_Map$() {
  $c_scg_ImmutableMapFactory.call(this)
}
$c_sci_Map$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
  /*<skip>*/
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.init___ = (function() {
  return this
});
$c_sci_Map$.prototype.empty__sc_GenMap = (function() {
  return $m_sci_Map$EmptyMap$()
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
}
/** @constructor */
function $c_scm_DefaultEntry() {
  $c_O.call(this);
  this.key$1 = null;
  this.value$1 = null;
  this.next$1 = null
}
$c_scm_DefaultEntry.prototype = new $h_O();
$c_scm_DefaultEntry.prototype.constructor = $c_scm_DefaultEntry;
/** @constructor */
function $h_scm_DefaultEntry() {
  /*<skip>*/
}
$h_scm_DefaultEntry.prototype = $c_scm_DefaultEntry.prototype;
$c_scm_DefaultEntry.prototype.chainString__T = (function() {
  var jsx$3 = this.key$1;
  var jsx$2 = this.value$1;
  if ((this.next$1 !== null)) {
    var this$1 = this.next$1;
    var jsx$1 = (" -> " + this$1.chainString__T())
  } else {
    var jsx$1 = ""
  };
  return ((((("(kv: " + jsx$3) + ", ") + jsx$2) + ")") + jsx$1)
});
$c_scm_DefaultEntry.prototype.init___O__O = (function(key, value) {
  this.key$1 = key;
  this.value$1 = value;
  return this
});
$c_scm_DefaultEntry.prototype.toString__T = (function() {
  return this.chainString__T()
});
function $is_scm_DefaultEntry(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_DefaultEntry)))
}
function $as_scm_DefaultEntry(obj) {
  return (($is_scm_DefaultEntry(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.DefaultEntry"))
}
function $isArrayOf_scm_DefaultEntry(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_DefaultEntry)))
}
function $asArrayOf_scm_DefaultEntry(obj, depth) {
  return (($isArrayOf_scm_DefaultEntry(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.DefaultEntry;", depth))
}
var $d_scm_DefaultEntry = new $TypeData().initClass({
  scm_DefaultEntry: 0
}, false, "scala.collection.mutable.DefaultEntry", {
  scm_DefaultEntry: 1,
  O: 1,
  scm_HashEntry: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_DefaultEntry.prototype.$classData = $d_scm_DefaultEntry;
/** @constructor */
function $c_scm_GrowingBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_GrowingBuilder.prototype = new $h_O();
$c_scm_GrowingBuilder.prototype.constructor = $c_scm_GrowingBuilder;
/** @constructor */
function $h_scm_GrowingBuilder() {
  /*<skip>*/
}
$h_scm_GrowingBuilder.prototype = $c_scm_GrowingBuilder.prototype;
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
$c_scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var blo = b.lo$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var a0b0 = $imul(a0, b0);
  var a1b0 = $imul(a1, b0);
  var a0b1 = $imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi = (((((((($imul(alo, b.hi$2) + $imul(this.hi$2, blo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo + b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo - b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_ConceptDescription() {
  $c_O.call(this);
  this.name$1 = null;
  this.root$1 = null;
  this.deprecated$1 = false
}
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_ConceptDescription;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_ConceptDescription() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype = $c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype;
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.productPrefix__T = (function() {
  return "ConceptDescription"
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_ConceptDescription(x$1)) {
    var ConceptDescription$1 = $as_Lcom_seamless_contexts_data$undtypes_ConceptDescription(x$1);
    return (((this.name$1 === ConceptDescription$1.name$1) && (this.root$1 === ConceptDescription$1.root$1)) && (this.deprecated$1 === ConceptDescription$1.deprecated$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.name$1;
      break
    }
    case 1: {
      return this.root$1;
      break
    }
    case 2: {
      return this.deprecated$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.init___T__T__Z = (function(name, root, deprecated) {
  this.name$1 = name;
  this.root$1 = root;
  this.deprecated$1 = deprecated;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.name$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.root$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, (this.deprecated$1 ? 1231 : 1237));
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_ConceptDescription(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_ConceptDescription)))
}
function $as_Lcom_seamless_contexts_data$undtypes_ConceptDescription(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_ConceptDescription(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.ConceptDescription"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_ConceptDescription(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_ConceptDescription)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_ConceptDescription(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_ConceptDescription(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.ConceptDescription;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_ConceptDescription = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_ConceptDescription: 0
}, false, "com.seamless.contexts.data_types.ConceptDescription", {
  Lcom_seamless_contexts_data$undtypes_ConceptDescription: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_ConceptDescription.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_ConceptDescription;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_DataTypesState() {
  $c_O.call(this);
  this.components$1 = null;
  this.concepts$1 = null;
  this.creationOrder$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_DataTypesState;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_DataTypesState() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype = $c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype;
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.productPrefix__T = (function() {
  return "DataTypesState"
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.deleteId__T__Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(id) {
  var components = $as_sci_Map(this.components$1.$$minus__O__sc_Map(id));
  var concepts = this.concepts$1;
  var creationOrder = this.creationOrder$1;
  return new $c_Lcom_seamless_contexts_data$undtypes_DataTypesState().init___sci_Map__sci_Map__sc_Seq(components, concepts, creationOrder)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.init___sci_Map__sci_Map__sc_Seq = (function(components, concepts, creationOrder) {
  this.components$1 = components;
  this.concepts$1 = concepts;
  this.creationOrder$1 = creationOrder;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.putId__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(id, description) {
  var created = (!this.creationOrder$1.contains__O__Z(id));
  var jsx$4 = this.components$1.$$plus__T2__sci_Map(new $c_T2().init___O__O(id, description));
  var jsx$3 = this.concepts$1;
  if (created) {
    var jsx$2 = this.creationOrder$1;
    var this$3 = $m_sc_Seq$();
    var jsx$1 = $as_sc_Seq(jsx$2.$$colon$plus__O__scg_CanBuildFrom__O(id, this$3.ReusableCBFInstance$2))
  } else {
    var jsx$1 = this.creationOrder$1
  };
  return new $c_Lcom_seamless_contexts_data$undtypes_DataTypesState().init___sci_Map__sci_Map__sc_Seq(jsx$4, jsx$3, jsx$1)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_DataTypesState(x$1)) {
    var DataTypesState$1 = $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(x$1);
    var x = this.components$1;
    var x$2 = DataTypesState$1.components$1;
    if (((x === null) ? (x$2 === null) : $f_sc_GenMapLike__equals__O__Z(x, x$2))) {
      var x$3 = this.concepts$1;
      var x$4 = DataTypesState$1.concepts$1;
      var jsx$1 = ((x$3 === null) ? (x$4 === null) : $f_sc_GenMapLike__equals__O__Z(x$3, x$4))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$5 = this.creationOrder$1;
      var x$6 = DataTypesState$1.creationOrder$1;
      return ((x$5 === null) ? (x$6 === null) : x$5.equals__O__Z(x$6))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.components$1;
      break
    }
    case 1: {
      return this.concepts$1;
      break
    }
    case 2: {
      return this.creationOrder$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.conceptComponents__T__sci_Map = (function(conceptId) {
  return $as_sci_Map(this.components$1.filter__F1__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, conceptId$1) {
    return (function(i$2) {
      var i = $as_T2(i$2);
      return ($as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(i.$$und2$f).conceptId$1 === conceptId$1)
    })
  })(this, conceptId))))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.getPastFields__T__sc_Seq = (function(id) {
  var this$2 = this.components$1;
  var pf = new $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1().init___Lcom_seamless_contexts_data$undtypes_DataTypesState__T(this, id);
  var this$1 = $m_sci_Iterable$();
  var bf = this$1.ReusableCBFInstance$2;
  return $as_sc_TraversableOnce($f_sc_TraversableLike__collect__s_PartialFunction__scg_CanBuildFrom__O(this$2, pf, bf)).toSeq__sc_Seq()
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.putConceptId__T__Lcom_seamless_contexts_data$undtypes_ConceptDescription__Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(id, description) {
  var created = (!this.creationOrder$1.contains__O__Z(id));
  var jsx$4 = this.components$1;
  var jsx$3 = this.concepts$1.$$plus__T2__sci_Map(new $c_T2().init___O__O(id, description));
  if (created) {
    var jsx$2 = this.creationOrder$1;
    var this$3 = $m_sc_Seq$();
    var jsx$1 = $as_sc_Seq(jsx$2.$$colon$plus__O__scg_CanBuildFrom__O(id, this$3.ReusableCBFInstance$2))
  } else {
    var jsx$1 = this.creationOrder$1
  };
  return new $c_Lcom_seamless_contexts_data$undtypes_DataTypesState().init___sci_Map__sci_Map__sc_Seq(jsx$4, jsx$3, jsx$1)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_DataTypesState(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_DataTypesState)))
}
function $as_Lcom_seamless_contexts_data$undtypes_DataTypesState(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_DataTypesState(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.DataTypesState"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_DataTypesState(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_DataTypesState)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_DataTypesState(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_DataTypesState(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.DataTypesState;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_DataTypesState = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_DataTypesState: 0
}, false, "com.seamless.contexts.data_types.DataTypesState", {
  Lcom_seamless_contexts_data$undtypes_DataTypesState: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_DataTypesState;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$() {
  $c_sr_AbstractFunction3.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype = new $h_sr_AbstractFunction3();
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_DataTypesState$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype = $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype.toString__T = (function() {
  return "DataTypesState"
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype.apply$default$3__sc_Seq = (function() {
  var jsx$1 = $m_sc_Seq$();
  var array = ["root"];
  return $as_sc_Seq(jsx$1.apply__sc_Seq__sc_GenTraversable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(array)))
});
var $d_Lcom_seamless_contexts_data$undtypes_DataTypesState$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_DataTypesState$: 0
}, false, "com.seamless.contexts.data_types.DataTypesState$", {
  Lcom_seamless_contexts_data$undtypes_DataTypesState$: 1,
  sr_AbstractFunction3: 1,
  O: 1,
  F3: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_DataTypesState$;
var $n_Lcom_seamless_contexts_data$undtypes_DataTypesState$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_DataTypesState$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_DataTypesState$)) {
    $n_Lcom_seamless_contexts_data$undtypes_DataTypesState$ = new $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_DataTypesState$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription() {
  $c_O.call(this);
  this.type$1 = null;
  this.parentId$1 = null;
  this.conceptId$1 = null;
  this.key$1 = null;
  this.fields$1 = null;
  this.typeParameters$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_ShapeDescription() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype = $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype;
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option = (function(type, parentId, conceptId, key, fields, typeParameters) {
  this.type$1 = type;
  this.parentId$1 = parentId;
  this.conceptId$1 = conceptId;
  this.key$1 = key;
  this.fields$1 = fields;
  this.typeParameters$1 = typeParameters;
  if (type.hasFields__Z()) {
    var requirement = fields.isDefined__Z();
    if ((!requirement)) {
      throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Fields must be defined for type object")
    }
  } else {
    var requirement$1 = fields.isEmpty__Z();
    if ((!requirement$1)) {
      throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Fields can not be set unless type is Object")
    }
  };
  if (type.hasTypeParameters__Z()) {
    var requirement$2 = typeParameters.isDefined__Z();
    if ((!requirement$2)) {
      throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + this.type$1) + " must have type parameters"))
    }
  } else {
    var requirement$3 = typeParameters.isEmpty__Z();
    if ((!requirement$3)) {
      throw new $c_jl_IllegalArgumentException().init___T((("requirement failed: " + this.type$1) + " does not accept type parameters"))
    }
  };
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.productPrefix__T = (function() {
  return "ShapeDescription"
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.appendField__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription = (function(fieldId) {
  var requirement = (this.type$1.hasFields__Z() && this.fields$1.isDefined__Z());
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Can not append fields to a non object")
  };
  var jsx$1 = $as_sc_SeqLike(this.fields$1.get__O());
  var this$2 = $m_sc_Seq$();
  var x$1 = new $c_s_Some().init___O(jsx$1.$$colon$plus__O__scg_CanBuildFrom__O(fieldId, this$2.ReusableCBFInstance$2));
  var x$2 = this.type$1;
  var x$3 = this.parentId$1;
  var x$4 = this.conceptId$1;
  var x$5 = this.key$1;
  var x$6 = this.typeParameters$1;
  return new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(x$2, x$3, x$4, x$5, x$1, x$6)
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.productArity__I = (function() {
  return 6
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.removeTypeParameter__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription = (function(typeParamId) {
  var requirement = (this.type$1.hasTypeParameters__Z() && this.typeParameters$1.isDefined__Z());
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Can not remove type parameters for a type that does not support them")
  };
  var x$1 = new $c_s_Some().init___O($as_sc_TraversableLike(this.typeParameters$1.get__O()).filterNot__F1__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, typeParamId$1) {
    return (function(i$2) {
      var i = $as_T(i$2);
      return (i === typeParamId$1)
    })
  })(this, typeParamId))));
  var x$2 = this.type$1;
  var x$3 = this.parentId$1;
  var x$4 = this.conceptId$1;
  var x$5 = this.key$1;
  var x$6 = this.fields$1;
  return new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(x$2, x$3, x$4, x$5, x$6, x$1)
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x$1)) {
    var ShapeDescription$1 = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x$1);
    var x = this.type$1;
    var x$2 = ShapeDescription$1.type$1;
    if (((((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)) && (this.parentId$1 === ShapeDescription$1.parentId$1)) && (this.conceptId$1 === ShapeDescription$1.conceptId$1))) {
      var x$3 = this.key$1;
      var x$4 = ShapeDescription$1.key$1;
      var jsx$2 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var x$5 = this.fields$1;
      var x$6 = ShapeDescription$1.fields$1;
      var jsx$1 = ((x$5 === null) ? (x$6 === null) : x$5.equals__O__Z(x$6))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$7 = this.typeParameters$1;
      var x$8 = ShapeDescription$1.typeParameters$1;
      return ((x$7 === null) ? (x$8 === null) : x$7.equals__O__Z(x$8))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.type$1;
      break
    }
    case 1: {
      return this.parentId$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    case 3: {
      return this.key$1;
      break
    }
    case 4: {
      return this.fields$1;
      break
    }
    case 5: {
      return this.typeParameters$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.removeField__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription = (function(fieldId) {
  var requirement = (this.type$1.hasFields__Z() && this.fields$1.isDefined__Z());
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Can not remove fields to a non object")
  };
  var x$1 = new $c_s_Some().init___O($as_sc_TraversableLike(this.fields$1.get__O()).filterNot__F1__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, fieldId$1) {
    return (function(i$2) {
      var i = $as_T(i$2);
      return (i === fieldId$1)
    })
  })(this, fieldId))));
  var x$2 = this.type$1;
  var x$3 = this.parentId$1;
  var x$4 = this.conceptId$1;
  var x$5 = this.key$1;
  var x$6 = this.typeParameters$1;
  return new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(x$2, x$3, x$4, x$5, x$1, x$6)
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.appendTypeParameter__T__Lcom_seamless_contexts_data$undtypes_ShapeDescription = (function(typeParamId) {
  var requirement = (this.type$1.hasTypeParameters__Z() && this.typeParameters$1.isDefined__Z());
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: Can not add type parameters to a type that does not support them")
  };
  var jsx$1 = $as_sc_SeqLike(this.typeParameters$1.get__O());
  var this$2 = $m_sc_Seq$();
  var x$1 = new $c_s_Some().init___O(jsx$1.$$colon$plus__O__scg_CanBuildFrom__O(typeParamId, this$2.ReusableCBFInstance$2));
  var x$2 = this.type$1;
  var x$3 = this.parentId$1;
  var x$4 = this.conceptId$1;
  var x$5 = this.key$1;
  var x$6 = this.fields$1;
  return new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(x$2, x$3, x$4, x$5, x$6, x$1)
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.updateType__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__sc_Seq__Lcom_seamless_contexts_data$undtypes_ShapeDescription = (function(newType, pastFieldIds) {
  var newTypeParameters = (newType.hasTypeParameters__Z() ? new $c_s_Some().init___O($m_sc_Seq$().apply__sc_Seq__sc_GenTraversable($m_sci_Nil$())) : $m_s_None$());
  if ((newType.hasFields__Z() && (!this.type$1.hasFields__Z()))) {
    var x$2 = new $c_s_Some().init___O(pastFieldIds);
    var x$4 = this.parentId$1;
    var x$5 = this.conceptId$1;
    var x$6 = this.key$1;
    return new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(newType, x$4, x$5, x$6, x$2, newTypeParameters)
  } else {
    var x$8 = $m_s_None$();
    var x$10 = this.parentId$1;
    var x$11 = this.conceptId$1;
    var x$12 = this.key$1;
    return new $c_Lcom_seamless_contexts_data$undtypes_ShapeDescription().init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__T__s_Option__s_Option__s_Option(newType, x$10, x$11, x$12, x$8, newTypeParameters)
  }
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_ShapeDescription(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_ShapeDescription)))
}
function $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_ShapeDescription(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.ShapeDescription"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_ShapeDescription(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_ShapeDescription)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_ShapeDescription(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_ShapeDescription(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.ShapeDescription;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_ShapeDescription = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_ShapeDescription: 0
}, false, "com.seamless.contexts.data_types.ShapeDescription", {
  Lcom_seamless_contexts_data$undtypes_ShapeDescription: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_ShapeDescription.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_ShapeDescription;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference() {
  $c_O.call(this);
  this.name$1 = null;
  this.id$1 = null;
  this.$$unddependents$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.init___T__T__sci_Vector = (function(name, id, _dependents) {
  this.name$1 = name;
  this.id$1 = id;
  this.$$unddependents$1 = _dependents;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.productPrefix__T = (function() {
  return "AllowedTypeReference"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.$$js$exported$prop$name__O = (function() {
  return this.name$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(x$1)) {
    var AllowedTypeReference$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(x$1);
    if (((this.name$1 === AllowedTypeReference$1.name$1) && (this.id$1 === AllowedTypeReference$1.id$1))) {
      var x = this.$$unddependents$1;
      var x$2 = AllowedTypeReference$1.$$unddependents$1;
      return ((x === null) ? (x$2 === null) : $f_sc_GenSeqLike__equals__O__Z(x, x$2))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.name$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.$$unddependents$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.$$js$exported$prop$$unddependents__O = (function() {
  return this.$$unddependents$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.$$js$exported$prop$dependents__O = (function() {
  return this.dependents__sjs_js_Array()
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.dependents__sjs_js_Array = (function() {
  var jsx$1 = $m_sjs_js_JSConverters$JSRichGenTraversableOnce$();
  var col = this.$$unddependents$1;
  return jsx$1.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array(col)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype, "dependents", {
  "get": (function() {
    return this.$$js$exported$prop$dependents__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype, "_dependents", {
  "get": (function() {
    return this.$$js$exported$prop$$unddependents__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype, "name", {
  "get": (function() {
    return this.$$js$exported$prop$name__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.AllowedTypeReference"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.AllowedTypeReference;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference: 0
}, false, "com.seamless.contexts.data_types.projections.AllowedTypeReference", {
  Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection() {
  $c_O.call(this);
  this.root$1 = null;
  this.$$undallowedTypeReferences$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.productPrefix__T = (function() {
  return "ShapeProjection"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.productArity__I = (function() {
  return 2
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(x$1)) {
    var ShapeProjection$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(x$1);
    var x = this.root$1;
    var x$2 = ShapeProjection$1.root$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.$$undallowedTypeReferences$1;
      var x$4 = ShapeProjection$1.$$undallowedTypeReferences$1;
      return ((x$3 === null) ? (x$4 === null) : $f_sc_GenSeqLike__equals__O__Z(x$3, x$4))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.root$1;
      break
    }
    case 1: {
      return this.$$undallowedTypeReferences$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.allowedTypeReferences__sjs_js_Array = (function() {
  var jsx$1 = $m_sjs_js_JSConverters$JSRichGenTraversableOnce$();
  var col = this.$$undallowedTypeReferences$1;
  return jsx$1.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array(col)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.$$js$exported$prop$allowedTypeReferences__O = (function() {
  return this.allowedTypeReferences__sjs_js_Array()
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.init___Lcom_seamless_contexts_data$undtypes_projections_Shape__sci_Vector = (function(root, _allowedTypeReferences) {
  this.root$1 = root;
  this.$$undallowedTypeReferences$1 = _allowedTypeReferences;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.$$js$exported$prop$root__O = (function() {
  return this.root$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.$$js$exported$prop$$undallowedTypeReferences__O = (function() {
  return this.$$undallowedTypeReferences$1
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype, "allowedTypeReferences", {
  "get": (function() {
    return this.$$js$exported$prop$allowedTypeReferences__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype, "_allowedTypeReferences", {
  "get": (function() {
    return this.$$js$exported$prop$$undallowedTypeReferences__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype, "root", {
  "get": (function() {
    return this.$$js$exported$prop$root__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.ShapeProjection"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.ShapeProjection;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection: 0
}, false, "com.seamless.contexts.data_types.projections.ShapeProjection", {
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection;
/** @constructor */
function $c_Lcom_seamless_contexts_rfc_RfcState() {
  $c_O.call(this);
  this.dataTypes$1 = null
}
$c_Lcom_seamless_contexts_rfc_RfcState.prototype = new $h_O();
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.constructor = $c_Lcom_seamless_contexts_rfc_RfcState;
/** @constructor */
function $h_Lcom_seamless_contexts_rfc_RfcState() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_rfc_RfcState.prototype = $c_Lcom_seamless_contexts_rfc_RfcState.prototype;
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.productPrefix__T = (function() {
  return "RfcState"
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.productArity__I = (function() {
  return 1
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.init___Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(dataTypes) {
  this.dataTypes$1 = dataTypes;
  return this
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_rfc_RfcState(x$1)) {
    var RfcState$1 = $as_Lcom_seamless_contexts_rfc_RfcState(x$1);
    var x = this.dataTypes$1;
    var x$2 = RfcState$1.dataTypes$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.dataTypes$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_rfc_RfcState(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_rfc_RfcState)))
}
function $as_Lcom_seamless_contexts_rfc_RfcState(obj) {
  return (($is_Lcom_seamless_contexts_rfc_RfcState(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.rfc.RfcState"))
}
function $isArrayOf_Lcom_seamless_contexts_rfc_RfcState(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_rfc_RfcState)))
}
function $asArrayOf_Lcom_seamless_contexts_rfc_RfcState(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_rfc_RfcState(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.rfc.RfcState;", depth))
}
var $d_Lcom_seamless_contexts_rfc_RfcState = new $TypeData().initClass({
  Lcom_seamless_contexts_rfc_RfcState: 0
}, false, "com.seamless.contexts.rfc.RfcState", {
  Lcom_seamless_contexts_rfc_RfcState: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_rfc_RfcState.prototype.$classData = $d_Lcom_seamless_contexts_rfc_RfcState;
/** @constructor */
function $c_Lcom_seamless_ddd_Effects() {
  $c_O.call(this);
  this.eventsToPersist$1 = null
}
$c_Lcom_seamless_ddd_Effects.prototype = new $h_O();
$c_Lcom_seamless_ddd_Effects.prototype.constructor = $c_Lcom_seamless_ddd_Effects;
/** @constructor */
function $h_Lcom_seamless_ddd_Effects() {
  /*<skip>*/
}
$h_Lcom_seamless_ddd_Effects.prototype = $c_Lcom_seamless_ddd_Effects.prototype;
$c_Lcom_seamless_ddd_Effects.prototype.productPrefix__T = (function() {
  return "Effects"
});
$c_Lcom_seamless_ddd_Effects.prototype.productArity__I = (function() {
  return 1
});
$c_Lcom_seamless_ddd_Effects.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_ddd_Effects(x$1)) {
    var Effects$1 = $as_Lcom_seamless_ddd_Effects(x$1);
    var x = this.eventsToPersist$1;
    var x$2 = Effects$1.eventsToPersist$1;
    return ((x === null) ? (x$2 === null) : $f_sc_GenSeqLike__equals__O__Z(x, x$2))
  } else {
    return false
  }
});
$c_Lcom_seamless_ddd_Effects.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.eventsToPersist$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_ddd_Effects.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_ddd_Effects.prototype.init___sci_Vector = (function(eventsToPersist) {
  this.eventsToPersist$1 = eventsToPersist;
  return this
});
$c_Lcom_seamless_ddd_Effects.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_ddd_Effects.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_ddd_Effects(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_ddd_Effects)))
}
function $as_Lcom_seamless_ddd_Effects(obj) {
  return (($is_Lcom_seamless_ddd_Effects(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.ddd.Effects"))
}
function $isArrayOf_Lcom_seamless_ddd_Effects(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_ddd_Effects)))
}
function $asArrayOf_Lcom_seamless_ddd_Effects(obj, depth) {
  return (($isArrayOf_Lcom_seamless_ddd_Effects(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.ddd.Effects;", depth))
}
var $d_Lcom_seamless_ddd_Effects = new $TypeData().initClass({
  Lcom_seamless_ddd_Effects: 0
}, false, "com.seamless.ddd.Effects", {
  Lcom_seamless_ddd_Effects: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_ddd_Effects.prototype.$classData = $d_Lcom_seamless_ddd_Effects;
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
function $is_jl_ClassCastException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
}
function $as_jl_ClassCastException(obj) {
  return (($is_jl_ClassCastException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
}
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_jl_NegativeArraySizeException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NegativeArraySizeException.prototype = new $h_jl_RuntimeException();
$c_jl_NegativeArraySizeException.prototype.constructor = $c_jl_NegativeArraySizeException;
/** @constructor */
function $h_jl_NegativeArraySizeException() {
  /*<skip>*/
}
$h_jl_NegativeArraySizeException.prototype = $c_jl_NegativeArraySizeException.prototype;
$c_jl_NegativeArraySizeException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_jl_NegativeArraySizeException = new $TypeData().initClass({
  jl_NegativeArraySizeException: 0
}, false, "java.lang.NegativeArraySizeException", {
  jl_NegativeArraySizeException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NegativeArraySizeException.prototype.$classData = $d_jl_NegativeArraySizeException;
/** @constructor */
function $c_jl_NullPointerException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
function $h_jl_NullPointerException() {
  /*<skip>*/
}
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
function $c_jl_UnsupportedOperationException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
function $h_jl_UnsupportedOperationException() {
  /*<skip>*/
}
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
function $c_ju_NoSuchElementException() {
  $c_jl_RuntimeException.call(this)
}
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
function $h_ju_NoSuchElementException() {
  /*<skip>*/
}
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_ju_NoSuchElementException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.objString$4 = null;
  this.obj$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  var this$1 = this.obj$4;
  return ("of class " + $objectGetClass(this$1).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_s_Option() {
  $c_O.call(this)
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
  /*<skip>*/
}
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.isDefined__Z = (function() {
  return (!this.isEmpty__Z())
});
/** @constructor */
function $c_s_PartialFunction$$anon$1() {
  $c_O.call(this);
  this.lift$1 = null
}
$c_s_PartialFunction$$anon$1.prototype = new $h_O();
$c_s_PartialFunction$$anon$1.prototype.constructor = $c_s_PartialFunction$$anon$1;
/** @constructor */
function $h_s_PartialFunction$$anon$1() {
  /*<skip>*/
}
$h_s_PartialFunction$$anon$1.prototype = $c_s_PartialFunction$$anon$1.prototype;
$c_s_PartialFunction$$anon$1.prototype.init___ = (function() {
  this.lift$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      return $m_s_None$()
    })
  })(this));
  return this
});
$c_s_PartialFunction$$anon$1.prototype.apply__O__O = (function(v1) {
  this.apply__O__sr_Nothing$(v1)
});
$c_s_PartialFunction$$anon$1.prototype.runWith__F1__F1 = (function(action) {
  return $m_s_PartialFunction$().scala$PartialFunction$$constFalse$f
});
$c_s_PartialFunction$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_PartialFunction$$anon$1.prototype.isDefinedAt__O__Z = (function(x) {
  return false
});
$c_s_PartialFunction$$anon$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
});
$c_s_PartialFunction$$anon$1.prototype.apply__O__sr_Nothing$ = (function(x) {
  throw new $c_s_MatchError().init___O(x)
});
var $d_s_PartialFunction$$anon$1 = new $TypeData().initClass({
  s_PartialFunction$$anon$1: 0
}, false, "scala.PartialFunction$$anon$1", {
  s_PartialFunction$$anon$1: 1,
  O: 1,
  s_PartialFunction: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anon$1.prototype.$classData = $d_s_PartialFunction$$anon$1;
/** @constructor */
function $c_s_Predef$$anon$2() {
  $c_s_Predef$$less$colon$less.call(this)
}
$c_s_Predef$$anon$2.prototype = new $h_s_Predef$$less$colon$less();
$c_s_Predef$$anon$2.prototype.constructor = $c_s_Predef$$anon$2;
/** @constructor */
function $h_s_Predef$$anon$2() {
  /*<skip>*/
}
$h_s_Predef$$anon$2.prototype = $c_s_Predef$$anon$2.prototype;
$c_s_Predef$$anon$2.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
/** @constructor */
function $c_s_Predef$$anon$3() {
  $c_s_Predef$$eq$colon$eq.call(this)
}
$c_s_Predef$$anon$3.prototype = new $h_s_Predef$$eq$colon$eq();
$c_s_Predef$$anon$3.prototype.constructor = $c_s_Predef$$anon$3;
/** @constructor */
function $h_s_Predef$$anon$3() {
  /*<skip>*/
}
$h_s_Predef$$anon$3.prototype = $c_s_Predef$$anon$3.prototype;
$c_s_Predef$$anon$3.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$3.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
function $f_s_math_Ordering__lteq__O__O__Z($thiz, x, y) {
  return ($thiz.compare__O__O__I(x, y) <= 0)
}
/** @constructor */
function $c_s_util_control_BreakControl() {
  $c_jl_Throwable.call(this)
}
$c_s_util_control_BreakControl.prototype = new $h_jl_Throwable();
$c_s_util_control_BreakControl.prototype.constructor = $c_s_util_control_BreakControl;
/** @constructor */
function $h_s_util_control_BreakControl() {
  /*<skip>*/
}
$h_s_util_control_BreakControl.prototype = $c_s_util_control_BreakControl.prototype;
$c_s_util_control_BreakControl.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable(this)
});
var $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
function $f_sc_GenMapLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenMap(that)) {
    var x2 = $as_sc_GenMap(that);
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenMapLike__liftedTree1$1__psc_GenMapLike__sc_GenMap__Z($thiz, x2)))
  } else {
    return false
  }
}
function $f_sc_GenMapLike__liftedTree1$1__psc_GenMapLike__sc_GenMap__Z($thiz, x2$1) {
  try {
    var this$1 = $thiz.iterator__sc_Iterator();
    var res = true;
    while ((res && this$1.hasNext__Z())) {
      var arg1 = this$1.next__O();
      var x0$1 = $as_T2(arg1);
      if ((x0$1 === null)) {
        throw new $c_s_MatchError().init___O(x0$1)
      };
      var k = x0$1.$$und1$f;
      var v = x0$1.$$und2$f;
      var x1$2 = x2$1.get__O__s_Option(k);
      matchEnd6: {
        if ($is_s_Some(x1$2)) {
          var x2 = $as_s_Some(x1$2);
          var p3 = x2.value$2;
          if ($m_sr_BoxesRunTime$().equals__O__O__Z(v, p3)) {
            res = true;
            break matchEnd6
          }
        };
        res = false
      }
    };
    return res
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $f_sc_GenSeqLike__indexOf__O__I__I($thiz, elem, from) {
  return $thiz.indexWhere__F1__I__I(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, elem$1) {
    return (function(x$1$2) {
      return $m_sr_BoxesRunTime$().equals__O__O__Z(elem$1, x$1$2)
    })
  })($thiz, elem)), from)
}
function $f_sc_GenSeqLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return ((x2 === $thiz) || $thiz.sameElements__sc_GenIterable__Z(x2))
  } else {
    return false
  }
}
function $f_sc_GenSeqLike__isDefinedAt__I__Z($thiz, idx) {
  return ((idx >= 0) && (idx < $thiz.length__I()))
}
function $is_sc_GenTraversable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
}
function $as_sc_GenTraversable(obj) {
  return (($is_sc_GenTraversable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversable"))
}
function $isArrayOf_sc_GenTraversable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
}
function $asArrayOf_sc_GenTraversable(obj, depth) {
  return (($isArrayOf_sc_GenTraversable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
}
/** @constructor */
function $c_sc_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sc_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
function $h_sc_Iterable$() {
  /*<skip>*/
}
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Iterable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
function $m_sc_Iterable$() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
}
/** @constructor */
function $c_sc_Iterator$$anon$10() {
  $c_sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$3$2 = null
}
$c_sc_Iterator$$anon$10.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$10.prototype.constructor = $c_sc_Iterator$$anon$10;
/** @constructor */
function $h_sc_Iterator$$anon$10() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$10.prototype = $c_sc_Iterator$$anon$10.prototype;
$c_sc_Iterator$$anon$10.prototype.next__O = (function() {
  return this.f$3$2.apply__O__O(this.$$outer$2.next__O())
});
$c_sc_Iterator$$anon$10.prototype.init___sc_Iterator__F1 = (function($$outer, f$3) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$3$2 = f$3;
  return this
});
$c_sc_Iterator$$anon$10.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
var $d_sc_Iterator$$anon$10 = new $TypeData().initClass({
  sc_Iterator$$anon$10: 0
}, false, "scala.collection.Iterator$$anon$10", {
  sc_Iterator$$anon$10: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$10.prototype.$classData = $d_sc_Iterator$$anon$10;
/** @constructor */
function $c_sc_Iterator$$anon$2() {
  $c_sc_AbstractIterator.call(this)
}
$c_sc_Iterator$$anon$2.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$2.prototype.constructor = $c_sc_Iterator$$anon$2;
/** @constructor */
function $h_sc_Iterator$$anon$2() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$2.prototype = $c_sc_Iterator$$anon$2.prototype;
$c_sc_Iterator$$anon$2.prototype.init___ = (function() {
  return this
});
$c_sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
var $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
/** @constructor */
function $c_sc_LinearSeqLike$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sc_LinearSeqLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqLike$$anon$1.prototype.constructor = $c_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $h_sc_LinearSeqLike$$anon$1() {
  /*<skip>*/
}
$h_sc_LinearSeqLike$$anon$1.prototype = $c_sc_LinearSeqLike$$anon$1.prototype;
$c_sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
$c_sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = $as_sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
var $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $c_sc_Traversable$() {
  $c_scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
}
$c_sc_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Traversable$.prototype.constructor = $c_sc_Traversable$;
/** @constructor */
function $h_sc_Traversable$() {
  /*<skip>*/
}
$h_sc_Traversable$.prototype = $c_sc_Traversable$.prototype;
$c_sc_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_Traversable$ = this;
  this.breaks$3 = new $c_s_util_control_Breaks().init___();
  return this
});
$c_sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Traversable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
var $n_sc_Traversable$ = (void 0);
function $m_sc_Traversable$() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
}
/** @constructor */
function $c_scg_ImmutableSetFactory() {
  $c_scg_SetFactory.call(this)
}
$c_scg_ImmutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_ImmutableSetFactory.prototype.constructor = $c_scg_ImmutableSetFactory;
/** @constructor */
function $h_scg_ImmutableSetFactory() {
  /*<skip>*/
}
$h_scg_ImmutableSetFactory.prototype = $c_scg_ImmutableSetFactory.prototype;
$c_scg_ImmutableSetFactory.prototype.empty__sc_GenTraversable = (function() {
  return this.emptyInstance__sci_Set()
});
$c_scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
function $c_sci_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
function $h_sci_Iterable$() {
  /*<skip>*/
}
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
function $m_sci_Iterable$() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
}
/** @constructor */
function $c_sci_StreamIterator() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sci_StreamIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_StreamIterator.prototype.constructor = $c_sci_StreamIterator;
/** @constructor */
function $h_sci_StreamIterator() {
  /*<skip>*/
}
$h_sci_StreamIterator.prototype = $c_sci_StreamIterator.prototype;
$c_sci_StreamIterator.prototype.next__O = (function() {
  if ($f_sc_Iterator__isEmpty__Z(this)) {
    return $m_sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
      return (function() {
        return $as_sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
$c_sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
});
$c_sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    })
  })(this)));
  return result
});
var $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
/** @constructor */
function $c_sci_Traversable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Traversable$.prototype.constructor = $c_sci_Traversable$;
/** @constructor */
function $h_sci_Traversable$() {
  /*<skip>*/
}
$h_sci_Traversable$.prototype = $c_sci_Traversable$.prototype;
$c_sci_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
var $n_sci_Traversable$ = (void 0);
function $m_sci_Traversable$() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
}
/** @constructor */
function $c_sci_TrieIterator() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
}
$c_sci_TrieIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_TrieIterator.prototype.constructor = $c_sci_TrieIterator;
/** @constructor */
function $h_sci_TrieIterator() {
  /*<skip>*/
}
$h_sci_TrieIterator.prototype = $c_sci_TrieIterator.prototype;
$c_sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
});
$c_sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
$c_sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return $newArrayObject($d_I.getArrayOf(), [6])
});
$c_sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
$c_sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u.length) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.get(this.scala$collection$immutable$TrieIterator$$depth$f);
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.get(this.scala$collection$immutable$TrieIterator$$depth$f);
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, null)
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.get(i);
    if (this.isContainer__p2__O__Z(m)) {
      return this.getElem__O__O(m)
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, this.scala$collection$immutable$TrieIterator$$arrayD$f);
        this.scala$collection$immutable$TrieIterator$$posStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, this.scala$collection$immutable$TrieIterator$$posD$f)
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
$c_sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if ($is_sci_HashMap$HashTrieMap(x)) {
    var x2 = $as_sci_HashMap$HashTrieMap(x);
    var jsx$1 = x2.elems$6
  } else {
    if ((!$is_sci_HashSet$HashTrieSet(x))) {
      throw new $c_s_MatchError().init___O(x)
    };
    var x3 = $as_sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  };
  return $asArrayOf_sci_Iterable(jsx$1, 1)
});
$c_sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
$c_sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
});
$c_sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
function $c_scm_HashTable$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.iterTable$2 = null;
  this.idx$2 = 0;
  this.es$2 = null
}
$c_scm_HashTable$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_HashTable$$anon$1.prototype.constructor = $c_scm_HashTable$$anon$1;
/** @constructor */
function $h_scm_HashTable$$anon$1() {
  /*<skip>*/
}
$h_scm_HashTable$$anon$1.prototype = $c_scm_HashTable$$anon$1.prototype;
$c_scm_HashTable$$anon$1.prototype.next__O = (function() {
  return this.next__scm_HashEntry()
});
$c_scm_HashTable$$anon$1.prototype.init___scm_HashTable = (function($$outer) {
  this.iterTable$2 = $$outer.table$5;
  this.idx$2 = $f_scm_HashTable__scala$collection$mutable$HashTable$$lastPopulatedIndex__I($$outer);
  this.es$2 = this.iterTable$2.get(this.idx$2);
  return this
});
$c_scm_HashTable$$anon$1.prototype.next__scm_HashEntry = (function() {
  var res = this.es$2;
  var this$1 = this.es$2;
  this.es$2 = this$1.next$1;
  while (((this.es$2 === null) && (this.idx$2 > 0))) {
    this.idx$2 = (((-1) + this.idx$2) | 0);
    this.es$2 = this.iterTable$2.get(this.idx$2)
  };
  return res
});
$c_scm_HashTable$$anon$1.prototype.hasNext__Z = (function() {
  return (this.es$2 !== null)
});
var $d_scm_HashTable$$anon$1 = new $TypeData().initClass({
  scm_HashTable$$anon$1: 0
}, false, "scala.collection.mutable.HashTable$$anon$1", {
  scm_HashTable$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_HashTable$$anon$1.prototype.$classData = $d_scm_HashTable$$anon$1;
/** @constructor */
function $c_scm_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_scm_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_scm_Iterable$.prototype.constructor = $c_scm_Iterable$;
/** @constructor */
function $h_scm_Iterable$() {
  /*<skip>*/
}
$h_scm_Iterable$.prototype = $c_scm_Iterable$.prototype;
$c_scm_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_Iterable$ = new $TypeData().initClass({
  scm_Iterable$: 0
}, false, "scala.collection.mutable.Iterable$", {
  scm_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_Iterable$.prototype.$classData = $d_scm_Iterable$;
var $n_scm_Iterable$ = (void 0);
function $m_scm_Iterable$() {
  if ((!$n_scm_Iterable$)) {
    $n_scm_Iterable$ = new $c_scm_Iterable$().init___()
  };
  return $n_scm_Iterable$
}
/** @constructor */
function $c_scm_LazyBuilder() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_scm_LazyBuilder.prototype = new $h_O();
$c_scm_LazyBuilder.prototype.constructor = $c_scm_LazyBuilder;
/** @constructor */
function $h_scm_LazyBuilder() {
  /*<skip>*/
}
$h_scm_LazyBuilder.prototype = $c_scm_LazyBuilder.prototype;
$c_scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new $c_scm_ListBuffer().init___();
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  $m_sci_List$();
  var array = [x];
  var i = (((-1) + $uI(array.length)) | 0);
  var result = $m_sci_Nil$();
  while ((i >= 0)) {
    var this$4 = result;
    var index = i;
    var x$1 = array[index];
    result = new $c_sci_$colon$colon().init___O__sci_List(x$1, this$4);
    i = (((-1) + i) | 0)
  };
  jsx$1.$$plus$eq__O__scm_ListBuffer(result);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
function $c_scm_ListBuffer$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.cursor$2 = null
}
$c_scm_ListBuffer$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_ListBuffer$$anon$1.prototype.constructor = $c_scm_ListBuffer$$anon$1;
/** @constructor */
function $h_scm_ListBuffer$$anon$1() {
  /*<skip>*/
}
$h_scm_ListBuffer$$anon$1.prototype = $c_scm_ListBuffer$$anon$1.prototype;
$c_scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
$c_scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
$c_scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== $m_sci_Nil$())
});
var $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
/** @constructor */
function $c_scm_MapBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_MapBuilder.prototype = new $h_O();
$c_scm_MapBuilder.prototype.constructor = $c_scm_MapBuilder;
/** @constructor */
function $h_scm_MapBuilder() {
  /*<skip>*/
}
$h_scm_MapBuilder.prototype = $c_scm_MapBuilder.prototype;
$c_scm_MapBuilder.prototype.$$plus$eq__T2__scm_MapBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__T2__sc_GenMap(x);
  return this
});
$c_scm_MapBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder($as_T2(elem))
});
$c_scm_MapBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_MapBuilder.prototype.init___sc_GenMap = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_MapBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder($as_T2(elem))
});
$c_scm_MapBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_MapBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_MapBuilder = new $TypeData().initClass({
  scm_MapBuilder: 0
}, false, "scala.collection.mutable.MapBuilder", {
  scm_MapBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_MapBuilder.prototype.$classData = $d_scm_MapBuilder;
/** @constructor */
function $c_scm_SetBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_SetBuilder.prototype = new $h_O();
$c_scm_SetBuilder.prototype.constructor = $c_scm_SetBuilder;
/** @constructor */
function $h_scm_SetBuilder() {
  /*<skip>*/
}
$h_scm_SetBuilder.prototype = $c_scm_SetBuilder.prototype;
$c_scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
$c_scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1() {
  $c_sr_AbstractPartialFunction.call(this);
  this.state$1$2 = null
}
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype = new $h_sr_AbstractPartialFunction();
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype = $c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype;
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.init___Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(state$1) {
  this.state$1$2 = state$1;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.isDefinedAt__Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand__Z = (function(x1) {
  return ($is_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(x1) || ($is_Lcom_seamless_contexts_data$undtypes_Commands$AddField(x1) || ($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(x1) || ($is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(x1) || ($is_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(x1) || ($is_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(x1) || true))))))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.applyOrElse__Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand__F1__O = (function(x1, $default) {
  if ($is_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(x1)) {
    var x2 = $as_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(x1);
    var name = x2.name$1;
    var root = x2.root$1;
    var conceptId = x2.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idIsUnused__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(conceptId, "Concept ID", this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idIsUnused__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(root, "Root Schema ID", this.state$1$2);
    var array = [new $c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined().init___T__T__T(name, root, conceptId)];
    var this$4 = $m_s_package$().Vector$1;
    if (($uI(array.length) === 0)) {
      var jsx$1 = this$4.NIL$6
    } else {
      var b = new $c_sci_VectorBuilder().init___();
      var i = 0;
      var len = $uI(array.length);
      while ((i < len)) {
        var index = i;
        var arg1 = array[index];
        b.$$plus$eq__O__sci_VectorBuilder(arg1);
        i = ((1 + i) | 0)
      };
      var jsx$1 = b.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$1)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$AddField(x1)) {
    var x3 = $as_Lcom_seamless_contexts_data$undtypes_Commands$AddField(x1);
    var parentId = x3.parentId$1;
    var id = x3.id$1;
    var conceptId$2 = x3.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idIsUnused__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(id, "Field ID", this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(parentId, conceptId$2, this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().requireIdType__T__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(parentId, $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$(), "to create a field", this.state$1$2);
    var array$1 = [new $c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded().init___T__T__T(parentId, id, conceptId$2)];
    var this$8 = $m_s_package$().Vector$1;
    if (($uI(array$1.length) === 0)) {
      var jsx$2 = this$8.NIL$6
    } else {
      var b$1 = new $c_sci_VectorBuilder().init___();
      var i$1 = 0;
      var len$1 = $uI(array$1.length);
      while ((i$1 < len$1)) {
        var index$1 = i$1;
        var arg1$1 = array$1[index$1];
        b$1.$$plus$eq__O__sci_VectorBuilder(arg1$1);
        i$1 = ((1 + i$1) | 0)
      };
      var jsx$2 = b$1.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$2)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(x1)) {
    var x4 = $as_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(x1);
    var fieldId = x4.id$1;
    var conceptId$3 = x4.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().isValidField__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(fieldId, this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(fieldId, conceptId$3, this.state$1$2);
    var array$2 = [new $c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved().init___T__T(fieldId, conceptId$3)];
    var this$12 = $m_s_package$().Vector$1;
    if (($uI(array$2.length) === 0)) {
      var jsx$3 = this$12.NIL$6
    } else {
      var b$2 = new $c_sci_VectorBuilder().init___();
      var i$2 = 0;
      var len$2 = $uI(array$2.length);
      while ((i$2 < len$2)) {
        var index$2 = i$2;
        var arg1$2 = array$2[index$2];
        b$2.$$plus$eq__O__sci_VectorBuilder(arg1$2);
        i$2 = ((1 + i$2) | 0)
      };
      var jsx$3 = b$2.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$3)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(x1)) {
    var x5 = $as_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(x1);
    var id$2 = x5.id$1;
    var newName = x5.newName$1;
    var conceptId$4 = x5.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(id$2, conceptId$4, this.state$1$2);
    var array$3 = [new $c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged().init___T__T__T(id$2, newName, conceptId$4)];
    var this$16 = $m_s_package$().Vector$1;
    if (($uI(array$3.length) === 0)) {
      var jsx$4 = this$16.NIL$6
    } else {
      var b$3 = new $c_sci_VectorBuilder().init___();
      var i$3 = 0;
      var len$3 = $uI(array$3.length);
      while ((i$3 < len$3)) {
        var index$3 = i$3;
        var arg1$3 = array$3[index$3];
        b$3.$$plus$eq__O__sci_VectorBuilder(arg1$3);
        i$3 = ((1 + i$3) | 0)
      };
      var jsx$4 = b$3.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$4)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(x1)) {
    var x6 = $as_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(x1);
    var id$3 = x6.id$1;
    var newType = x6.to$1;
    var conceptId$5 = x6.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(id$3, conceptId$5, this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().refTypeExists__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__Lcom_seamless_contexts_data$undtypes_DataTypesState__Z(newType, this.state$1$2);
    var array$4 = [new $c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned().init___T__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T(id$3, newType, conceptId$5)];
    var this$20 = $m_s_package$().Vector$1;
    if (($uI(array$4.length) === 0)) {
      var jsx$5 = this$20.NIL$6
    } else {
      var b$4 = new $c_sci_VectorBuilder().init___();
      var i$4 = 0;
      var len$4 = $uI(array$4.length);
      while ((i$4 < len$4)) {
        var index$4 = i$4;
        var arg1$4 = array$4[index$4];
        b$4.$$plus$eq__O__sci_VectorBuilder(arg1$4);
        i$4 = ((1 + i$4) | 0)
      };
      var jsx$5 = b$4.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$5)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(x1)) {
    var x7 = $as_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(x1);
    var parentId$2 = x7.parentId$1;
    var id$4 = x7.id$1;
    var conceptId$6 = x7.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idIsUnused__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(id$4, "Concept ID", this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().requireIdTakesTypeParameters__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(parentId$2, "add a new type parameter", this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(parentId$2, conceptId$6, this.state$1$2);
    var array$5 = [new $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded().init___T__T__T(parentId$2, id$4, conceptId$6)];
    var this$24 = $m_s_package$().Vector$1;
    if (($uI(array$5.length) === 0)) {
      var jsx$6 = this$24.NIL$6
    } else {
      var b$5 = new $c_sci_VectorBuilder().init___();
      var i$5 = 0;
      var len$5 = $uI(array$5.length);
      while ((i$5 < len$5)) {
        var index$5 = i$5;
        var arg1$5 = array$5[index$5];
        b$5.$$plus$eq__O__sci_VectorBuilder(arg1$5);
        i$5 = ((1 + i$5) | 0)
      };
      var jsx$6 = b$5.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$6)
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(x1)) {
    var x8 = $as_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(x1);
    var id$5 = x8.id$1;
    var conceptId$7 = x8.conceptId$1;
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().isValidTypeParameter__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(id$5, this.state$1$2);
    $m_Lcom_seamless_contexts_data$undtypes_Validators$().idExistsForSchema__T__T__Lcom_seamless_contexts_data$undtypes_DataTypesState__V(id$5, conceptId$7, this.state$1$2);
    var array$6 = [new $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved().init___T__T(id$5, conceptId$7)];
    var this$28 = $m_s_package$().Vector$1;
    if (($uI(array$6.length) === 0)) {
      var jsx$7 = this$28.NIL$6
    } else {
      var b$6 = new $c_sci_VectorBuilder().init___();
      var i$6 = 0;
      var len$6 = $uI(array$6.length);
      while ((i$6 < len$6)) {
        var index$6 = i$6;
        var arg1$6 = array$6[index$6];
        b$6.$$plus$eq__O__sci_VectorBuilder(arg1$6);
        i$6 = ((1 + i$6) | 0)
      };
      var jsx$7 = b$6.result__sci_Vector()
    };
    return new $c_Lcom_seamless_ddd_Effects().init___sci_Vector(jsx$7)
  } else {
    var this$29 = $m_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$();
    return $f_Lcom_seamless_ddd_EventSourcedAggregate__noEffect__Lcom_seamless_ddd_Effects(this$29)
  }
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.isDefinedAt__O__Z = (function(x) {
  return this.isDefinedAt__Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand__Z($as_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(x))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return this.applyOrElse__Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand__F1__O($as_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(x), $default)
});
var $d_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1 = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1: 0
}, false, "com.seamless.contexts.data_types.DataTypesAggregate$$anonfun$handleCommand$1", {
  Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$$anonfun$handleCommand$1;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1() {
  $c_sr_AbstractPartialFunction.call(this);
  this.id$1$2 = null
}
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype = new $h_sr_AbstractPartialFunction();
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype = $c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype;
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.init___Lcom_seamless_contexts_data$undtypes_DataTypesState__T = (function($$outer, id$1) {
  this.id$1$2 = id$1;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.applyOrElse__T2__F1__O = (function(x1, $default) {
  return ((($as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f).parentId$1 === this.id$1$2) && $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f).key$1.isDefined__Z()) ? x1.$$und1$f : $default.apply__O__O(x1))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.isDefinedAt__O__Z = (function(x) {
  return this.isDefinedAt__T2__Z($as_T2(x))
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return this.applyOrElse__T2__F1__O($as_T2(x), $default)
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.isDefinedAt__T2__Z = (function(x1) {
  return (($as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f).parentId$1 === this.id$1$2) && $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f).key$1.isDefined__Z())
});
var $d_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1 = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1: 0
}, false, "com.seamless.contexts.data_types.DataTypesState$$anonfun$getPastFields$1", {
  Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_DataTypesState$$anonfun$getPastFields$1;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.$$js$exported$prop$isRef__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.productPrefix__T = (function() {
  return "BooleanT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.productArity__I = (function() {
  return 0
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.toString__T = (function() {
  return "BooleanT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.hasTypeParameters__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.hasFields__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.isRef__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.$$js$exported$prop$hasFields__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.$$js$exported$prop$id__O = (function() {
  return "boolean"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.hashCode__I = (function() {
  return 2070707532
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.id__T = (function() {
  return "boolean"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$BooleanT$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.$$js$exported$prop$isRef__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.productPrefix__T = (function() {
  return "IntegerT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.productArity__I = (function() {
  return 0
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.toString__T = (function() {
  return "IntegerT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.hasTypeParameters__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.hasFields__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.isRef__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.$$js$exported$prop$hasFields__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.$$js$exported$prop$id__O = (function() {
  return "integer"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.hashCode__I = (function() {
  return 634718966
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.id__T = (function() {
  return "integer"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$IntegerT$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.$$js$exported$prop$isRef__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.productPrefix__T = (function() {
  return "ListT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.productArity__I = (function() {
  return 0
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.toString__T = (function() {
  return "ListT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.hasFields__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.hasTypeParameters__Z = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.isRef__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.$$js$exported$prop$hasFields__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.$$js$exported$prop$id__O = (function() {
  return "list"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.hashCode__I = (function() {
  return 73429846
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.id__T = (function() {
  return "list"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$ListT$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.$$js$exported$prop$isRef__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.productPrefix__T = (function() {
  return "NumberT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.productArity__I = (function() {
  return 0
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.toString__T = (function() {
  return "NumberT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.hasTypeParameters__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.hasFields__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.isRef__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.$$js$exported$prop$hasFields__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.$$js$exported$prop$id__O = (function() {
  return "number"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.hashCode__I = (function() {
  return (-335862261)
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.id__T = (function() {
  return "number"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$NumberT$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.$$js$exported$prop$isRef__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.productPrefix__T = (function() {
  return "ObjectT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.productArity__I = (function() {
  return 0
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.toString__T = (function() {
  return "ObjectT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.hasTypeParameters__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.hasFields__Z = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.isRef__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.$$js$exported$prop$hasFields__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.$$js$exported$prop$id__O = (function() {
  return "object"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.hashCode__I = (function() {
  return 5004501
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.id__T = (function() {
  return "object"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$ObjectT$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT() {
  $c_O.call(this);
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.$$js$exported$prop$isRef__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.productPrefix__T = (function() {
  return "RefT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.productArity__I = (function() {
  return 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(x$1)) {
    var RefT$1 = $as_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(x$1);
    return (this.conceptId$1 === RefT$1.conceptId$1)
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.hasTypeParameters__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.hasFields__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.isRef__Z = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.$$js$exported$prop$hasFields__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.$$js$exported$prop$id__O = (function() {
  return this.conceptId$1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.init___T = (function(conceptId) {
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.id__T = (function() {
  return this.conceptId$1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT)))
}
function $as_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.package$Primitives$RefT"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.package$Primitives$RefT;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$RefT", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$() {
  $c_O.call(this)
}
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype;
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.init___ = (function() {
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.$$js$exported$prop$isRef__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.productPrefix__T = (function() {
  return "StringT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.productArity__I = (function() {
  return 0
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.toString__T = (function() {
  return "StringT"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.hasTypeParameters__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.hasFields__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.isRef__Z = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.$$js$exported$prop$hasTypeParameters__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.$$js$exported$prop$hasFields__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.$$js$exported$prop$id__O = (function() {
  return "string"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.hashCode__I = (function() {
  return (-217105853)
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.id__T = (function() {
  return "string"
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype, "isRef", {
  "get": (function() {
    return this.$$js$exported$prop$isRef__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype, "hasFields", {
  "get": (function() {
    return this.$$js$exported$prop$hasFields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype, "hasTypeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$hasTypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
var $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$ = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$: 0
}, false, "com.seamless.contexts.data_types.package$Primitives$StringT$", {
  Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$;
var $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$ = (void 0);
function $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$() {
  if ((!$n_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$)) {
    $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$ = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$().init___()
  };
  return $n_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_Field() {
  $c_O.call(this);
  this.key$1 = null;
  this.shape$1 = null;
  this.id$1 = null;
  this.depth$1 = 0
}
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_Field;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_Field() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.productPrefix__T = (function() {
  return "Field"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$isTypeParameter__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.productArity__I = (function() {
  return 4
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$shape__O = (function() {
  return this.shape$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_Field(x$1)) {
    var Field$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_Field(x$1);
    if ((this.key$1 === Field$1.key$1)) {
      var x = this.shape$1;
      var x$2 = Field$1.shape$1;
      var jsx$1 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      var jsx$1 = false
    };
    if ((jsx$1 && (this.id$1 === Field$1.id$1))) {
      return (this.depth$1 === Field$1.depth$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.key$1;
      break
    }
    case 1: {
      return this.shape$1;
      break
    }
    case 2: {
      return this.id$1;
      break
    }
    case 3: {
      return this.depth$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$key__O = (function() {
  return this.key$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$isField__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.init___T__Lcom_seamless_contexts_data$undtypes_projections_Shape__T__I = (function(key, shape, id, depth) {
  this.key$1 = key;
  this.shape$1 = shape;
  this.id$1 = id;
  this.depth$1 = depth;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$isTypeParametersList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$isObjectFieldList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$isLeaf__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.key$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.shape$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.id$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.depth$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 4)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$$js$exported$prop$depth__O = (function() {
  return this.depth$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "isLeaf", {
  "get": (function() {
    return this.$$js$exported$prop$isLeaf__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "isTypeParametersList", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParametersList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "isObjectFieldList", {
  "get": (function() {
    return this.$$js$exported$prop$isObjectFieldList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "isTypeParameter", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParameter__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "isField", {
  "get": (function() {
    return this.$$js$exported$prop$isField__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "depth", {
  "get": (function() {
    return this.$$js$exported$prop$depth__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "shape", {
  "get": (function() {
    return this.$$js$exported$prop$shape__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype, "key", {
  "get": (function() {
    return this.$$js$exported$prop$key__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_Field(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_Field)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_Field(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_Field(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.Field"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_Field(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_Field)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_Field(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_Field(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.Field;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_Field = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_Field: 0
}, false, "com.seamless.contexts.data_types.projections.Field", {
  Lcom_seamless_contexts_data$undtypes_projections_Field: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_projections_Shape: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_Field.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_Field;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape() {
  $c_O.call(this);
  this.type$1 = null;
  this.id$1 = null;
  this.depth$1 = 0
}
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_LeafShape() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.productPrefix__T = (function() {
  return "LeafShape"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$isTypeParameter__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(x$1)) {
    var LeafShape$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(x$1);
    var x = this.type$1;
    var x$2 = LeafShape$1.type$1;
    if ((((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)) && (this.id$1 === LeafShape$1.id$1))) {
      return (this.depth$1 === LeafShape$1.depth$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.type$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.depth$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$isField__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$isTypeParametersList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$isObjectFieldList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$type__O = (function() {
  return this.type$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.type$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.id$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.depth$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$isLeaf__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$$js$exported$prop$depth__O = (function() {
  return this.depth$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T__I = (function(type, id, depth) {
  this.type$1 = type;
  this.id$1 = id;
  this.depth$1 = depth;
  return this
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "isTypeParametersList", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParametersList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "isObjectFieldList", {
  "get": (function() {
    return this.$$js$exported$prop$isObjectFieldList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "isTypeParameter", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParameter__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "isField", {
  "get": (function() {
    return this.$$js$exported$prop$isField__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "isLeaf", {
  "get": (function() {
    return this.$$js$exported$prop$isLeaf__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "depth", {
  "get": (function() {
    return this.$$js$exported$prop$depth__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype, "type", {
  "get": (function() {
    return this.$$js$exported$prop$type__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_LeafShape)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.LeafShape"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_LeafShape)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_LeafShape(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.LeafShape;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_LeafShape = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_LeafShape: 0
}, false, "com.seamless.contexts.data_types.projections.LeafShape", {
  Lcom_seamless_contexts_data$undtypes_projections_LeafShape: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_projections_Shape: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_LeafShape.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_LeafShape;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape() {
  $c_O.call(this);
  this.type$1 = null;
  this.$$undfields$1 = null;
  this.id$1 = null;
  this.depth$1 = 0
}
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.fields__sjs_js_Array = (function() {
  var jsx$1 = $m_sjs_js_JSConverters$JSRichGenTraversableOnce$();
  var col = this.$$undfields$1;
  return jsx$1.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array(col)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.productPrefix__T = (function() {
  return "ObjectShape"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$isTypeParameter__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__sci_Vector__T__I = (function(type, _fields, id, depth) {
  this.type$1 = type;
  this.$$undfields$1 = _fields;
  this.id$1 = id;
  this.depth$1 = depth;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.productArity__I = (function() {
  return 4
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(x$1)) {
    var ObjectShape$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(x$1);
    var x = this.type$1;
    var x$2 = ObjectShape$1.type$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.$$undfields$1;
      var x$4 = ObjectShape$1.$$undfields$1;
      var jsx$1 = ((x$3 === null) ? (x$4 === null) : $f_sc_GenSeqLike__equals__O__Z(x$3, x$4))
    } else {
      var jsx$1 = false
    };
    if ((jsx$1 && (this.id$1 === ObjectShape$1.id$1))) {
      return (this.depth$1 === ObjectShape$1.depth$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.type$1;
      break
    }
    case 1: {
      return this.$$undfields$1;
      break
    }
    case 2: {
      return this.id$1;
      break
    }
    case 3: {
      return this.depth$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$fields__O = (function() {
  return this.fields__sjs_js_Array()
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$isField__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$isTypeParametersList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$isObjectFieldList__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$type__O = (function() {
  return this.type$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$isLeaf__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.type$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.$$undfields$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.id$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.depth$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 4)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$depth__O = (function() {
  return this.depth$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$$js$exported$prop$$undfields__O = (function() {
  return this.$$undfields$1
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "isLeaf", {
  "get": (function() {
    return this.$$js$exported$prop$isLeaf__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "isTypeParametersList", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParametersList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "isTypeParameter", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParameter__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "isField", {
  "get": (function() {
    return this.$$js$exported$prop$isField__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "fields", {
  "get": (function() {
    return this.$$js$exported$prop$fields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "isObjectFieldList", {
  "get": (function() {
    return this.$$js$exported$prop$isObjectFieldList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "depth", {
  "get": (function() {
    return this.$$js$exported$prop$depth__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "_fields", {
  "get": (function() {
    return this.$$js$exported$prop$$undfields__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype, "type", {
  "get": (function() {
    return this.$$js$exported$prop$type__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_ObjectShape)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.ObjectShape"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_ObjectShape)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.ObjectShape;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_ObjectShape: 0
}, false, "com.seamless.contexts.data_types.projections.ObjectShape", {
  Lcom_seamless_contexts_data$undtypes_projections_ObjectShape: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_projections_Shape: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_ObjectShape;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1() {
  $c_sr_AbstractPartialFunction.call(this);
  this.state$1$2 = null
}
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype = new $h_sr_AbstractPartialFunction();
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.init___Lcom_seamless_contexts_data$undtypes_DataTypesState = (function(state$1) {
  this.state$1$2 = state$1;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.applyOrElse__T2__F1__O = (function(x1, $default) {
  if ((x1 !== null)) {
    var id = $as_T(x1.$$und1$f);
    var concept = $as_Lcom_seamless_contexts_data$undtypes_ConceptDescription(x1.$$und2$f);
    if ((!concept.deprecated$1)) {
      var this$2 = this.state$1$2.components$1;
      var pf = new $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2().init___Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1__T(this, id);
      var this$1 = $m_sci_Iterable$();
      var bf = this$1.ReusableCBFInstance$2;
      var dependentConcepts = $as_sc_TraversableOnce($f_sc_TraversableLike__collect__s_PartialFunction__scg_CanBuildFrom__O(this$2, pf, bf)).toSet__sci_Set();
      var jsx$1 = concept.name$1;
      $m_sci_Vector$();
      var cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
      return new $c_Lcom_seamless_contexts_data$undtypes_projections_AllowedTypeReference().init___T__T__sci_Vector(jsx$1, id, $as_sci_Vector($f_sc_TraversableLike__to__scg_CanBuildFrom__O(dependentConcepts, cbf)))
    }
  };
  return $default.apply__O__O(x1)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.isDefinedAt__O__Z = (function(x) {
  return this.isDefinedAt__T2__Z($as_T2(x))
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return this.applyOrElse__T2__F1__O($as_T2(x), $default)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.isDefinedAt__T2__Z = (function(x1) {
  if ((x1 !== null)) {
    var concept = $as_Lcom_seamless_contexts_data$undtypes_ConceptDescription(x1.$$und2$f);
    if ((!concept.deprecated$1)) {
      return true
    }
  };
  return false
});
var $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1 = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1: 0
}, false, "com.seamless.contexts.data_types.projections.ShapeProjection$$anonfun$1", {
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2() {
  $c_sr_AbstractPartialFunction.call(this);
  this.id$1$2 = null
}
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype = new $h_sr_AbstractPartialFunction();
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.init___Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1__T = (function($$outer, id$1) {
  this.id$1$2 = id$1;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.applyOrElse__T2__F1__O = (function(x1, $default) {
  if ((x1 !== null)) {
    var dep = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f);
    if ((dep.type$1.isRef__Z() && ($as_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(dep.type$1).conceptId$1 === this.id$1$2))) {
      return dep.conceptId$1
    }
  };
  return $default.apply__O__O(x1)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.isDefinedAt__O__Z = (function(x) {
  return this.isDefinedAt__T2__Z($as_T2(x))
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return this.applyOrElse__T2__F1__O($as_T2(x), $default)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.isDefinedAt__T2__Z = (function(x1) {
  if ((x1 !== null)) {
    var dep = $as_Lcom_seamless_contexts_data$undtypes_ShapeDescription(x1.$$und2$f);
    if ((dep.type$1.isRef__Z() && ($as_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT(dep.type$1).conceptId$1 === this.id$1$2))) {
      return true
    }
  };
  return false
});
var $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2 = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2: 0
}, false, "com.seamless.contexts.data_types.projections.ShapeProjection$$anonfun$1$$anonfun$2", {
  Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_ShapeProjection$$anonfun$1$$anonfun$2;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter() {
  $c_O.call(this);
  this.shape$1 = null;
  this.id$1 = null;
  this.depth$1 = 0
}
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.productPrefix__T = (function() {
  return "TypeParameter"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$isTypeParameter__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$shape__O = (function() {
  return this.shape$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(x$1)) {
    var TypeParameter$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(x$1);
    var x = this.shape$1;
    var x$2 = TypeParameter$1.shape$1;
    if ((((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)) && (this.id$1 === TypeParameter$1.id$1))) {
      return (this.depth$1 === TypeParameter$1.depth$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.shape$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.depth$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$isField__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.init___Lcom_seamless_contexts_data$undtypes_projections_Shape__T__I = (function(shape, id, depth) {
  this.shape$1 = shape;
  this.id$1 = id;
  this.depth$1 = depth;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$isTypeParametersList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$isObjectFieldList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.shape$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.id$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.depth$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$isLeaf__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$$js$exported$prop$depth__O = (function() {
  return this.depth$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "isTypeParametersList", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParametersList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "isObjectFieldList", {
  "get": (function() {
    return this.$$js$exported$prop$isObjectFieldList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "isField", {
  "get": (function() {
    return this.$$js$exported$prop$isField__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "isTypeParameter", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParameter__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "isLeaf", {
  "get": (function() {
    return this.$$js$exported$prop$isLeaf__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "depth", {
  "get": (function() {
    return this.$$js$exported$prop$depth__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype, "shape", {
  "get": (function() {
    return this.$$js$exported$prop$shape__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_TypeParameter)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.TypeParameter"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_TypeParameter)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.TypeParameter;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_TypeParameter: 0
}, false, "com.seamless.contexts.data_types.projections.TypeParameter", {
  Lcom_seamless_contexts_data$undtypes_projections_TypeParameter: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_projections_Shape: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_TypeParameter;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape() {
  $c_O.call(this);
  this.type$1 = null;
  this.$$undtypeParameters$1 = null;
  this.id$1 = null;
  this.depth$1 = 0
}
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype = $c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype;
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.productPrefix__T = (function() {
  return "TypeParameterShape"
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$isTypeParameter__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.init___Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__sci_Vector__T__I = (function(type, _typeParameters, id, depth) {
  this.type$1 = type;
  this.$$undtypeParameters$1 = _typeParameters;
  this.id$1 = id;
  this.depth$1 = depth;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.productArity__I = (function() {
  return 4
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$$undtypeParameters__O = (function() {
  return this.$$undtypeParameters$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(x$1)) {
    var TypeParameterShape$1 = $as_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(x$1);
    var x = this.type$1;
    var x$2 = TypeParameterShape$1.type$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.$$undtypeParameters$1;
      var x$4 = TypeParameterShape$1.$$undtypeParameters$1;
      var jsx$1 = ((x$3 === null) ? (x$4 === null) : $f_sc_GenSeqLike__equals__O__Z(x$3, x$4))
    } else {
      var jsx$1 = false
    };
    if ((jsx$1 && (this.id$1 === TypeParameterShape$1.id$1))) {
      return (this.depth$1 === TypeParameterShape$1.depth$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.type$1;
      break
    }
    case 1: {
      return this.$$undtypeParameters$1;
      break
    }
    case 2: {
      return this.id$1;
      break
    }
    case 3: {
      return this.depth$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$isField__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$typeParameters__O = (function() {
  return this.typeParameters__sjs_js_Array()
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$isTypeParametersList__O = (function() {
  return true
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$isObjectFieldList__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$type__O = (function() {
  return this.type$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.typeParameters__sjs_js_Array = (function() {
  var jsx$1 = $m_sjs_js_JSConverters$JSRichGenTraversableOnce$();
  var col = this.$$undtypeParameters$1;
  return jsx$1.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array(col)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$isLeaf__O = (function() {
  return false
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.type$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.$$undtypeParameters$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.id$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.depth$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 4)
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$$js$exported$prop$depth__O = (function() {
  return this.depth$1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "isLeaf", {
  "get": (function() {
    return this.$$js$exported$prop$isLeaf__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "isObjectFieldList", {
  "get": (function() {
    return this.$$js$exported$prop$isObjectFieldList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "isTypeParameter", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParameter__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "isField", {
  "get": (function() {
    return this.$$js$exported$prop$isField__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "typeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$typeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "isTypeParametersList", {
  "get": (function() {
    return this.$$js$exported$prop$isTypeParametersList__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "depth", {
  "get": (function() {
    return this.$$js$exported$prop$depth__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "_typeParameters", {
  "get": (function() {
    return this.$$js$exported$prop$$undtypeParameters__O()
  }),
  "configurable": true
});
Object.defineProperty($c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype, "type", {
  "get": (function() {
    return this.$$js$exported$prop$type__O()
  }),
  "configurable": true
});
function $is_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape)))
}
function $as_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.projections.TypeParameterShape"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.projections.TypeParameterShape;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape: 0
}, false, "com.seamless.contexts.data_types.projections.TypeParameterShape", {
  Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_projections_Shape: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_projections_TypeParameterShape;
/** @constructor */
function $c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1() {
  $c_sr_AbstractPartialFunction.call(this);
  this.state$1$2 = null
}
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype = new $h_sr_AbstractPartialFunction();
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.constructor = $c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1;
/** @constructor */
function $h_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype = $c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype;
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.init___Lcom_seamless_contexts_rfc_RfcState = (function(state$1) {
  this.state$1$2 = state$1;
  return this
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.isDefinedAt__O__Z = (function(x) {
  return this.isDefinedAt__Lcom_seamless_contexts_rfc_Commands$RfcCommand__Z($as_Lcom_seamless_contexts_rfc_Commands$RfcCommand(x))
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.isDefinedAt__Lcom_seamless_contexts_rfc_Commands$RfcCommand__Z = (function(x1) {
  return true
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return this.applyOrElse__Lcom_seamless_contexts_rfc_Commands$RfcCommand__F1__O($as_Lcom_seamless_contexts_rfc_Commands$RfcCommand(x), $default)
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.applyOrElse__Lcom_seamless_contexts_rfc_Commands$RfcCommand__F1__O = (function(x1, $default) {
  if ($is_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(x1)) {
    var x2 = $as_Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand(x1);
    return $m_Lcom_seamless_contexts_rfc_Composition$().forwardTo__Lcom_seamless_ddd_EventSourcedAggregate__O__O__Lcom_seamless_ddd_Effects($m_Lcom_seamless_contexts_data$undtypes_DataTypesAggregate$(), x2, this.state$1$2.dataTypes$1)
  } else {
    var this$1 = $m_Lcom_seamless_contexts_rfc_RfcAggregate$();
    return $f_Lcom_seamless_ddd_EventSourcedAggregate__noEffect__Lcom_seamless_ddd_Effects(this$1)
  }
});
var $d_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1 = new $TypeData().initClass({
  Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1: 0
}, false, "com.seamless.contexts.rfc.RfcAggregate$$anonfun$handleCommand$1", {
  Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1.prototype.$classData = $d_Lcom_seamless_contexts_rfc_RfcAggregate$$anonfun$handleCommand$1;
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T2(x$1)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $f_s_Product2__productElement__I__O(this, n)
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_T2(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
}
function $as_T2(obj) {
  return (($is_T2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
}
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
function $c_jl_ArrayIndexOutOfBoundsException() {
  $c_jl_IndexOutOfBoundsException.call(this)
}
$c_jl_ArrayIndexOutOfBoundsException.prototype = new $h_jl_IndexOutOfBoundsException();
$c_jl_ArrayIndexOutOfBoundsException.prototype.constructor = $c_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $h_jl_ArrayIndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_ArrayIndexOutOfBoundsException.prototype = $c_jl_ArrayIndexOutOfBoundsException.prototype;
$c_jl_ArrayIndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_ArrayIndexOutOfBoundsException = new $TypeData().initClass({
  jl_ArrayIndexOutOfBoundsException: 0
}, false, "java.lang.ArrayIndexOutOfBoundsException", {
  jl_ArrayIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArrayIndexOutOfBoundsException.prototype.$classData = $d_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $c_s_None$() {
  $c_s_Option.call(this)
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
  /*<skip>*/
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.init___ = (function() {
  return this
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.isEmpty__Z = (function() {
  return true
});
$c_s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("None.get")
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
}
/** @constructor */
function $c_s_PartialFunction$$anonfun$1() {
  $c_sr_AbstractPartialFunction.call(this)
}
$c_s_PartialFunction$$anonfun$1.prototype = new $h_sr_AbstractPartialFunction();
$c_s_PartialFunction$$anonfun$1.prototype.constructor = $c_s_PartialFunction$$anonfun$1;
/** @constructor */
function $h_s_PartialFunction$$anonfun$1() {
  /*<skip>*/
}
$h_s_PartialFunction$$anonfun$1.prototype = $c_s_PartialFunction$$anonfun$1.prototype;
$c_s_PartialFunction$$anonfun$1.prototype.init___ = (function() {
  return this
});
$c_s_PartialFunction$$anonfun$1.prototype.isDefinedAt__O__Z = (function(x1) {
  return true
});
$c_s_PartialFunction$$anonfun$1.prototype.applyOrElse__O__F1__O = (function(x1, $default) {
  return $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f
});
var $d_s_PartialFunction$$anonfun$1 = new $TypeData().initClass({
  s_PartialFunction$$anonfun$1: 0
}, false, "scala.PartialFunction$$anonfun$1", {
  s_PartialFunction$$anonfun$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anonfun$1.prototype.$classData = $d_s_PartialFunction$$anonfun$1;
/** @constructor */
function $c_s_Some() {
  $c_s_Option.call(this);
  this.value$2 = null
}
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
function $h_s_Some() {
  /*<skip>*/
}
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1
});
$c_s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_Some(x$1)) {
    var Some$1 = $as_s_Some(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Some$1.value$2)
  } else {
    return false
  }
});
$c_s_Some.prototype.isEmpty__Z = (function() {
  return false
});
$c_s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_Some.prototype.get__O = (function() {
  return this.value$2
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_Some.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_Some.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_Some(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
}
function $as_s_Some(obj) {
  return (($is_s_Some(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"))
}
function $isArrayOf_s_Some(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
}
function $asArrayOf_s_Some(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth))
}
var $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
function $f_sc_GenSetLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSet(that)) {
    var x2 = $as_sc_GenSet(that);
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2)))
  } else {
    return false
  }
}
function $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2$1) {
  try {
    return $thiz.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O($thiz, f, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, f$1) {
    return (function(x$2) {
      return $as_scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($as_sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($thiz, b, f)));
  return b.result__O()
}
function $f_sc_TraversableLike__to__scg_CanBuildFrom__O($thiz, cbf) {
  var b = cbf.apply__scm_Builder();
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Traversable());
  return b.result__O()
}
function $f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn$1, partStart$1) {
  var firstChar = (65535 & $uI(fqn$1.charCodeAt(partStart$1)));
  return (((firstChar > 90) && (firstChar < 127)) || (firstChar < 65))
}
function $f_sc_TraversableLike__toString__T($thiz) {
  return $thiz.mkString__T__T__T__T(($thiz.stringPrefix__T() + "("), ", ", ")")
}
function $f_sc_TraversableLike__filterImpl__F1__Z__O($thiz, p, isFlipped) {
  var b = $thiz.newBuilder__scm_Builder();
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, p$1, isFlipped$1, b$1) {
    return (function(x$2) {
      return (($uZ(p$1.apply__O__O(x$2)) !== isFlipped$1) ? b$1.$$plus$eq__O__scm_Builder(x$2) : (void 0))
    })
  })($thiz, p, isFlipped, b)));
  return b.result__O()
}
function $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O($thiz, f, bf) {
  var b = $f_sc_TraversableLike__builder$1__psc_TraversableLike__scg_CanBuildFrom__scm_Builder($thiz, bf);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, f$1) {
    return (function(x$2) {
      return b$1.$$plus$eq__O__scm_Builder(f$1.apply__O__O(x$2))
    })
  })($thiz, b, f)));
  return b.result__O()
}
function $f_sc_TraversableLike__builder$1__psc_TraversableLike__scg_CanBuildFrom__scm_Builder($thiz, bf$1) {
  var b = bf$1.apply__O__scm_Builder($thiz.repr__O());
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  return b
}
function $f_sc_TraversableLike__collect__s_PartialFunction__scg_CanBuildFrom__O($thiz, pf, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  $thiz.foreach__F1__V(pf.runWith__F1__F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1) {
    return (function(x$1$2) {
      return b$1.$$plus$eq__O__scm_Builder(x$1$2)
    })
  })($thiz, b))));
  return b.result__O()
}
function $f_sc_TraversableLike__stringPrefix__T($thiz) {
  var this$1 = $thiz.repr__O();
  var fqn = $objectGetClass(this$1).getName__T();
  var pos = (((-1) + $uI(fqn.length)) | 0);
  while (true) {
    if ((pos !== (-1))) {
      var index = pos;
      var jsx$1 = ((65535 & $uI(fqn.charCodeAt(index))) === 36)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      pos = (((-1) + pos) | 0)
    } else {
      break
    }
  };
  if ((pos === (-1))) {
    var jsx$2 = true
  } else {
    var index$1 = pos;
    var jsx$2 = ((65535 & $uI(fqn.charCodeAt(index$1))) === 46)
  };
  if (jsx$2) {
    return ""
  };
  var result = "";
  while (true) {
    var partEnd = ((1 + pos) | 0);
    while (true) {
      if ((pos !== (-1))) {
        var index$2 = pos;
        var jsx$4 = ((65535 & $uI(fqn.charCodeAt(index$2))) <= 57)
      } else {
        var jsx$4 = false
      };
      if (jsx$4) {
        var index$3 = pos;
        var jsx$3 = ((65535 & $uI(fqn.charCodeAt(index$3))) >= 48)
      } else {
        var jsx$3 = false
      };
      if (jsx$3) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    var lastNonDigit = pos;
    while (true) {
      if ((pos !== (-1))) {
        var index$4 = pos;
        var jsx$6 = ((65535 & $uI(fqn.charCodeAt(index$4))) !== 36)
      } else {
        var jsx$6 = false
      };
      if (jsx$6) {
        var index$5 = pos;
        var jsx$5 = ((65535 & $uI(fqn.charCodeAt(index$5))) !== 46)
      } else {
        var jsx$5 = false
      };
      if (jsx$5) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    var partStart = ((1 + pos) | 0);
    if (((pos === lastNonDigit) && (partEnd !== $uI(fqn.length)))) {
      return result
    };
    while (true) {
      if ((pos !== (-1))) {
        var index$6 = pos;
        var jsx$7 = ((65535 & $uI(fqn.charCodeAt(index$6))) === 36)
      } else {
        var jsx$7 = false
      };
      if (jsx$7) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    if ((pos === (-1))) {
      var atEnd = true
    } else {
      var index$7 = pos;
      var atEnd = ((65535 & $uI(fqn.charCodeAt(index$7))) === 46)
    };
    if ((atEnd || (!$f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn, partStart)))) {
      var part = $as_T(fqn.substring(partStart, partEnd));
      var thiz = result;
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        result = part
      } else {
        result = ((("" + part) + new $c_jl_Character().init___C(46)) + result)
      };
      if (atEnd) {
        return result
      }
    }
  }
}
function $is_sc_TraversableLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableLike)))
}
function $as_sc_TraversableLike(obj) {
  return (($is_sc_TraversableLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableLike"))
}
function $isArrayOf_sc_TraversableLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableLike)))
}
function $asArrayOf_sc_TraversableLike(obj, depth) {
  return (($isArrayOf_sc_TraversableLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableLike;", depth))
}
/** @constructor */
function $c_scg_SeqFactory() {
  $c_scg_GenSeqFactory.call(this)
}
$c_scg_SeqFactory.prototype = new $h_scg_GenSeqFactory();
$c_scg_SeqFactory.prototype.constructor = $c_scg_SeqFactory;
/** @constructor */
function $h_scg_SeqFactory() {
  /*<skip>*/
}
$h_scg_SeqFactory.prototype = $c_scg_SeqFactory.prototype;
/** @constructor */
function $c_sci_HashMap$HashTrieMap$$anon$3() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashMap$HashTrieMap$$anon$3.prototype = new $h_sci_TrieIterator();
$c_sci_HashMap$HashTrieMap$$anon$3.prototype.constructor = $c_sci_HashMap$HashTrieMap$$anon$3;
/** @constructor */
function $h_sci_HashMap$HashTrieMap$$anon$3() {
  /*<skip>*/
}
$h_sci_HashMap$HashTrieMap$$anon$3.prototype = $c_sci_HashMap$HashTrieMap$$anon$3.prototype;
$c_sci_HashMap$HashTrieMap$$anon$3.prototype.init___sci_HashMap$HashTrieMap = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$6);
  return this
});
$c_sci_HashMap$HashTrieMap$$anon$3.prototype.getElem__O__O = (function(x) {
  return $as_sci_HashMap$HashMap1(x).ensurePair__T2()
});
var $d_sci_HashMap$HashTrieMap$$anon$3 = new $TypeData().initClass({
  sci_HashMap$HashTrieMap$$anon$3: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap$$anon$3", {
  sci_HashMap$HashTrieMap$$anon$3: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashMap$HashTrieMap$$anon$3.prototype.$classData = $d_sci_HashMap$HashTrieMap$$anon$3;
/** @constructor */
function $c_sci_HashSet$HashTrieSet$$anon$1() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashSet$HashTrieSet$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = $c_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $h_sci_HashSet$HashTrieSet$$anon$1() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet$$anon$1.prototype = $c_sci_HashSet$HashTrieSet$$anon$1.prototype;
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.getElem__O__O = (function(cc) {
  return $as_sci_HashSet$HashSet1(cc).key$6
});
var $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $c_sci_Set$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_Set$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_Set$.prototype.constructor = $c_sci_Set$;
/** @constructor */
function $h_sci_Set$() {
  /*<skip>*/
}
$h_sci_Set$.prototype = $c_sci_Set$.prototype;
$c_sci_Set$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
var $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
var $n_sci_Set$ = (void 0);
function $m_sci_Set$() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
}
/** @constructor */
function $c_sci_Stream$StreamBuilder() {
  $c_scm_LazyBuilder.call(this)
}
$c_sci_Stream$StreamBuilder.prototype = new $h_scm_LazyBuilder();
$c_sci_Stream$StreamBuilder.prototype.constructor = $c_sci_Stream$StreamBuilder;
/** @constructor */
function $h_sci_Stream$StreamBuilder() {
  /*<skip>*/
}
$h_sci_Stream$StreamBuilder.prototype = $c_sci_Stream$StreamBuilder.prototype;
$c_sci_Stream$StreamBuilder.prototype.init___ = (function() {
  $c_scm_LazyBuilder.prototype.init___.call(this);
  return this
});
$c_sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
$c_sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return $as_sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$5$2) {
      var x$5 = $as_sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___())))
});
function $is_sci_Stream$StreamBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
}
function $as_sci_Stream$StreamBuilder(obj) {
  return (($is_sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
}
function $isArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
}
function $asArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (($isArrayOf_sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
}
var $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
/** @constructor */
function $c_sci_VectorBuilder() {
  $c_O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
  /*<skip>*/
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
$c_sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
$c_sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
$c_sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u.length)) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.set(this.lo$1, elem);
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
$c_sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
$c_sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = $m_sci_Vector$();
    return this$1.NIL$6
  };
  var s = new $c_sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, 0, xor)
  };
  return s
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
$c_sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
$c_sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $as_sci_VectorBuilder($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
});
$c_sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
function $is_sci_VectorBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
}
function $as_sci_VectorBuilder(obj) {
  return (($is_sci_VectorBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
}
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
function $c_sci_VectorIterator() {
  $c_sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
}
$c_sci_VectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_VectorIterator.prototype.constructor = $c_sci_VectorIterator;
/** @constructor */
function $h_sci_VectorIterator() {
  /*<skip>*/
}
$h_sci_VectorIterator.prototype = $c_sci_VectorIterator.prototype;
$c_sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.get(this.lo$2);
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      $f_sci_VectorPointer__gotoNextBlockStart__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
$c_sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
$c_sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
$c_sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
$c_sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
$c_sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
$c_sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
$c_sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
$c_sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
$c_sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
$c_sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
$c_sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
$c_sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
$c_sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
$c_sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
$c_sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
$c_sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
var $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
/** @constructor */
function $c_scm_HashMap$() {
  $c_scg_MutableMapFactory.call(this)
}
$c_scm_HashMap$.prototype = new $h_scg_MutableMapFactory();
$c_scm_HashMap$.prototype.constructor = $c_scm_HashMap$;
/** @constructor */
function $h_scm_HashMap$() {
  /*<skip>*/
}
$h_scm_HashMap$.prototype = $c_scm_HashMap$.prototype;
$c_scm_HashMap$.prototype.init___ = (function() {
  return this
});
$c_scm_HashMap$.prototype.empty__sc_GenMap = (function() {
  return new $c_scm_HashMap().init___()
});
var $d_scm_HashMap$ = new $TypeData().initClass({
  scm_HashMap$: 0
}, false, "scala.collection.mutable.HashMap$", {
  scm_HashMap$: 1,
  scg_MutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_HashMap$.prototype.$classData = $d_scm_HashMap$;
var $n_scm_HashMap$ = (void 0);
function $m_scm_HashMap$() {
  if ((!$n_scm_HashMap$)) {
    $n_scm_HashMap$ = new $c_scm_HashMap$().init___()
  };
  return $n_scm_HashMap$
}
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, message, cause, true, true);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined() {
  $c_O.call(this);
  this.name$1 = null;
  this.root$1 = null;
  this.id$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.productPrefix__T = (function() {
  return "ConceptDefined"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(x$1)) {
    var ConceptDefined$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(x$1);
    return (((this.name$1 === ConceptDefined$1.name$1) && (this.root$1 === ConceptDefined$1.root$1)) && (this.id$1 === ConceptDefined$1.id$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.name$1;
      break
    }
    case 1: {
      return this.root$1;
      break
    }
    case 2: {
      return this.id$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.init___T__T__T = (function(name, root, id) {
  this.name$1 = name;
  this.root$1 = root;
  this.id$1 = id;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$ConceptDefined"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$ConceptDefined;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined: 0
}, false, "com.seamless.contexts.data_types.Events$ConceptDefined", {
  Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$ConceptDefined;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded() {
  $c_O.call(this);
  this.parentId$1 = null;
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.productPrefix__T = (function() {
  return "FieldAdded"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(x$1)) {
    var FieldAdded$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(x$1);
    return (((this.parentId$1 === FieldAdded$1.parentId$1) && (this.id$1 === FieldAdded$1.id$1)) && (this.conceptId$1 === FieldAdded$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parentId$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.init___T__T__T = (function(parentId, id, conceptId) {
  this.parentId$1 = parentId;
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$FieldAdded)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$FieldAdded"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$FieldAdded)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$FieldAdded;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$FieldAdded: 0
}, false, "com.seamless.contexts.data_types.Events$FieldAdded", {
  Lcom_seamless_contexts_data$undtypes_Events$FieldAdded: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$FieldAdded;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged() {
  $c_O.call(this);
  this.id$1 = null;
  this.newName$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.productPrefix__T = (function() {
  return "FieldNameChanged"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(x$1)) {
    var FieldNameChanged$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(x$1);
    return (((this.id$1 === FieldNameChanged$1.id$1) && (this.newName$1 === FieldNameChanged$1.newName$1)) && (this.conceptId$1 === FieldNameChanged$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.newName$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.init___T__T__T = (function(id, newName, conceptId) {
  this.id$1 = id;
  this.newName$1 = newName;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$FieldNameChanged"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$FieldNameChanged;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged: 0
}, false, "com.seamless.contexts.data_types.Events$FieldNameChanged", {
  Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$FieldNameChanged;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved() {
  $c_O.call(this);
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.init___T__T = (function(id, conceptId) {
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.productPrefix__T = (function() {
  return "FieldRemoved"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.productArity__I = (function() {
  return 2
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(x$1)) {
    var FieldRemoved$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(x$1);
    return ((this.id$1 === FieldRemoved$1.id$1) && (this.conceptId$1 === FieldRemoved$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$FieldRemoved"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$FieldRemoved;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved: 0
}, false, "com.seamless.contexts.data_types.Events$FieldRemoved", {
  Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$FieldRemoved;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned() {
  $c_O.call(this);
  this.id$1 = null;
  this.to$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.productPrefix__T = (function() {
  return "TypeAssigned"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.init___T__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T = (function(id, to, conceptId) {
  this.id$1 = id;
  this.to$1 = to;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(x$1)) {
    var TypeAssigned$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(x$1);
    if ((this.id$1 === TypeAssigned$1.id$1)) {
      var x = this.to$1;
      var x$2 = TypeAssigned$1.to$1;
      var jsx$1 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      return (this.conceptId$1 === TypeAssigned$1.conceptId$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.to$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$TypeAssigned"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$TypeAssigned;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned: 0
}, false, "com.seamless.contexts.data_types.Events$TypeAssigned", {
  Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$TypeAssigned;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded() {
  $c_O.call(this);
  this.parentId$1 = null;
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.productPrefix__T = (function() {
  return "TypeParameterAdded"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(x$1)) {
    var TypeParameterAdded$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(x$1);
    return (((this.parentId$1 === TypeParameterAdded$1.parentId$1) && (this.id$1 === TypeParameterAdded$1.id$1)) && (this.conceptId$1 === TypeParameterAdded$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parentId$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.init___T__T__T = (function(parentId, id, conceptId) {
  this.parentId$1 = parentId;
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$TypeParameterAdded"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$TypeParameterAdded;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded: 0
}, false, "com.seamless.contexts.data_types.Events$TypeParameterAdded", {
  Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterAdded;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved() {
  $c_O.call(this);
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype = $c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.init___T__T = (function(id, conceptId) {
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.productPrefix__T = (function() {
  return "TypeParameterRemoved"
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.productArity__I = (function() {
  return 2
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(x$1)) {
    var TypeParameterRemoved$1 = $as_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(x$1);
    return ((this.id$1 === TypeParameterRemoved$1.id$1) && (this.conceptId$1 === TypeParameterRemoved$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Events$TypeParameterRemoved"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Events$TypeParameterRemoved;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved: 0
}, false, "com.seamless.contexts.data_types.Events$TypeParameterRemoved", {
  Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Events$DataTypesEvent: 1,
  Lcom_seamless_contexts_rfc_Events$RfcEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Events$TypeParameterRemoved;
/** @constructor */
function $c_ju_Arrays$$anon$3() {
  $c_O.call(this);
  this.cmp$1$1 = null
}
$c_ju_Arrays$$anon$3.prototype = new $h_O();
$c_ju_Arrays$$anon$3.prototype.constructor = $c_ju_Arrays$$anon$3;
/** @constructor */
function $h_ju_Arrays$$anon$3() {
  /*<skip>*/
}
$h_ju_Arrays$$anon$3.prototype = $c_ju_Arrays$$anon$3.prototype;
$c_ju_Arrays$$anon$3.prototype.init___ju_Comparator = (function(cmp$1) {
  this.cmp$1$1 = cmp$1;
  return this
});
$c_ju_Arrays$$anon$3.prototype.compare__O__O__I = (function(x, y) {
  return this.cmp$1$1.compare__O__O__I(x, y)
});
var $d_ju_Arrays$$anon$3 = new $TypeData().initClass({
  ju_Arrays$$anon$3: 0
}, false, "java.util.Arrays$$anon$3", {
  ju_Arrays$$anon$3: 1,
  O: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Arrays$$anon$3.prototype.$classData = $d_ju_Arrays$$anon$3;
/** @constructor */
function $c_s_math_Ordering$$anon$2() {
  $c_O.call(this);
  this.$$outer$1 = null;
  this.f$1$1 = null
}
$c_s_math_Ordering$$anon$2.prototype = new $h_O();
$c_s_math_Ordering$$anon$2.prototype.constructor = $c_s_math_Ordering$$anon$2;
/** @constructor */
function $h_s_math_Ordering$$anon$2() {
  /*<skip>*/
}
$h_s_math_Ordering$$anon$2.prototype = $c_s_math_Ordering$$anon$2.prototype;
$c_s_math_Ordering$$anon$2.prototype.compare__O__O__I = (function(x, y) {
  return this.$$outer$1.compare__O__O__I(this.f$1$1.apply__O__O(x), this.f$1$1.apply__O__O(y))
});
$c_s_math_Ordering$$anon$2.prototype.init___s_math_Ordering__F1 = (function($$outer, f$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.f$1$1 = f$1;
  return this
});
var $d_s_math_Ordering$$anon$2 = new $TypeData().initClass({
  s_math_Ordering$$anon$2: 0
}, false, "scala.math.Ordering$$anon$2", {
  s_math_Ordering$$anon$2: 1,
  O: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$$anon$2.prototype.$classData = $d_s_math_Ordering$$anon$2;
/** @constructor */
function $c_sc_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sc_Seq$.prototype = new $h_scg_SeqFactory();
$c_sc_Seq$.prototype.constructor = $c_sc_Seq$;
/** @constructor */
function $h_sc_Seq$() {
  /*<skip>*/
}
$h_sc_Seq$.prototype = $c_sc_Seq$.prototype;
$c_sc_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Seq$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
var $n_sc_Seq$ = (void 0);
function $m_sc_Seq$() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
}
/** @constructor */
function $c_scg_IndexedSeqFactory() {
  $c_scg_SeqFactory.call(this)
}
$c_scg_IndexedSeqFactory.prototype = new $h_scg_SeqFactory();
$c_scg_IndexedSeqFactory.prototype.constructor = $c_scg_IndexedSeqFactory;
/** @constructor */
function $h_scg_IndexedSeqFactory() {
  /*<skip>*/
}
$h_scg_IndexedSeqFactory.prototype = $c_scg_IndexedSeqFactory.prototype;
/** @constructor */
function $c_sci_HashMap$() {
  $c_scg_ImmutableMapFactory.call(this);
  this.defaultMerger$4 = null
}
$c_sci_HashMap$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_HashMap$.prototype.constructor = $c_sci_HashMap$;
/** @constructor */
function $h_sci_HashMap$() {
  /*<skip>*/
}
$h_sci_HashMap$.prototype = $c_sci_HashMap$.prototype;
$c_sci_HashMap$.prototype.init___ = (function() {
  $n_sci_HashMap$ = this;
  var mergef = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(a$2, b$2) {
      var a = $as_T2(a$2);
      $as_T2(b$2);
      return a
    })
  })(this));
  this.defaultMerger$4 = new $c_sci_HashMap$$anon$1().init___F2(mergef);
  return this
});
$c_sci_HashMap$.prototype.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap = (function(hash0, elem0, hash1, elem1, level, size) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashMap.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.set(0, elem0);
      elems.set(1, elem1)
    } else {
      elems.set(0, elem1);
      elems.set(1, elem0)
    };
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap, elems, size)
  } else {
    var elems$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    elems$2.set(0, this.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(hash0, elem0, hash1, elem1, ((5 + level) | 0), size));
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap$2, elems$2, size)
  }
});
$c_sci_HashMap$.prototype.scala$collection$immutable$HashMap$$keepBits__I__I__I = (function(bitmap, keep) {
  var result = 0;
  var current = bitmap;
  var kept = keep;
  while ((kept !== 0)) {
    var lsb = (current ^ (current & (((-1) + current) | 0)));
    if (((1 & kept) !== 0)) {
      result = (result | lsb)
    };
    current = (current & (~lsb));
    kept = ((kept >>> 1) | 0)
  };
  return result
});
$c_sci_HashMap$.prototype.empty__sc_GenMap = (function() {
  return $m_sci_HashMap$EmptyHashMap$()
});
var $d_sci_HashMap$ = new $TypeData().initClass({
  sci_HashMap$: 0
}, false, "scala.collection.immutable.HashMap$", {
  sci_HashMap$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1,
  scg_BitOperations$Int: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashMap$.prototype.$classData = $d_sci_HashMap$;
var $n_sci_HashMap$ = (void 0);
function $m_sci_HashMap$() {
  if ((!$n_sci_HashMap$)) {
    $n_sci_HashMap$ = new $c_sci_HashMap$().init___()
  };
  return $n_sci_HashMap$
}
/** @constructor */
function $c_sci_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Seq$.prototype = new $h_scg_SeqFactory();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
function $h_sci_Seq$() {
  /*<skip>*/
}
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
function $m_sci_Seq$() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
}
/** @constructor */
function $c_scm_IndexedSeq$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_IndexedSeq$.prototype = new $h_scg_SeqFactory();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
function $h_scm_IndexedSeq$() {
  /*<skip>*/
}
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
function $m_scm_IndexedSeq$() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
}
/** @constructor */
function $c_sjs_js_WrappedArray$() {
  $c_scg_SeqFactory.call(this)
}
$c_sjs_js_WrappedArray$.prototype = new $h_scg_SeqFactory();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
}
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$AddField() {
  $c_O.call(this);
  this.parentId$1 = null;
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$AddField;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$AddField() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.productPrefix__T = (function() {
  return "AddField"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$AddField(x$1)) {
    var AddField$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$AddField(x$1);
    return (((this.parentId$1 === AddField$1.parentId$1) && (this.id$1 === AddField$1.id$1)) && (this.conceptId$1 === AddField$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parentId$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.init___T__T__T = (function(parentId, id, conceptId) {
  this.parentId$1 = parentId;
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$AddField(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$AddField)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$AddField(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$AddField(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$AddField"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AddField(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$AddField)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AddField(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AddField(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$AddField;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$AddField = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$AddField: 0
}, false, "com.seamless.contexts.data_types.Commands$AddField", {
  Lcom_seamless_contexts_data$undtypes_Commands$AddField: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$AddField;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter() {
  $c_O.call(this);
  this.parentId$1 = null;
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.productPrefix__T = (function() {
  return "AddTypeParameter"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(x$1)) {
    var AddTypeParameter$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(x$1);
    return (((this.parentId$1 === AddTypeParameter$1.parentId$1) && (this.id$1 === AddTypeParameter$1.id$1)) && (this.conceptId$1 === AddTypeParameter$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parentId$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.init___T__T__T = (function(parentId, id, conceptId) {
  this.parentId$1 = parentId;
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$AddTypeParameter"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$AddTypeParameter;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter: 0
}, false, "com.seamless.contexts.data_types.Commands$AddTypeParameter", {
  Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType() {
  $c_O.call(this);
  this.id$1 = null;
  this.to$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$AssignType() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.productPrefix__T = (function() {
  return "AssignType"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.init___T__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T = (function(id, to, conceptId) {
  this.id$1 = id;
  this.to$1 = to;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(x$1)) {
    var AssignType$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(x$1);
    if ((this.id$1 === AssignType$1.id$1)) {
      var x = this.to$1;
      var x$2 = AssignType$1.to$1;
      var jsx$1 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      return (this.conceptId$1 === AssignType$1.conceptId$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.to$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$AssignType)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$AssignType"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$AssignType)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$AssignType(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$AssignType;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$AssignType = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$AssignType: 0
}, false, "com.seamless.contexts.data_types.Commands$AssignType", {
  Lcom_seamless_contexts_data$undtypes_Commands$AssignType: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$AssignType;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept() {
  $c_O.call(this);
  this.name$1 = null;
  this.root$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.productPrefix__T = (function() {
  return "DefineConcept"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(x$1)) {
    var DefineConcept$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(x$1);
    return (((this.name$1 === DefineConcept$1.name$1) && (this.root$1 === DefineConcept$1.root$1)) && (this.conceptId$1 === DefineConcept$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.name$1;
      break
    }
    case 1: {
      return this.root$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.init___T__T__T = (function(name, root, conceptId) {
  this.name$1 = name;
  this.root$1 = root;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$DefineConcept"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$DefineConcept;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept: 0
}, false, "com.seamless.contexts.data_types.Commands$DefineConcept", {
  Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept() {
  $c_O.call(this);
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.productPrefix__T = (function() {
  return "DeprecateConcept"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.productArity__I = (function() {
  return 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(x$1)) {
    var DeprecateConcept$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(x$1);
    return (this.conceptId$1 === DeprecateConcept$1.conceptId$1)
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.init___T = (function(conceptId) {
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$DeprecateConcept"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$DeprecateConcept;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept: 0
}, false, "com.seamless.contexts.data_types.Commands$DeprecateConcept", {
  Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField() {
  $c_O.call(this);
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.init___T__T = (function(id, conceptId) {
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.productPrefix__T = (function() {
  return "RemoveField"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.productArity__I = (function() {
  return 2
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(x$1)) {
    var RemoveField$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(x$1);
    return ((this.id$1 === RemoveField$1.id$1) && (this.conceptId$1 === RemoveField$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$RemoveField)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$RemoveField"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$RemoveField)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$RemoveField;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$RemoveField: 0
}, false, "com.seamless.contexts.data_types.Commands$RemoveField", {
  Lcom_seamless_contexts_data$undtypes_Commands$RemoveField: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter() {
  $c_O.call(this);
  this.id$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.init___T__T = (function(id, conceptId) {
  this.id$1 = id;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.productPrefix__T = (function() {
  return "RemoveTypeParameter"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.productArity__I = (function() {
  return 2
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(x$1)) {
    var RemoveTypeParameter$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(x$1);
    return ((this.id$1 === RemoveTypeParameter$1.id$1) && (this.conceptId$1 === RemoveTypeParameter$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$RemoveTypeParameter"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$RemoveTypeParameter;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter: 0
}, false, "com.seamless.contexts.data_types.Commands$RemoveTypeParameter", {
  Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName() {
  $c_O.call(this);
  this.newName$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.init___T__T = (function(newName, conceptId) {
  this.newName$1 = newName;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.productPrefix__T = (function() {
  return "SetConceptName"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.productArity__I = (function() {
  return 2
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(x$1)) {
    var SetConceptName$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(x$1);
    return ((this.newName$1 === SetConceptName$1.newName$1) && (this.conceptId$1 === SetConceptName$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.newName$1;
      break
    }
    case 1: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$SetConceptName"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$SetConceptName;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName: 0
}, false, "com.seamless.contexts.data_types.Commands$SetConceptName", {
  Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName() {
  $c_O.call(this);
  this.id$1 = null;
  this.newName$1 = null;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.productPrefix__T = (function() {
  return "SetFieldName"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(x$1)) {
    var SetFieldName$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(x$1);
    return (((this.id$1 === SetFieldName$1.id$1) && (this.newName$1 === SetFieldName$1.newName$1)) && (this.conceptId$1 === SetFieldName$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.newName$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.init___T__T__T = (function(id, newName, conceptId) {
  this.id$1 = id;
  this.newName$1 = newName;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$SetFieldName"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$SetFieldName;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName: 0
}, false, "com.seamless.contexts.data_types.Commands$SetFieldName", {
  Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName;
/** @constructor */
function $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence() {
  $c_O.call(this);
  this.id$1 = null;
  this.optional$1 = false;
  this.conceptId$1 = null
}
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype = new $h_O();
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.constructor = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence;
/** @constructor */
function $h_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence() {
  /*<skip>*/
}
$h_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype;
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.productPrefix__T = (function() {
  return "SetFieldOccurrence"
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.productArity__I = (function() {
  return 3
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(x$1)) {
    var SetFieldOccurrence$1 = $as_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(x$1);
    return (((this.id$1 === SetFieldOccurrence$1.id$1) && (this.optional$1 === SetFieldOccurrence$1.optional$1)) && (this.conceptId$1 === SetFieldOccurrence$1.conceptId$1))
  } else {
    return false
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.id$1;
      break
    }
    case 1: {
      return this.optional$1;
      break
    }
    case 2: {
      return this.conceptId$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.init___T__Z__T = (function(id, optional, conceptId) {
  this.id$1 = id;
  this.optional$1 = optional;
  this.conceptId$1 = conceptId;
  return this
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.id$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, (this.optional$1 ? 1231 : 1237));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.conceptId$1));
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence)))
}
function $as_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(obj) {
  return (($is_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.seamless.contexts.data_types.Commands$SetFieldOccurrence"))
}
function $isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence)))
}
function $asArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(obj, depth) {
  return (($isArrayOf_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.seamless.contexts.data_types.Commands$SetFieldOccurrence;", depth))
}
var $d_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence = new $TypeData().initClass({
  Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence: 0
}, false, "com.seamless.contexts.data_types.Commands$SetFieldOccurrence", {
  Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence: 1,
  O: 1,
  Lcom_seamless_contexts_data$undtypes_Commands$DataTypesCommand: 1,
  Lcom_seamless_contexts_rfc_Commands$RfcCommand: 1,
  Lcom_seamless_ddd_ExportedCommand: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.$classData = $d_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence;
/** @constructor */
function $c_s_math_Ordering$Int$() {
  $c_O.call(this)
}
$c_s_math_Ordering$Int$.prototype = new $h_O();
$c_s_math_Ordering$Int$.prototype.constructor = $c_s_math_Ordering$Int$;
/** @constructor */
function $h_s_math_Ordering$Int$() {
  /*<skip>*/
}
$h_s_math_Ordering$Int$.prototype = $c_s_math_Ordering$Int$.prototype;
$c_s_math_Ordering$Int$.prototype.init___ = (function() {
  return this
});
$c_s_math_Ordering$Int$.prototype.compare__O__O__I = (function(x, y) {
  var x$1 = $uI(x);
  var y$1 = $uI(y);
  return ((x$1 === y$1) ? 0 : ((x$1 < y$1) ? (-1) : 1))
});
var $d_s_math_Ordering$Int$ = new $TypeData().initClass({
  s_math_Ordering$Int$: 0
}, false, "scala.math.Ordering$Int$", {
  s_math_Ordering$Int$: 1,
  O: 1,
  s_math_Ordering$IntOrdering: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$Int$.prototype.$classData = $d_s_math_Ordering$Int$;
var $n_s_math_Ordering$Int$ = (void 0);
function $m_s_math_Ordering$Int$() {
  if ((!$n_s_math_Ordering$Int$)) {
    $n_s_math_Ordering$Int$ = new $c_s_math_Ordering$Int$().init___()
  };
  return $n_s_math_Ordering$Int$
}
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  $c_O.call(this);
  this.toString$1 = null
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
  /*<skip>*/
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ClassTypeManifest() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass1$1 = null;
  this.typeArguments$1 = null
}
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ClassTypeManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
/** @constructor */
function $c_sc_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
}
$c_sc_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sc_IndexedSeq$.prototype.constructor = $c_sc_IndexedSeq$;
/** @constructor */
function $h_sc_IndexedSeq$() {
  /*<skip>*/
}
$h_sc_IndexedSeq$.prototype = $c_sc_IndexedSeq$.prototype;
$c_sc_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
  return this
});
$c_sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
var $n_sc_IndexedSeq$ = (void 0);
function $m_sc_IndexedSeq$() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
}
/** @constructor */
function $c_sc_IndexedSeqLike$Elements() {
  $c_sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$2 = null
}
$c_sc_IndexedSeqLike$Elements.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqLike$Elements.prototype.constructor = $c_sc_IndexedSeqLike$Elements;
/** @constructor */
function $h_sc_IndexedSeqLike$Elements() {
  /*<skip>*/
}
$h_sc_IndexedSeqLike$Elements.prototype = $c_sc_IndexedSeqLike$Elements.prototype;
$c_sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    $m_sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$2.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
$c_sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.index$2 = start;
  return this
});
$c_sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
$c_sc_IndexedSeqLike$Elements.prototype.drop__I__sc_Iterator = (function(n) {
  return ((n <= 0) ? new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this.$$outer$2, this.index$2, this.end$2) : ((((this.index$2 + n) | 0) >= this.end$2) ? new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this.$$outer$2, this.end$2, this.end$2) : new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this.$$outer$2, ((this.index$2 + n) | 0), this.end$2)))
});
var $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
/** @constructor */
function $c_sci_HashSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_HashSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_HashSet$.prototype.constructor = $c_sci_HashSet$;
/** @constructor */
function $h_sci_HashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$.prototype = $c_sci_HashSet$.prototype;
$c_sci_HashSet$.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$keepBits__I__I__I = (function(bitmap, keep) {
  var result = 0;
  var current = bitmap;
  var kept = keep;
  while ((kept !== 0)) {
    var lsb = (current ^ (current & (((-1) + current) | 0)));
    if (((1 & kept) !== 0)) {
      result = (result | lsb)
    };
    current = (current & (~lsb));
    kept = ((kept >>> 1) | 0)
  };
  return result
});
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.set(0, elem0);
      elems.set(1, elem1)
    } else {
      elems.set(0, elem1);
      elems.set(1, elem0)
    };
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.set(0, child);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
$c_sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
var $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
var $n_sci_HashSet$ = (void 0);
function $m_sci_HashSet$() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
}
/** @constructor */
function $c_sci_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this)
}
$c_sci_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
function $h_sci_IndexedSeq$() {
  /*<skip>*/
}
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
function $m_sci_IndexedSeq$() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
}
/** @constructor */
function $c_sci_ListSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_ListSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_ListSet$.prototype.constructor = $c_sci_ListSet$;
/** @constructor */
function $h_sci_ListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$.prototype = $c_sci_ListSet$.prototype;
$c_sci_ListSet$.prototype.init___ = (function() {
  return this
});
$c_sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
var $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
var $n_sci_ListSet$ = (void 0);
function $m_sci_ListSet$() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
}
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.getMessage__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.init___ = (function() {
  this.toString$1 = "Boolean";
  return this
});
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
var $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest$.prototype = $c_s_reflect_ManifestFactory$ByteManifest$.prototype;
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.init___ = (function() {
  this.toString$1 = "Byte";
  return this
});
var $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
var $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ByteManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$CharManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest$.prototype = $c_s_reflect_ManifestFactory$CharManifest$.prototype;
$c_s_reflect_ManifestFactory$CharManifest$.prototype.init___ = (function() {
  this.toString$1 = "Char";
  return this
});
var $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
var $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$CharManifest$() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.init___ = (function() {
  this.toString$1 = "Double";
  return this
});
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
var $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest$.prototype = $c_s_reflect_ManifestFactory$FloatManifest$.prototype;
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.init___ = (function() {
  this.toString$1 = "Float";
  return this
});
var $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
var $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$FloatManifest$() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
$c_s_reflect_ManifestFactory$IntManifest$.prototype.init___ = (function() {
  this.toString$1 = "Int";
  return this
});
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
var $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$LongManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest$.prototype = $c_s_reflect_ManifestFactory$LongManifest$.prototype;
$c_s_reflect_ManifestFactory$LongManifest$.prototype.init___ = (function() {
  this.toString$1 = "Long";
  return this
});
var $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
var $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$LongManifest$() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$PhantomManifest() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null
}
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$PhantomManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest$.prototype = $c_s_reflect_ManifestFactory$ShortManifest$.prototype;
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.init___ = (function() {
  this.toString$1 = "Short";
  return this
});
var $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
var $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ShortManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest$.prototype = $c_s_reflect_ManifestFactory$UnitManifest$.prototype;
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.init___ = (function() {
  this.toString$1 = "Unit";
  return this
});
var $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
var $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$UnitManifest$() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
}
function $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sci_Vector(that)) {
    var x2 = $as_sci_Vector(that);
    if ($is_sci_Vector($thiz)) {
      var thisVector = $as_sci_Vector($thiz);
      if ((thisVector === x2)) {
        return true
      } else {
        var equal = (thisVector.length__I() === x2.length__I());
        if (equal) {
          var length = x2.length__I();
          var index = 0;
          while (((index < length) && equal)) {
            equal = $m_sr_BoxesRunTime$().equals__O__O__Z(thisVector.apply__I__O(index), x2.apply__I__O(index));
            index = ((1 + index) | 0)
          }
        };
        return equal
      }
    }
  };
  var these = $thiz.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
}
function $f_sc_IterableLike__take__I__O($thiz, n) {
  var b = $thiz.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(b, n, $thiz);
    var i = 0;
    var it = $thiz.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
}
function $f_sc_IterableLike__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = start;
  var x = ((start + len) | 0);
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = ((x < that) ? x : that);
  var it = $thiz.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
}
/** @constructor */
function $c_sci_List$() {
  $c_scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
}
$c_sci_List$.prototype = new $h_scg_SeqFactory();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
  /*<skip>*/
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_List$ = this;
  this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.empty__sc_GenTraversable = (function() {
  return $m_sci_Nil$()
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
}
/** @constructor */
function $c_sci_Stream$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Stream$.prototype = new $h_scg_SeqFactory();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
function $h_sci_Stream$() {
  /*<skip>*/
}
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Stream$.prototype.continually__F0__sci_Stream = (function(elem) {
  var hd = elem.apply__O();
  var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, elem$1) {
    return (function() {
      return $m_sci_Stream$().continually__F0__sci_Stream(elem$1)
    })
  })(this, elem));
  return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
});
$c_sci_Stream$.prototype.filteredTail__sci_Stream__F1__Z__sci_Stream$Cons = (function(stream, p, isFlipped) {
  var hd = stream.head__O();
  var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, stream$1, p$1, isFlipped$1) {
    return (function() {
      return $as_sci_Stream(stream$1.tail__O()).filterImpl__F1__Z__sci_Stream(p$1, isFlipped$1)
    })
  })(this, stream, p, isFlipped));
  return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
});
$c_sci_Stream$.prototype.empty__sc_GenTraversable = (function() {
  return $m_sci_Stream$Empty$()
});
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_Stream$StreamBuilder().init___()
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
function $m_sci_Stream$() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
}
/** @constructor */
function $c_scm_ArrayBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ArrayBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
}
/** @constructor */
function $c_scm_ListBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ListBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
function $h_scm_ListBuffer$() {
  /*<skip>*/
}
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
function $m_scm_ListBuffer$() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyManifest$.prototype = $c_s_reflect_ManifestFactory$AnyManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.init___ = (function() {
  this.toString$2 = "Any";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$AnyManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyManifest$", {
  s_reflect_ManifestFactory$AnyManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyManifest$;
var $n_s_reflect_ManifestFactory$AnyManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyManifest$)) {
    $n_s_reflect_ManifestFactory$AnyManifest$ = new $c_s_reflect_ManifestFactory$AnyManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyValManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyValManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyValManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyValManifest$.prototype = $c_s_reflect_ManifestFactory$AnyValManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.init___ = (function() {
  this.toString$2 = "AnyVal";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$AnyValManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyValManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyValManifest$", {
  s_reflect_ManifestFactory$AnyValManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyValManifest$;
var $n_s_reflect_ManifestFactory$AnyValManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyValManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyValManifest$)) {
    $n_s_reflect_ManifestFactory$AnyValManifest$ = new $c_s_reflect_ManifestFactory$AnyValManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyValManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NothingManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NothingManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NothingManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NothingManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NothingManifest$.prototype = $c_s_reflect_ManifestFactory$NothingManifest$.prototype;
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.init___ = (function() {
  this.toString$2 = "Nothing";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
var $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NothingManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NullManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NullManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NullManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NullManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NullManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NullManifest$.prototype = $c_s_reflect_ManifestFactory$NullManifest$.prototype;
$c_s_reflect_ManifestFactory$NullManifest$.prototype.init___ = (function() {
  this.toString$2 = "Null";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
var $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NullManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ObjectManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ObjectManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ObjectManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ObjectManifest$.prototype = $c_s_reflect_ManifestFactory$ObjectManifest$.prototype;
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.init___ = (function() {
  this.toString$2 = "Object";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
var $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ObjectManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
}
function $is_sc_GenMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenMap)))
}
function $as_sc_GenMap(obj) {
  return (($is_sc_GenMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenMap"))
}
function $isArrayOf_sc_GenMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenMap)))
}
function $asArrayOf_sc_GenMap(obj, depth) {
  return (($isArrayOf_sc_GenMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenMap;", depth))
}
function $is_sc_GenSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
}
function $as_sc_GenSeq(obj) {
  return (($is_sc_GenSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSeq"))
}
function $isArrayOf_sc_GenSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
}
function $asArrayOf_sc_GenSeq(obj, depth) {
  return (($isArrayOf_sc_GenSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
}
/** @constructor */
function $c_sci_Vector$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null
}
$c_sci_Vector$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
  /*<skip>*/
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_Vector$ = this;
  this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
$c_sci_Vector$.prototype.empty__sc_GenTraversable = (function() {
  return this.NIL$6
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
}
/** @constructor */
function $c_sc_AbstractTraversable() {
  $c_O.call(this)
}
$c_sc_AbstractTraversable.prototype = new $h_O();
$c_sc_AbstractTraversable.prototype.constructor = $c_sc_AbstractTraversable;
/** @constructor */
function $h_sc_AbstractTraversable() {
  /*<skip>*/
}
$h_sc_AbstractTraversable.prototype = $c_sc_AbstractTraversable.prototype;
$c_sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.toVector__sci_Vector = (function() {
  $m_sci_Vector$();
  var cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
  return $as_sci_Vector($f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractTraversable.prototype.filter__F1__O = (function(p) {
  return this.filterImpl__F1__Z__O(p, false)
});
$c_sc_AbstractTraversable.prototype.filterImpl__F1__Z__O = (function(p, isFlipped) {
  return $f_sc_TraversableLike__filterImpl__F1__Z__O(this, p, isFlipped)
});
$c_sc_AbstractTraversable.prototype.sizeHintIfCheap__I = (function() {
  return (-1)
});
$c_sc_AbstractTraversable.prototype.filterNot__F1__O = (function(p) {
  return this.filterImpl__F1__Z__O(p, true)
});
$c_sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.toSet__sci_Set = (function() {
  var this$1 = $m_sci_Set$();
  var cbf = new $c_scg_GenSetFactory$$anon$1().init___scg_GenSetFactory(this$1);
  return $as_sci_Set($f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
$c_sc_AbstractTraversable.prototype.toMap__s_Predef$$less$colon$less__sci_Map = (function(ev) {
  var b = new $c_scm_MapBuilder().init___sc_GenMap($m_sci_Map$EmptyMap$());
  this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, ev$1) {
    return (function(x$2) {
      return b$1.$$plus$eq__O__scm_Builder(x$2)
    })
  })(this, b, ev)));
  return $as_sci_Map(b.elems$1)
});
$c_sc_AbstractTraversable.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $f_sc_SeqLike__isEmpty__Z($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
}
function $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O($thiz, elem, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Seq());
  b.$$plus$eq__O__scm_Builder(elem);
  return b.result__O()
}
function $f_sc_SeqLike__sorted__s_math_Ordering__O($thiz, ord) {
  var len = $thiz.length__I();
  var b = $thiz.newBuilder__scm_Builder();
  if ((len === 1)) {
    b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz)
  } else if ((len > 1)) {
    b.sizeHint__I__V(len);
    var arr = $newArrayObject($d_O.getArrayOf(), [len]);
    var i = new $c_sr_IntRef().init___I(0);
    $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, arr$1, i$1) {
      return (function(x$2) {
        arr$1.set(i$1.elem$1, x$2);
        i$1.elem$1 = ((1 + i$1.elem$1) | 0)
      })
    })($thiz, arr, i)));
    $m_ju_Arrays$().sort__AO__ju_Comparator__V(arr, ord);
    i.elem$1 = 0;
    while ((i.elem$1 < arr.u.length)) {
      b.$$plus$eq__O__scm_Builder(arr.get(i.elem$1));
      i.elem$1 = ((1 + i.elem$1) | 0)
    }
  };
  return b.result__O()
}
function $f_sc_SeqLike__indexWhere__F1__I__I($thiz, p, from) {
  var i = ((from > 0) ? from : 0);
  var it = $thiz.iterator__sc_Iterator().drop__I__sc_Iterator(from);
  while (it.hasNext__Z()) {
    if ($uZ(p.apply__O__O(it.next__O()))) {
      return i
    } else {
      i = ((1 + i) | 0)
    }
  };
  return (-1)
}
function $f_sc_SeqLike__reverse__O($thiz) {
  var elem = $m_sci_Nil$();
  var xs = new $c_sr_ObjectRef().init___O(elem);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, xs$1) {
    return (function(x$2) {
      var this$2 = $as_sci_List(xs$1.elem$1);
      xs$1.elem$1 = new $c_sci_$colon$colon().init___O__sci_List(x$2, this$2)
    })
  })($thiz, xs)));
  var b = $thiz.newBuilder__scm_Builder();
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  var this$3 = $as_sci_List(xs.elem$1);
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    b.$$plus$eq__O__scm_Builder(arg1);
    var this$4 = these;
    these = this$4.tail__sci_List()
  };
  return b.result__O()
}
function $f_sc_SeqLike__contains__O__Z($thiz, elem) {
  return $thiz.exists__F1__Z(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, elem$1) {
    return (function(x$12$2) {
      return $m_sr_BoxesRunTime$().equals__O__O__Z(x$12$2, elem$1)
    })
  })($thiz, elem)))
}
function $f_sc_SeqLike__sortBy__F1__s_math_Ordering__O($thiz, f, ord) {
  var ord$1 = new $c_s_math_Ordering$$anon$2().init___s_math_Ordering__F1(ord, f);
  return $f_sc_SeqLike__sorted__s_math_Ordering__O($thiz, ord$1)
}
function $is_sc_SeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_SeqLike)))
}
function $as_sc_SeqLike(obj) {
  return (($is_sc_SeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.SeqLike"))
}
function $isArrayOf_sc_SeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_SeqLike)))
}
function $asArrayOf_sc_SeqLike(obj, depth) {
  return (($isArrayOf_sc_SeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.SeqLike;", depth))
}
function $is_sc_GenSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
}
function $as_sc_GenSet(obj) {
  return (($is_sc_GenSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSet"))
}
function $isArrayOf_sc_GenSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
}
function $asArrayOf_sc_GenSet(obj, depth) {
  return (($isArrayOf_sc_GenSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
}
function $is_sc_IndexedSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
}
function $as_sc_IndexedSeqLike(obj) {
  return (($is_sc_IndexedSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
}
function $isArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
}
function $asArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (($isArrayOf_sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
}
function $is_sc_LinearSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
}
function $as_sc_LinearSeqLike(obj) {
  return (($is_sc_LinearSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqLike"))
}
function $isArrayOf_sc_LinearSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
}
function $asArrayOf_sc_LinearSeqLike(obj, depth) {
  return (($isArrayOf_sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
}
function $f_sc_IndexedSeqOptimized__lengthCompare__I__I($thiz, len) {
  return (($thiz.length__I() - len) | 0)
}
function $f_sc_IndexedSeqOptimized__exists__F1__Z($thiz, p) {
  return ($f_sc_IndexedSeqOptimized__prefixLengthImpl__psc_IndexedSeqOptimized__F1__Z__I($thiz, p, false) !== $thiz.length__I())
}
function $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_IndexedSeq(that)) {
    var x2 = $as_sc_IndexedSeq(that);
    var len = $thiz.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($thiz.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_IndexedSeqOptimized__isEmpty__Z($thiz) {
  return ($thiz.length__I() === 0)
}
function $f_sc_IndexedSeqOptimized__prefixLengthImpl__psc_IndexedSeqOptimized__F1__Z__I($thiz, p, expectTrue) {
  var i = 0;
  while (((i < $thiz.length__I()) && ($uZ(p.apply__O__O($thiz.apply__I__O(i))) === expectTrue))) {
    i = ((1 + i) | 0)
  };
  return i
}
function $f_sc_IndexedSeqOptimized__foreach__F1__V($thiz, f) {
  var i = 0;
  var len = $thiz.length__I();
  while ((i < len)) {
    f.apply__O__O($thiz.apply__I__O(i));
    i = ((1 + i) | 0)
  }
}
function $f_sc_IndexedSeqOptimized__indexWhere__F1__I__I($thiz, p, from) {
  var start = ((from > 0) ? from : 0);
  var len = $thiz.length__I();
  var i = start;
  while (true) {
    if ((i < len)) {
      var arg1 = $thiz.apply__I__O(i);
      var jsx$1 = (!$uZ(p.apply__O__O(arg1)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      i = ((1 + i) | 0)
    } else {
      break
    }
  };
  var n = ((start + ((i - start) | 0)) | 0);
  return $f_sc_IndexedSeqOptimized__negLength__psc_IndexedSeqOptimized__I__I($thiz, n)
}
function $f_sc_IndexedSeqOptimized__reverse__O($thiz) {
  var b = $thiz.newBuilder__scm_Builder();
  b.sizeHint__I__V($thiz.length__I());
  var i = $thiz.length__I();
  while ((i > 0)) {
    i = (((-1) + i) | 0);
    b.$$plus$eq__O__scm_Builder($thiz.apply__I__O(i))
  };
  return b.result__O()
}
function $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = 0;
  var j = start;
  var x = $thiz.length__I();
  var x$1 = ((x < len) ? x : len);
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((x$1 < that) ? x$1 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $thiz.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
}
function $f_sc_IndexedSeqOptimized__negLength__psc_IndexedSeqOptimized__I__I($thiz, n) {
  return ((n >= $thiz.length__I()) ? (-1) : n)
}
function $f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var xs = $thiz;
    return $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len)
  }
}
function $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    if (($thiz === x2)) {
      return true
    } else {
      var these = $thiz;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = $as_sc_LinearSeqOptimized(these.tail__O());
        those = $as_sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_LinearSeqOptimized__exists__F1__Z($thiz, p) {
  var these = $thiz;
  while ((!these.isEmpty__Z())) {
    if ($uZ(p.apply__O__O(these.head__O()))) {
      return true
    };
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return false
}
function $f_sc_LinearSeqOptimized__apply__I__O($thiz, n) {
  var rest = $thiz.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
}
function $f_sc_LinearSeqOptimized__indexWhere__F1__I__I($thiz, p, from) {
  var i = ((from > 0) ? from : 0);
  var these = $thiz.drop__I__sc_LinearSeqOptimized(from);
  while (true) {
    var this$3 = these;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$3)) {
      if ($uZ(p.apply__O__O(these.head__O()))) {
        return i
      };
      i = ((1 + i) | 0);
      these = $as_sc_LinearSeqOptimized(these.tail__O())
    } else {
      break
    }
  };
  return (-1)
}
function $f_sc_LinearSeqOptimized__length__I($thiz) {
  var these = $thiz;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return len
}
function $f_sc_LinearSeqOptimized__last__O($thiz) {
  if ($thiz.isEmpty__Z()) {
    throw new $c_ju_NoSuchElementException().init___()
  };
  var these = $thiz;
  var nx = $as_sc_LinearSeqOptimized(these.tail__O());
  while ((!nx.isEmpty__Z())) {
    these = nx;
    nx = $as_sc_LinearSeqOptimized(nx.tail__O())
  };
  return these.head__O()
}
function $f_sc_LinearSeqOptimized__contains__O__Z($thiz, elem) {
  var these = $thiz;
  while ((!these.isEmpty__Z())) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), elem)) {
      return true
    };
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return false
}
function $f_sc_LinearSeqOptimized__isDefinedAt__I__Z($thiz, x) {
  return ((x >= 0) && ($f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, x) > 0))
}
function $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
}
function $is_sc_LinearSeqOptimized(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
}
function $as_sc_LinearSeqOptimized(obj) {
  return (($is_sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
}
function $isArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
}
function $asArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
}
function $f_sc_SetLike__isEmpty__Z($thiz) {
  return ($thiz.size__I() === 0)
}
function $f_sc_SetLike__toSeq__sc_Seq($thiz) {
  if ($thiz.isEmpty__Z()) {
    var this$1 = $m_s_package$().Vector$1;
    return this$1.NIL$6
  } else {
    $m_s_package$();
    var vb = new $c_sci_VectorBuilder().init___();
    $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, vb$1) {
      return (function(x$1$2) {
        return vb$1.$$plus$eq__O__scm_Builder(x$1$2)
      })
    })($thiz, vb)));
    return vb.result__sci_Vector()
  }
}
function $f_sc_MapLike__apply__O__O($thiz, key) {
  var x1 = $thiz.get__O__s_Option(key);
  var x = $m_s_None$();
  if ((x === x1)) {
    return $f_sc_MapLike__$default__O__O($thiz, key)
  } else if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var value = x2.value$2;
    return value
  } else {
    throw new $c_s_MatchError().init___O(x1)
  }
}
function $f_sc_MapLike__isEmpty__Z($thiz) {
  return ($thiz.size__I() === 0)
}
function $f_sc_MapLike__getOrElse__O__F0__O($thiz, key, $default) {
  var x1 = $thiz.get__O__s_Option(key);
  if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var v = x2.value$2;
    return v
  } else {
    var x = $m_s_None$();
    if ((x === x1)) {
      return $default.apply__O()
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sc_MapLike__$default__O__O($thiz, key) {
  throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
}
function $f_sc_MapLike__contains__O__Z($thiz, key) {
  return $thiz.get__O__s_Option(key).isDefined__Z()
}
function $f_sc_MapLike__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var this$2 = $thiz.iterator__sc_Iterator();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x0$1$2) {
      var x0$1 = $as_T2(x0$1$2);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        return (("" + $m_s_Predef$any2stringadd$().$$plus$extension__O__T__T(k, " -> ")) + v)
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    })
  })($thiz));
  var this$3 = new $c_sc_Iterator$$anon$10().init___sc_Iterator__F1(this$2, f);
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, b, start, sep, end)
}
function $f_sc_MapLike__toSeq__sc_Seq($thiz) {
  if ($thiz.isEmpty__Z()) {
    var this$1 = $m_s_package$().Vector$1;
    return this$1.NIL$6
  } else {
    $m_s_package$();
    var vb = new $c_sci_VectorBuilder().init___();
    $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, vb$1) {
      return (function(x$6$2) {
        var x$6 = $as_T2(x$6$2);
        return vb$1.$$plus$eq__O__scm_Builder(x$6)
      })
    })($thiz, vb)));
    return vb.result__sci_Vector()
  }
}
function $f_sc_MapLike__filterNot__F1__sc_Map($thiz, p) {
  var elem = $as_sc_Map($thiz);
  var res = new $c_sr_ObjectRef().init___O(elem);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, p$1, res$1) {
    return (function(kv$2) {
      var kv = $as_T2(kv$2);
      if ($uZ(p$1.apply__O__O(kv))) {
        res$1.elem$1 = $as_sc_Map(res$1.elem$1).$$minus__O__sc_Map(kv.$$und1$f)
      }
    })
  })($thiz, p, res)));
  return $as_sc_Map(res.elem$1)
}
function $f_sc_MapLike__applyOrElse__O__F1__O($thiz, x, $default) {
  return $thiz.getOrElse__O__F0__O(x, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, $default$1, x$1) {
    return (function() {
      return $default$1.apply__O__O(x$1)
    })
  })($thiz, $default, x)))
}
/** @constructor */
function $c_sc_AbstractIterable() {
  $c_sc_AbstractTraversable.call(this)
}
$c_sc_AbstractIterable.prototype = new $h_sc_AbstractTraversable();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
  /*<skip>*/
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IterableLike__sameElements__sc_GenIterable__Z(this, that)
});
$c_sc_AbstractIterable.prototype.exists__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__exists__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__forall__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  $f_sc_Iterator__foreach__F1__V(this$1, f)
});
$c_sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IterableLike__copyToArray__O__I__I__V(this, xs, start, len)
});
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
}
var $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
function $is_sc_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
}
function $as_sc_Seq(obj) {
  return (($is_sc_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Seq"))
}
function $isArrayOf_sc_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
}
function $asArrayOf_sc_Seq(obj, depth) {
  return (($isArrayOf_sc_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Seq;", depth))
}
function $is_sc_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Map)))
}
function $as_sc_Map(obj) {
  return (($is_sc_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Map"))
}
function $isArrayOf_sc_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Map)))
}
function $asArrayOf_sc_Map(obj, depth) {
  return (($isArrayOf_sc_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Map;", depth))
}
function $is_sc_Set(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Set)))
}
function $as_sc_Set(obj) {
  return (($is_sc_Set(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Set"))
}
function $isArrayOf_sc_Set(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Set)))
}
function $asArrayOf_sc_Set(obj, depth) {
  return (($isArrayOf_sc_Set(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Set;", depth))
}
function $is_sjs_js_ArrayOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_ArrayOps)))
}
function $as_sjs_js_ArrayOps(obj) {
  return (($is_sjs_js_ArrayOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.ArrayOps"))
}
function $isArrayOf_sjs_js_ArrayOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_ArrayOps)))
}
function $asArrayOf_sjs_js_ArrayOps(obj, depth) {
  return (($isArrayOf_sjs_js_ArrayOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.ArrayOps;", depth))
}
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
}
function $f_scm_MapLike__toSeq__sc_Seq($thiz) {
  var result = new $c_scm_ArrayBuffer().init___I($thiz.tableSize$5);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
    return (function(x$1$2) {
      var x$1 = $as_T2(x$1$2);
      return result$1.$$plus$eq__O__scm_ArrayBuffer(x$1)
    })
  })($thiz, result)));
  return result
}
/** @constructor */
function $c_sc_AbstractSeq() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
  /*<skip>*/
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.indexOf__O__I__I = (function(elem, from) {
  return $f_sc_GenSeqLike__indexOf__O__I__I(this, elem, from)
});
$c_sc_AbstractSeq.prototype.runWith__F1__F1 = (function(action) {
  return $f_s_PartialFunction__runWith__F1__F1(this, action)
});
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqLike__isEmpty__Z(this)
});
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSeqLike__equals__O__Z(this, that)
});
$c_sc_AbstractSeq.prototype.$$colon$plus__O__scg_CanBuildFrom__O = (function(elem, bf) {
  return $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O(this, elem, bf)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSeq.prototype.indexWhere__F1__I__I = (function(p, from) {
  return $f_sc_SeqLike__indexWhere__F1__I__I(this, p, from)
});
$c_sc_AbstractSeq.prototype.reverse__O = (function() {
  return $f_sc_SeqLike__reverse__O(this)
});
$c_sc_AbstractSeq.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sc_AbstractSeq.prototype.contains__O__Z = (function(elem) {
  return $f_sc_SeqLike__contains__O__Z(this, elem)
});
$c_sc_AbstractSeq.prototype.toSeq__sc_Seq = (function() {
  return this.thisCollection__sc_Seq()
});
$c_sc_AbstractSeq.prototype.indexOf__O__I = (function(elem) {
  return this.indexOf__O__I__I(elem, 0)
});
$c_sc_AbstractSeq.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
/** @constructor */
function $c_sc_AbstractMap() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractMap.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractMap.prototype.constructor = $c_sc_AbstractMap;
/** @constructor */
function $h_sc_AbstractMap() {
  /*<skip>*/
}
$h_sc_AbstractMap.prototype = $c_sc_AbstractMap.prototype;
$c_sc_AbstractMap.prototype.apply__O__O = (function(key) {
  return $f_sc_MapLike__apply__O__O(this, key)
});
$c_sc_AbstractMap.prototype.runWith__F1__F1 = (function(action) {
  return $f_s_PartialFunction__runWith__F1__F1(this, action)
});
$c_sc_AbstractMap.prototype.isEmpty__Z = (function() {
  return $f_sc_MapLike__isEmpty__Z(this)
});
$c_sc_AbstractMap.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenMapLike__equals__O__Z(this, that)
});
$c_sc_AbstractMap.prototype.getOrElse__O__F0__O = (function(key, $default) {
  return $f_sc_MapLike__getOrElse__O__F0__O(this, key, $default)
});
$c_sc_AbstractMap.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractMap.prototype.contains__O__Z = (function(key) {
  return $f_sc_MapLike__contains__O__Z(this, key)
});
$c_sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_MapLike__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractMap.prototype.toSeq__sc_Seq = (function() {
  return $f_sc_MapLike__toSeq__sc_Seq(this)
});
$c_sc_AbstractMap.prototype.isDefinedAt__O__Z = (function(key) {
  return this.contains__O__Z(key)
});
$c_sc_AbstractMap.prototype.filterNot__F1__sc_Map = (function(p) {
  return $f_sc_MapLike__filterNot__F1__sc_Map(this, p)
});
$c_sc_AbstractMap.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var xs = this.seq__sc_Map();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(xs, this$1.mapSeed$2)
});
$c_sc_AbstractMap.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_sc_MapLike__applyOrElse__O__F1__O(this, x, $default)
});
$c_sc_AbstractMap.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_MapBuilder().init___sc_GenMap(this.empty__sc_Map())
});
$c_sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map"
});
/** @constructor */
function $c_sc_AbstractSet() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSet.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSet.prototype.constructor = $c_sc_AbstractSet;
/** @constructor */
function $h_sc_AbstractSet() {
  /*<skip>*/
}
$h_sc_AbstractSet.prototype = $c_sc_AbstractSet.prototype;
$c_sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return $f_sc_SetLike__isEmpty__Z(this)
});
$c_sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSetLike__equals__O__Z(this, that)
});
$c_sc_AbstractSet.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
$c_sc_AbstractSet.prototype.toSeq__sc_Seq = (function() {
  return $f_sc_SetLike__toSeq__sc_Seq(this)
});
$c_sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_sc_AbstractSet.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
$c_sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
function $is_sci_Set(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Set)))
}
function $as_sci_Set(obj) {
  return (($is_sci_Set(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Set"))
}
function $isArrayOf_sci_Set(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Set)))
}
function $asArrayOf_sci_Set(obj, depth) {
  return (($isArrayOf_sci_Set(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Set;", depth))
}
function $is_sci_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Map)))
}
function $as_sci_Map(obj) {
  return (($is_sci_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map"))
}
function $isArrayOf_sci_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map)))
}
function $asArrayOf_sci_Map(obj, depth) {
  return (($isArrayOf_sci_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map;", depth))
}
/** @constructor */
function $c_sci_AbstractMap() {
  $c_sc_AbstractMap.call(this)
}
$c_sci_AbstractMap.prototype = new $h_sc_AbstractMap();
$c_sci_AbstractMap.prototype.constructor = $c_sci_AbstractMap;
/** @constructor */
function $h_sci_AbstractMap() {
  /*<skip>*/
}
$h_sci_AbstractMap.prototype = $c_sci_AbstractMap.prototype;
$c_sci_AbstractMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_AbstractMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_AbstractMap.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Iterable$()
});
$c_sci_AbstractMap.prototype.empty__sc_Map = (function() {
  return this.empty__sci_Map()
});
$c_sci_AbstractMap.prototype.empty__sci_Map = (function() {
  return $m_sci_Map$EmptyMap$()
});
$c_sci_AbstractMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_AbstractMap.prototype.filterNot__F1__O = (function(p) {
  return this.filterNot__F1__sc_Map(p)
});
$c_sci_AbstractMap.prototype.toMap__s_Predef$$less$colon$less__sci_Map = (function(ev) {
  return this
});
/** @constructor */
function $c_sci_ListSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_ListSet.prototype = new $h_sc_AbstractSet();
$c_sci_ListSet.prototype.constructor = $c_sci_ListSet;
/** @constructor */
function $h_sci_ListSet() {
  /*<skip>*/
}
$h_sci_ListSet.prototype = $c_sci_ListSet.prototype;
$c_sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_ListSet.prototype.next__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next of empty set")
});
$c_sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_ListSet$()
});
$c_sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
$c_sci_ListSet.prototype.size__I = (function() {
  return 0
});
$c_sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
});
$c_sci_ListSet.prototype.empty__sc_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet.prototype.reverseList$1__p4__sci_List = (function() {
  var curr = this;
  var res = $m_sci_Nil$();
  while ((!curr.isEmpty__Z())) {
    var x$4 = curr.elem__O();
    var this$1 = res;
    res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    curr = curr.next__sci_ListSet()
  };
  return res
});
$c_sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_ListSet.prototype.elem__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("elem of empty set")
});
$c_sci_ListSet.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
function $is_sci_ListSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListSet)))
}
function $as_sci_ListSet(obj) {
  return (($is_sci_ListSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListSet"))
}
function $isArrayOf_sci_ListSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListSet)))
}
function $asArrayOf_sci_ListSet(obj, depth) {
  return (($isArrayOf_sci_ListSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListSet;", depth))
}
/** @constructor */
function $c_sci_Set$EmptySet$() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_Set$EmptySet$.prototype = new $h_sc_AbstractSet();
$c_sci_Set$EmptySet$.prototype.constructor = $c_sci_Set$EmptySet$;
/** @constructor */
function $h_sci_Set$EmptySet$() {
  /*<skip>*/
}
$h_sci_Set$EmptySet$.prototype = $c_sci_Set$EmptySet$.prototype;
$c_sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
$c_sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
$c_sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$EmptySet$.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new $c_sci_Set$Set1().init___O(elem)
});
var $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
var $n_sci_Set$EmptySet$ = (void 0);
function $m_sci_Set$EmptySet$() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
}
/** @constructor */
function $c_sci_Set$Set1() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null
}
$c_sci_Set$Set1.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set1.prototype.constructor = $c_sci_Set$Set1;
/** @constructor */
function $h_sci_Set$Set1() {
  /*<skip>*/
}
$h_sci_Set$Set1.prototype = $c_sci_Set$Set1.prototype;
$c_sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set1.prototype.forall__F1__Z = (function(p) {
  return $uZ(p.apply__O__O(this.elem1$4))
});
$c_sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
$c_sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
$c_sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [this.elem1$4];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
$c_sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
$c_sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
$c_sci_Set$Set1.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
/** @constructor */
function $c_sci_Set$Set2() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
}
$c_sci_Set$Set2.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set2.prototype.constructor = $c_sci_Set$Set2;
/** @constructor */
function $h_sci_Set$Set2() {
  /*<skip>*/
}
$h_sci_Set$Set2.prototype = $c_sci_Set$Set2.prototype;
$c_sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
$c_sci_Set$Set2.prototype.forall__F1__Z = (function(p) {
  return ($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4)))
});
$c_sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
$c_sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
$c_sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [this.elem1$4, this.elem2$4];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
$c_sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
$c_sci_Set$Set2.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
/** @constructor */
function $c_sci_Set$Set3() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
}
$c_sci_Set$Set3.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set3.prototype.constructor = $c_sci_Set$Set3;
/** @constructor */
function $h_sci_Set$Set3() {
  /*<skip>*/
}
$h_sci_Set$Set3.prototype = $c_sci_Set$Set3.prototype;
$c_sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set3.prototype.forall__F1__Z = (function(p) {
  return (($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4)))
});
$c_sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
$c_sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
$c_sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
$c_sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [this.elem1$4, this.elem2$4, this.elem3$4];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
$c_sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
$c_sci_Set$Set3.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
/** @constructor */
function $c_sci_Set$Set4() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
}
$c_sci_Set$Set4.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set4.prototype.constructor = $c_sci_Set$Set4;
/** @constructor */
function $h_sci_Set$Set4() {
  /*<skip>*/
}
$h_sci_Set$Set4.prototype = $c_sci_Set$Set4.prototype;
$c_sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set4.prototype.forall__F1__Z = (function(p) {
  return ((($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4))) && $uZ(p.apply__O__O(this.elem4$4)))
});
$c_sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
$c_sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
$c_sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_HashSet().init___().$$plus__O__sci_HashSet(this.elem1$4).$$plus__O__sci_HashSet(this.elem2$4).$$plus__O__sci_HashSet(this.elem3$4).$$plus__O__sci_HashSet(this.elem4$4).$$plus__O__sci_HashSet(elem))
});
$c_sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
$c_sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
$c_sci_Set$Set4.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
/** @constructor */
function $c_sci_HashSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_HashSet.prototype = new $h_sc_AbstractSet();
$c_sci_HashSet.prototype.constructor = $c_sci_HashSet;
/** @constructor */
function $h_sci_HashSet() {
  /*<skip>*/
}
$h_sci_HashSet.prototype = $c_sci_HashSet.prototype;
$c_sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
});
$c_sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
});
$c_sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashSet.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_HashSet$()
});
$c_sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if ($is_sci_HashSet(that)) {
    var x2 = $as_sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return $f_sc_Iterator__forall__F1__Z(this$1, that)
  }
});
$c_sci_HashSet.prototype.size__I = (function() {
  return 0
});
$c_sci_HashSet.prototype.filterNot__F1__sci_HashSet = (function(p) {
  var size = this.size__I();
  var x = ((6 + size) | 0);
  var buffer = $newArrayObject($d_sci_HashSet.getArrayOf(), [((x < 224) ? x : 224)]);
  var s = this.filter0__F1__Z__I__Asci_HashSet__I__sci_HashSet(p, true, 0, buffer, 0);
  return ((s === null) ? $m_sci_HashSet$EmptyHashSet$() : s)
});
$c_sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashSet.prototype.empty__sc_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
$c_sci_HashSet.prototype.filterNot__F1__O = (function(p) {
  return this.filterNot__F1__sci_HashSet(p)
});
$c_sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.toSet__sci_Set = (function() {
  return this
});
$c_sci_HashSet.prototype.filter0__F1__Z__I__Asci_HashSet__I__sci_HashSet = (function(p, negate, level, buffer, offset0) {
  return null
});
$c_sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
$c_sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
function $is_sci_HashSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
}
function $as_sci_HashSet(obj) {
  return (($is_sci_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet"))
}
function $isArrayOf_sci_HashSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
}
function $asArrayOf_sci_HashSet(obj, depth) {
  return (($isArrayOf_sci_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
}
var $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
/** @constructor */
function $c_sci_ListSet$EmptyListSet$() {
  $c_sci_ListSet.call(this)
}
$c_sci_ListSet$EmptyListSet$.prototype = new $h_sci_ListSet();
$c_sci_ListSet$EmptyListSet$.prototype.constructor = $c_sci_ListSet$EmptyListSet$;
/** @constructor */
function $h_sci_ListSet$EmptyListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$EmptyListSet$.prototype = $c_sci_ListSet$EmptyListSet$.prototype;
$c_sci_ListSet$EmptyListSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
var $n_sci_ListSet$EmptyListSet$ = (void 0);
function $m_sci_ListSet$EmptyListSet$() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
}
/** @constructor */
function $c_sci_ListSet$Node() {
  $c_sci_ListSet.call(this);
  this.elem$5 = null;
  this.$$outer$5 = null
}
$c_sci_ListSet$Node.prototype = new $h_sci_ListSet();
$c_sci_ListSet$Node.prototype.constructor = $c_sci_ListSet$Node;
/** @constructor */
function $h_sci_ListSet$Node() {
  /*<skip>*/
}
$h_sci_ListSet$Node.prototype = $c_sci_ListSet$Node.prototype;
$c_sci_ListSet$Node.prototype.next__sci_ListSet = (function() {
  return this.$$outer$5
});
$c_sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
$c_sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.next__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
$c_sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, elem) {
  this.elem$5 = elem;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$5 = $$outer
  };
  return this
});
$c_sci_ListSet$Node.prototype.elem__O = (function() {
  return this.elem$5
});
$c_sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
$c_sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.elem__O(), e)) {
        return true
      } else {
        n = n.next__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
var $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
/** @constructor */
function $c_scm_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
  /*<skip>*/
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
$c_scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
$c_scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
function $is_scm_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Map)))
}
function $as_scm_Map(obj) {
  return (($is_scm_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Map"))
}
function $isArrayOf_scm_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Map)))
}
function $asArrayOf_scm_Map(obj, depth) {
  return (($isArrayOf_scm_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Map;", depth))
}
/** @constructor */
function $c_sci_HashSet$EmptyHashSet$() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$EmptyHashSet$.prototype = new $h_sci_HashSet();
$c_sci_HashSet$EmptyHashSet$.prototype.constructor = $c_sci_HashSet$EmptyHashSet$;
/** @constructor */
function $h_sci_HashSet$EmptyHashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$EmptyHashSet$.prototype = $c_sci_HashSet$EmptyHashSet$.prototype;
$c_sci_HashSet$EmptyHashSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
var $n_sci_HashSet$EmptyHashSet$ = (void 0);
function $m_sci_HashSet$EmptyHashSet$() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
}
/** @constructor */
function $c_sci_HashSet$HashTrieSet() {
  $c_sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
}
$c_sci_HashSet$HashTrieSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$HashTrieSet.prototype.constructor = $c_sci_HashSet$HashTrieSet;
/** @constructor */
function $h_sci_HashSet$HashTrieSet() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet.prototype = $c_sci_HashSet$HashTrieSet.prototype;
$c_sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.get(offset);
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u.length);
      elemsNew.set(offset, subNew);
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.set(offset, new $c_sci_HashSet$HashSet1().init___O__I(key, hash));
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u.length - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
$c_sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u.length)) {
    this.elems$5.get(i).foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
$c_sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
$c_sci_HashSet$HashTrieSet.prototype.filter0__F1__Z__I__Asci_HashSet__I__sci_HashSet = (function(p, negate, level, buffer, offset0) {
  var offset = offset0;
  var rs = 0;
  var kept = 0;
  var i = 0;
  while ((i < this.elems$5.u.length)) {
    var result = this.elems$5.get(i).filter0__F1__Z__I__Asci_HashSet__I__sci_HashSet(p, negate, ((5 + level) | 0), buffer, offset);
    if ((result !== null)) {
      buffer.set(offset, result);
      offset = ((1 + offset) | 0);
      rs = ((rs + result.size__I()) | 0);
      kept = (kept | (1 << i))
    };
    i = ((1 + i) | 0)
  };
  if ((offset === offset0)) {
    return null
  } else if ((rs === this.size0$5)) {
    return this
  } else if (((offset === ((1 + offset0) | 0)) && (!$is_sci_HashSet$HashTrieSet(buffer.get(offset0))))) {
    return buffer.get(offset0)
  } else {
    var length = ((offset - offset0) | 0);
    var elems1 = $newArrayObject($d_sci_HashSet.getArrayOf(), [length]);
    $systemArraycopy(buffer, offset0, elems1, 0, length);
    var bitmap1 = ((length === this.elems$5.u.length) ? this.bitmap$5 : $m_sci_HashSet$().scala$collection$immutable$HashSet$$keepBits__I__I__I(this.bitmap$5, kept));
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap1, elems1, rs)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u.length));
  return this
});
$c_sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.get((31 & index)).get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.get(offset).get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
$c_sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if ($is_sci_HashSet$HashTrieSet(that)) {
      var x2 = $as_sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.get(ai).subsetOf0__sci_HashSet__I__Z(b.get(bi), ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
function $is_sci_HashSet$HashTrieSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
}
function $as_sci_HashSet$HashTrieSet(obj) {
  return (($is_sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
}
function $isArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
}
function $asArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
}
var $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
/** @constructor */
function $c_sci_HashSet$LeafHashSet() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$LeafHashSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$LeafHashSet.prototype.constructor = $c_sci_HashSet$LeafHashSet;
/** @constructor */
function $h_sci_HashSet$LeafHashSet() {
  /*<skip>*/
}
$h_sci_HashSet$LeafHashSet.prototype = $c_sci_HashSet$LeafHashSet.prototype;
/** @constructor */
function $c_sci_ListMap() {
  $c_sci_AbstractMap.call(this)
}
$c_sci_ListMap.prototype = new $h_sci_AbstractMap();
$c_sci_ListMap.prototype.constructor = $c_sci_ListMap;
/** @constructor */
function $h_sci_ListMap() {
  /*<skip>*/
}
$h_sci_ListMap.prototype = $c_sci_ListMap.prototype;
$c_sci_ListMap.prototype.value__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("value of empty map")
});
$c_sci_ListMap.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListMap.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
$c_sci_ListMap.prototype.empty__sc_Map = (function() {
  return $m_sci_ListMap$EmptyListMap$()
});
$c_sci_ListMap.prototype.$$minus__O__sc_Map = (function(key) {
  return this.$$minus__O__sci_ListMap(key)
});
$c_sci_ListMap.prototype.empty__sci_Map = (function() {
  return $m_sci_ListMap$EmptyListMap$()
});
$c_sci_ListMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_ListMap.prototype.size__I = (function() {
  return 0
});
$c_sci_ListMap.prototype.$$plus__T2__sci_ListMap = (function(kv) {
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, kv.$$und1$f, kv.$$und2$f)
});
$c_sci_ListMap.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.reverseList$1__p5__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
});
$c_sci_ListMap.prototype.key__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("key of empty map")
});
$c_sci_ListMap.prototype.updated__O__O__sci_ListMap = (function(key, value) {
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, key, value)
});
$c_sci_ListMap.prototype.filterNot__F1__O = (function(p) {
  return $f_sc_MapLike__filterNot__F1__sc_Map(this, p)
});
$c_sci_ListMap.prototype.$$minus__O__sci_ListMap = (function(key) {
  return this
});
$c_sci_ListMap.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$()
});
$c_sci_ListMap.prototype.reverseList$1__p5__sci_List = (function() {
  var curr = this;
  var res = $m_sci_Nil$();
  while ((!curr.isEmpty__Z())) {
    var x$4 = new $c_T2().init___O__O(curr.key__O(), curr.value__O());
    var this$1 = res;
    res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    curr = curr.next__sci_ListMap()
  };
  return res
});
$c_sci_ListMap.prototype.next__sci_ListMap = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next of empty map")
});
$c_sci_ListMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
$c_sci_ListMap.prototype.stringPrefix__T = (function() {
  return "ListMap"
});
function $is_sci_ListMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListMap)))
}
function $as_sci_ListMap(obj) {
  return (($is_sci_ListMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListMap"))
}
function $isArrayOf_sci_ListMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListMap)))
}
function $asArrayOf_sci_ListMap(obj, depth) {
  return (($isArrayOf_sci_ListMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListMap;", depth))
}
/** @constructor */
function $c_sci_Map$EmptyMap$() {
  $c_sci_AbstractMap.call(this)
}
$c_sci_Map$EmptyMap$.prototype = new $h_sci_AbstractMap();
$c_sci_Map$EmptyMap$.prototype.constructor = $c_sci_Map$EmptyMap$;
/** @constructor */
function $h_sci_Map$EmptyMap$() {
  /*<skip>*/
}
$h_sci_Map$EmptyMap$.prototype = $c_sci_Map$EmptyMap$.prototype;
$c_sci_Map$EmptyMap$.prototype.init___ = (function() {
  return this
});
$c_sci_Map$EmptyMap$.prototype.apply__O__O = (function(key) {
  this.apply__O__sr_Nothing$(key)
});
$c_sci_Map$EmptyMap$.prototype.getOrElse__O__F0__O = (function(key, $default) {
  return $default.apply__O()
});
$c_sci_Map$EmptyMap$.prototype.$$plus__T2__sci_Map = (function(kv) {
  var key = kv.$$und1$f;
  var value = kv.$$und2$f;
  return new $c_sci_Map$Map1().init___O__O(key, value)
});
$c_sci_Map$EmptyMap$.prototype.$$minus__O__sc_Map = (function(key) {
  return this
});
$c_sci_Map$EmptyMap$.prototype.size__I = (function() {
  return 0
});
$c_sci_Map$EmptyMap$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Map$EmptyMap$.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$()
});
$c_sci_Map$EmptyMap$.prototype.contains__O__Z = (function(key) {
  return false
});
$c_sci_Map$EmptyMap$.prototype.apply__O__sr_Nothing$ = (function(key) {
  throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
});
$c_sci_Map$EmptyMap$.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  var key = kv.$$und1$f;
  var value = kv.$$und2$f;
  return new $c_sci_Map$Map1().init___O__O(key, value)
});
var $d_sci_Map$EmptyMap$ = new $TypeData().initClass({
  sci_Map$EmptyMap$: 0
}, false, "scala.collection.immutable.Map$EmptyMap$", {
  sci_Map$EmptyMap$: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$EmptyMap$.prototype.$classData = $d_sci_Map$EmptyMap$;
var $n_sci_Map$EmptyMap$ = (void 0);
function $m_sci_Map$EmptyMap$() {
  if ((!$n_sci_Map$EmptyMap$)) {
    $n_sci_Map$EmptyMap$ = new $c_sci_Map$EmptyMap$().init___()
  };
  return $n_sci_Map$EmptyMap$
}
/** @constructor */
function $c_sci_Map$Map1() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null
}
$c_sci_Map$Map1.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map1.prototype.constructor = $c_sci_Map$Map1;
/** @constructor */
function $h_sci_Map$Map1() {
  /*<skip>*/
}
$h_sci_Map$Map1.prototype = $c_sci_Map$Map1.prototype;
$c_sci_Map$Map1.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map1.prototype.init___O__O = (function(key1, value1) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  return this
});
$c_sci_Map$Map1.prototype.getOrElse__O__F0__O = (function(key, $default) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? this.value1$5 : $default.apply__O())
});
$c_sci_Map$Map1.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
$c_sci_Map$Map1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5))
});
$c_sci_Map$Map1.prototype.$$minus__O__sc_Map = (function(key) {
  return this.$$minus__O__sci_Map(key)
});
$c_sci_Map$Map1.prototype.size__I = (function() {
  return 1
});
$c_sci_Map$Map1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [new $c_T2().init___O__O(this.key1$5, this.value1$5)];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map1.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map1().init___O__O(this.key1$5, value) : new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, key, value))
});
$c_sci_Map$Map1.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : $m_s_None$())
});
$c_sci_Map$Map1.prototype.contains__O__Z = (function(key) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)
});
$c_sci_Map$Map1.prototype.$$minus__O__sci_Map = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? $m_sci_Map$EmptyMap$() : this)
});
$c_sci_Map$Map1.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map1 = new $TypeData().initClass({
  sci_Map$Map1: 0
}, false, "scala.collection.immutable.Map$Map1", {
  sci_Map$Map1: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map1.prototype.$classData = $d_sci_Map$Map1;
/** @constructor */
function $c_sci_Map$Map2() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null
}
$c_sci_Map$Map2.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map2.prototype.constructor = $c_sci_Map$Map2;
/** @constructor */
function $h_sci_Map$Map2() {
  /*<skip>*/
}
$h_sci_Map$Map2.prototype = $c_sci_Map$Map2.prototype;
$c_sci_Map$Map2.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return this.value2$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map2.prototype.getOrElse__O__F0__O = (function(key, $default) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? this.value1$5 : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? this.value2$5 : $default.apply__O()))
});
$c_sci_Map$Map2.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
$c_sci_Map$Map2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5))
});
$c_sci_Map$Map2.prototype.$$minus__O__sc_Map = (function(key) {
  return this.$$minus__O__sci_Map(key)
});
$c_sci_Map$Map2.prototype.size__I = (function() {
  return 2
});
$c_sci_Map$Map2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5)];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map2.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value) : new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, key, value)))
});
$c_sci_Map$Map2.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : $m_s_None$()))
});
$c_sci_Map$Map2.prototype.contains__O__Z = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5))
});
$c_sci_Map$Map2.prototype.init___O__O__O__O = (function(key1, value1, key2, value2) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  return this
});
$c_sci_Map$Map2.prototype.$$minus__O__sci_Map = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map1().init___O__O(this.key2$5, this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map1().init___O__O(this.key1$5, this.value1$5) : this))
});
$c_sci_Map$Map2.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map2 = new $TypeData().initClass({
  sci_Map$Map2: 0
}, false, "scala.collection.immutable.Map$Map2", {
  sci_Map$Map2: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map2.prototype.$classData = $d_sci_Map$Map2;
/** @constructor */
function $c_sci_Map$Map3() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null
}
$c_sci_Map$Map3.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map3.prototype.constructor = $c_sci_Map$Map3;
/** @constructor */
function $h_sci_Map$Map3() {
  /*<skip>*/
}
$h_sci_Map$Map3.prototype = $c_sci_Map$Map3.prototype;
$c_sci_Map$Map3.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return this.value2$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
    return this.value3$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map3.prototype.getOrElse__O__F0__O = (function(key, $default) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? this.value1$5 : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? this.value2$5 : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? this.value3$5 : $default.apply__O())))
});
$c_sci_Map$Map3.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
$c_sci_Map$Map3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5))
});
$c_sci_Map$Map3.prototype.$$minus__O__sc_Map = (function(key) {
  return this.$$minus__O__sci_Map(key)
});
$c_sci_Map$Map3.prototype.init___O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  return this
});
$c_sci_Map$Map3.prototype.size__I = (function() {
  return 3
});
$c_sci_Map$Map3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5)];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map3.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value) : new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, key, value))))
});
$c_sci_Map$Map3.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : $m_s_None$())))
});
$c_sci_Map$Map3.prototype.contains__O__Z = (function(key) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5))
});
$c_sci_Map$Map3.prototype.$$minus__O__sci_Map = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key2$5, this.value2$5, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5) : this)))
});
$c_sci_Map$Map3.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map3 = new $TypeData().initClass({
  sci_Map$Map3: 0
}, false, "scala.collection.immutable.Map$Map3", {
  sci_Map$Map3: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map3.prototype.$classData = $d_sci_Map$Map3;
/** @constructor */
function $c_sci_Map$Map4() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null;
  this.key4$5 = null;
  this.value4$5 = null
}
$c_sci_Map$Map4.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map4.prototype.constructor = $c_sci_Map$Map4;
/** @constructor */
function $h_sci_Map$Map4() {
  /*<skip>*/
}
$h_sci_Map$Map4.prototype = $c_sci_Map$Map4.prototype;
$c_sci_Map$Map4.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return this.value2$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
    return this.value3$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5)) {
    return this.value4$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map4.prototype.getOrElse__O__F0__O = (function(key, $default) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? this.value1$5 : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? this.value2$5 : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? this.value3$5 : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? this.value4$5 : $default.apply__O()))))
});
$c_sci_Map$Map4.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
$c_sci_Map$Map4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key4$5, this.value4$5))
});
$c_sci_Map$Map4.prototype.$$minus__O__sc_Map = (function(key) {
  return this.$$minus__O__sci_Map(key)
});
$c_sci_Map$Map4.prototype.size__I = (function() {
  return 4
});
$c_sci_Map$Map4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5), new $c_T2().init___O__O(this.key4$5, this.value4$5)];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map4.prototype.init___O__O__O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3, key4, value4) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  this.key4$5 = key4;
  this.value4$5 = value4;
  return this
});
$c_sci_Map$Map4.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, value) : new $c_sci_HashMap().init___().updated__O__O__sci_HashMap(this.key1$5, this.value1$5).updated__O__O__sci_HashMap(this.key2$5, this.value2$5).updated__O__O__sci_HashMap(this.key3$5, this.value3$5).updated__O__O__sci_HashMap(this.key4$5, this.value4$5).updated__O__O__sci_HashMap(key, value)))))
});
$c_sci_Map$Map4.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_s_Some().init___O(this.value4$5) : $m_s_None$()))))
});
$c_sci_Map$Map4.prototype.contains__O__Z = (function(key) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5))
});
$c_sci_Map$Map4.prototype.$$minus__O__sci_Map = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5) : this))))
});
$c_sci_Map$Map4.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map4 = new $TypeData().initClass({
  sci_Map$Map4: 0
}, false, "scala.collection.immutable.Map$Map4", {
  sci_Map$Map4: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map4.prototype.$classData = $d_sci_Map$Map4;
/** @constructor */
function $c_sci_HashMap() {
  $c_sci_AbstractMap.call(this)
}
$c_sci_HashMap.prototype = new $h_sci_AbstractMap();
$c_sci_HashMap.prototype.constructor = $c_sci_HashMap;
/** @constructor */
function $h_sci_HashMap() {
  /*<skip>*/
}
$h_sci_HashMap.prototype = $c_sci_HashMap.prototype;
$c_sci_HashMap.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
});
$c_sci_HashMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashMap.prototype.init___ = (function() {
  return this
});
$c_sci_HashMap.prototype.filter__F1__sci_HashMap = (function(p) {
  $m_sci_HashMap$();
  var size = this.size__I();
  var x = ((6 + size) | 0);
  var buffer = $newArrayObject($d_sci_HashMap.getArrayOf(), [((x < 224) ? x : 224)]);
  $m_sci_HashMap$();
  var m = this.filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap(p, false, 0, buffer, 0);
  return ((m === null) ? $m_sci_HashMap$EmptyHashMap$() : m)
});
$c_sci_HashMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv)
});
$c_sci_HashMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return $m_s_None$()
});
$c_sci_HashMap.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.$$plus__T2__sci_HashMap(kv)
});
$c_sci_HashMap.prototype.$$plus__T2__sci_HashMap = (function(kv) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(kv.$$und1$f, this.computeHash__O__I(kv.$$und1$f), 0, kv.$$und2$f, kv, null)
});
$c_sci_HashMap.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashMap.prototype.filterNot__F1__sci_HashMap = (function(p) {
  $m_sci_HashMap$();
  var size = this.size__I();
  var x = ((6 + size) | 0);
  var buffer = $newArrayObject($d_sci_HashMap.getArrayOf(), [((x < 224) ? x : 224)]);
  $m_sci_HashMap$();
  var m = this.filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap(p, true, 0, buffer, 0);
  return ((m === null) ? $m_sci_HashMap$EmptyHashMap$() : m)
});
$c_sci_HashMap.prototype.empty__sc_Map = (function() {
  $m_sci_HashMap$();
  return $m_sci_HashMap$EmptyHashMap$()
});
$c_sci_HashMap.prototype.$$minus__O__sc_Map = (function(key) {
  return this.$$minus__O__sci_HashMap(key)
});
$c_sci_HashMap.prototype.updated__O__O__sci_HashMap = (function(key, value) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, this.computeHash__O__I(key), 0, value, null, null)
});
$c_sci_HashMap.prototype.removed0__O__I__I__sci_HashMap = (function(key, hash, level) {
  return this
});
$c_sci_HashMap.prototype.filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap = (function(p, negate, level, buffer, offset0) {
  return null
});
$c_sci_HashMap.prototype.$$minus__O__sci_HashMap = (function(key) {
  return this.removed0__O__I__I__sci_HashMap(key, this.computeHash__O__I(key), 0)
});
$c_sci_HashMap.prototype.empty__sci_Map = (function() {
  $m_sci_HashMap$();
  return $m_sci_HashMap$EmptyHashMap$()
});
$c_sci_HashMap.prototype.filter__F1__O = (function(p) {
  return this.filter__F1__sci_HashMap(p)
});
$c_sci_HashMap.prototype.size__I = (function() {
  return 0
});
$c_sci_HashMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_HashMap.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashMap.prototype.filterNot__F1__O = (function(p) {
  return this.filterNot__F1__sci_HashMap(p)
});
$c_sci_HashMap.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashMap.prototype.get__O__s_Option = (function(key) {
  return this.get0__O__I__I__s_Option(key, this.computeHash__O__I(key), 0)
});
$c_sci_HashMap.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashMap.prototype.contains__O__Z = (function(key) {
  return this.contains0__O__I__I__Z(key, this.computeHash__O__I(key), 0)
});
$c_sci_HashMap.prototype.filterNot__F1__sc_Map = (function(p) {
  return this.filterNot__F1__sci_HashMap(p)
});
$c_sci_HashMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_HashMap(kv)
});
var $d_sci_HashMap = new $TypeData().initClass({
  sci_HashMap: 0
}, false, "scala.collection.immutable.HashMap", {
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap.prototype.$classData = $d_sci_HashMap;
/** @constructor */
function $c_sci_HashSet$HashSet1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
}
$c_sci_HashSet$HashSet1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSet1.prototype.constructor = $c_sci_HashSet$HashSet1;
/** @constructor */
function $h_sci_HashSet$HashSet1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSet1.prototype = $c_sci_HashSet$HashSet1.prototype;
$c_sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = $m_sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
$c_sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
$c_sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
$c_sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [this.key$6];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashSet$HashSet1.prototype.filter0__F1__Z__I__Asci_HashSet__I__sci_HashSet = (function(p, negate, level, buffer, offset0) {
  return ((negate !== $uZ(p.apply__O__O(this.key$6))) ? this : null)
});
$c_sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
$c_sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
function $is_sci_HashSet$HashSet1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
}
function $as_sci_HashSet$HashSet1(obj) {
  return (($is_sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
}
function $isArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
}
function $asArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
}
var $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
/** @constructor */
function $c_sci_HashSet$HashSetCollision1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
}
$c_sci_HashSet$HashSetCollision1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSetCollision1.prototype.constructor = $c_sci_HashSet$HashSetCollision1;
/** @constructor */
function $h_sci_HashSet$HashSetCollision1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSetCollision1.prototype = $c_sci_HashSet$HashSetCollision1.prototype;
$c_sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
$c_sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  $f_sc_Iterator__foreach__F1__V(this$3, f)
});
$c_sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
$c_sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
});
$c_sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
$c_sci_HashSet$HashSetCollision1.prototype.filter0__F1__Z__I__Asci_HashSet__I__sci_HashSet = (function(p, negate, level, buffer, offset0) {
  if (negate) {
    var this$1 = this.ks$6;
    var ks1 = $as_sci_ListSet($f_sc_TraversableLike__filterImpl__F1__Z__O(this$1, p, true))
  } else {
    var this$2 = this.ks$6;
    var ks1 = $as_sci_ListSet($f_sc_TraversableLike__filterImpl__F1__Z__O(this$2, p, false))
  };
  var x1 = ks1.size__I();
  switch (x1) {
    case 0: {
      return null;
      break
    }
    case 1: {
      var this$3 = ks1.reverseList$1__p4__sci_List();
      return new $c_sci_HashSet$HashSet1().init___O__I(new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$3).next__O(), this.hash$6);
      break
    }
    default: {
      return ((x1 === this.ks$6.size__I()) ? this : new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(this.hash$6, ks1))
    }
  }
});
$c_sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
$c_sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  var res = true;
  while ((res && this$3.hasNext__Z())) {
    var arg1 = this$3.next__O();
    res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
  };
  return res
});
var $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
/** @constructor */
function $c_sci_ListMap$EmptyListMap$() {
  $c_sci_ListMap.call(this)
}
$c_sci_ListMap$EmptyListMap$.prototype = new $h_sci_ListMap();
$c_sci_ListMap$EmptyListMap$.prototype.constructor = $c_sci_ListMap$EmptyListMap$;
/** @constructor */
function $h_sci_ListMap$EmptyListMap$() {
  /*<skip>*/
}
$h_sci_ListMap$EmptyListMap$.prototype = $c_sci_ListMap$EmptyListMap$.prototype;
$c_sci_ListMap$EmptyListMap$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListMap$EmptyListMap$ = new $TypeData().initClass({
  sci_ListMap$EmptyListMap$: 0
}, false, "scala.collection.immutable.ListMap$EmptyListMap$", {
  sci_ListMap$EmptyListMap$: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$EmptyListMap$.prototype.$classData = $d_sci_ListMap$EmptyListMap$;
var $n_sci_ListMap$EmptyListMap$ = (void 0);
function $m_sci_ListMap$EmptyListMap$() {
  if ((!$n_sci_ListMap$EmptyListMap$)) {
    $n_sci_ListMap$EmptyListMap$ = new $c_sci_ListMap$EmptyListMap$().init___()
  };
  return $n_sci_ListMap$EmptyListMap$
}
/** @constructor */
function $c_sci_ListMap$Node() {
  $c_sci_ListMap.call(this);
  this.key$6 = null;
  this.value$6 = null;
  this.$$outer$6 = null
}
$c_sci_ListMap$Node.prototype = new $h_sci_ListMap();
$c_sci_ListMap$Node.prototype.constructor = $c_sci_ListMap$Node;
/** @constructor */
function $h_sci_ListMap$Node() {
  /*<skip>*/
}
$h_sci_ListMap$Node.prototype = $c_sci_ListMap$Node.prototype;
$c_sci_ListMap$Node.prototype.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap = (function(k, cur, acc) {
  _removeInternal: while (true) {
    if (cur.isEmpty__Z()) {
      var this$1 = acc;
      return $as_sci_ListMap($f_sc_LinearSeqOptimized__last__O(this$1))
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      var x$5 = cur.next__sci_ListMap();
      var this$2 = acc;
      var acc$1 = x$5;
      var these = this$2;
      while ((!these.isEmpty__Z())) {
        var arg1 = acc$1;
        var arg2 = these.head__O();
        var x0$1 = $as_sci_ListMap(arg1);
        var x1$1 = $as_sci_ListMap(arg2);
        acc$1 = new $c_sci_ListMap$Node().init___sci_ListMap__O__O(x0$1, x1$1.key__O(), x1$1.value__O());
        these = $as_sc_LinearSeqOptimized(these.tail__O())
      };
      return $as_sci_ListMap(acc$1)
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var x$6 = cur;
      var this$3 = acc;
      var temp$acc = new $c_sci_$colon$colon().init___O__sci_List(x$6, this$3);
      cur = temp$cur;
      acc = temp$acc;
      continue _removeInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.apply__O__O = (function(k) {
  return this.applyInternal__p6__sci_ListMap__O__O(this, k)
});
$c_sci_ListMap$Node.prototype.value__O = (function() {
  return this.value$6
});
$c_sci_ListMap$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListMap$Node.prototype.applyInternal__p6__sci_ListMap__O__O = (function(cur, k) {
  _applyInternal: while (true) {
    if (cur.isEmpty__Z()) {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + k))
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return cur.value__O()
    } else {
      cur = cur.next__sci_ListMap();
      continue _applyInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.getInternal__p6__sci_ListMap__O__s_Option = (function(cur, k) {
  _getInternal: while (true) {
    if (cur.isEmpty__Z()) {
      return $m_s_None$()
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return new $c_s_Some().init___O(cur.value__O())
    } else {
      cur = cur.next__sci_ListMap();
      continue _getInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.sizeInternal__p6__sci_ListMap__I__I = (function(cur, acc) {
  _sizeInternal: while (true) {
    if (cur.isEmpty__Z()) {
      return acc
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var temp$acc = ((1 + acc) | 0);
      cur = temp$cur;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
$c_sci_ListMap$Node.prototype.$$minus__O__sc_Map = (function(key) {
  return this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(key, this, $m_sci_Nil$())
});
$c_sci_ListMap$Node.prototype.size__I = (function() {
  return this.sizeInternal__p6__sci_ListMap__I__I(this, 0)
});
$c_sci_ListMap$Node.prototype.key__O = (function() {
  return this.key$6
});
$c_sci_ListMap$Node.prototype.$$plus__T2__sci_ListMap = (function(kv) {
  var k = kv.$$und1$f;
  var m = this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, kv.$$und1$f, kv.$$und2$f)
});
$c_sci_ListMap$Node.prototype.updated__O__O__sci_ListMap = (function(k, v) {
  var m = this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, k, v)
});
$c_sci_ListMap$Node.prototype.$$minus__O__sci_ListMap = (function(k) {
  return this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$())
});
$c_sci_ListMap$Node.prototype.get__O__s_Option = (function(k) {
  return this.getInternal__p6__sci_ListMap__O__s_Option(this, k)
});
$c_sci_ListMap$Node.prototype.contains__O__Z = (function(k) {
  return this.containsInternal__p6__sci_ListMap__O__Z(this, k)
});
$c_sci_ListMap$Node.prototype.init___sci_ListMap__O__O = (function($$outer, key, value) {
  this.key$6 = key;
  this.value$6 = value;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$6 = $$outer
  };
  return this
});
$c_sci_ListMap$Node.prototype.containsInternal__p6__sci_ListMap__O__Z = (function(cur, k) {
  _containsInternal: while (true) {
    if ((!cur.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
        return true
      } else {
        cur = cur.next__sci_ListMap();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListMap$Node.prototype.next__sci_ListMap = (function() {
  return this.$$outer$6
});
$c_sci_ListMap$Node.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
var $d_sci_ListMap$Node = new $TypeData().initClass({
  sci_ListMap$Node: 0
}, false, "scala.collection.immutable.ListMap$Node", {
  sci_ListMap$Node: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$Node.prototype.$classData = $d_sci_ListMap$Node;
/** @constructor */
function $c_sci_Stream() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_Stream.prototype = new $h_sc_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
function $h_sci_Stream() {
  /*<skip>*/
}
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Stream.prototype.reverse__sci_Stream = (function() {
  var elem = $m_sci_Stream$Empty$();
  var result = new $c_sr_ObjectRef().init___O(elem);
  var these = this;
  while ((!these.isEmpty__Z())) {
    $m_sci_Stream$();
    var stream = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, result$1) {
      return (function() {
        return $as_sci_Stream(result$1.elem$1)
      })
    })(this, result));
    var r = new $c_sci_Stream$ConsWrapper().init___F0(stream).$$hash$colon$colon__O__sci_Stream(these.head__O());
    r.tail__O();
    result.elem$1 = r;
    these = $as_sci_Stream(these.tail__O())
  };
  return $as_sci_Stream(result.elem$1)
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_Stream.prototype.exists__F1__Z = (function(p) {
  return $f_sc_LinearSeqOptimized__exists__F1__Z(this, p)
});
$c_sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
      var prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = ($as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, nonEmptyPrefix$1, f$1) {
        return (function() {
          var x = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, nonEmptyPrefix, f))))
    };
    return x$1
  } else {
    return $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.equals__O__Z = (function(that) {
  return ((this === that) || $f_sc_GenSeqLike__equals__O__Z(this, that))
});
$c_sci_Stream.prototype.filterImpl__F1__Z__sci_Stream = (function(p, isFlipped) {
  var rest = this;
  while (((!rest.isEmpty__Z()) && ($uZ(p.apply__O__O(rest.head__O())) === isFlipped))) {
    rest = $as_sci_Stream(rest.tail__O())
  };
  var this$1 = rest;
  if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
    return $m_sci_Stream$().filteredTail__sci_Stream__F1__Z__sci_Stream$Cons(rest, p, isFlipped)
  } else {
    return $m_sci_Stream$Empty$()
  }
});
$c_sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
$c_sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.toString__T = (function() {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "Stream(", ", ", ")")
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  _foreach: while (true) {
    if ((!_$this.isEmpty__Z())) {
      f.apply__O__O(_$this.head__O());
      _$this = $as_sci_Stream(_$this.tail__O());
      continue _foreach
    };
    break
  }
});
$c_sci_Stream.prototype.indexWhere__F1__I__I = (function(p, from) {
  return $f_sc_LinearSeqOptimized__indexWhere__F1__I__I(this, p, from)
});
$c_sci_Stream.prototype.reverse__O = (function() {
  return this.reverse__sci_Stream()
});
$c_sci_Stream.prototype.filterImpl__F1__Z__O = (function(p, isFlipped) {
  return this.filterImpl__F1__Z__sci_Stream(p, isFlipped)
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_StreamIterator().init___sci_Stream(this)
});
$c_sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = $as_sci_Stream(left.tail__O())
  };
  return len
});
$c_sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
$c_sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
$c_sci_Stream.prototype.contains__O__Z = (function(elem) {
  return $f_sc_LinearSeqOptimized__contains__O__Z(this, elem)
});
$c_sci_Stream.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if ((cursor !== scout)) {
        cursor = scout;
        if (scout.tailDefined__Z()) {
          scout = $as_sci_Stream(scout.tail__O());
          while (((cursor !== scout) && scout.tailDefined__Z())) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = $as_sci_Stream(cursor.tail__O());
            scout = $as_sci_Stream(scout.tail__O());
            if (scout.tailDefined__Z()) {
              scout = $as_sci_Stream(scout.tail__O())
            }
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        var this$1 = cursor;
        if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
$c_sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream.prototype.toSeq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
});
$c_sci_Stream.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Stream.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var hd = f.apply__O__O(this.head__O());
      var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1) {
        return (function() {
          var x = $as_sci_Stream($this.tail__O()).map__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f));
      var x$1 = new $c_sci_Stream$Cons().init___O__F0(hd, tl)
    };
    return x$1
  } else {
    return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.take__I__sci_Stream = (function(n) {
  if (((n <= 0) || this.isEmpty__Z())) {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  } else if ((n === 1)) {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        $m_sci_Stream$();
        return $m_sci_Stream$Empty$()
      })
    })(this));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    var hd$1 = this.head__O();
    var tl$1 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, n$1) {
      return (function() {
        return $as_sci_Stream(this$2$1.tail__O()).take__I__sci_Stream((((-1) + n$1) | 0))
      })
    })(this, n));
    return new $c_sci_Stream$Cons().init___O__F0(hd$1, tl$1)
  }
});
$c_sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return $as_sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, rest$1) {
      return (function() {
        return $as_sci_Stream($this.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
function $is_sci_Stream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
}
function $as_sci_Stream(obj) {
  return (($is_sci_Stream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
}
function $isArrayOf_sci_Stream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
}
function $asArrayOf_sci_Stream(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
}
function $f_scm_ResizableArray__apply__I__O($thiz, idx) {
  if ((idx >= $thiz.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $thiz.array$6.get(idx)
}
function $f_scm_ResizableArray__foreach__F1__V($thiz, f) {
  var i = 0;
  var top = $thiz.size0$6;
  while ((i < top)) {
    f.apply__O__O($thiz.array$6.get(i));
    i = ((1 + i) | 0)
  }
}
function $f_scm_ResizableArray__ensureSize__I__V($thiz, n) {
  var value = $thiz.array$6.u.length;
  var hi = (value >> 31);
  var hi$1 = (n >> 31);
  if (((hi$1 === hi) ? (((-2147483648) ^ n) > ((-2147483648) ^ value)) : (hi$1 > hi))) {
    var lo = (value << 1);
    var hi$2 = (((value >>> 31) | 0) | (hi << 1));
    var newSize_$_lo$2 = lo;
    var newSize_$_hi$2 = hi$2;
    while (true) {
      var hi$3 = (n >> 31);
      var b_$_lo$2 = newSize_$_lo$2;
      var b_$_hi$2 = newSize_$_hi$2;
      var bhi = b_$_hi$2;
      if (((hi$3 === bhi) ? (((-2147483648) ^ n) > ((-2147483648) ^ b_$_lo$2)) : (hi$3 > bhi))) {
        var this$1_$_lo$2 = newSize_$_lo$2;
        var this$1_$_hi$2 = newSize_$_hi$2;
        var lo$1 = (this$1_$_lo$2 << 1);
        var hi$4 = (((this$1_$_lo$2 >>> 31) | 0) | (this$1_$_hi$2 << 1));
        var jsx$1_$_lo$2 = lo$1;
        var jsx$1_$_hi$2 = hi$4;
        newSize_$_lo$2 = jsx$1_$_lo$2;
        newSize_$_hi$2 = jsx$1_$_hi$2
      } else {
        break
      }
    };
    var this$2_$_lo$2 = newSize_$_lo$2;
    var this$2_$_hi$2 = newSize_$_hi$2;
    var ahi = this$2_$_hi$2;
    if (((ahi === 0) ? (((-2147483648) ^ this$2_$_lo$2) > (-1)) : (ahi > 0))) {
      var jsx$2_$_lo$2 = 2147483647;
      var jsx$2_$_hi$2 = 0;
      newSize_$_lo$2 = jsx$2_$_lo$2;
      newSize_$_hi$2 = jsx$2_$_hi$2
    };
    var this$3_$_lo$2 = newSize_$_lo$2;
    var this$3_$_hi$2 = newSize_$_hi$2;
    var newArray = $newArrayObject($d_O.getArrayOf(), [this$3_$_lo$2]);
    $systemArraycopy($thiz.array$6, 0, newArray, 0, $thiz.size0$6);
    $thiz.array$6 = newArray
  }
}
function $f_scm_ResizableArray__$$init$__V($thiz) {
  var x = $thiz.initialSize$6;
  $thiz.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $thiz.size0$6 = 0
}
function $f_scm_ResizableArray__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var x = ((len < that) ? len : that);
  var that$1 = $thiz.size0$6;
  var len1 = ((x < that$1) ? x : that$1);
  if ((len1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.array$6, 0, xs, start, len1)
  }
}
/** @constructor */
function $c_sci_HashMap$EmptyHashMap$() {
  $c_sci_HashMap.call(this)
}
$c_sci_HashMap$EmptyHashMap$.prototype = new $h_sci_HashMap();
$c_sci_HashMap$EmptyHashMap$.prototype.constructor = $c_sci_HashMap$EmptyHashMap$;
/** @constructor */
function $h_sci_HashMap$EmptyHashMap$() {
  /*<skip>*/
}
$h_sci_HashMap$EmptyHashMap$.prototype = $c_sci_HashMap$EmptyHashMap$.prototype;
$c_sci_HashMap$EmptyHashMap$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashMap$EmptyHashMap$ = new $TypeData().initClass({
  sci_HashMap$EmptyHashMap$: 0
}, false, "scala.collection.immutable.HashMap$EmptyHashMap$", {
  sci_HashMap$EmptyHashMap$: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$EmptyHashMap$.prototype.$classData = $d_sci_HashMap$EmptyHashMap$;
var $n_sci_HashMap$EmptyHashMap$ = (void 0);
function $m_sci_HashMap$EmptyHashMap$() {
  if ((!$n_sci_HashMap$EmptyHashMap$)) {
    $n_sci_HashMap$EmptyHashMap$ = new $c_sci_HashMap$EmptyHashMap$().init___()
  };
  return $n_sci_HashMap$EmptyHashMap$
}
/** @constructor */
function $c_sci_HashMap$HashMap1() {
  $c_sci_HashMap.call(this);
  this.key$6 = null;
  this.hash$6 = 0;
  this.value$6 = null;
  this.kv$6 = null
}
$c_sci_HashMap$HashMap1.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashMap1.prototype.constructor = $c_sci_HashMap$HashMap1;
/** @constructor */
function $h_sci_HashMap$HashMap1() {
  /*<skip>*/
}
$h_sci_HashMap$HashMap1.prototype = $c_sci_HashMap$HashMap1.prototype;
$c_sci_HashMap$HashMap1.prototype.ensurePair__T2 = (function() {
  if ((this.kv$6 !== null)) {
    return this.kv$6
  } else {
    this.kv$6 = new $c_T2().init___O__O(this.key$6, this.value$6);
    return this.kv$6
  }
});
$c_sci_HashMap$HashMap1.prototype.init___O__I__O__T2 = (function(key, hash, value, kv) {
  this.key$6 = key;
  this.hash$6 = hash;
  this.value$6 = value;
  this.kv$6 = kv;
  return this
});
$c_sci_HashMap$HashMap1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    if ((merger === null)) {
      return ((this.value$6 === value) ? this : new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv))
    } else {
      var nkv = merger.apply__T2__T2__T2(this.ensurePair__T2(), ((kv !== null) ? kv : new $c_T2().init___O__O(key, value)));
      return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(nkv.$$und1$f, hash, nkv.$$und2$f, nkv)
    }
  } else if ((hash !== this.hash$6)) {
    var that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, 2)
  } else {
    var this$2 = $m_sci_ListMap$EmptyListMap$();
    var key$1 = this.key$6;
    var value$1 = this.value$6;
    return new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this$2, key$1, value$1).updated__O__O__sci_ListMap(key, value))
  }
});
$c_sci_HashMap$HashMap1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6)) ? new $c_s_Some().init___O(this.value$6) : $m_s_None$())
});
$c_sci_HashMap$HashMap1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.ensurePair__T2())
});
$c_sci_HashMap$HashMap1.prototype.removed0__O__I__I__sci_HashMap = (function(key, hash, level) {
  return (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6)) ? ($m_sci_HashMap$(), $m_sci_HashMap$EmptyHashMap$()) : this)
});
$c_sci_HashMap$HashMap1.prototype.filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap = (function(p, negate, level, buffer, offset0) {
  return ((negate !== $uZ(p.apply__O__O(this.ensurePair__T2()))) ? this : null)
});
$c_sci_HashMap$HashMap1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashMap$HashMap1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var array = [this.ensurePair__T2()];
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashMap$HashMap1.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
function $is_sci_HashMap$HashMap1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
}
function $as_sci_HashMap$HashMap1(obj) {
  return (($is_sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
}
function $isArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
}
function $asArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
}
var $d_sci_HashMap$HashMap1 = new $TypeData().initClass({
  sci_HashMap$HashMap1: 0
}, false, "scala.collection.immutable.HashMap$HashMap1", {
  sci_HashMap$HashMap1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMap1.prototype.$classData = $d_sci_HashMap$HashMap1;
/** @constructor */
function $c_sci_HashMap$HashMapCollision1() {
  $c_sci_HashMap.call(this);
  this.hash$6 = 0;
  this.kvs$6 = null
}
$c_sci_HashMap$HashMapCollision1.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashMapCollision1.prototype.constructor = $c_sci_HashMap$HashMapCollision1;
/** @constructor */
function $h_sci_HashMap$HashMapCollision1() {
  /*<skip>*/
}
$h_sci_HashMap$HashMapCollision1.prototype = $c_sci_HashMap$HashMapCollision1.prototype;
$c_sci_HashMap$HashMapCollision1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if ((hash === this.hash$6)) {
    return (((merger === null) || (!this.kvs$6.contains__O__Z(key))) ? new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.updated__O__O__sci_ListMap(key, value)) : new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.$$plus__T2__sci_ListMap(merger.apply__T2__T2__T2(new $c_T2().init___O__O(key, this.kvs$6.apply__O__O(key)), kv))))
  } else {
    var that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, ((1 + this.kvs$6.size__I()) | 0))
  }
});
$c_sci_HashMap$HashMapCollision1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return ((hash === this.hash$6) ? this.kvs$6.get__O__s_Option(key) : $m_s_None$())
});
$c_sci_HashMap$HashMapCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.kvs$6;
  var this$2 = this$1.reverseList$1__p5__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  $f_sc_Iterator__foreach__F1__V(this$3, f)
});
$c_sci_HashMap$HashMapCollision1.prototype.removed0__O__I__I__sci_HashMap = (function(key, hash, level) {
  if ((hash === this.hash$6)) {
    var kvs1 = this.kvs$6.$$minus__O__sci_ListMap(key);
    var x1 = kvs1.size__I();
    switch (x1) {
      case 0: {
        $m_sci_HashMap$();
        return $m_sci_HashMap$EmptyHashMap$();
        break
      }
      case 1: {
        var this$2 = kvs1.reverseList$1__p5__sci_List();
        var kv = $as_T2(new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2).next__O());
        return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(kv.$$und1$f, hash, kv.$$und2$f, kv);
        break
      }
      default: {
        return ((x1 === this.kvs$6.size__I()) ? this : new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, kvs1))
      }
    }
  } else {
    return this
  }
});
$c_sci_HashMap$HashMapCollision1.prototype.filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap = (function(p, negate, level, buffer, offset0) {
  if (negate) {
    var this$1 = this.kvs$6;
    var kvs1 = $as_sci_ListMap($f_sc_MapLike__filterNot__F1__sc_Map(this$1, p))
  } else {
    var this$2 = this.kvs$6;
    var kvs1 = $as_sci_ListMap($f_sc_TraversableLike__filterImpl__F1__Z__O(this$2, p, false))
  };
  var x1 = kvs1.size__I();
  switch (x1) {
    case 0: {
      return null;
      break
    }
    case 1: {
      var this$3 = kvs1.reverseList$1__p5__sci_List();
      var x1$2 = $as_T2(new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$3).next__O());
      if ((x1$2 === null)) {
        throw new $c_s_MatchError().init___O(x1$2)
      };
      var k = x1$2.$$und1$f;
      var v = x1$2.$$und2$f;
      return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(k, this.hash$6, v, x1$2);
      break
    }
    default: {
      return ((x1 === this.kvs$6.size__I()) ? this : new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(this.hash$6, kvs1))
    }
  }
});
$c_sci_HashMap$HashMapCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.kvs$6;
  var this$2 = this$1.reverseList$1__p5__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
});
$c_sci_HashMap$HashMapCollision1.prototype.size__I = (function() {
  return this.kvs$6.size__I()
});
$c_sci_HashMap$HashMapCollision1.prototype.init___I__sci_ListMap = (function(hash, kvs) {
  this.hash$6 = hash;
  this.kvs$6 = kvs;
  return this
});
$c_sci_HashMap$HashMapCollision1.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.kvs$6.contains__O__Z(key))
});
var $d_sci_HashMap$HashMapCollision1 = new $TypeData().initClass({
  sci_HashMap$HashMapCollision1: 0
}, false, "scala.collection.immutable.HashMap$HashMapCollision1", {
  sci_HashMap$HashMapCollision1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMapCollision1.prototype.$classData = $d_sci_HashMap$HashMapCollision1;
/** @constructor */
function $c_sci_HashMap$HashTrieMap() {
  $c_sci_HashMap.call(this);
  this.bitmap$6 = 0;
  this.elems$6 = null;
  this.size0$6 = 0
}
$c_sci_HashMap$HashTrieMap.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashTrieMap.prototype.constructor = $c_sci_HashMap$HashTrieMap;
/** @constructor */
function $h_sci_HashMap$HashTrieMap() {
  /*<skip>*/
}
$h_sci_HashMap$HashTrieMap.prototype = $c_sci_HashMap$HashTrieMap.prototype;
$c_sci_HashMap$HashTrieMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
  if (((this.bitmap$6 & mask) !== 0)) {
    var sub = this.elems$6.get(offset);
    var subNew = sub.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, ((5 + level) | 0), value, kv, merger);
    if ((subNew === sub)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashMap.getArrayOf(), [this.elems$6.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew, 0, this.elems$6.u.length);
      elemsNew.set(offset, subNew);
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(this.bitmap$6, elemsNew, ((this.size0$6 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [((1 + this.elems$6.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew$2, 0, offset);
    elemsNew$2.set(offset, new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv));
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$6.u.length - offset) | 0));
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I((this.bitmap$6 | mask), elemsNew$2, ((1 + this.size0$6) | 0))
  }
});
$c_sci_HashMap$HashTrieMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  if ((this.bitmap$6 === (-1))) {
    return this.elems$6.get(index).get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
  } else {
    var mask = (1 << index);
    if (((this.bitmap$6 & mask) !== 0)) {
      var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
      return this.elems$6.get(offset).get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
    } else {
      return $m_s_None$()
    }
  }
});
$c_sci_HashMap$HashTrieMap.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$6.u.length)) {
    this.elems$6.get(i).foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashMap$HashTrieMap.prototype.removed0__O__I__I__sci_HashMap = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
  if (((this.bitmap$6 & mask) !== 0)) {
    var sub = this.elems$6.get(offset);
    var subNew = sub.removed0__O__I__I__sci_HashMap(key, hash, ((5 + level) | 0));
    if ((subNew === sub)) {
      return this
    } else if ($f_sc_MapLike__isEmpty__Z(subNew)) {
      var bitmapNew = (this.bitmap$6 ^ mask);
      if ((bitmapNew !== 0)) {
        var elemsNew = $newArrayObject($d_sci_HashMap.getArrayOf(), [(((-1) + this.elems$6.u.length) | 0)]);
        $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew, 0, offset);
        $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, ((1 + offset) | 0), elemsNew, offset, (((-1) + ((this.elems$6.u.length - offset) | 0)) | 0));
        var sizeNew = ((this.size0$6 - sub.size__I()) | 0);
        return (((elemsNew.u.length === 1) && (!$is_sci_HashMap$HashTrieMap(elemsNew.get(0)))) ? elemsNew.get(0) : new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmapNew, elemsNew, sizeNew))
      } else {
        $m_sci_HashMap$();
        return $m_sci_HashMap$EmptyHashMap$()
      }
    } else if (((this.elems$6.u.length === 1) && (!$is_sci_HashMap$HashTrieMap(subNew)))) {
      return subNew
    } else {
      var elemsNew$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [this.elems$6.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew$2, 0, this.elems$6.u.length);
      elemsNew$2.set(offset, subNew);
      var sizeNew$2 = ((this.size0$6 + ((subNew.size__I() - sub.size__I()) | 0)) | 0);
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(this.bitmap$6, elemsNew$2, sizeNew$2)
    }
  } else {
    return this
  }
});
$c_sci_HashMap$HashTrieMap.prototype.filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap = (function(p, negate, level, buffer, offset0) {
  var offset = offset0;
  var rs = 0;
  var kept = 0;
  var i = 0;
  while ((i < this.elems$6.u.length)) {
    var result = this.elems$6.get(i).filter0__F1__Z__I__Asci_HashMap__I__sci_HashMap(p, negate, ((5 + level) | 0), buffer, offset);
    if ((result !== null)) {
      buffer.set(offset, result);
      offset = ((1 + offset) | 0);
      rs = ((rs + result.size__I()) | 0);
      kept = (kept | (1 << i))
    };
    i = ((1 + i) | 0)
  };
  if ((offset === offset0)) {
    return null
  } else if ((rs === this.size0$6)) {
    return this
  } else if (((offset === ((1 + offset0) | 0)) && (!$is_sci_HashMap$HashTrieMap(buffer.get(offset0))))) {
    return buffer.get(offset0)
  } else {
    var length = ((offset - offset0) | 0);
    var elems1 = $newArrayObject($d_sci_HashMap.getArrayOf(), [length]);
    $systemArraycopy(buffer, offset0, elems1, 0, length);
    var bitmap1 = ((length === this.elems$6.u.length) ? this.bitmap$6 : $m_sci_HashMap$().scala$collection$immutable$HashMap$$keepBits__I__I__I(this.bitmap$6, kept));
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap1, elems1, rs)
  }
});
$c_sci_HashMap$HashTrieMap.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashMap$HashTrieMap$$anon$3().init___sci_HashMap$HashTrieMap(this)
});
$c_sci_HashMap$HashTrieMap.prototype.size__I = (function() {
  return this.size0$6
});
$c_sci_HashMap$HashTrieMap.prototype.init___I__Asci_HashMap__I = (function(bitmap, elems, size0) {
  this.bitmap$6 = bitmap;
  this.elems$6 = elems;
  this.size0$6 = size0;
  return this
});
$c_sci_HashMap$HashTrieMap.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  if ((this.bitmap$6 === (-1))) {
    return this.elems$6.get(index).contains0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    var mask = (1 << index);
    if (((this.bitmap$6 & mask) !== 0)) {
      var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
      return this.elems$6.get(offset).contains0__O__I__I__Z(key, hash, ((5 + level) | 0))
    } else {
      return false
    }
  }
});
function $is_sci_HashMap$HashTrieMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
}
function $as_sci_HashMap$HashTrieMap(obj) {
  return (($is_sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
}
function $isArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
}
function $asArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
}
var $d_sci_HashMap$HashTrieMap = new $TypeData().initClass({
  sci_HashMap$HashTrieMap: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap", {
  sci_HashMap$HashTrieMap: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashTrieMap.prototype.$classData = $d_sci_HashMap$HashTrieMap;
/** @constructor */
function $c_sci_List() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_List.prototype = new $h_sc_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
  /*<skip>*/
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_List.prototype.exists__F1__Z = (function(p) {
  return $f_sc_LinearSeqOptimized__exists__F1__Z(this, p)
});
$c_sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
$c_sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
$c_sci_List.prototype.indexWhere__F1__I__I = (function(p, from) {
  return $f_sc_LinearSeqOptimized__indexWhere__F1__I__I(this, p, from)
});
$c_sci_List.prototype.reverse__O = (function() {
  return this.reverse__sci_List()
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
$c_sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
$c_sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.length__I = (function() {
  return $f_sc_LinearSeqOptimized__length__I(this)
});
$c_sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
$c_sci_List.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.contains__O__Z = (function(elem) {
  return $f_sc_LinearSeqOptimized__contains__O__Z(this, elem)
});
$c_sci_List.prototype.toSeq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
});
$c_sci_List.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_List.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ((bf === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((this === $m_sci_Nil$())) {
      return $m_sci_Nil$()
    } else {
      var h = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(this.head__O()), $m_sci_Nil$());
      var t = h;
      var rest = this.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(rest.head__O()), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      };
      return h
    }
  } else {
    return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_List.prototype.reverse__sci_List = (function() {
  var result = $m_sci_Nil$();
  var these = this;
  while ((!these.isEmpty__Z())) {
    var x$4 = these.head__O();
    var this$1 = result;
    result = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  return result
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
function $is_sci_List(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
}
function $as_sci_List(obj) {
  return (($is_sci_List(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
}
/** @constructor */
function $c_sci_Stream$Cons() {
  $c_sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
}
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
function $h_sci_Stream$Cons() {
  /*<skip>*/
}
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  if ($is_sci_Stream$Cons(that)) {
    var x2 = $as_sci_Stream$Cons(that);
    return this.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z(this, x2)
  } else {
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  }
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z = (function(a, b) {
  _consEq: while (true) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(a.hd$5, b.hd$5)) {
      var x1 = a.tail__sci_Stream();
      if ($is_sci_Stream$Cons(x1)) {
        var x2 = $as_sci_Stream$Cons(x1);
        var x1$2 = b.tail__sci_Stream();
        if ($is_sci_Stream$Cons(x1$2)) {
          var x2$2 = $as_sci_Stream$Cons(x1$2);
          if ((x2 === x2$2)) {
            return true
          } else {
            a = x2;
            b = x2$2;
            continue _consEq
          }
        } else {
          return false
        }
      } else {
        return b.tail__sci_Stream().isEmpty__Z()
      }
    } else {
      return false
    }
  }
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
function $is_sci_Stream$Cons(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$Cons)))
}
function $as_sci_Stream$Cons(obj) {
  return (($is_sci_Stream$Cons(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$Cons"))
}
function $isArrayOf_sci_Stream$Cons(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$Cons)))
}
function $asArrayOf_sci_Stream$Cons(obj, depth) {
  return (($isArrayOf_sci_Stream$Cons(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$Cons;", depth))
}
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
function $c_sci_Stream$Empty$() {
  $c_sci_Stream.call(this)
}
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
function $h_sci_Stream$Empty$() {
  /*<skip>*/
}
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
function $m_sci_Stream$Empty$() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
}
/** @constructor */
function $c_sci_Vector() {
  $c_sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
}
$c_sci_Vector.prototype = new $h_sc_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
  /*<skip>*/
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
$c_sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
$c_sci_Vector.prototype.gotoPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    $f_sci_VectorPointer__gotoPosWritable1__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    $f_sci_VectorPointer__gotoPosWritable0__I__I__V(this, newIndex, xor);
    this.dirty$4 = true
  }
});
$c_sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return $f_sci_VectorPointer__getElem__I__I__O(this, idx, xor)
});
$c_sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
$c_sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    $f_sci_VectorPointer__stabilize__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, index$1, xor)
  }
});
$c_sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
$c_sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
$c_sci_Vector.prototype.$$colon$plus__O__scg_CanBuildFrom__O = (function(elem, bf) {
  return ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2)) ? this.appendBack__O__sci_Vector(elem) : $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O(this, elem, bf))
});
$c_sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
$c_sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
$c_sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
$c_sci_Vector.prototype.shiftTopLevel__p4__I__I__V = (function(oldLeft, newLeft) {
  var x1 = (((-1) + this.depth$4) | 0);
  switch (x1) {
    case 0: {
      var array = this.display0$4;
      this.display0$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array, oldLeft, newLeft);
      break
    }
    case 1: {
      var array$1 = this.display1$4;
      this.display1$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$1, oldLeft, newLeft);
      break
    }
    case 2: {
      var array$2 = this.display2$4;
      this.display2$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$2, oldLeft, newLeft);
      break
    }
    case 3: {
      var array$3 = this.display3$4;
      this.display3$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$3, oldLeft, newLeft);
      break
    }
    case 4: {
      var array$4 = this.display4$4;
      this.display4$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$4, oldLeft, newLeft);
      break
    }
    case 5: {
      var array$5 = this.display5$4;
      this.display5$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$5, oldLeft, newLeft);
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
$c_sci_Vector.prototype.toVector__sci_Vector = (function() {
  return this
});
$c_sci_Vector.prototype.appendBack__O__sci_Vector = (function(value) {
  if ((this.endIndex$4 !== this.startIndex$4)) {
    var blockIndex = ((-32) & this.endIndex$4);
    var lo = (31 & this.endIndex$4);
    if ((this.endIndex$4 !== blockIndex)) {
      var s = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
      var depth = this.depth$4;
      $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
      s.dirty$4 = this.dirty$4;
      s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
      s.display0$4.set(lo, value);
      return s
    } else {
      var shift = (this.startIndex$4 & (~(((-1) + (1 << $imul(5, (((-1) + this.depth$4) | 0)))) | 0)));
      var shiftBlocks = ((this.startIndex$4 >>> $imul(5, (((-1) + this.depth$4) | 0))) | 0);
      if ((shift !== 0)) {
        if ((this.depth$4 > 1)) {
          var newBlockIndex = ((blockIndex - shift) | 0);
          var newFocus = ((this.focus$4 - shift) | 0);
          var s$2 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex);
          var depth$1 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$2, this, depth$1);
          s$2.dirty$4 = this.dirty$4;
          s$2.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
          s$2.gotoFreshPosWritable__p4__I__I__I__V(newFocus, newBlockIndex, (newFocus ^ newBlockIndex));
          s$2.display0$4.set(lo, value);
          return s$2
        } else {
          var newBlockIndex$2 = (((-32) + blockIndex) | 0);
          var newFocus$2 = this.focus$4;
          var s$3 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex$2);
          var depth$2 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$3, this, depth$2);
          s$3.dirty$4 = this.dirty$4;
          s$3.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
          s$3.gotoPosWritable__p4__I__I__I__V(newFocus$2, newBlockIndex$2, (newFocus$2 ^ newBlockIndex$2));
          s$3.display0$4.set(((32 - shift) | 0), value);
          return s$3
        }
      } else {
        var newFocus$3 = this.focus$4;
        var s$4 = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
        var depth$3 = this.depth$4;
        $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$4, this, depth$3);
        s$4.dirty$4 = this.dirty$4;
        s$4.gotoFreshPosWritable__p4__I__I__I__V(newFocus$3, blockIndex, (newFocus$3 ^ blockIndex));
        s$4.display0$4.set(lo, value);
        return s$4
      }
    }
  } else {
    var elems = $newArrayObject($d_O.getArrayOf(), [32]);
    elems.set(0, value);
    var s$5 = new $c_sci_Vector().init___I__I__I(0, 1, 0);
    s$5.depth$4 = 1;
    s$5.display0$4 = elems;
    return s$5
  }
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
$c_sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
$c_sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
$c_sci_Vector.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_sci_Vector.prototype.gotoFreshPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    $f_sci_VectorPointer__gotoFreshPosWritable1__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V(this, oldIndex, newIndex, xor);
    this.dirty$4 = true
  }
});
$c_sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
$c_sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
$c_sci_Vector.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.toSeq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
$c_sci_Vector.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sci_Vector.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
$c_sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
$c_sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
$c_sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
function $is_sci_Vector(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Vector)))
}
function $as_sci_Vector(obj) {
  return (($is_sci_Vector(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector"))
}
function $isArrayOf_sci_Vector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector)))
}
function $asArrayOf_sci_Vector(obj, depth) {
  return (($isArrayOf_sci_Vector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector;", depth))
}
var $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
/** @constructor */
function $c_sci_$colon$colon() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
  /*<skip>*/
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.tl$5;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
function $c_sci_Nil$() {
  $c_sci_List.call(this)
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
  /*<skip>*/
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.init___ = (function() {
  return this
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.tail__sci_List = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Nil$.prototype.equals__O__Z = (function(that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
}
/** @constructor */
function $c_scm_AbstractMap() {
  $c_sc_AbstractMap.call(this)
}
$c_scm_AbstractMap.prototype = new $h_sc_AbstractMap();
$c_scm_AbstractMap.prototype.constructor = $c_scm_AbstractMap;
/** @constructor */
function $h_scm_AbstractMap() {
  /*<skip>*/
}
$h_scm_AbstractMap.prototype = $c_scm_AbstractMap.prototype;
$c_scm_AbstractMap.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_Iterable$()
});
$c_scm_AbstractMap.prototype.toSeq__sc_Seq = (function() {
  return $f_scm_MapLike__toSeq__sc_Seq(this)
});
$c_scm_AbstractMap.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_AbstractMap.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_HashMap().init___()
});
$c_scm_AbstractMap.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
function $c_scm_AbstractBuffer() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
  /*<skip>*/
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
function $c_scm_HashMap() {
  $c_scm_AbstractMap.call(this);
  this.$$undloadFactor$5 = 0;
  this.table$5 = null;
  this.tableSize$5 = 0;
  this.threshold$5 = 0;
  this.sizemap$5 = null;
  this.seedvalue$5 = 0
}
$c_scm_HashMap.prototype = new $h_scm_AbstractMap();
$c_scm_HashMap.prototype.constructor = $c_scm_HashMap;
/** @constructor */
function $h_scm_HashMap() {
  /*<skip>*/
}
$h_scm_HashMap.prototype = $c_scm_HashMap.prototype;
$c_scm_HashMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_HashMap.prototype.init___ = (function() {
  $c_scm_HashMap.prototype.init___scm_HashTable$Contents.call(this, null);
  return this
});
$c_scm_HashMap.prototype.apply__O__O = (function(key) {
  var result = $as_scm_DefaultEntry($f_scm_HashTable__findEntry__O__scm_HashEntry(this, key));
  return ((result === null) ? $f_sc_MapLike__$default__O__O(this, key) : result.value$1)
});
$c_scm_HashMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_HashMap.prototype.addEntry0__p5__scm_DefaultEntry__I__V = (function(e, h) {
  var x$1 = $as_scm_DefaultEntry(this.table$5.get(h));
  e.next$1 = x$1;
  this.table$5.set(h, e);
  this.tableSize$5 = ((1 + this.tableSize$5) | 0);
  $f_scm_HashTable__nnSizeMapAdd__I__V(this, h)
});
$c_scm_HashMap.prototype.$$plus$eq__T2__scm_HashMap = (function(kv) {
  var key = kv.$$und1$f;
  var value = kv.$$und2$f;
  var e = $as_scm_DefaultEntry($f_scm_HashTable__findOrAddEntry__O__O__scm_HashEntry(this, key, value));
  if ((e !== null)) {
    e.value$1 = kv.$$und2$f
  };
  return this
});
$c_scm_HashMap.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__scm_HashMap($as_T2(elem))
});
$c_scm_HashMap.prototype.foreach__F1__V = (function(f) {
  var iterTable = this.table$5;
  var idx = $f_scm_HashTable__scala$collection$mutable$HashTable$$lastPopulatedIndex__I(this);
  var es = iterTable.get(idx);
  while ((es !== null)) {
    var this$1 = es;
    var next = this$1.next$1;
    var arg1 = es;
    var e = $as_scm_DefaultEntry(arg1);
    f.apply__O__O(new $c_T2().init___O__O(e.key$1, e.value$1));
    es = next;
    while (((es === null) && (idx > 0))) {
      idx = (((-1) + idx) | 0);
      es = iterTable.get(idx)
    }
  }
});
$c_scm_HashMap.prototype.findEntry__p5__O__I__scm_DefaultEntry = (function(key, h) {
  var e = $as_scm_DefaultEntry(this.table$5.get(h));
  while (this.notFound__p5__O__scm_DefaultEntry__Z(key, e)) {
    var this$1 = e;
    e = this$1.next$1
  };
  return e
});
$c_scm_HashMap.prototype.empty__sc_Map = (function() {
  return new $c_scm_HashMap().init___()
});
$c_scm_HashMap.prototype.$$minus__O__sc_Map = (function(key) {
  var this$2 = new $c_scm_HashMap().init___();
  var this$3 = $as_scm_Map($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this$2, this));
  return this$3.$$minus$eq__O__scm_HashMap(key)
});
$c_scm_HashMap.prototype.size__I = (function() {
  return this.tableSize$5
});
$c_scm_HashMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_scm_HashMap.prototype.result__O = (function() {
  return this
});
$c_scm_HashMap.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_scm_HashTable$$anon$1().init___scm_HashTable(this);
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(e$2) {
      var e = $as_scm_DefaultEntry(e$2);
      return new $c_T2().init___O__O(e.key$1, e.value$1)
    })
  })(this));
  return new $c_sc_Iterator$$anon$10().init___sc_Iterator__F1(this$1, f)
});
$c_scm_HashMap.prototype.init___scm_HashTable$Contents = (function(contents) {
  $f_scm_HashTable__$$init$__V(this);
  $f_scm_HashTable__initWithContents__scm_HashTable$Contents__V(this, contents);
  return this
});
$c_scm_HashMap.prototype.notFound__p5__O__scm_DefaultEntry__Z = (function(key, e) {
  if ((e !== null)) {
    var key1 = e.key$1;
    return (!$m_sr_BoxesRunTime$().equals__O__O__Z(key1, key))
  } else {
    return false
  }
});
$c_scm_HashMap.prototype.filterNot__F1__O = (function(p) {
  return $f_sc_MapLike__filterNot__F1__sc_Map(this, p)
});
$c_scm_HashMap.prototype.get__O__s_Option = (function(key) {
  var e = $as_scm_DefaultEntry($f_scm_HashTable__findEntry__O__scm_HashEntry(this, key));
  return ((e === null) ? $m_s_None$() : new $c_s_Some().init___O(e.value$1))
});
$c_scm_HashMap.prototype.$$minus$eq__O__scm_HashMap = (function(key) {
  $f_scm_HashTable__removeEntry__O__scm_HashEntry(this, key);
  return this
});
$c_scm_HashMap.prototype.contains__O__Z = (function(key) {
  return ($f_scm_HashTable__findEntry__O__scm_HashEntry(this, key) !== null)
});
$c_scm_HashMap.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__T2__scm_HashMap($as_T2(elem))
});
$c_scm_HashMap.prototype.addEntry__p5__scm_DefaultEntry__I__O = (function(e, h) {
  if ((this.tableSize$5 >= this.threshold$5)) {
    $f_scm_HashTable__addEntry__scm_HashEntry__V(this, e)
  } else {
    this.addEntry0__p5__scm_DefaultEntry__I__V(e, h)
  };
  return e.value$1
});
$c_scm_HashMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  var this$2 = new $c_scm_HashMap().init___();
  var this$3 = $as_scm_Map($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this$2, this));
  return this$3.$$plus$eq__T2__scm_HashMap(kv)
});
function $is_scm_HashMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_HashMap)))
}
function $as_scm_HashMap(obj) {
  return (($is_scm_HashMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.HashMap"))
}
function $isArrayOf_scm_HashMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashMap)))
}
function $asArrayOf_scm_HashMap(obj, depth) {
  return (($isArrayOf_scm_HashMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.HashMap;", depth))
}
var $d_scm_HashMap = new $TypeData().initClass({
  scm_HashMap: 0
}, false, "scala.collection.mutable.HashMap", {
  scm_HashMap: 1,
  scm_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  scm_Map: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_MapLike: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_HashTable: 1,
  scm_HashTable$HashUtils: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_HashMap.prototype.$classData = $d_scm_HashMap;
/** @constructor */
function $c_scm_ListBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
}
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
function $h_scm_ListBuffer() {
  /*<skip>*/
}
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.indexOf__O__I__I = (function(elem, from) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_GenSeqLike__indexOf__O__I__I(this$1, elem, from)
});
$c_scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__apply__I__O(this$2, n)
  }
});
$c_scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this$1, len)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this$1, that)
});
$c_scm_ListBuffer.prototype.exists__F1__Z = (function(p) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__exists__F1__Z(this$1, p)
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return (this.len$6 === 0)
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
$c_scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if ($is_scm_ListBuffer(that)) {
    var x2 = $as_scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.indexWhere__F1__I__I = (function(p, from) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__indexWhere__F1__I__I(this$1, p, from)
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
$c_scm_ListBuffer.prototype.contains__O__Z = (function(elem) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__contains__O__Z(this$1, elem)
});
$c_scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.isEmpty__Z()) {
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
$c_scm_ListBuffer.prototype.toSeq__sc_Seq = (function() {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return this$1
});
$c_scm_ListBuffer.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this$1, x$1)
});
$c_scm_ListBuffer.prototype.toSet__sci_Set = (function() {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$2 = $m_sci_Set$();
  var cbf = new $c_scg_GenSetFactory$$anon$1().init___scg_GenSetFactory(this$2);
  return $as_sci_Set($f_sc_TraversableLike__to__scg_CanBuildFrom__O(this$1, cbf))
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.indexOf__O__I = (function(elem) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_GenSeqLike__indexOf__O__I__I(this$1, elem, 0)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.toMap__s_Predef$$less$colon$less__sci_Map = (function(ev) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var b = new $c_scm_MapBuilder().init___sc_GenMap($m_sci_Map$EmptyMap$());
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    b.$$plus$eq__T2__scm_MapBuilder($as_T2(arg1));
    var this$3 = these;
    these = this$3.tail__sci_List()
  };
  return $as_sci_Map(b.elems$1)
});
$c_scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = $as_sc_TraversableOnce($f_sc_IterableLike__take__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return $as_scm_ListBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
function $is_scm_ListBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
}
function $as_scm_ListBuffer(obj) {
  return (($is_scm_ListBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
}
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
function $c_scm_StringBuilder() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$5 = null
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
  /*<skip>*/
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var c = this.underlying$5.charAt__I__C(idx);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  var c = this.underlying$5.charAt__I__C(index);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.exists__F1__Z = (function(p) {
  return $f_sc_IndexedSeqOptimized__exists__F1__Z(this, p)
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  return this.underlying$5.java$lang$StringBuilder$$content$f
});
$c_scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_StringBuilder.prototype.indexWhere__F1__I__I = (function(p, from) {
  return $f_sc_IndexedSeqOptimized__indexWhere__F1__I__I(this, p, from)
});
$c_scm_StringBuilder.prototype.reverse__O = (function() {
  return this.reverse__scm_StringBuilder()
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  return this.underlying$5.java$lang$StringBuilder$$content$f
});
$c_scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  var this$1 = this.underlying$5;
  this$1.java$lang$StringBuilder$$content$f = (("" + this$1.java$lang$StringBuilder$$content$f) + s);
  return this
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.underlying$5.length__I())
});
$c_scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  var this$2 = new $c_jl_StringBuilder().init___I((($uI(initValue.length) + initCapacity) | 0));
  this$2.java$lang$StringBuilder$$content$f = (("" + this$2.java$lang$StringBuilder$$content$f) + initValue);
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, this$2);
  return this
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  return this.underlying$5.length__I()
});
$c_scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintIfCheap__I = (function() {
  return this.underlying$5.length__I()
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  var this$2 = this.underlying$5;
  var str = ("" + x);
  this$2.java$lang$StringBuilder$$content$f = (this$2.java$lang$StringBuilder$$content$f + str);
  return this
});
$c_scm_StringBuilder.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_StringBuilder.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_StringBuilder.prototype.reverse__scm_StringBuilder = (function() {
  return new $c_scm_StringBuilder().init___jl_StringBuilder(new $c_jl_StringBuilder().init___jl_CharSequence(this.underlying$5).reverse__jl_StringBuilder())
});
$c_scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
});
$c_scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
function $c_sjs_js_WrappedArray() {
  $c_scm_AbstractBuffer.call(this);
  this.array$6 = null
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.exists__F1__Z = (function(p) {
  return $f_sc_IndexedSeqOptimized__exists__F1__Z(this, p)
});
$c_sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sjs_js_WrappedArray.prototype.indexWhere__F1__I__I = (function(p, from) {
  return $f_sc_IndexedSeqOptimized__indexWhere__F1__I__I(this, p, from)
});
$c_sjs_js_WrappedArray.prototype.reverse__O = (function() {
  return $f_sc_IndexedSeqOptimized__reverse__O(this)
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.array$6.length))
});
$c_sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.sizeHintIfCheap__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
function $is_sjs_js_WrappedArray(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedArray)))
}
function $as_sjs_js_WrappedArray(obj) {
  return (($is_sjs_js_WrappedArray(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.WrappedArray"))
}
function $isArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
}
function $asArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (($isArrayOf_sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth))
}
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
/** @constructor */
function $c_scm_ArrayBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
  /*<skip>*/
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  $f_scm_ResizableArray__ensureSize__I__V(this, n);
  this.array$6.set(this.size0$6, elem);
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.exists__F1__Z = (function(p) {
  return $f_sc_IndexedSeqOptimized__exists__F1__Z(this, p)
});
$c_scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  $f_scm_ResizableArray__foreach__F1__V(this, f)
});
$c_scm_ArrayBuffer.prototype.indexWhere__F1__I__I = (function(p, from) {
  return $f_sc_IndexedSeqOptimized__indexWhere__F1__I__I(this, p, from)
});
$c_scm_ArrayBuffer.prototype.reverse__O = (function() {
  return $f_sc_IndexedSeqOptimized__reverse__O(this)
});
$c_scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
$c_scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  $f_scm_ResizableArray__$$init$__V(this);
  return this
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintIfCheap__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if ($is_sc_IndexedSeqLike(xs)) {
    var x2 = $as_sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    $f_scm_ResizableArray__ensureSize__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return $as_scm_ArrayBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuffer.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ResizableArray__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = $newArrayObject($d_O.getArrayOf(), [len]);
    $systemArraycopy(this.array$6, 0, newarray, 0, this.size0$6);
    this.array$6 = newarray
  }
});
$c_scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
function $is_scm_ArrayBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
}
function $as_scm_ArrayBuffer(obj) {
  return (($is_scm_ArrayBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
}
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.DataTypesServiceHelper = $m_Lcom_seamless_contexts_data$undtypes_DataTypesServiceHelper$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.rfc = ($e.com.seamless.contexts.rfc || {});
/** @constructor */
$e.com.seamless.contexts.rfc.RfcService = (function() {
  var $thiz = new $c_Lcom_seamless_contexts_rfc_RfcService();
  $c_Lcom_seamless_contexts_rfc_RfcService.prototype.init___.call($thiz);
  return $thiz
});
$e.com.seamless.contexts.rfc.RfcService.prototype = $c_Lcom_seamless_contexts_rfc_RfcService.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
$e.com.seamless.contexts.data_types.Primitives.BooleanT = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$BooleanT$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
$e.com.seamless.contexts.data_types.Primitives.IntegerT = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$IntegerT$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
$e.com.seamless.contexts.data_types.Primitives.ListT = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ListT$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
$e.com.seamless.contexts.data_types.Primitives.NumberT = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$NumberT$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
$e.com.seamless.contexts.data_types.Primitives.ObjectT = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$ObjectT$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Primitives.RefT = (function(arg$1) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT();
  var prep0 = $as_T(arg$1);
  $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype.init___T.call($thiz, prep0);
  return $thiz
});
$e.com.seamless.contexts.data_types.Primitives.RefT.prototype = $c_Lcom_seamless_contexts_data$undtypes_package$Primitives$RefT.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Primitives = ($e.com.seamless.contexts.data_types.Primitives || {});
$e.com.seamless.contexts.data_types.Primitives.StringT = $m_Lcom_seamless_contexts_data$undtypes_package$Primitives$StringT$;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.AddField = (function(arg$1, arg$2, arg$3) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$AddField();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  var prep2 = $as_T(arg$3);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype.init___T__T__T.call($thiz, prep0, prep1, prep2);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.AddField.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$AddField.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.AddTypeParameter = (function(arg$1, arg$2, arg$3) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  var prep2 = $as_T(arg$3);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype.init___T__T__T.call($thiz, prep0, prep1, prep2);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.AddTypeParameter.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$AddTypeParameter.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.AssignType = (function(arg$1, arg$2, arg$3) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType(arg$2);
  var prep2 = $as_T(arg$3);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype.init___T__Lcom_seamless_contexts_data$undtypes_package$Primitives$PrimitiveType__T.call($thiz, prep0, prep1, prep2);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.AssignType.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$AssignType.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.DefineConcept = (function(arg$1, arg$2, arg$3) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  var prep2 = $as_T(arg$3);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype.init___T__T__T.call($thiz, prep0, prep1, prep2);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.DefineConcept.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$DefineConcept.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.DeprecateConcept = (function(arg$1) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept();
  var prep0 = $as_T(arg$1);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype.init___T.call($thiz, prep0);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.DeprecateConcept.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$DeprecateConcept.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.RemoveField = (function(arg$1, arg$2) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype.init___T__T.call($thiz, prep0, prep1);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.RemoveField.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveField.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.RemoveTypeParameter = (function(arg$1, arg$2) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype.init___T__T.call($thiz, prep0, prep1);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.RemoveTypeParameter.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$RemoveTypeParameter.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.SetConceptName = (function(arg$1, arg$2) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype.init___T__T.call($thiz, prep0, prep1);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.SetConceptName.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetConceptName.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.SetFieldName = (function(arg$1, arg$2, arg$3) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName();
  var prep0 = $as_T(arg$1);
  var prep1 = $as_T(arg$2);
  var prep2 = $as_T(arg$3);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype.init___T__T__T.call($thiz, prep0, prep1, prep2);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.SetFieldName.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldName.prototype;
$e.com = ($e.com || {});
$e.com.seamless = ($e.com.seamless || {});
$e.com.seamless.contexts = ($e.com.seamless.contexts || {});
$e.com.seamless.contexts.data_types = ($e.com.seamless.contexts.data_types || {});
$e.com.seamless.contexts.data_types.Commands = ($e.com.seamless.contexts.data_types.Commands || {});
/** @constructor */
$e.com.seamless.contexts.data_types.Commands.SetFieldOccurrence = (function(arg$1, arg$2, arg$3) {
  var $thiz = new $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence();
  var prep0 = $as_T(arg$1);
  var prep1 = $uZ(arg$2);
  var prep2 = $as_T(arg$3);
  $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype.init___T__Z__T.call($thiz, prep0, prep1, prep2);
  return $thiz
});
$e.com.seamless.contexts.data_types.Commands.SetFieldOccurrence.prototype = $c_Lcom_seamless_contexts_data$undtypes_Commands$SetFieldOccurrence.prototype;
//# sourceMappingURL=seamless-ddd-fastopt.js.map
