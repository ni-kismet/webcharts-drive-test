/* * The MIT License
Copyright (c) 2010, 2011, 2012, 2013 by Juergen Marsch
Copyright (c) 2015 by Andrew Dove & Ciprian Ceteras
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function (global, $) {
// Static Public Variables
IntensityGraph.ColorscaleType = 'colorScale';

var drawLegend = function(ctx, x, y, w, h, gradient, lowColor, highColor) {
    var highLowColorBoxHeight = 7,
      grad = ctx.createLinearGradient(0, y + h, 0, y),
      first = gradient[0].value, last = gradient[gradient.length - 1].value, offset, i;
    for (i = 0; i < gradient.length; i++) {
        offset = (gradient[i].value - first) / (last - first);
        if (offset >= 0 && offset <= 1.0) {
            grad.addColorStop(offset, gradient[i].color);
        }
    }

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = lowColor;
    ctx.fillRect(x, y + h, w, highLowColorBoxHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y + h + 0.5, w + 1, highLowColorBoxHeight);
    ctx.fillStyle = highColor;
    ctx.fillRect(x, y - highLowColorBoxHeight, w, highLowColorBoxHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - highLowColorBoxHeight + 0.5, w + 1, highLowColorBoxHeight);
};

function isColorScale(axis) {
    return axis.options.type === IntensityGraph.ColorscaleType;
}

function IntensityGraph() {
    this.pluginName = 'intensitygraph';
    this.pluginVersion = '0.2';
    this.defaultOptions = {
        series: {
            intensitygraph: {
                data: [],
                show: false,
                lowColor: 'rgba(0,0,0,1)',
                highColor: 'rgba(255,255,255,1)',
                min: 0,
                max: 1
            }
        }
    };

    var defaultGradient = [
        { value: 0, color: '#3182bd' },
        { value: 0.50, color: '#9ecae1' },
        { value: 1.0, color: '#deebf7' }
    ];
    var defaultBoxPosition = { centerX: 20, centerY: 0 };

    function extendEmpty(org, ext) {
        for (var i in ext) {
            if (!org[i]) {
                org[i] = ext[i];
            } else {
                if (typeof ext[i] === 'object') {
                    extendEmpty(org[i], ext[i]);
                }
            }
        }
    };

    function processRawData(plot, s, sData, sDatapoints) {
        var opts = plot.getOptions();
        if (opts.series.intensitygraph.show === true && sData[0].length > 0) {
            sDatapoints.pointsize = 2;

            // push two data points, one with xmin, ymin, the other one with xmax, ymax
            // so the autoscale algorithms can determine the draw size.
            sDatapoints.points.length = 0;
            sDatapoints.points.push(0, 0);
            sDatapoints.points.push(sData.length || 0, sData[0] ? sData[0].length : 0);
        }

        // TODO reserve enough space so the map is not drawn outside of the chart.
    }

    this.init = function(plot) {
        var opt = null,
            offset = '7',
            acanvas = null,
            series = null,
            tempCanvas, tempImageData;
        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            if (options.series.intensitygraph.show) {
                extendEmpty(options, this.defaultOptions);
                if (!options.series.intensitygraph.gradient) {
                    options.series.intensitygraph.gradient = defaultGradient;
                }

                var yaxes = plot.getYAxes(),
                    colorScaleAxis = yaxes.filter(function (axis) { return IntensityGraph.prototype.isColorScale(axis); })[0];
                if (colorScaleAxis && (!colorScaleAxis.boxPosition || colorScaleAxis.boxPosition.centerX === 0)) {
                    colorScaleAxis.boxPosition = defaultBoxPosition;
                }
                opt = options;
                plot.hooks.drawSeries.push(drawSeries);
                plot.hooks.processRawData.push(processRawData);

                // caching all the colors of the gradient, min and max in one place
                options.series.intensitygraph.palette = initColorPalette(options);
            }
        };

        function initColorPalette(opt) {
            var i, x,
                canvas = document.createElement('canvas');
            canvas.width = '1';
            canvas.height = '256';
            var ctx = canvas.getContext('2d'),
                grad = ctx.createLinearGradient(0, 0, 0, 256),
                gradient = opt.series.intensitygraph.gradient,
                first = gradient[0].value, last = gradient[gradient.length - 1].value, offset;

            if (last === first) {
                grad.addColorStop(0, gradient[0].color);
                grad.addColorStop(1, gradient[0].color);
            } else {
                for (i = 0; i < gradient.length; i++) {
                    x = gradient[i].value;
                    offset = (x - first) / (last - first);
                    if (offset >= 0 && offset <= 1) {
                        grad.addColorStop(offset, gradient[i].color);
                    }
                }
            }

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1, 256);
            var palette = [],
                imgDataPalette = ctx.getImageData(0, 0, 1, 256).data;
            for (i = 0; i < imgDataPalette.length; i++) {
                palette[i] = imgDataPalette[i];
            }

            var colorStr, colorArr,
                colorLow = opt.series.intensitygraph.lowColor,
                colorHigh = opt.series.intensitygraph.highColor;

            colorStr = colorLow.slice(colorLow.indexOf('(') + 1, colorLow.indexOf(')'));
            colorArr = colorStr.split(',');
            palette.push(parseInt(colorArr[0], 10));
            palette.push(parseInt(colorArr[1], 10));
            palette.push(parseInt(colorArr[2], 10));
            palette.push(parseFloat(colorArr[3]) * 255);

            colorStr = colorHigh.slice(colorHigh.indexOf('(') + 1, colorHigh.indexOf(')'));
            colorArr = colorStr.split(',');
            palette.push(parseInt(colorArr[0], 10));
            palette.push(parseInt(colorArr[1], 10));
            palette.push(parseInt(colorArr[2], 10));
            palette.push(parseFloat(colorArr[3]) * 255);

            return palette;
        };

        function drawSeries(plot, ctx, serie) {
            var offset = plot.getPlotOffset(),
                w, h, imgData;

            ctx.save();
            ctx.beginPath();
            ctx.rect(offset.left, offset.top, plot.width(), plot.height());
            ctx.clip();

            var wstart = Math.floor(Math.max(serie.xaxis.min, 0)) | 0,
                wstop = Math.ceil(Math.min(serie.data.length, serie.xaxis.max)) | 0,
                hstart = Math.floor(Math.max(serie.yaxis.min, 0)) | 0,
                hstop = Math.ceil(Math.min(serie.data[0].length, serie.yaxis.max)) | 0,
                xaxisStart = serie.xaxis.p2c(wstart),
                xaxisStop = serie.xaxis.p2c(wstop),
                yaxisStart = serie.yaxis.p2c(hstart),
                yaxisStop = serie.yaxis.p2c(hstop),
                xpctsPerPx = Math.abs((wstop - wstart) / (xaxisStop - xaxisStart)),
                ypctsPerPx = Math.abs((hstop - hstart) / (yaxisStop - yaxisStart)),
                decimate = xpctsPerPx > 1 && ypctsPerPx > 1;
            if (decimate) {
                var w2Start = Math.floor(xaxisStart),
                    w2Stop = Math.floor(xaxisStop),
                    h2Start = Math.floor(yaxisStop),
                    h2Stop = Math.floor(yaxisStart);
                w = w2Stop - w2Start;
                h = h2Stop - h2Start;
                imgData = getTempImageData(w, h);
                drawSeriesPointByPoint(imgData, wstart, wstop, hstart, hstop, w, h, xpctsPerPx, ypctsPerPx,
                    serie.intensitygraph.palette, serie.data, serie.intensitygraph.min, serie.intensitygraph.max)
            } else {
                w = wstop - wstart,
                h = hstop - hstart,
                imgData = getTempImageData(w, h);
                drawSeriesRectByRect(imgData, wstart, wstop, hstart, hstop, w, h,
                    serie.intensitygraph.palette, serie.data, serie.intensitygraph.min, serie.intensitygraph.max);
            }

            if (imgData) {
                tempCanvas.getContext('2d').putImageData(imgData, 0, 0);

                ctx.imageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                ctx.drawImage(tempCanvas, 0, 0, w, h,
                    xaxisStart + offset.left, yaxisStop + offset.top,
                    xaxisStop - xaxisStart, yaxisStart - yaxisStop);
            }

            ctx.restore();

            var yaxes = plot.getYAxes(),
                colorScaleAxis = yaxes.filter(function (axis) { return isColorScale(axis); })[0],
                colorScaleGradientWidth = 10,
                x = colorScaleAxis  && colorScaleAxis.show ? colorScaleAxis.box.left + colorScaleGradientWidth : offset.left + plot.width() + 20,
                gradient = opt.series.intensitygraph.gradient,
                lowColor = opt.series.intensitygraph.lowColor,
                highColor = opt.series.intensitygraph.highColor;
            if (colorScaleAxis && colorScaleAxis.show) {
                IntensityGraph.prototype.drawLegend(ctx, x, offset.top, colorScaleGradientWidth, plot.height(), gradient, lowColor, highColor);
            }

            function drawSeriesPointByPoint(imgData, wstart, wstop, hstart, hstop, w, h, xpctsPerPx, ypctsPerPx, palette, data, minValue, maxValue) {
                var i, j, x, y, x2, y2, x2limit, y2limit, value, value2, index, p, range = maxValue - minValue;
                for(i = 0; i < w; i++) {
                    x = wstart + (i * xpctsPerPx) | 0;
                    for(j = 0; j < h; j++) {
                        y = hstart + (j * ypctsPerPx) | 0;
                        value = data[x][y];
                        x2limit = Math.floor(Math.min((x + xpctsPerPx), data.length)) | 0;
                        y2limit = Math.floor(Math.min(y + ypctsPerPx, data[0].length)) | 0;
                        for (x2 = x; x2 < x2limit; x2++) {
                            for (y2 = y; y2 < y2limit; y2++) {
                                value2 = data[x2][y2];
                                if (value2 > value) {
                                    value = value2;
                                }
                            }
                        }
                        if (value < minValue) {
                            index = 256 * 4;
                        } else if (value > maxValue) {
                            index = 256 * 4 + 4;
                        } else {
                            index = 4 * Math.round((value - minValue) * 255 / range)
                        }
                        p = 4*(h-j-1)*w + 4*i;
                        imgData.data[p + 0] = palette[index + 0];
                        imgData.data[p + 1] = palette[index + 1];
                        imgData.data[p + 2] = palette[index + 2];
                        imgData.data[p + 3] = palette[index + 3];
                    }
                }
            }

            function drawSeriesRectByRect(imgData, wstart, wstop, hstart, hstop, w, h, palette, data, minValue, maxValue) {
                var i, j, value, index, p, range = maxValue - minValue;
                for(i = wstart; i < wstop; i++) {
                    for(j = hstart; j < hstop; j++) {
                        value = data[i][j];
                        if (value < minValue) {
                            index = 256 * 4;
                        } else if (value > maxValue) {
                            index = 256 * 4 + 4;
                        } else {
                            index = 4 * Math.round((value - minValue) * 255 / range)
                        }
                        p = 4*(hstop-j-1)*w + 4*(i-wstart);
                        imgData.data[p + 0] = palette[index + 0];
                        imgData.data[p + 1] = palette[index + 1];
                        imgData.data[p + 2] = palette[index + 2];
                        imgData.data[p + 3] = palette[index + 3];
                    }
                }
            }

            function getTempImageData(width, height) {
                if (!tempCanvas) {
                    tempCanvas = document.createElement('canvas');
                    tempCanvas.className = 'tempCanvas';
                    tempCanvas.style.visibility = 'hidden';
                    tempImageData = null;
                }
                if (width > 0 && height > 0 && (!tempImageData || tempCanvas.width !== width || tempCanvas.height !== height)) {
                    tempCanvas.width = width;
                    tempCanvas.style.width = width + 'px';
                    tempCanvas.height = height;
                    tempCanvas.style.height = height + 'px';
                    tempImageData = tempCanvas.getContext('2d').createImageData(width, height);
                }
                return tempImageData;
            }
        };
    };
};

IntensityGraph.prototype.drawLegend = drawLegend;
IntensityGraph.prototype.isColorScale = isColorScale;

var intensityGraph = new IntensityGraph();

$.plot.plugins.push({
    init: intensityGraph.init,
    options: intensityGraph.defaultOptions,
    name: intensityGraph.pluginName,
    version: intensityGraph.pluginVersion
});

if (typeof module === 'object' && module.exports) {
    module.exports = IntensityGraph;
} else {
    global.IntensityGraph = IntensityGraph;
}

})(this, jQuery);
