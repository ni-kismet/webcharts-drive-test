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
        var newy = Math.sqrt(samples/2) | 0;

        if (y !== newy) {
            x = 2*newy;
            y = newy;
            buffer = []
            for (var i =0; i < x; i++) {
                buffer[i] = [];
            }
        }
    }

    // update data reuses the same buffer, so no memory is allocated here, except the first time when it runs
    function updateData() {
        samples = Number(document.querySelector('input[name="samples"]:checked').value);

        initBuffer();

        for (var i = 0; i < x; i++) {
            for (var j=0 ; j < y; j++) {
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

    if (graph.isReady) {
        window.requestAnimationFrame(updateDataAndRAF);
    } else {
        graph.onReady = function() {
            window.requestAnimationFrame(updateDataAndRAF);
        };
    }

    var axisMode = document.querySelector("#axisMode");
    axisMode.onclick = function () {
        var sel = document.querySelector('input[name="axisMode"]:checked').value,
            horizontalAxis = document.querySelector('#horizontalAxis'),
            verticalAxis = document.querySelector('#verticalAxis');

        horizontalAxis.logScale = sel === 'log';
        verticalAxis.logScale = sel === 'log';
    }
})();
