/*jshint browser: true*/

(function () {
    'use strict';
    var graph;
    var globalIndex = 0;

    var plots = 1;
    var samples = 1000;
    var isamples = 10000;
    var initbuffer = [];
    var iindex = 0;

    for (var i = 0; i < isamples; i++) {
        initbuffer[i] = i%(isamples);
    }

    var column = [];

    function updateData() {
        var offset;
        plots = Number(document.querySelector('input[name="plots"]:checked').value);
        samples = Number(document.querySelector('input[name="samples"]:checked').value);
        var hb = graph.getHistoryBuffer();

        hb.setWidth(plots);

        for (var i = 0; i < samples; i++, iindex++) {
            if (iindex > isamples -1) {
                iindex = 0;
            }
            for (var j=0; j < plots; j++) {
                offset = j * isamples;

                column[j] = initbuffer[iindex];
                column[j] += offset;
            }

            if (column.length > plots) {
                column.length = plots;
            }

            hb.push(column);
        }

        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;
    }

    function updateDataAndDraw() {
        updateData();
    }

    graph = document.querySelector("#graph1");
    var fps_display = document.querySelector("#fps");

    function updateDataAndRAF() {
        updateDataAndDraw();
        fps_display.update(plots * samples);
        window.requestAnimationFrame(updateDataAndRAF);
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
