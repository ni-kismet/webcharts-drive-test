## ni-cartesian-axis

> Add axes to a graph.

```html
<ni-cartesian-graph>
  <ni-cartesian-axis show grid-lines show-label label="Axis 1" axis-position='bottom'>
  </ni-cartesian-axis>
  <ni-cartesian-axis show grid-lines show-label label="Axis 2" axis-position='top'>
  </ni-cartesian-axis>
  <ni-cartesian-axis show grid-lines show-label label="Axis 3" axis-position='left'>
  </ni-cartesian-axis>
</ni-cartesian-graph>
```
Multiple vertical and horizontal axes can be added to a graph and configured.

Axes can be placed to the right, left and on top or bottom of a graph, can use a
logarithmic scale if desired and can show time. A relative time format is supported
along with the absolute time format.

The minimum and maximum value of an axis can be specified. Autoscaling according
to the data ranges dispayed is also possible.


### ni-cartesian-axis properties

**axis-ref** - an axis id used to bind plots to the axes. Default: ''

**show** (boolean) - if true the axis will be visible. Default: false

**label** (string) - the name of the axis. Default: '' 

**axis-position** (string) - the position of the axis. Default: 'left'
 Accepted values: 'top', 'bottom', 'left' and 'right'


**show-label** (boolean) - if true the axis label will be visible.
       Default: false 

**minimum** (number) - the minimum axis value. Default: 0

**maximum** (number) - the maximum axis value. Default: 1

**auto-scale** (string) - if 'exact' or 'loose' the axis will adapt to the data
       ranges of the plots assigned to that axis. if 'none', the axis will adapt to the
       minimum and maximum options. For 'growexact' and 'growloose' the axis will adapt only when
       the new data value is bigger than the old one. Default: 'auto'

**log-scale** (boolean) - if true the axis will be a log axis. Default: false

**format** (string) - the format of the tick labels. Default: ''
TODO: document the format


**show-tick-labels** (string) - which of the tick labels are visible.
       Possible values: 'none', 'endpoints', 'major' and 'all'. Default: 'all'.
       For 'endpoints' only the minimum and the maximum values will be visible
       at the edges of the axis. To make some intermediary values visible use
       'major', and 'all' to show all of them.

**grid-lines** (boolean) - if true the grid lines for the axis will
       be visible. Default: false

**show-ticks** (boolean) - if true the tick lines for the axis will
       be visible. A tick line is a short line which connects the tick label with
       the axis. Default: false

**show-minor-ticks** (boolean) - if true the minor tick lines for the axis
       will be visible. Minor tick lines are short lines (half of the tick line
       length) which subdivide the interval between tick lines in five intervals.
       Default: false
