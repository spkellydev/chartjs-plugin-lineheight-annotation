# Chart JS Line Height Annotation Plugin

A small, lightweight and reliable ChartJS plugin for Line charts specifically. This plugin was made to be compatible with the `react-chartjs-2` library, but it is available as a commonjs and umd module, as well.

![alt-text](https://github.com/spkellydev/chartjs-plugin-lineheight-annotation/raw/master/examples/public/always-chartjs-lineheight-annotation-plugin.png "Chart JS Line Height Annotation Plugin")

The lines always go to the top of the data point, but you can choose if they're _always on_ **or** _when user hovers_. On hover: The line will draw to the tallest data point near the user's hover position.

## Usage

```sh
npm i chartjs-plugin-lineheight-annotation
```

For React components:

```js
import React, { Component } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-lineheight-annotation";

class App extends Component {
  render() {
    let data = api.get("line-data");
    return (
      <Line
        options={{
          // see all defaults / options below!
          lineHeightAnnotation: {
            color: "#000",
            shadow: true
          }
        }}
        data={data}
      />
    );
  }
}
```

and that's it!

### Options

```js
/// default values
lineHeightAnnotation: {
  // defaults to have line to the highest data point on every tick
  always: true,
  // optionally, only have line draw to the highest datapoint nearest the user's hover position
  hover: false,
  // colors of the line
  color: '#000',
  // name of yAxis
  yAxis: 'y-axis-0',
  // weight of the line
  lineWeight: 1.5,
   /// sets shadow for ALL lines on the canvas
  shadow: {
    // color of the shadow
    color: 'rgba(0,0,0,0.35)',
    // blur of the shadow
    blur: 10,
    /// shadow offset
    offset: {
      // x offset
      x: 0,
      // y offset
      y: 3
    }
  },
  // dash defaults at [10, 10]
  noDash: true,
}
```

## Always on:

![alt-text](https://github.com/spkellydev/chartjs-plugin-lineheight-annotation/raw/master/examples/public/always-chartjs-lineheight-annotation-plugin.png "Chart JS Line Height Annotation Plugin")
