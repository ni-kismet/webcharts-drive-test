/*jshint browser: true*/

(function () {
    'use strict';
    const cBigCog3X = -2.5;
    const cBigCog3Y = 0;
    const cSmallCog3X = 3.5;
    const cSmallCog3Y = 0;

    var graph;
    var graph2;
    var graph3;
    var globalIndex = 0;

    var plots = 1;
    var samples = 100000;
    var isamples = 100;
    var plotBuffer1 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var plotBuffer2 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];
    var plotBuffer3 = [[{x:0, y:0}],[{x:0, y:0}],[{x:0, y:0}]];

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

    var chainSampleBuffer = {x:[], y:[]}

    //Properties for cog with spirals
    var cog1_MovementProperties = {
        XOffset: 0.5,
        YOffset: 1.7,
        XDir: true,
        YDir: true
    }

    //boundaries of cogs with chain
    const cBigCog3_Radius = 1;
    const cSmallCog3_Radius = 0.333333;
    
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


    function generateChainPinPoints(pinsSamplesArray, movementOffset, loc1_Pins, loc2_Pins, loc3_Pins, loc4_Pins, bigCogXOffset, smallCogXOffset, angleScale, bigCogVelocityScale, smallCogVelocityScale, bigCogScale, smallCogScale) {
        var angle = 0;
        //section 1:
        for (var i = 0; i < loc1_Pins; i++) {
            angle = (i + movementOffset) * angleScale * bigCogVelocityScale;

            pinsSamplesArray.x[i] = Math.sin(angle) * bigCogVelocityScale + bigCogXOffset;
            pinsSamplesArray.y[i] = Math.cos(angle) * bigCogVelocityScale + 0;
        }

        //section 2:
        for (var i = loc1_Pins; i < loc1_Pins + loc2_Pins; i++) {
            angle = (i + movementOffset) * angleScale * bigCogVelocityScale;

            pinsSamplesArray.x[i] = angle * bigCogVelocityScale + bigCogXOffset;
            pinsSamplesArray.y[i] = -angle / 8.4 * bigCogVelocityScale + 1.004;
        }

        //section 3:
        for (var i = loc1_Pins + loc2_Pins; i < loc1_Pins + loc2_Pins + loc3_Pins; i++) {
            angle = (i + movementOffset + 12.3) * angleScale * smallCogVelocityScale;

            pinsSamplesArray.x[i] = Math.sin(angle) * smallCogVelocityScale / 10.5 + smallCogXOffset;
            pinsSamplesArray.y[i] = Math.cos(angle) * smallCogVelocityScale / 10.5 - 0.01;
        }

        //section 4:
        for (var i = loc1_Pins + loc2_Pins + loc3_Pins; i < loc1_Pins + loc2_Pins + loc3_Pins + loc4_Pins - 1; i++) {
            angle = (i + movementOffset) * angleScale * bigCogVelocityScale;

            pinsSamplesArray.x[i] = -angle * bigCogVelocityScale + 3 * smallCogXOffset - 0.05;
            pinsSamplesArray.y[i] = 0.43 - angle / 9 * bigCogVelocityScale;
        }

        //section 4-1 (one link):
        var i = loc1_Pins + loc2_Pins + loc3_Pins + loc4_Pins - 1;
        angle = (0 + movementOffset) * angleScale * bigCogVelocityScale;
        pinsSamplesArray.x[i] = Math.sin(angle) * bigCogVelocityScale + bigCogXOffset;
        pinsSamplesArray.y[i] = Math.cos(angle) * bigCogVelocityScale + 0;
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


    function updatePlotBufferForChain(thePlotBufferArray, SamplesArray, totalSamples, plotIndexInBuffer) {
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

        //Generate samples for cogs
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


    function updateBufferForThirdGraph(plotBuffer) {
        var globalIndex_div = globalIndex / 10;
        var globalIndexChain_div = globalIndex % 20 / 20;
        var interiorScale;
        var exteriorScale;
        var angleScale = 2 * Math.PI / isamples;
        var velocityScale;

        //Generate samples for cogs
        //big cog
        interiorScale = 0.95;
        exteriorScale = 1.05;
        velocityScale = 1;
        generateCogPoints(bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, globalIndex_div, cBigCog3X, 0, angleScale, velocityScale, interiorScale, exteriorScale);

        //small cog
        interiorScale = 0.95 * 0.333333 / 1.12;
        exteriorScale = 1.05 * 0.333333 * 1.12;
        velocityScale = 3.333333;

        //right cog
        generateCogPoints(smallCog1_InteriorSamplesBuffer, smallCog1_ExteriorSamplesBuffer, isamples / 3 + 2, globalIndex_div + 0.5, cSmallCog3X - 0.01, -0.01,  angleScale, velocityScale, interiorScale, exteriorScale);

        //chain
        generateChainPinPoints(chainSampleBuffer, globalIndexChain_div - 25, 25, 47, 8, 49, cBigCog3X, cSmallCog3X, angleScale * 2, 1, 3.333333, cBigCog3_Radius, cSmallCog3_Radius);

        //Update global buffer with samples from cogs and spirals buffers
        //big cog
        updatePlotBufferForCogs(plotBuffer, bigCogInteriorSamplesBuffer, bigCogExteriorSamplesBuffer, isamples, 0);

        //small cogs
        updatePlotBufferForCogs(plotBuffer, smallCog1_InteriorSamplesBuffer, smallCog1_ExteriorSamplesBuffer, isamples / 3 - 3, 1);

        //chain
        updatePlotBufferForChain(plotBuffer, chainSampleBuffer, 25 + 47 + 8 + 49, 2);
    }


    function booleanToDir(aBool, increment)
    {
        if (aBool) {
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
        updateBufferForThirdGraph(plotBuffer3, 0, 0);

        computeCog1_Dirs(cog1_MovementProperties);

        globalIndex += (isamples/60) | 0;
        globalIndex %= isamples;

        graph.setData(plotBuffer1);
        graph2.setData(plotBuffer2);
        graph3.setData(plotBuffer3);
    }

    updateBufferForFirstGraph(plotBuffer1, cog1_MovementProperties.XOffset, cog1_MovementProperties.YOffset);
    updateBufferForSecondGraph(plotBuffer2);
    updateBufferForThirdGraph(plotBuffer3, 0, 0);

    graph = document.querySelector("#graph1");
    graph2 = document.querySelector("#graph2");
    graph3 = document.querySelector("#graph3");
    var fps_display = document.querySelector("#fps");

    function updateDataAndRAF() {
        window.requestAnimationFrame(updateDataAndRAF);
        updateDataAndDraw();
        fps_display.update(plots * samples);
    };


    if (graph.isReady) {
        window.requestAnimationFrame(updateDataAndRAF);
    } else {
        graph.onReady = function() {
            window.requestAnimationFrame(updateDataAndRAF);
        };
    }

})();
