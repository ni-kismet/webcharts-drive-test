/*jshint browser: true*/

(function () {
    'use strict';
    var graph;
    var globalIndex = 0;
    var NIAnalogWaveform = window.NIAnalogWaveform;
    var NITimestamp = window.NITimestamp;
    var startDate= Date.now();

    var plots = 1;
    var samples = 50000;
    var isamples = 50000;

    var buffer = [];
    var initbuffer = [];

    var initBuffer = function () {
        if (buffer.length !== plots) {
            buffer.length = 0;
            for (var i=0; i < plots; i++) {
                buffer[i] = new NIAnalogWaveform({t0: new NITimestamp(new Date(startDate)), dt: 1/1000, Y:[]});
            }
        }
    }

    for (var i = 0; i < isamples; i++) {
        initbuffer[i] = i%(isamples/4);
    }

    // update data reuses the same buffer, so no memory is allocated here, except the first time when it runs
    function updateDataAndDraw() {
        var offset;
        var iindex;
        var now = new NITimestamp(new Date(startDate));
        plots = Number(document.querySelector('input[name="plots"]:checked').value);
        samples = Number(document.querySelector('input[name="samples"]:checked').value);

        initBuffer();

        for (var j=0 ; j < plots; j++) {
            offset = j * isamples/3;
            iindex = globalIndex;
            for (var i = 0; i < samples; i++, iindex++) {
                if (iindex > isamples -1) {
                    iindex = 0;
                }
                buffer[j].Y[i] = initbuffer[iindex];
                buffer[j].Y[i] += offset;
            }
            if (buffer[j].Y.length !== samples) {
                buffer[j].Y.length = samples;
            }

            buffer[j].t0 = now;
        }

        startDate += (isamples/60) | 0;
        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;

        graph.setData(buffer);
    }

    graph = document.querySelector("#graph");
    var fps_display = document.querySelector("#fps");

    function updateDataAndRAF() {
        window.requestAnimationFrame(updateDataAndRAF);
        updateDataAndDraw();
        fps_display.update(plots * samples);
    };

    var domReady = function (readyCallback) {
        if (window.HTMLImports && window.HTMLImports.whenReady) {
            HTMLImports.whenReady(readyCallback);
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', readyCallback);
        } else {
            readyCallback();
        }
    };

    domReady(function () {
        graph.onReady = function() {
            window.requestAnimationFrame(updateDataAndRAF);
        };
    });
})();
