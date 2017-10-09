/*jshint browser: true*/

(function () {
    'use strict';
    var graph;
    var graph2;
    var globalIndex = 0;

    var plots = 1;
    var samples = 100000;
    var isamples = 100;
    //var buffer = [];
    var buffer = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var plotBuffer1 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var plotBuffer2 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var buffer1 = {a:[], b:[]};
    var buffer2 = {a:[], b:[]};
    var buffer3 = {a:[], b:[]};
    var buffer4 = {a:[], b:[]};
    var buffer5 = {a:[], b:[]};
    var buffer6 = {a:[], b:[]};
    var buffer7 = {a:[], b:[]};
    var buffer8 = {a:[], b:[]};
    var buffer9 = {a:[], b:[]};
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


    function generateCogPoints(interiorSamplesArray, exteriorSamplesArray, totalSamples, movementOffset, xOffset, yOffset, angleScale, velocityScale, interiorScale, exteriorScale) {
        var angle = 0;
        for (var i = 0; i <= totalSamples; i++) {
            angle = (i + movementOffset) * angleScale * velocityScale;

            interiorSamplesArray.a[i] = Math.sin(angle) * interiorScale + xOffset;
            interiorSamplesArray.b[i] = Math.cos(angle) * interiorScale + yOffset;

            exteriorSamplesArray.a[i] = Math.sin(angle) * exteriorScale + xOffset;
            exteriorSamplesArray.b[i] = Math.cos(angle) * exteriorScale + yOffset;
        }
    }


    function generateSpiralPoints(spiralSamplesArray, totalSamples, movementOffset, phase, xOffset, yOffset, angleScale, velocityScale, spiralScale) {
        var angle = 0;
        for (var i = 0; i <= totalSamples; i++) {
            angle = ((i + phase) * 2 + movementOffset) * angleScale * velocityScale;

            spiralSamplesArray.a[i] = Math.sin(angle) * i / spiralScale + xOffset;
            spiralSamplesArray.b[i] = Math.cos(angle) * i / spiralScale + yOffset;
        }
    }


    function updatePlotBufferForCogs(thePlotBufferArray, interiorSamplesArray, exteriorSamplesArray, totalSamples, plotIndexInBuffer) {
        for (var i = 0; i <= totalSamples; i++) {
            thePlotBufferArray[plotIndexInBuffer][i] = {};
            if (i % 2 === 0) {
                thePlotBufferArray[plotIndexInBuffer][i].x = interiorSamplesArray.a[i];
                thePlotBufferArray[plotIndexInBuffer][i].y = interiorSamplesArray.b[i];
            } else {
                thePlotBufferArray[plotIndexInBuffer][i].x = exteriorSamplesArray.a[i];
                thePlotBufferArray[plotIndexInBuffer][i].y = exteriorSamplesArray.b[i];
            }
        }
    }


    function updatePlotBufferForSpirals(thePlotBufferArray, SamplesArray, totalSamples, plotIndexInBuffer) {
        for (var i = 0; i <= totalSamples; i++) {
            thePlotBufferArray[plotIndexInBuffer][i] = {};
            thePlotBufferArray[plotIndexInBuffer][i].x = SamplesArray.a[i];
            thePlotBufferArray[plotIndexInBuffer][i].y = SamplesArray.b[i];
        }
    }


    function updateCircle(plotBuffer) {
        var globalIndex_div = globalIndex / 10;
        var interiorScale;
        var exteriorScale;
        var angleScale = 2 * Math.PI / isamples;
        var velocityScale;

        //Generate samples for cogs and spirals
        //big cog
        interiorScale = 0.95;
        exteriorScale = 1.05;
        velocityScale = 1;
        generateCogPoints(buffer1, buffer2, isamples, globalIndex_div, 0, 0, angleScale, velocityScale, interiorScale, exteriorScale);

        //small cogs
        interiorScale = 0.95 * 0.333333 / 1.12;
        exteriorScale = 1.05 * 0.333333 * 1.12;
        velocityScale = 3.333333;
        generateCogPoints(buffer3, buffer4, isamples / 3 + 2, -globalIndex_div, 1.38, 0.0333333, angleScale, velocityScale, interiorScale, exteriorScale);
        generateCogPoints(buffer5, buffer6, isamples / 3 + 2, -globalIndex_div, 0,    1.38,      angleScale, velocityScale, interiorScale, exteriorScale);

        //spirals
        velocityScale = 1;
        generateSpiralPoints(buffer7, isamples, globalIndex, 0,                0, 0, angleScale, velocityScale, isamples * 1.1);
        generateSpiralPoints(buffer8, isamples, globalIndex, isamples / 3,     0, 0, angleScale, velocityScale, isamples * 1.1);
        generateSpiralPoints(buffer9, isamples, globalIndex, isamples * 2 / 3, 0, 0, angleScale, velocityScale, isamples * 1.1);

        //Update global buffer with samples from cogs and spirals buffers
        //big cog
        updatePlotBufferForCogs(plotBuffer, buffer1, buffer2, isamples, 0);

        //small cogs
        updatePlotBufferForCogs(plotBuffer, buffer3, buffer4, isamples / 3 - 3, 1);
        updatePlotBufferForCogs(plotBuffer, buffer5, buffer6, isamples / 3 - 3, 2);

        //spirals
        updatePlotBufferForSpirals(plotBuffer, buffer7, isamples, 3);
        updatePlotBufferForSpirals(plotBuffer, buffer8, isamples, 4);
        updatePlotBufferForSpirals(plotBuffer, buffer9, isamples, 5);

        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;
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
                //buffer[j][(i + j * 4000) % samples] = initbuffer[0][iindex];
                //buffer[j][(i + j * 4000) % samples] += offset;     // trying hard to prvent numbers to be allocated on the heap;

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
        updateCircle(plotBuffer1);
        updateCircle(plotBuffer2);
        graph.setData(plotBuffer1);
        graph2.setData(plotBuffer2);
    }

    updateCircle(plotBuffer1);
    updateCircle(plotBuffer2);

    graph = document.querySelector("#graph1");
    graph2 = document.querySelector("#graph2");
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

    if (graph.isReady) {
        window.requestAnimationFrame(updateDataAndRAF);
    } else {
        graph.onReady = function() {
            window.requestAnimationFrame(updateDataAndRAF);
        };
    }

})();
