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
    var initbuffer = [[]];

    var initBuffer = function () {
        if (buffer.length !== plots) {
            buffer.length = 0;
            for (var i=0; i < plots; i++) {
                buffer[i] = [];
            }
        }
    }

    for (var i = 0; i < isamples; i++) {
        initbuffer[0][i] = i%(isamples);
    }


    // update data reuses the same buffer, so no memory is allocated here, except the first time when it runs
    function updateData() {
        var offset;
        var iindex;
        plots = Number(document.querySelector('input[name="plots"]:checked').value);
        samples = Number(document.querySelector('input[name="samples"]:checked').value);

        initBuffer();

        for (var j=0 ; j < plots; j++) {
            offset = j * isamples;
            iindex = globalIndex;
            for (var i = 0; i < samples; i++, iindex++) {
                if (iindex > isamples -1) {
                    iindex = 0;
                }
                buffer[j][i] = initbuffer[0][iindex];
                buffer[j][i] += offset;     // trying hard to prvent numbers to be allocated on the heap;
            }
            if (buffer[j].length !== samples) {
                buffer[j].length = samples;
            }
        }

        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;
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
        fps_display.update(plots * samples);
    };

    function setAutoscale(state) {
        var axes = [].slice.call(graph.querySelectorAll('ni-cartesian-axis'));

        var av= axes.map(function (axis) {
            var fa = axis.getFlotAxis();
            return {minimum: fa.datamin, maximum: fa.datamax};
        });

        axes.forEach(function (axis, i) {
            if (!state) {
                var fa = axis.getFlotAxis();
                axis.minimum = av[i].minimum;
                axis.maximum = av[i].maximum;
                axis.autoScale = 'none';
            } else {
                axis.autoScale = 'exact';
            }
        });
    }

    var autoscale_form = document.querySelector('#autoscale_form');
    var rad = autoscale_form.querySelectorAll('input[name="autoscale"]');
    var onClick = function() {
        setAutoscale(this.value === '1');
    };

    for(var i = 0; i < rad.length; i++) {
        rad[i].onclick = onClick;
    }

    var pointshape_form = document.querySelector('#pointshape_form');
    if (pointshape_form) {
        var ps = pointshape_form.querySelectorAll('input[name="pointshape"]');
        for (var i = 0; i < ps.length; i++) {
            ps[i].onclick = function() {
                var renderers = document.querySelectorAll('ni-cartesian-plot-renderer');
                for (var j = 0; j < renderers.length; j ++) {
                    renderers[j].pointShape = this.value;
                }
            };
        }
    }

    var domReady = function (readyCallback) {
        if (window.HTMLImports && window.HTMLImports.whenReady) {
            HTMLImports.whenReady(readyCallback);
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', readyCallback);
        } else {
            readyCallback();
        }
    };

    domReady( function () {
        NationalInstruments.HtmlVI.Elements.NIElement.addNIEventListener('attached', function () {
            window.requestAnimationFrame(updateDataAndRAF);
        });
    });
})();
