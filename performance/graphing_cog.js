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

    function updateCircle(plotBuffer) {
        var globalIndex_div = globalIndex / 10;
        var globalIndex2_div = globalIndex / 3.333333;
        var isamples_div2 = isamples / 2;
        var isamples_div3 = isamples / 3;
        var isamples_div23 = isamples * 2 / 3;
        var angle = 0;
        var angle1 = 0;
        var angle2 = 0;
        var angle3 = 0;
        var scale1;
        var scale2;
        var angleScale = 2 * Math.PI / isamples;
        var smallCogOffset = 1.38;

        scale1 = 0.95;
        scale2 = 1.05;
        for (var i = 0; i <= isamples; i++) {
            angle = (i + globalIndex_div) * angleScale;

            buffer1.a[i] = Math.sin(angle) * scale1;
            buffer1.b[i] = Math.cos(angle) * scale1;

            buffer2.a[i] = Math.sin(angle) * scale2;
            buffer2.b[i] = Math.cos(angle) * scale2;
        }

        scale1 = 0.95 * 0.333333 / 1.12;
        scale2 = 1.05 * 0.333333 * 1.12;
        for (var i = 0; i <= isamples / 3 + 2; i++) {
            angle = (i - globalIndex_div) * angleScale * 3.333333;
            buffer3.a[i] = Math.sin(angle) * scale1 + smallCogOffset;
            buffer3.b[i] = Math.cos(angle) * scale1 + 0.0333333;

            buffer4.a[i] = Math.sin(angle) * scale2 + smallCogOffset;
            buffer4.b[i] = Math.cos(angle) * scale2 + 0.0333333;

            buffer5.a[i] = Math.sin(angle) * scale1;
            buffer5.b[i] = Math.cos(angle) * scale1 + smallCogOffset;

            buffer6.a[i] = Math.sin(angle) * scale2;
            buffer6.b[i] = Math.cos(angle) * scale2 + smallCogOffset;
        }

        //spirals
        scale1 = isamples * 1.1;
        for (var i = 0; i <= isamples; i++) {
            angle1 = (i * 2 + globalIndex) * angleScale;
            angle2 = ((i + isamples_div3) * 2 + globalIndex) * angleScale;
            angle3 = ((i + isamples_div23) * 2 + globalIndex) * angleScale;

            buffer7.a[i] = Math.sin(angle1) * i / scale1;
            buffer7.b[i] = Math.cos(angle1) * i / scale1;

            buffer8.a[i] = Math.sin(angle2) * i / scale1;
            buffer8.b[i] = Math.cos(angle2) * i / scale1;

            buffer9.a[i] = Math.sin(angle3) * i / scale1;
            buffer9.b[i] = Math.cos(angle3) * i / scale1;
        }


        for (var i = 0; i <= isamples; i++) {
            plotBuffer[0][i] = {};
            if (i % 2 === 0) {
                plotBuffer[0][i].x = buffer1.a[i];
                plotBuffer[0][i].y = buffer1.b[i];
            } else {
                plotBuffer[0][i].x = buffer2.a[i];
                plotBuffer[0][i].y = buffer2.b[i];
            }
        }

        for (var i = 0; i <= isamples / 3 - 3; i++) {
            plotBuffer[1][i] = {};
            plotBuffer[2][i] = {};
            if (i % 2 === 0) {
                plotBuffer[1][i].x = buffer3.a[i];
                plotBuffer[1][i].y = buffer3.b[i];
                plotBuffer[2][i].x = buffer5.a[i];
                plotBuffer[2][i].y = buffer5.b[i];
            } else {
                plotBuffer[1][i].x = buffer4.a[i];
                plotBuffer[1][i].y = buffer4.b[i];
                plotBuffer[2][i].x = buffer6.a[i];
                plotBuffer[2][i].y = buffer6.b[i];
            }
        }

        //spirals
        for (var i = 0; i <= isamples; i++) {
            plotBuffer[3][i] = {};
            plotBuffer[4][i] = {};
            plotBuffer[5][i] = {};

            plotBuffer[3][i].x = buffer7.a[i];
            plotBuffer[3][i].y = buffer7.b[i];
            plotBuffer[4][i].x = buffer8.a[i];
            plotBuffer[4][i].y = buffer8.b[i];
            plotBuffer[5][i].x = buffer9.a[i];
            plotBuffer[5][i].y = buffer9.b[i];
        }

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
