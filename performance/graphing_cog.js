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
    var bigCogInteriorSamplesBuffer = {x:[], y:[]};
    var bigCogExteriorSamplesBuffer = {x:[], y:[]};
    var externalCogInteriorSamplesBuffer = {x:[], y:[]};
    var externalCogExteriorSamplesBuffer = {x:[], y:[]};

    var smallCog1_InteriorSamplesBuffer = {x:[], y:[]};
    var smallCog1_ExteriorSamplesBuffer = {x:[], y:[]};
    var smallCog2_InteriorSamplesBuffer = {x:[], y:[]};
    var smallCog2_ExteriorSamplesBuffer = {x:[], y:[]};
    var smallCog3_InteriorSamplesBuffer = {x:[], y:[]};
    var smallCog3_ExteriorSamplesBuffer = {x:[], y:[]};
    var smallCog4_InteriorSamplesBuffer = {x:[], y:[]};
    var smallCog4_ExteriorSamplesBuffer = {x:[], y:[]};

    var spiral1_SampleBuffer = {x:[], y:[]};
    var spiral2_SampleBuffer = {x:[], y:[]};
    var spiral3_SampleBuffer = {x:[], y:[]};

    //Properties for cog with spirals
    var cog1_MovementProperties = {
        XOffset: 0.5,
        YOffset: 1.7,
        XDir: true,
        YDir: true
    }

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

            interiorSamplesArray.x[i] = Math.sin(angle) * interiorScale + xOffset;
            interiorSamplesArray.y[i] = Math.cos(angle) * interiorScale + yOffset;

            exteriorSamplesArray.x[i] = Math.sin(angle) * exteriorScale + xOffset;
            exteriorSamplesArray.y[i] = Math.cos(angle) * exteriorScale + yOffset;
        }
    }


    function generateSpiralPoints(spiralSamplesArray, totalSamples, movementOffset, phase, xOffset, yOffset, angleScale, velocityScale, spiralScale) {
        var angle = 0;
        for (var i = 0; i <= totalSamples; i++) {
            angle = ((i + phase) * 2 + movementOffset) * angleScale * velocityScale;

            spiralSamplesArray.x[i] = Math.sin(angle) * i / spiralScale + xOffset;
            spiralSamplesArray.y[i] = Math.cos(angle) * i / spiralScale + yOffset;
        }
    }


    function updatePlotBufferForCogs(thePlotBufferArray, interiorSamplesArray, exteriorSamplesArray, totalSamples, plotIndexInBuffer) {
        for (var i = 0; i <= totalSamples; i++) {
            thePlotBufferArray[plotIndexInBuffer][i] = {};
            if ((i & 1) === 0) {
                thePlotBufferArray[plotIndexInBuffer][i].x = interiorSamplesArray.x[i];
                thePlotBufferArray[plotIndexInBuffer][i].y = interiorSamplesArray.y[i];
            } else {
                thePlotBufferArray[plotIndexInBuffer][i].x = exteriorSamplesArray.x[i];
                thePlotBufferArray[plotIndexInBuffer][i].y = exteriorSamplesArray.y[i];
            }
        }
    }


    function updatePlotBufferForSpirals(thePlotBufferArray, SamplesArray, totalSamples, plotIndexInBuffer) {
        for (var i = 0; i <= totalSamples; i++) {
            thePlotBufferArray[plotIndexInBuffer][i] = {};
            thePlotBufferArray[plotIndexInBuffer][i].x = SamplesArray.x[i];
            thePlotBufferArray[plotIndexInBuffer][i].y = SamplesArray.y[i];
        }
    }


    function updateBufferForFirstGraph(plotBuffer, cogXOffset, cogYOffset) {
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
        generateCogPoints(bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, globalIndex_div, cogXOffset, cogYOffset, angleScale, velocityScale, interiorScale, exteriorScale);

        //spirals
        velocityScale = 1;
        generateSpiralPoints(spiral1_SampleBuffer, isamples, globalIndex, 0,                cogXOffset, cogYOffset, angleScale, velocityScale, isamples * 1.1);
        generateSpiralPoints(spiral2_SampleBuffer, isamples, globalIndex, isamples / 3,     cogXOffset, cogYOffset, angleScale, velocityScale, isamples * 1.1);
        generateSpiralPoints(spiral3_SampleBuffer, isamples, globalIndex, isamples * 2 / 3, cogXOffset, cogYOffset, angleScale, velocityScale, isamples * 1.1);

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

        //right cog
        generateCogPoints(smallCog1_InteriorSamplesBuffer, smallCog1_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div + 0.0333333 * 6, 1.38, 0.0333333 / 2,  angleScale, velocityScale, interiorScale, exteriorScale);

        //up cog
        generateCogPoints(smallCog2_InteriorSamplesBuffer, smallCog2_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div, 0,    1.38,       angleScale, velocityScale, interiorScale, exteriorScale);

        //left cog
        generateCogPoints(smallCog3_InteriorSamplesBuffer, smallCog3_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div - 0.0333333 * 6, -1.38, 0.0333333 / 2, angleScale, velocityScale, interiorScale, exteriorScale);

        //down cog
        generateCogPoints(smallCog4_InteriorSamplesBuffer, smallCog4_ExteriorSamplesBuffer, isamples / 3 + 2, -globalIndex_div + 0.0333333 * 12, 0.0333333,    -1.38,      angleScale, velocityScale, interiorScale, exteriorScale);

        //external cog
        interiorScale = 0.97 * 1.77;
        exteriorScale = 1.03 * 1.77;
        velocityScale = 0.5;
        generateCogPoints(externalCogInteriorSamplesBuffer, externalCogExteriorSamplesBuffer, isamples * 3, -globalIndex_div, 0, 0, angleScale * 2, velocityScale / 1.5, interiorScale, exteriorScale);


        //Update global buffer with samples from cogs and spirals buffers
        //big cog
        updatePlotBufferForCogs(plotBuffer, bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, 0);

        //small cogs
        updatePlotBufferForCogs(plotBuffer, smallCog1_InteriorSamplesBuffer, smallCog1_ExteriorSamplesBuffer, isamples / 3 - 3, 1);
        updatePlotBufferForCogs(plotBuffer, smallCog2_InteriorSamplesBuffer, smallCog2_ExteriorSamplesBuffer, isamples / 3 - 3, 2);
        updatePlotBufferForCogs(plotBuffer, smallCog3_InteriorSamplesBuffer, smallCog3_ExteriorSamplesBuffer, isamples / 3 - 3, 3);
        updatePlotBufferForCogs(plotBuffer, smallCog4_InteriorSamplesBuffer, smallCog4_ExteriorSamplesBuffer, isamples / 3 - 3, 4);

        //external cog
        updatePlotBufferForCogs(plotBuffer, externalCogInteriorSamplesBuffer, externalCogExteriorSamplesBuffer, isamples * 3, 5);
    }


    function booleanToDir(aBool, increment)
    {
        if (aBool === true) {
            return increment
        } else {
            return -increment
        }

    }

    function computeCog1_Dirs(cogMovementProperties) {
        cogMovementProperties.XOffset = cogMovementProperties.XOffset + booleanToDir(cogMovementProperties.XDir, 0.03);
        cogMovementProperties.YOffset = cogMovementProperties.YOffset + booleanToDir(cogMovementProperties.YDir, 0.01);

        if ((cogMovementProperties.XOffset >= 3) || (cogMovementProperties.XOffset <= -3)) {
            cogMovementProperties.XDir = !cogMovementProperties.XDir;
        }

        if ((cogMovementProperties.YOffset >= 3) || (cogMovementProperties.YOffset <= -3)) {
            cogMovementProperties.YDir = !cogMovementProperties.YDir;
        }
    }


    function updateDataAndDraw() {
        updateBufferForFirstGraph(plotBuffer1, cog1_MovementProperties.XOffset, cog1_MovementProperties.YOffset);
        updateBufferForSecondGraph(plotBuffer2);

        computeCog1_Dirs(cog1_MovementProperties);

        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;

        graph.setData(plotBuffer1);
        graph2.setData(plotBuffer2);
    }

    updateBufferForFirstGraph(plotBuffer1, cog1_MovementProperties.XOffset, cog1_MovementProperties.YOffset);
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
