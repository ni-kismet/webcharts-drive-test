/*global $, HistoryBuffer*/
/*jshint browser: true*/

(function () {
    'use strict';
    var graph, graph2, graph3;
    var globalIndex = 0;

    var plots = 1;
    var samples = 50000;
    var buffer = [];
    var chartStep = 9/samples;

    // update data reuses the same buffer, so no memory is allocated here, except the first time when it runs
    function updateDataAndDraw() {
        var sin;

        for (var i = 0; i < samples; i++) {
            buffer[i] = (i + globalIndex)%10000;
        }

        globalIndex += samples/60;

        graph.setData(buffer);
    }


    graph = document.querySelector("#graph1");

    function updateDataAndRAF() {
        updateDataAndDraw();
        window.requestAnimationFrame(updateDataAndRAF);
    };

    if (graph.isReady) {
        window.requestAnimationFrame(updateDataAndRAF);
    } else {
        graph.onReady = function() {
            window.requestAnimationFrame(updateDataAndRAF);
        };
    }
})();
