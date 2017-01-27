/*jshint browser: true*/

(function () {
    'use strict';
    var graph;
    var globalIndex = 0;

    var plots = 1;
    var samples = 100000;
    var isamples = 10000;
    var buffer = [];
    var chartStep = 9/samples;
    var x = 0;
    var y = 0;

    function initBuffer() {
        var newx = Math.sqrt(samples/2) | 0;

        if (x !== newx) {
            x = newx;
            y = newx/2;
            buffer = []
            for (var i =0; i < x; i++) {
                buffer[i] = [];
            }
        }
    }

    // update data reuses the same buffer, so no memory is allocated here, except the first time when it runs
    function updateData() {
        var offset;
        var iindex;
        samples = Number(document.querySelector('input[name="samples"]:checked').value);

        initBuffer();

        for (var j=0 ; j < y; j++) {
            offset = j * isamples;
            for (var i = 0; i < x; i++, iindex++) {
                buffer[i][j] = ((globalIndex + i + j) % x) /x;
            }
        }

        globalIndex ++;
        globalIndex %= x;
    }

    function updateDataAndDraw() {
        updateData();
        graph.setData(buffer);
    }

    graph = document.querySelector("#graph1");
    var fps_display = document.querySelector("#fps");

    function updateDataAndRAF() {
        window.requestAnimationFrame(updateDataAndRAF);
        updateDataAndDraw();
        fps_display.update(x * y);
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
        NationalInstruments.HtmlVI.Elements.NIElement.addNIEventListener('attached', function () {
            window.requestAnimationFrame(updateDataAndRAF);
        });
    });
})();
