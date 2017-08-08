/* Flot plugin for adding cursors to the plot.

Copyright (c) cipix2000@gmail.com.
Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.
*/

/*global jQuery*/

(function ($) {
    'use strict';

    var options = {
        cursors: []
    };

    var constants = {
        iRectSize: 8,
        symbolSize: 8,
        mouseGrabMargin: 8,
        textHeight: 10, // to do: compute it somehow. Canvas doesn't give us a way to know it
        labelPadding: 10
    };

    function init(plot) {
        var cursors = [];
        var update = [];

        function createCursor(options) {
            return mixin(options, {
                name: options.name || ('unnamed ' + cursors.length),
                position: options.position || {
                    relativeX: 0.5, // relative to the with of the drawing area
                    relativeY: 0.5, // relative to the height of the drawing area
                    x: undefined, // plot value
                    y: undefined // plot value
                },
                mousePosition: {
                    relativeX: undefined,
                    relativeY: undefined
                },
                x: 0, // canvas point
                y: 0, // canvas point
                show: true,
                selected: false,
                highlighted: false,
                mode: 'xy',
                showIntersections: false,
                showLabel: false,
                showValues: true,
                color: 'gray',
                fontSize: '10px',
                fontFamily: 'sans-serif',
                fontStyle: '',
                fontWeight: '',
                lineWidth: 1,
                movable: true,
                mouseButton: 'all',
                dashes: 1,
                intersectionColor: 'darkgray',
                intersectionLabelPosition: 'bottom-right',
                snapToPlot: undefined,
                defaultxaxis: 1,
                defaultyaxis: 1
            });
        }

        plot.hooks.processOptions.push(function (plot) {
            plot.getOptions().cursors.forEach(function (options) {
                plot.addCursor(options);
            });
        });

        plot.getCursors = function () {
            return cursors;
        };

        plot.addCursor = function addCursor(options) {
            var currentCursor = createCursor(options);

            setPosition(plot, currentCursor, currentCursor.position);

            cursors.push(currentCursor);

            plot.triggerRedrawOverlay();
        };

        plot.removeCursor = function removeCursor(cursor) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                cursors.splice(index, 1);
            }

            plot.triggerRedrawOverlay();
        };

        plot.setCursor = function setCursor(cursor, options) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                mixin(options, cursors[index]);
                setPosition(plot, cursors[index], cursors[index].position);
                plot.triggerRedrawOverlay();
            }
        };

        plot.getIntersections = function getIntersections(cursor) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                return cursors[index].intersections;
            }

            return [];
        };

        plot.formatCursorPosition = formatCursorPosition;

        var selectedCursor = function (cursors) {
            var result;

            cursors.forEach(function (cursor) {
                if (cursor.selected) {
                    if (!result) {
                        result = cursor;
                    }
                }
            });

            return result;
        };

        var visibleCursors = function(cursors) {
            return cursors.filter(function (cursor) {
                return cursor.show;
            });
        };

        // possible issues with ie8
        var correctMouseButton = function (cursor, buttonNumber) {
            switch (cursor.mouseButton) {
                case 'all':
                    return true;
                case 'left':
                    return buttonNumber === 0;
                case 'middle':
                    return buttonNumber === 1;
                case 'right':
                    return buttonNumber === 2;
                default:
                    return true;
            }
        };

        function onMouseDown(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                // unselect the cursor and move it to the current position
                currentlySelectedCursor.selected = false;
                plot.getPlaceholder().css('cursor', 'default');
                currentlySelectedCursor.x = mouseX;
                currentlySelectedCursor.y = mouseY;
                currentlySelectedCursor.position.relativeX = currentlySelectedCursor.x / plot.width();
                currentlySelectedCursor.position.relativeY = currentlySelectedCursor.y / plot.height();

                plot.triggerRedrawOverlay();
            } else {
                // find nearby cursor and unlock it
                var targetCursor;
                var dragmode;

                visibleCursors(cursors).forEach(function (cursor) {
                    if (!cursor.movable) {
                        return;
                    }
                    if (mouseOverCursorHorizontalLine(e, plot, cursor)) {
                        targetCursor = cursor;
                        dragmode = 'y';
                    }
                    if (mouseOverCursorVerticalLine(e, plot, cursor)) {
                        targetCursor = cursor;
                        dragmode = 'x';
                    }
                    if (mouseOverCursorManipulator(e, plot, cursor)) {
                        targetCursor = cursor;
                        dragmode = 'xy';
                    }
                });

                if (targetCursor) {
                    if (!correctMouseButton(targetCursor, e.button)) {
                        return;
                    }
                    targetCursor.selected = true;
                    targetCursor.dragmode = dragmode;
                    // changed for InsightCM -max
                    if (targetCursor.mode === 'x') {
                        plot.getPlaceholder().css('cursor', 'ew-resize');
                    } else if (targetCursor.mode === 'y') {
                        plot.getPlaceholder().css('cursor', 'ns-resize');
                    } else {
                        plot.getPlaceholder().css('cursor', 'move');
                    }
                    plot.getPlaceholder().css('cursor', 'move');
                    plot.triggerRedrawOverlay();
                    e.stopImmediatePropagation();
                }
            }
        }

        function onMouseUp(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                if (!correctMouseButton(currentlySelectedCursor, e.button)) {
                    return;
                }
                // lock the free cursor to current position
                currentlySelectedCursor.selected = false;
                if (currentlySelectedCursor.dragmode.indexOf('x') !== -1) {
                    currentlySelectedCursor.x = mouseX;
                    currentlySelectedCursor.mousePosition.relativeX = mouseX / plot.width();
                    currentlySelectedCursor.position.relativeX = currentlySelectedCursor.x / plot.width();
                }

                if (currentlySelectedCursor.dragmode.indexOf('y') !== -1) {
                    currentlySelectedCursor.y = mouseY;
                    currentlySelectedCursor.mousePosition.relativeY = mouseY / plot.height();
                    currentlySelectedCursor.position.relativeY = currentlySelectedCursor.y / plot.height();
                }

                plot.getPlaceholder().css('cursor', 'default');
                plot.triggerRedrawOverlay();
            }
        }

        function onMouseMove(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                if (currentlySelectedCursor.dragmode.indexOf('x') !== -1) {
                    currentlySelectedCursor.x = mouseX;
                    currentlySelectedCursor.position.relativeX = currentlySelectedCursor.x / plot.width();
                    currentlySelectedCursor.mousePosition.relativeX = mouseX / plot.width();
                }

                if (currentlySelectedCursor.dragmode.indexOf('y') !== -1) {
                    currentlySelectedCursor.y = mouseY;
                    currentlySelectedCursor.position.relativeY = currentlySelectedCursor.y / plot.height();
                    currentlySelectedCursor.mousePosition.relativeY = mouseY / plot.height();
                }

                plot.triggerRedrawOverlay();
                e.stopImmediatePropagation();
            } else {
                visibleCursors(cursors).forEach(function (cursor) {
                    if (!cursor.movable) {
                        return;
                    }
                    if (mouseOverCursorManipulator(e, plot, cursor)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }

                        plot.getPlaceholder().css('cursor', 'pointer');
                    } else if (mouseOverCursorVerticalLine(e, plot, cursor)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }

                        plot.getPlaceholder().css('cursor', 'col-resize');
                    } else if (mouseOverCursorHorizontalLine(e, plot, cursor)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }

                        plot.getPlaceholder().css('cursor', 'row-resize');
                    } else {
                        if (cursor.highlighted) {
                            cursor.highlighted = false;
                            plot.getPlaceholder().css('cursor', 'default');
                            plot.triggerRedrawOverlay();
                        }
                    }
                });
            }
        }

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            eventHolder.mousedown(onMouseDown);
            eventHolder.mouseup(onMouseUp);
            eventHolder.mousemove(onMouseMove);
        });

        function findIntersections(plot, cursor) {
            var intersections = {
                cursor: cursor.name,
                points: []
            };

            var cursorLastMouseX = cursor.mousePosition.relativeX * plot.width(),
                cursorLastMouseY = cursor.mousePosition.relativeY * plot.height(),
                nearestPoint = plot.findNearbyItem(cursorLastMouseX, cursorLastMouseY, function(seriesIndex) {
                    return cursor.snapToPlot === -1 || seriesIndex === cursor.snapToPlot;
                }, Number.MAX_VALUE, function(x, y) {
                    return x * x + y * y * 0.025;
                });

            if (nearestPoint) {
                var dataset = plot.getData(),
                    ps = dataset[nearestPoint.seriesIndex].datapoints.pointsize,
                    i = nearestPoint.dataIndex * ps;

                intersections.points.push({
                    x: nearestPoint.datapoint[0],
                    y: nearestPoint.datapoint[1],
                    leftPoint: [i - ps, i - ps + 1],
                    rightPoint: [i, i + 1],
                    seriesIndex: nearestPoint.seriesIndex
                });
            }

            return intersections;
        }

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var isPositionInitialized = function(position) {
                    return position.x !== undefined && position.y !== undefined &&
                        position.relativeX !== undefined && position.relativeY !== undefined;
                },
                isMousePositionInitilized = function(mousePosition) {
                    return mousePosition.relativeX !== undefined && mousePosition.relativeY !== undefined;
                };

            update = [];

            cursors.forEach(function (cursor) {
                var intersections;

                if (!isPositionInitialized(cursor.position)) {
                    setPosition(plot, cursor, cursor.position);
                }
                if (!isMousePositionInitilized(cursor.mousePosition)) {
                    cursor.mousePosition.relativeX = cursor.x / plot.width();
                    cursor.mousePosition.relativeY = cursor.y / plot.height();
                }

                intersections = findIntersections(plot, cursor);
                maybeSnapToPlot(plot, cursor, intersections);
                cursor.intersections = intersections;
                intersections.target = cursor;
                update.push(intersections);

                if (cursor.show) {
                    var plotOffset = plot.getPlotOffset();

                    ctx.save();
                    ctx.translate(plotOffset.left, plotOffset.top);

                    determineAndSetTextQuadrant(plot, ctx, cursor);
                    drawVerticalAndHorizontalLines(plot, ctx, cursor);
                    drawLabel(plot, ctx, cursor);
                    drawIntersections(plot, ctx, cursor);
                    drawValues(plot, ctx, cursor);
                    if (cursor.symbol !== 'none') {
                        drawManipulator(plot, ctx, cursor);
                    }

                    ctx.restore();
                }
            });

            if (update.length > 0) {
                plot.getPlaceholder().trigger('cursorupdates', [update]);
            }
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind('mousedown', onMouseDown);
            eventHolder.unbind('mouseup', onMouseUp);
            eventHolder.unbind('mousemove', onMouseMove);
            eventHolder.unbind('cursorupdates');
            plot.getPlaceholder().css('cursor', 'default');
        });
    }

    function mixin(source, destination) {
        Object.keys(source).forEach(function (key) {
            destination[key] = source[key];
        });

        return destination;
    }

    /**
        Calculate and set the canvas coords based on relative coords or plot values.
        When both provided then the relative coords will be took into account
        and the plot values ignored.
     */
    function setPosition(plot, cursor, pos) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            x = pos.relativeX !== undefined
                ? pos.relativeX * plot.width()
                : (xaxis.p2c ? xaxis.p2c(pos.x) : undefined),
            y = pos.relativeX !== undefined
                ? pos.relativeY * plot.height()
                : (yaxis.p2c ? yaxis.p2c(pos.y) : undefined);

        cursor.x = Math.max(0, Math.min(x, plot.width()));
        cursor.y = Math.max(0, Math.min(y, plot.height()));
    }

    function maybeSnapToPlot(plot, cursor, intersections) {
        if (cursor.snapToPlot >= -1) {
            var point = intersections.points[0];

            if (point) {
                var plotData = plot.getData()[point.seriesIndex],
                    relativeX = plotData.xaxis.p2c(point.x) / plot.width(),
                    relativeY = plotData.yaxis.p2c(point.y) / plot.height();

                setPosition(plot, cursor, {
                    x: point.x,
                    y: point.y
                });

                cursor.position.relativeX = relativeX;
                cursor.position.relativeY = relativeY;
                intersections.x = point.x; // update cursor position
                intersections.y = point.y;
            }
        }
    }

    function determineAndSetTextQuadrant(plot, ctx, cursor) {
        var width = plot.width(),
            height = plot.height(),
            y = cursor.y,
            x = cursor.x,
            rowsWidth = 0,
            rowsHeight = 0,
            count = rowCount(cursor),
            fontSizeInPx = Number(cursor.fontSize.substring(0, cursor.fontSize.length - 2)),
            lowerLimit = 0.05,
            higherLimit = 1 - lowerLimit;

        ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
        if (cursor.showLabel) {
            rowsWidth = Math.max(rowsWidth, ctx.measureText(cursor.name).width);
        }
        if (cursor.showValues) {
            var positionTextValues = formatCursorPosition(plot, cursor),
                text = positionTextValues.xTextValue + ", " + positionTextValues.yTextValue;
            rowsWidth = Math.max(rowsWidth, ctx.measureText(text).width);
        }

        if (cursor.halign === 'right' && x + rowsWidth > width * higherLimit) {
            cursor.halign = 'left';
        } else if (cursor.halign === 'left' && x - rowsWidth < width * lowerLimit) {
            cursor.halign = 'right';
        } else if (!cursor.halign) {
            cursor.halign = 'right';
        }

        rowsHeight = count * (fontSizeInPx + constants.labelPadding);

        if (cursor.valign === 'below' && y + rowsHeight > height * higherLimit) {
            cursor.valign = 'above';
        } else if (cursor.valign === 'above' && y - rowsHeight < height * lowerLimit) {
            cursor.valign = 'below';
        } else if (!cursor.valign) {
            cursor.valign = 'below';
        }
    }

    /**
     * The text displayed next to the cursor can be stacked as rows and their positions can be calculated with this function.
     * The bottom one has the index = 0, and the top one has the index = count -1. Depending on the current cursor's possition
     * relative to the center of the plot, index and count, the positions will be computed like this:
     *
     *               |
     *           two | two
     *           one | one
     *          zero | zero
     *       --------+--------
     *           two | two
     *           one | one
     *          zero | zero
     *               |
     */
    function computeRowPosition(plot, cursor, index, count) {
        var textAlign = 'left';
        var fontSizeInPx = Number(cursor.fontSize.substring(0, cursor.fontSize.length - 2));

        var y = cursor.y;
        var x = cursor.x;

        if (cursor.halign === 'left') {
            x -= constants.labelPadding;
            textAlign = 'right';
        } else {
            x += constants.labelPadding;
        }

        if (cursor.valign === 'above') {
            y -= constants.labelPadding * (count - index) + fontSizeInPx * (count - 1 - index);
        } else {
            y += constants.labelPadding * (index + 1) + fontSizeInPx * (index + 1);
        }

        return {
            x: x,
            y: y,
            textAlign: textAlign
        };
    }

    function rowCount(cursor) {
        return (cursor.showLabel ? 1 : 0) + (cursor.showValues ? 1 : 0);
    }

    function labelRowIndex(cursor) {
        return 0;
    }

    function valuesRowIndex(cursor) {
        return cursor.showLabel ? 1 : 0;
    }

    function drawLabel(plot, ctx, cursor) {
        if (cursor.showLabel) {
            ctx.beginPath();
            var position = computeRowPosition(plot, cursor, labelRowIndex(cursor), rowCount(cursor));
            ctx.fillStyle = cursor.color;
            ctx.textAlign = position.textAlign;
            ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
            ctx.fillText(cursor.name, position.x, position.y);
            ctx.textAlign = 'left';
            ctx.stroke();
        }
    }

    function fillTextAligned(ctx, text, x, y, position, fontStyle, fontWeight, fontSize, fontFamily) {
        var fontSizeInPx = Number(fontSize.substring(0, fontSize.length - 2));
        var textWidth;
        switch (position) {
            case 'left':
                textWidth = ctx.measureText(text).width;
                x = x - textWidth - constants.iRectSize;
                break;
            case 'bottom-left':
                textWidth = ctx.measureText(text).width;
                x = x - textWidth - constants.iRectSize;
                y = y + fontSizeInPx;
                break;
            case 'top-left':
                textWidth = ctx.measureText(text).width;
                x = x - textWidth - constants.iRectSize;
                y = y - constants.iRectSize;
                break;
            case 'top-right':
                x = x + constants.iRectSize;
                y = y - constants.iRectSize;
                break;
            case 'right':
                x = x + constants.iRectSize;
                break;
            case 'bottom-right':
            default:
                x = x + constants.iRectSize;
                y = y + fontSizeInPx;
                break;
        }

        ctx.textBaseline = "middle";
        ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + ' ' + fontFamily;
        ctx.fillText(text, x, y);
    }

    function drawIntersections(plot, ctx, cursor) {
        if (cursor.showIntersections && hasVerticalLine(cursor)) {
            ctx.beginPath();
            if (cursor.intersections === undefined) {
                return;
            }
            cursor.intersections.points.forEach(function (point, index) {
                if (typeof cursor.showIntersections === 'object') {
                    if (cursor.showIntersections.indexOf(index) === -1) {
                        return;
                    }
                }
                var coord = plot.p2c(point);
                ctx.fillStyle = cursor.intersectionColor;
                ctx.fillRect(Math.floor(coord.left) - constants.iRectSize / 2,
                    Math.floor(coord.top) - constants.iRectSize / 2,
                    constants.iRectSize, constants.iRectSize);

                var text;
                if (typeof cursor.formatIntersectionData === 'function') {
                    text = cursor.formatIntersectionData(point);
                } else {
                    text = point.y.toFixed(2);
                }

                fillTextAligned(ctx, text, coord.left, coord.top, cursor.intersectionLabelPosition, cursor.fontStyle, cursor.fontWeight, cursor.fontSize, cursor.fontFamily);
            });
            ctx.stroke();
        }
    }

    function computeCursorsPrecision(plot, axis, canvasPosition) {
        var canvas2 = axis.direction === "x" ? canvasPosition + 1 : canvasPosition - 1,
            point1 = axis.c2p(canvasPosition),
            point2 = axis.c2p(canvas2);

        return plot.computeValuePrecision(point1, point2, axis.direction, 1);
    }

    function findXAxis(plot, cursor) {
        var dataset = plot.getData(),
            xaxes = plot.getXAxes(),
            zeroBasedIndex = cursor.defaultxaxis - 1;
        if (cursor.snapToPlot >= -1) {
            if (cursor.intersections && cursor.intersections.points[0]) {
                var series = dataset[cursor.intersections.points[0].seriesIndex];
                return series ? series.xaxis : xaxes[zeroBasedIndex];
            } else {
                return xaxes[zeroBasedIndex];
            }
        } else {
            return xaxes[zeroBasedIndex];
        }
    }

    function findYAxis(plot, cursor) {
        var dataset = plot.getData(),
            yaxes = plot.getYAxes(),
            zeroBasedIndex = cursor.defaultyaxis - 1;
        if (cursor.snapToPlot >= -1) {
            if (cursor.intersections && cursor.intersections.points[0]) {
                var series = dataset[cursor.intersections.points[0].seriesIndex];
                return series ? series.yaxis : yaxes[zeroBasedIndex];
            } else {
                return yaxes[zeroBasedIndex];
            }
        } else {
            return yaxes[zeroBasedIndex];
        }
    }

    function formatCursorPosition(plot, cursor) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            htmlSpace = '&nbsp;',
            xaxisPrecision = computeCursorsPrecision(plot, xaxis, cursor.x),
            xFormattedValue = xaxis.tickFormatter(xaxis.c2p(cursor.x), xaxis, xaxisPrecision),
            spaceIndex = xFormattedValue.indexOf(htmlSpace),
            yaxisPrecision = computeCursorsPrecision(plot, yaxis, cursor.y),
            yFormattedValue = yaxis.tickFormatter(yaxis.c2p(cursor.y), yaxis, yaxisPrecision);

        spaceIndex = xFormattedValue.indexOf(htmlSpace);
        if (spaceIndex !== -1) {
            xFormattedValue = xFormattedValue.slice(0, spaceIndex);
        }

        spaceIndex = yFormattedValue.indexOf(htmlSpace);
        if (spaceIndex !== -1) {
            yFormattedValue = yFormattedValue.slice(0, spaceIndex);
        }

        return {
            xTextValue: xFormattedValue,
            yTextValue: yFormattedValue
        }
    }

    function drawValues(plot, ctx, cursor) {
        if (cursor.showValues) {
            var positionTextValues = formatCursorPosition(plot, cursor),
                text = positionTextValues.xTextValue + ", " + positionTextValues.yTextValue,
                position = computeRowPosition(plot, cursor, valuesRowIndex(cursor), rowCount(cursor));

            ctx.fillStyle = cursor.color;
            ctx.textAlign = position.textAlign;
            ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
            ctx.fillText(text, position.x, position.y);
        }
    }

    function drawVerticalAndHorizontalLines(plot, ctx, cursor) {
        // abort draw if linewidth is zero
        if (cursor.lineWidth === 0) {
            return;
        }
        // keep line sharp
        var adj = cursor.lineWidth % 2 ? 0.5 : 0,
            delta, numberOfSegments, i;

        ctx.strokeStyle = cursor.color;
        ctx.lineWidth = cursor.lineWidth;
        ctx.lineJoin = "round";

        ctx.beginPath();

        if (cursor.mode.indexOf("x") !== -1) {
            var drawX = Math.floor(cursor.x) + adj;
            if (cursor.dashes <= 0) {
                ctx.moveTo(drawX, 0);
                ctx.lineTo(drawX, plot.height());
            } else {
                numberOfSegments = cursor.dashes * 2 - 1;
                delta = plot.height() / numberOfSegments;
                for (i = 0; i < numberOfSegments; i += 2) {
                    ctx.moveTo(drawX, delta * i);
                    ctx.lineTo(drawX, delta * (i + 1));
                }
            }
        }

        if (cursor.mode.indexOf("y") !== -1) {
            var drawY = Math.floor(cursor.y) + adj;
            if (cursor.dashes <= 0) {
                ctx.moveTo(0, drawY);
                ctx.lineTo(plot.width(), drawY);
            } else {
                numberOfSegments = cursor.dashes * 2 - 1;
                delta = plot.width() / numberOfSegments;
                for (i = 0; i < numberOfSegments; i += 2) {
                    ctx.moveTo(delta * i, drawY);
                    ctx.lineTo(delta * (i + 1), drawY);
                }
            }
        }

        ctx.stroke();
    }

    function drawManipulator(plot, ctx, cursor) {
        // keep line sharp
        var adj = cursor.lineWidth % 2 ? 0.5 : 0;
        ctx.beginPath();

        if (cursor.highlighted) {
            ctx.strokeStyle = 'orange';
        } else {
            ctx.strokeStyle = cursor.color;
        }
        if (cursor.symbol && plot.drawSymbol && plot.drawSymbol[cursor.symbol]) {
            //first draw a white background
            ctx.fillStyle = 'white';
            ctx.fillRect(Math.floor(cursor.x) + adj - (constants.symbolSize / 2 + 1),
                Math.floor(cursor.y) + adj - (constants.symbolSize / 2 + 1),
                constants.symbolSize + 2, constants.symbolSize + 2);
            plot.drawSymbol[cursor.symbol](ctx, Math.floor(cursor.x) + adj,
                Math.floor(cursor.y) + adj, constants.symbolSize / 2, 0);
        } else {
            ctx.fillRect(Math.floor(cursor.x) + adj - (constants.symbolSize / 2),
                Math.floor(cursor.y) + adj - (constants.symbolSize / 2),
                constants.symbolSize, constants.symbolSize);
        }

        ctx.stroke();
    }

    function hasVerticalLine(cursor) {
        return (cursor.mode.indexOf('x') !== -1);
    }

    function hasHorizontalLine(cursor) {
        return (cursor.mode.indexOf('y') !== -1);
    }

    function mouseOverCursorManipulator(e, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
        var grabRadius = constants.symbolSize + constants.mouseGrabMargin;

        return ((mouseX > cursor.x - grabRadius) && (mouseX < cursor.x + grabRadius) &&
            (mouseY > cursor.y - grabRadius) && (mouseY < cursor.y + grabRadius)) &&
            (cursor.symbol !== 'none');
    }

    function mouseOverCursorVerticalLine(e, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

        return (hasVerticalLine(cursor) && (mouseX > cursor.x - constants.mouseGrabMargin) &&
            (mouseX < cursor.x + constants.mouseGrabMargin) && (mouseY > 0) && (mouseY < plot.height()));
    }

    function mouseOverCursorHorizontalLine(e, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

        return (hasHorizontalLine(cursor) && (mouseY > cursor.y - constants.mouseGrabMargin) &&
            (mouseY < cursor.y + constants.mouseGrabMargin) && (mouseX > 0) && (mouseX < plot.width()));
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'cursors',
        version: '0.2'
    });
})(jQuery);
