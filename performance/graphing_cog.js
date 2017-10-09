/*jshint browser: true*/

(function () {
    'use strict';
    var graph;
    var graph2;
    var globalIndex = 0;

    var plots = 1;
    var samples = 100000;
    var isamples = 100;
    var plotBuffer1 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var plotBuffer2 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var bigCogInteriorSamplesBuffer = {a:[], b:[]};
    var bigCogExteriorSamplesBuffer = {a:[], b:[]};
    var externalCogInteriorSamplesBuffer = {a:[], b:[]};
    var externalCogExteriorSamplesBuffer = {a:[], b:[]};

    var smallCog1_InteriorSamplesBuffer = {a:[], b:[]};
    var smallCog1_ExteriorSamplesBuffer = {a:[], b:[]};
    var smallCog2_InteriorSamplesBuffer = {a:[], b:[]};
    var smallCog2_ExteriorSamplesBuffer = {a:[], b:[]};
    var smallCog3_InteriorSamplesBuffer = {a:[], b:[]};
    var smallCog3_ExteriorSamplesBuffer = {a:[], b:[]};
    var smallCog4_InteriorSamplesBuffer = {a:[], b:[]};
    var smallCog4_ExteriorSamplesBuffer = {a:[], b:[]};

    var spiral1_SampleBuffer = {a:[], b:[]};
    var spiral2_SampleBuffer = {a:[], b:[]};
    var spiral3_SampleBuffer = {a:[], b:[]};

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
            if ((i & 1) === 0) {
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


    function updateBufferForFirstGraph(plotBuffer) {
        var globalIndex_div = globalIndex / 10;
        var interiorScale;
        var exteriorScale;
        var angleScale = 2 * Math.PI / isamples;
        var velocityScale;

        //Generate samples for cog and spirals
        //big cog
        interiorScale = 0.95;
        exteriorScale = 1.05;
        velocityScale = 1;
        generateCogPoints(bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, globalIndex_div, 0, 0, angleScale, velocityScale, interiorScale, exteriorScale);

        //spirals
        velocityScale = 1;
        generateSpiralPoints(spiral1_SampleBuffer, isamples, globalIndex, 0,                0, 0, angleScale, velocityScale, isamples * 1.1);
        generateSpiralPoints(spiral2_SampleBuffer, isamples, globalIndex, isamples / 3,     0, 0, angleScale, velocityScale, isamples * 1.1);
        generateSpiralPoints(spiral3_SampleBuffer, isamples, globalIndex, isamples * 2 / 3, 0, 0, angleScale, velocityScale, isamples * 1.1);

        //Update global buffer with samples from cogs and spirals buffers
        //big cog
        updatePlotBufferForCogs(plotBuffer, bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, 0);

        //spirals
        updatePlotBufferForSpirals(plotBuffer, spiral1_SampleBuffer, isamples, 1);
        updatePlotBufferForSpirals(plotBuffer, spiral2_SampleBuffer, isamples, 2);
        updatePlotBufferForSpirals(plotBuffer, spiral3_SampleBuffer, isamples, 3);
    }


    function updateBufferForSecondGraph(plotBuffer) {
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
        generateCogPoints(bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, globalIndex_div, 0, 0, angleScale, velocityScale, interiorScale, exteriorScale);

        //small cogs
        interiorScale = 0.95 * 0.333333 / 1.12;
        exteriorScale = 1.05 * 0.333333 * 1.12;
        velocityScale = 3.333333;
        generateCogPoints(smallCog1_InteriorSamplesBuffer, smallCog1_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div, 1.38, 0.0333333,  angleScale, velocityScale, interiorScale, exteriorScale);
        generateCogPoints(smallCog2_InteriorSamplesBuffer, smallCog2_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div, 0,    1.38,       angleScale, velocityScale, interiorScale, exteriorScale);
        generateCogPoints(smallCog3_InteriorSamplesBuffer, smallCog3_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div, -1.38, 0.0333333, angleScale, velocityScale, interiorScale, exteriorScale);
        generateCogPoints(smallCog4_InteriorSamplesBuffer, smallCog4_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div, 0.0333333 * 2,    -1.38,      angleScale, velocityScale, interiorScale, exteriorScale);

        //external cog
        interiorScale = 0.97 * 1.77;
        exteriorScale = 1.03 * 1.77;
        velocityScale = 0.5;
        generateCogPoints(externalCogInteriorSamplesBuffer, externalCogExteriorSamplesBuffer, isamples * 2, -globalIndex_div, 0, 0, angleScale * 4, velocityScale / 2, interiorScale, exteriorScale);


        //Update global buffer with samples from cogs and spirals buffers
        //big cog
        updatePlotBufferForCogs(plotBuffer, bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, 0);

        //small cogs
        updatePlotBufferForCogs(plotBuffer, smallCog1_InteriorSamplesBuffer, smallCog1_ExteriorSamplesBuffer, isamples / 3 - 3, 1);
        updatePlotBufferForCogs(plotBuffer, smallCog2_InteriorSamplesBuffer, smallCog2_ExteriorSamplesBuffer, isamples / 3 - 3, 2);
        updatePlotBufferForCogs(plotBuffer, smallCog3_InteriorSamplesBuffer, smallCog3_ExteriorSamplesBuffer, isamples / 3 - 3, 3);
        updatePlotBufferForCogs(plotBuffer, smallCog4_InteriorSamplesBuffer, smallCog4_ExteriorSamplesBuffer, isamples / 3 - 3, 4);

        //external cog
        updatePlotBufferForCogs(plotBuffer, externalCogInteriorSamplesBuffer, externalCogExteriorSamplesBuffer, isamples * 2, 5);
    }


    function updateDataAndDraw() {
        updateBufferForFirstGraph(plotBuffer1);
        updateBufferForSecondGraph(plotBuffer2);

        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;

        graph.setData(plotBuffer1);
        graph2.setData(plotBuffer2);
    }

    updateBufferForFirstGraph(plotBuffer1);
    updateBufferForSecondGraph(plotBuffer2);

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
