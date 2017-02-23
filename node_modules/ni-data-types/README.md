# data-types [![Build Status](https://travis-ci.com/ni-kismet/data-types.svg?token=Jyx4TwQ8BfwmoFUnfzWe&branch=master)](https://travis-ci.com/ni-kismet/data-types)

This repository contains support for non-standard Javascript data types needed for engineering and scientific applications.

# Data Types

## NIType

Contains all the information needed to fully describe a NIType, as as an API to retrieve the information. It can be constructed from a JSON encoded string or a full notation object.

```javascript
var booleanType = new NIType('"Boolean"'); // A single boolean.
var arrayType = new NIType({name: 'Array', rank: 1, subtype:{name: 'Boolean'}}); // 1-D array of booleans.

var arraySubtype = arrayType.getSubtype(); // An instance of NIType

console.log(arraySubtype.isBoolean()); // true
console.log(booleanType.isBoolean()); // true
console.log(booleanType.equals(arraySubtype)); // true
console.log(booleanType.equals(arrayType)); // false
```

For more information, you can look at the [docs of NIType](NIType.md).

## NIComplex. Complex numbers for high performance applications

Can be constructed from a string representing
* complex numbers with real part before imaginary part or imaginary part before real part
* complex numbers represented with scientific notation
* complex numbers whose real and/or imaginary parts contain [metric (SI) prefixes](https://en.wikipedia.org/wiki/Metric_prefix#List_of_SI_prefixes), such as kilo (k) or mega (M).
* complex numbers with only real or imaginary part
* complex numbers containing NaN as imaginary part, real part, or both
* +/-infinity, +/-inf, +/-Infinity, +/-Inf
* complex numbers that have the imaginary part represented only as +/-i or i

Can be constructed from numbers
* first paramater value is used for the real part and the second one for the imaginary part

It throw errors for any type of invalid input

```javascript
var complex = new NIComplex('1 + 2i');
var complex1 = new NIComplex(1, 2);
var complex2 = new NIComplex(1);
var wrongComplex = new NIComplex('not a number'); // will throw
```

Complex numbers are objects containing two IEEE754 numbers, *realPart* and *imaginaryPart*.

```javascript
var complex = new NIComplex('1 + 2i');
var re = complex.realPart;
var im = complex.imaginaryPart;
```
## NITimestamp. High precision timestamps

A NITimestamp is a data structure used to represent time with the high precision needed by scientific and engineering applications. An NITimestamp is composed by a pair of:
* *seconds*, a integer number representing seconds passed since the _epoch_
* *fractions*, an integer number between 0 and 2<sup>52</sup> - 1 representing the fractions of seconds in the timestamp. A fraction is one second divided by 2<sup>52</sup>.

The main design goals of the NITimestamp is interoperability with [LabVIEW Timestamp], and as a consequence:

1. the _epoch_ used in NITimestamps is the [LabVIEW epoch] (1 January 1904).
2. the serialization format of the NITimestamp is using Int64, UInt64

### Usage

```javascript
var timestamp = new NITimestamp(); // the epoch
var timestamp2 = new NITimestamp('0:0'); // the epoch
var timestamp3 = new NITimestamp(new Date(Date.now())); // current time
var timestamp4 = new NITimestamp(35.27); // 35.27 seconds past the epoch
var timestamp5 = new NITimestamp(timestamp); // copy a timestamp
```

**The NITimestamp constructor**  can be called with no parameters or with different types of parameters:

1. a string in the format "123:567890" where
  * the first part is an INT64 serialized to a decimal string, representing the nr. of seconds relative to _epoch_
  * the second part is a UINT64 serialized to a decimal string, representing the fractional part of the seconds
2. a javascript Date
3. a Number, representing the seconds passed since the _epoch_
4. a NITimestamp.

## NIAnalogWaveform. A waveform of analog data samples

A NIAnalogWaveform represents a series of analog data samples. The main use case for it is for samples acquired periodically with a constant time interval between them.


[LabVIEW epoch]: https://en.wikipedia.org/wiki/Epoch_(reference_date)
[LabVIEW Timestamp]: http://www.ni.com/tutorial/7900/en/
