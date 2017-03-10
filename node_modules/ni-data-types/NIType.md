# NIType

Contains all the information needed to correctly describe a data type. Helper methods to explore type properties.

## Supported data types
* Boolean
* Int8
* Int16
* Int32
* Int64
* UInt8
* UInt16
* UInt32
* UInt64
* Single
* Double
* ComplexSingle
* ComplexDouble
* String
* Path
* Timestamp
* Enum
* Cluster
* Array
* AnalogWaveform
* DigitalWaveform

## Usage

It can be constructed from a JSON string that at least contains `name` property that maps to one of the names in `window.NITypeNames`.

Examples:

```javascript
var int16Type = new NIType('{"name":"Int16"}');
var stringType = new NIType('{"name":"String"}');
```

Is also possible to use a full notation JS Object like

```javascript
var arrayType = new NIType({name: 'Array', rank: 1, subtype: {name: 'String'}});
var clusterType = new NIType({name: 'Cluster', fields: ['One', 'Two'], subtype: [{name: 'Boolean'}, {name: 'UInt8'}]});
```

Or simply use short-notation JS objects
```javascript
var arrayType = new NIType({name: 'Array', rank: 1, subtype: 'Path'});
var clusterType = new NIType({name: 'Cluster', fields: ['One', 'Two'], subtype: ['Boolean', 'UInt16']});
```

To reduce overhead a little, you can also just pass the name of the type as a JSON string.

```javascript
var int16Type = new NIType('"Int16"');
var stringType = new NIType('"String"');
```

This is true for all simple types (Only require the type `name`):
* Void
* Boolean
* Int8
* Int16
* Int32
* Int64
* UInt8
* UInt16
* UInt32
* UInt64
* Single
* Double
* ComplexSingle
* ComplexDouble
* String
* Path
* Timestamp
* DigitalWaveform

There are other types that require extra information to be described correctly.

### Enum

In addition of having the `name` property with value `NITypeNames.ENUM`. It must have a `subtype` property with a valid descriptor for `UInt8`, `UInt16`, `UInt32`.

Example:

```javascript
var enumType = new NIType('{"name":"Enum","subtype":{"name":"UInt32"}}');
var shortEnumType = new NIType('{"name":"Enum","subtype":"UInt16"}');
var invalidEnumType = new NIType('{"name":"Enum","subtype":"Int64"}'); // This would throw. Invalid subtype.
```

### Array

Must have as `name` property the string in `NITypeNames.ARRAY`. It must contain a `subtype` property with a valid descriptor for any type except `Array`.
It should have a `rank` property, a positive integer for the number of dimensions in the array.
Optionally, for a fixed-size array, the property `size` is available, which must map to an array of integers describing the size of each dimension of the `Array`.

Example:

```javascript
var arrayType = new NIType('{"name":"Array","subtype":{"name":"String"},"rank":1}'); // Variable size  1-D array
var shortArrayType = new NIType('{"name":"Array","subtype":"Timestamp","rank":3}');
var fixedSizeArrayType = new NIType('{"name":"Array","subtype":"Boolean","rank":2,"size":[2,3]}'); // 2-D array (2 by 3) of booleans.

var invalidType = new NIType('{"name":"Array","subtype":{"name":"Array","rank":1,"subtype":"Path"},"rank":1}'); // This throws. For an array of arrays better use multidimensional array.
```

### Cluster

For the cluster descriptor, the `name` property must be `NITypeNames.CLUSTER`. It must contain a `fields` property also, which points to an array of strings. Each string in said array must be the name of the variable in the cluster. The `subtype` property is optional, but if provided must be an array of valid descriptors. Each variable name from `fields` maps to the descriptor in `subtype`, therefore both arrays must be of the same length.

Examples:

```javascript
var clusterType = new NIType('{"name":"Cluster","fields":[]}'); // Empty cluster.
var clusterBooleanType = new NIType('{"name":"Cluster","fields":["Power Button"],"subtype":[{"name":"Boolean"}]}');
var clusterShortIntType = new NIType('{"name":"Cluster","fields":["Power Button"],"subtype":["Int16"]}');

var invalidSubtypeClusterType = new NIType('{"name":"Cluster","fields":["First"],"subtype":[]}'); // This throws. subtype.length === fields.length, must be true.
```

### AnalogWaveform

An analog waveform descriptor must have its `name` property assigned to `NITypeNames.ANALOGWAVEFORM`. The other required property is `subtype` and it must be a numeric, this includes: integers, unsigned integers, floating point and complex types.

## Type helper methods

Once an instance is succesfully created, you can use its helper functions to find out about the properties of the type.

### General types methods

All types have their own `is{TypeName}()`, which returns true if the type described is actually the {TypeName} of the method. (See the list above to see the names)


Examples: 

```javascript
var booleanType = new NIType('"Boolean"');
console.log(booleanType.isBoolean()); // This prints "true"
console.log(booleanType.isString()); // This prints "false"

var arrayType = new NIType('{"name":"Array","subtype":"UInt16","rank":1}');
console.log(arrayType.isArray()); // This prints "true"
```

`getName()` returns the name of the type. Its value matches one in the enum `NITypeNames`.

```javascript
// Therefore is possible to implement something like:

switch(descriptor.getName()) {
    case NITypeNames.PATH:
    case NITypeNames.STRING:
      // Do something
}

```

`equals(NIType)` returns true if all the properties from the type descriptor provided as parameter match the instance recursively.

Examples:

```javascript
var arrayType1 = new NIType('{"name":"Array","rank":1,"subtype":"Boolean"}');
var arrayType2 = new NIType('{"name":"Array","rank":1,"subtype":"Boolean"}');

var areArraysEqual = arraType1.equals(arrayType2); // This is true

var arrayOfClusters = new NIType('{"name":"Array","rank":1,"subtype":{"name":"Cluster","fields":["A"]}}');
var array2DOfClusters = new NIType('{"name":"Array","rank":2,"subtype":{"name":"Cluster","fields":["A"]}}');

var areArraysOfClusterEquals = arrayOfClusters.equals(array2DOfClusters); // This is false since rank is different.

// Clusters fields and subtypes order must match.
var clusterType = new NIType('{"name":"Cluster","fields":["A","B","C"],"subtype":["Boolean","UInt8","String"]}');
var clusterType2 = new NIType('{"name":"Cluster","fields":["A","B","C"],"subtype":["Boolean","ComplexSingle","String"]}');

var areClustersEqual = clusterType.equals(clusterType2); // This is false, subtype[1] are different.

// However order declaration doesn't affect equality
clusterType = new NIType('{"name":"Cluster","fields":["A","B","C"],"subtype":["Boolean","UInt8","String"]}');
clusterType2 = new NIType('{"subtype":["Boolean","UInt8","String"],"name":"Cluster","fields":["A","B","C"]}');

areClustersEqual = clusterType.equals(clusterType2); // Now this is true, since they have identical properties.
```

### Numerics

Additionally, numerics count with broader type checks.

* `isFloat()` returns true if the type represents a floating point type like `Single` or `Double`, false otherwise.
* `isSignedInteger()` returns true if the type is a signed integer type like `Int8`, `Int16`, `Int32` or `Int64`, false otherwise.
* `isUnsignedInteger()` returns true if the type is an unsigned integer type like `UInt8`, `UInt16`, `UInt32` or `UInt64`, false otherwise.
* `is64BitInteger()` returns true if the type is an integer that needs 64 bits to be represented precisely, like `Int64` or `UInt64`, false otherwise.
* `isInteger()` returns true if the type returns true to either `isSignedInteger()` or `isUnsignedInteger()`, false otherwise.
* `isComplex()` returns true if the type is either a complex number like `ComplexSingle` or `ComplexDouble`.
* `isNumeric()` returns true if the type returns true to any of the previous functions. 

### Composed types

`Array`, `Enum`, `AnalogWaveform` and `Cluster` are composed types, they share the following function:

* `getSubtype()`. Returns an instance of `NIType` or an array of those in case of the `Cluster`

Examples: 

```javascript
var arrayType = new NIType('{"name":"Array","rank":1,"subtype":"Double"}');
var enumType = new NIType('{"name":"Enum","subtype":"UInt32"}');
var analogType = new NIType('{"name":"AnalogWaveform","subtype":"Single"}');

var arraySubtype = arrayType.getSubtype();
var enumSubtype = enumType.getSubtype();
var analogSubtype = enumType.getSubtype();

// All these are true
console.log(arraySubtype.isDouble());
console.log(enumType.isUInt32());
console.log(analogSubtype.isSingle());
```

### Array methods

Array types also have some extra methods.

* `getRank()` returns an integer greater than zero with the rank of the array.
* `getSize()` defined for fixed-size arrays. Returns an array of positive integers, including zero, that describe the size of each dimension in the array.

Examples:

```javascript
var arrayType = new NIType('{"name":"Array","rank":2,"size":[2,3],"subtype":"Boolean"}');
console.log(arrayType.getSize()); // prints [2, 3]
console.log(arrayType.getRank()); // prints 2
```

### Cluster methods

Clusters instances expose these methods.

* `getSubtype()` returns an array of NIType instances of the subelements in the cluster. `undefined` if information is not there (Cluster is partially built).
* `getFields()` returns an array of `string` with the names of the fields in the subelements of the cluster.

Examples:

```javascript
var clusterType = new NIType('{"name":"Cluster","subtype":["Boolean"],"fields":["Power Button"]}');
var partialClusterType = new NIType('{"name":"Cluster","fields":["Text Button"]}');

var clusterSubtype = clusterType.getSubtype(); // returns an array containing a NIType of boolean.
console.log(clusterType.isBoolean()); // Would print true

var partialClusterSubtype = partialClusterType.getSubtype();
console.log(partialClusterSubtype); // Prints undefined

var clusterFields = clusterType.getFields();
console.log(clusterFields); // ["Power Button"]
```

### JSON descriptor

Sometimes is required to send the JSON type descriptor to other applications, for that case 2 functions are provided:

* `toJSON()` returns a JSON string that describes the whole type using the full-format. This means that even simple subtypes are described as objects. e.g. `{"name":"Array", "subtype":{"name":"Path"}}`.
* `toShortJSON()` returns a JSON string that describes the whole type but uses strings for simple subtypes. e.g. `{"name":"Array","subtype":"Path"}`.
