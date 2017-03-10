## ni-cartesian-plot

> A custom element that, along with a nested ni-cartesian-plot-renderer describes
the way a data plot is rendered.

A plot is the graphic representation of a data set. A graph or chart can show
simultaneously multiple data sets (plots). To customize how a data set, or plot
is rendered use ni-cartesian-plot elements nested inside a graph or chart
element.

```html
<ni-cartesian-graph>
  <ni-cartesian-axis axis-ref="axis1ref" show axis-position="bottom"></ni-cartesian-axis>
  <ni-cartesian-axis axis-ref="axis2ref" show axis-position="left"></ni-cartesian-axis>
  <ni-cartesian-plot show label="plot 1" xaxis="axis1ref" yaxis="axis2ref">
    add an ni-cartesian-plot-renderer here
  </ni-cartesian-plot>
</ni-cartesian-graph>
```


### ni-cartesian-plot properties 

**show** (boolean) - if true the plot will be shown. Default: false 

**label** (string) - the name of the plot. Default: '' 

**xaxis** (string) - the X axis that this plot will use. Default: ''.
       Accepted values: an axis-ref. In case an xaxis with the specified axis-ref
       is not found the first xaxis is used

**yaxis** (string) - the Y axis that this plot will use. Default: ''.
       Accepted values: an axis-ref. In case an yaxis with the specified axis-ref
       is not found the first yaxis is used

**enable-hover** (boolean) - if true, when the mouse hovers close to a point on the plot
       a tooltip with the point value will be shown 

**hover-format** (string) - specifies the format of the text shown in the tooltip. TODO: document the format
