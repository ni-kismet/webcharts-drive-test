/* history buffer data structure for charting.

Copyright (c) 2007-2015 National Instruments
Licensed under the MIT license.
*/
/*globals CBuffer, SegmentTree, module*/

/**
# HistoryBufferWaveform

> A historyBuffer is a data structure that enables efficient charting operations
on a sliding window of data points. HistoryBufferWaveform enables a charting of analog waveforms.

Example:
```javascript
var hb1 = new HistoryBufferWaveform(10);

aw = new NIAnalogWaveform({
    t0: 4,
    dt: 1,
    Y:[1, 2, 3]
});

aw1 = new NIAnalogWaveform({
    t0: 1,
    dt: 1,
    Y:[1, 2, 3]
});

// in an analog waveform history buffer with width 1 we can push analog waveforms
hb1.push(aw);
hb1.push(aw1);

console.log(hb1.toArray()); //[aw, aw2]

console.log(hb1.toDataSeries()); //[[4, 1], [5, 2], [6, 3], [null, null], [1, 1], [2, 2], [3, 3]]
```

*/

/** ## HistoryBufferWaveform methods*/
(function (global) {
    'use strict';

    /** **HistoryBufferWaveform(capacity, width)** - the History buffer constructor creates
    a new history buffer with the specified capacity (default: 1024) and width (default: 1)*/
    var HistoryBufferWaveform = function (capacity, width) {
        this.capacity = capacity || 1024;
        this.width = width || 1;

        this.buffers = []; // circular buffers for data

        for (var i = 0; i < this.width; i++) {
            this.buffers.push(new CBuffer(capacity));
        }

        this.buffer = this.buffers[0];

        this.count = 0;
        this.callOnChange = undefined;
        this.changed = false;
    };

    HistoryBufferWaveform.prototype.__proto__ = HistoryBufferNumeric.prototype; // delegate to HistoryBuffer

    HistoryBufferWaveform.prototype.rebuildSegmentTrees = function () { // no segment tree is used for waveforms
    };

    /* store an element in the history buffer, don't update stats */
    HistoryBufferWaveform.prototype.pushNoStatsUpdate = function (item) {
        if (this.width === 1) {
            this.buffer.push(item);
        } else {
            if (Array.isArray(item) && item.length === this.width) {
                for (var i = 0; i < this.width; i++) {
                    this.buffers[i].push(item[i]);
                }
            }
        }
    };

    /* get the tree nodes at the specified level that keeps the information for the specified interval*/
    HistoryBufferWaveform.prototype.getTreeNodes = function (level, start, end) { // no segment tree is used for waveforms
    };

    /* update the segment tree with the newly added values*/
    HistoryBufferWaveform.prototype.updateSegmentTrees = function () {
    };

    function waveformInRange(aw, start, end) {
        if (aw.Y.length === 0) {
            return false;
        }

        var t0 = new NITimestamp(aw.t0);

        var waveformStart = 0 + t0;
        var waveformEnd = 0 + t0 + aw.Y.length * aw.dt;

        if (waveformStart < start && waveformEnd < start) {
            return false;
        }

        if (waveformStart > end && waveformEnd > end) {
            return false;
        }

        return true;
    }

    function appendWaveformToDecimateBuffer(aw, start, end, buffer) {
        var Y = aw.Y,
            TS = aw.t0,
            currentTS = new NITimestamp(TS),
            floatCurrentTS;

        for (var i=0; i < Y.length; i++) {
            floatCurrentTS = currentTS.valueOf();

            if (floatCurrentTS >= (start - aw.dt) && floatCurrentTS <= (end + aw.dt)) {
                buffer.push(floatCurrentTS);
                buffer.push(Y[i]);
            }
            currentTS.add(aw.dt);
        }
    }

    function appendWaveformToDataSeries(aw, buffer) {
        var Y = aw.Y,
            TS = aw.t0,
            currentTS = new NITimestamp(TS),
            floatCurrentTS;

        for (var i=0; i < Y.length; i++) {
            floatCurrentTS = currentTS.valueOf();
            buffer.push([floatCurrentTS, Y[i]]);
            currentTS.add(aw.dt);
        }
    }

    /** **query(start, end, step, index)** - decimates the data set at the
    provided *index*, starting at the start sample, ending at the end sample
    with the provided step */
    HistoryBufferWaveform.prototype.query = function (start, end, step, index) {
        if (index === undefined) {
            index = 0;
        }

        var result = [];
        var waveforms = this.buffers[index].toArray();

        waveforms.forEach(function (waveform) {
            if (!waveformInRange(waveform, start, end)) {
                return;
            }

            if (result.length > 0) {
                // add a "gap" to separate the analog waveforms
                result.push(null);
                result.push(null);
            }

            appendWaveformToDecimateBuffer(waveform, start, end, result);
        });

        return result;
    };

    /** **toDataSeries()** - returns the content of the history buffer into a
    flot data series*/
    HistoryBufferWaveform.prototype.toDataSeries = function (index) {
        if (index === undefined) {
            index = 0;
        }

        var result = [];
        var waveforms = this.buffers[index].toArray();

        waveforms.forEach(function (waveform) {
            if (result.length > 0) {
                // add a "gap" to separate the analog waveforms
                result.push([null, null]);
            }

            appendWaveformToDataSeries(waveform, result);
        });

        return result;
    };

    HistoryBufferWaveform.prototype.range = function (index) {
        var minTS = Infinity, maxTS = -Infinity,
            min = Infinity, max= -Infinity;

        function updateMinMax(aw) {
            var startTS, endTS
            var Y = aw.Y;
            var t0 = new NITimestamp(aw.t0);

            if (Y.length === 0) {
                return;
            }

            for (var i = 0; i < Y.length; i++) {
                if (Y[i] > max) {
                    max = Y[i];
                }

                if (Y[i] < min) {
                    min = Y[i];
                }
            }

            startTS = 0 + t0;
            endTS = 0 + (new NITimestamp(t0)).add(aw.dt * aw.Y.length);

            if (startTS < minTS) {
                minTS = startTS;
            }

            if (endTS > maxTS) {
                maxTS = endTS;
            }
        }

        if (index === undefined) {
            index = 0;
        }

        var waveforms = this.buffers[index].toArray();

        if (waveforms.length === 0) {
            return {};
        }

        waveforms.forEach(function (waveform) {
            updateMinMax(waveform);
        });

        return {
            xmin: minTS,
            xmax: maxTS,
            ymin: min,
            ymax: max
        }
    };

    HistoryBufferWaveform.prototype.toJSON = function() {
        var serializedHb = {
            data: this.toArray(),
            width: this.width,
            capacity: this.capacity,
            valueType: 'HistoryBuffer',
            startIndex: this.startIndex(),
            count: this.count
        };

        return serializedHb;
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = HistoryBufferWaveform;
    } else {
        global.HistoryBufferWaveform = HistoryBufferWaveform;
    }
})(this);
