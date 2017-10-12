flot.cursors [![Build Status](https://travis-ci.org/ni-kismet/flot-cursors-plugin.svg?branch=master)](https://travis-ci.org/ni-kismet/flot-cursors-plugin) [![Coverage Status](https://coveralls.io/repos/github/ni-kismet/flot-cursors-plugin/badge.svg?branch=master)](https://coveralls.io/github/ni-kismet/flot-cursors-plugin?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ni-kismet/flot-cursors-plugin.svg)](https://greenkeeper.io/)
============

This is a plugin for engineering-flot to create cursors. Cursors are used to measure various values on the graphs and charts. Multiple cursors are supported.

This plugin is based on another plugin `jQuery.flot.crosshair.js` which can be found in the flot chart package at <http://www.flotcharts.org/>

Options
-------

The plugin supports these options:

```javascript
    cursors: [
        {
            name: 'string'
            mode: null or 'x' or 'y' or 'xy',
            color: color,
            lineWidth: number,
            position: {
                relativeX or x or x2 or x3 ..: number,
                relativeY or y or y2 or y3 ..: number
            },
            valign: 'below' or 'above',
            halign: 'right' or 'left',
            show: true or false,
            showLabel: true or false,
            showValues: true or false,
            snapToPlot: undefined, -1, 0 or positive number,
            interpolate: true or false,
            defaultxaxis: 1,
            defaultyaxis: 1,
            symbol: 'cross', 'triangle' ...,
            movable: true or false,
            mouseButton: 'all' or 'left' or 'right' or 'middle',
            dashes: number,
            showIntersections: true or false or array,
            intersectionColor: color,
            intersectionLabelPosition: 'bottom-right', 'right', 'top-right' 'bottom-left', 'left' or 'top-left',
            fontSize: '<number>px',
            fontFamily: string,
            fontStyle: string,
            fontWeight: string,
            formatIntersectionData: null or function(point)
        },
        <more cursors if needed>
    ]
```

**name** is a string containing the name/label of the cursor.

**mode** is one of "x", "y" or "xy". The "x" mode enables a vertical cursor that lets you trace the values on the x axis, "y" enables a horizontal cursor and "xy" enables them both. "xy" is default. This is used only for configuring the drawing of vertical and horizontal line.

**color** is the color of the cursor (default is "rgba(170, 0, 0, 0.80)")

**lineWidth** is the width of the drawn lines (default is 1). Setting lineWidth to zero creates an invisible cursor.

**position** position of the cursor. It can be specified relative to the canvas, using a *relativeX, relativeY* pair of coordinates which are expressed as a number between 0 and 1. It can be also specified using axis based coordinates ( *x, x2, x3 .., y, y2, y3* ).

**valign** is the vertical position of the label and values relative to the cursor symbol. Possible values: 'below' or 'above'. Default is 'below'.

**valign** is the horizontal position of the label and values relative to the cursor symbol. Possible values: 'right' or 'left'. Default is 'right'.

**show** if false the cursor won't be visible and the mouse interactions for it will be disabled. Default value: true.

**showLabel** if true the name of the cursor will be displayed next to the cursor manipulator.

**showValues** the coordinate of the cursor (relative to the specified plot or axis) will be displayed next to the cursor manipulator.

**snapToPlot** specifies a plot to which the cursor will snap. If set to -1 then the cursor will snap to any plot. If not specified or set to undefined, NaN or any value smaller than -1 then the cursor will be free.

**interpolate** if true, the position of the cursor will be set as interpolation on OY axis between nearest points to it's position. Otherwise, it will snap to the nearest point.

**defaultxaxis**: the one-based index of the x axis to follow when the cursor is snapping to no plot

**defaultyaxis**: the one-based index of the y axis to follow when the cursor is snapping to no plot

**symbol** a shape ('cross', 'triangle' ...). The cursor manipulator will have this shape. Set to 'none' to draw no symbol.

**movable** if true, the cursor can be moved with the mouse. Default is true.

**mouseButton** is which mouse button is used to move the cursor. Note that this may not be compatible with IE 8. Default is 'all'.

**dashes** the number of dashes you want in the line. Set to 1 to get a solid line without dashes. Default is 1.

**showIntersections** if true the intersection with the plots will be displayed as grey rectangles. Can be set to an array of series indices to only show intersections with those series. Default is false.

**intersectionColor** sets the color of the boxes drawn at intersections, and also the color of the text showing the value at the intersection. Default is 'darkgray'.

**intersectionLabelPosition** sets where the intersection label text appears, relative to the intersection. Default is 'bottom-right'.

**fontSize** sets the font size of the cursor labels and intersection value labels. Default is '10px'.

**fontFamily** sets the font size of the cursor labels and intersection value labels. Default is 'sans-serif'.

**fontStyle** sets the font size of the cursor labels and intersection value labels. Default is ''.

**fontWeight** sets the font size of the cursor labels and intersection value labels. Default is ''.

**formatIntersectionData** allows you to provide a custom formating function for data. point parameter is composed of
```
{
    x: interpolated intersection x position,
    y: interpolated intersection y position,
    leftPoint: the closest datapoint on the left of the intersection,
    rightPoint: the closest datapoint on the right of the intersection
 }
```

Public Methods and events
-------------------------


The plugin adds some public methods to the plot:

* plot.getCursors()

    Returns a list containing all the cursors

* plot.addCursor(options)

    creates a new cursor with the parameters specified in options.

* plot.removeCursor(cursorToRemove)

    remove the specified cursor from the plot. cursorToRemove is a cursor
    reference to one of the cursors obtained with getCursors()

* plot.setCursor(cursor , options)

    changes one or more cursor properties.

* plot.getIntersections(cursor)

    returns the intersections of the cursor with plots 	

* plot.formatCursorPosition(plot, cursor)

    return the formatted text values of the position of cursor as an
    object { xTextValue, yTextValue }

Everytime one or more cursors changes state a *cursorupdates* event is emitted on the chart container.
These events are emitted in one of these situations:

* cursor added
* cursor removed
* cursor moved
* intersections of the cursors with the plots changed due to chart data changes


How to use
----------

```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    cursors: [
        { name: 'Green cursor', mode: 'xy', color: 'green' },
        { name: 'Red cursor', mode: 'xy', color: 'red' }
    ]
    ...
});

$("#graph").bind("cursorupdates", function (event, cursordata) {
    cursordata.forEach(function (cursor) {
        console.log("Cursor " + cursor.cursor + " intersections:");
        cursor.points.forEach(function (point) {
            console.log("x:" + point.x + " y: " + point.y);
        });
    });
});
```    

Examples and tests
------------------

jquery.flot.cursors is available under the MIT license.

Interactive example: <https://rawgit.com/ni-kismet/flot-cursors-plugin/master/example.html>

Tests on Travis CI: https://travis-ci.org/ni-kismet/flot-cursors-plugin
