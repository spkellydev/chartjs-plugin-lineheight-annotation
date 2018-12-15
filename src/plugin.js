import Chart from "chart.js";

const plugin = {
  id: "lineHeightAnnotation",
  afterDatasetDraw: chart => {
    const options = chart.options.lineHeightAnnotation
      ? chart.options.lineHeightAnnotation
      : false;
    const ctx = chart.ctx;

    if (options.shadow) {
      let { shadow } = options;
      const _stroke = ctx.stroke;
      ctx.stroke = function() {
        ctx.save();
        ctx.shadowColor = shadow.color ? shadow.color : "rgba(0,0,0,0.35)";
        ctx.shadowBlur = shadow.blur ? shadow.blur : 10;
        ctx.shadowOffsetX = shadow.offset ? shadow.offset.x : 0;
        ctx.shadowOffsetY = shadow.offset ? shadow.offset.y : 3;
        _stroke.apply(this, arguments);
        ctx.restore();
      };
    }

    // draw a dashed line when someone hovers over a data point
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const activePoint = chart.tooltip._active[0];

      const x = activePoint.tooltipPosition().x;
      const yAxis = chart.scales[options.yAxis ? options.yAxis : "y-axis-0"];

      // Activity pages don't need this functionality.
      if (!yAxis) {
        return;
      }

      const tickMax = yAxis.ticksAsNumbers[0]; // first index is always the tallest
      const tickLow = yAxis.ticksAsNumbers[yAxis.ticksAsNumbers.length - 1]; // lowest tick
      const topY = yAxis.top; // clientRect.top + chart.padding.y
      const bottomY = yAxis.bottom; // clientRect.bottom

      let maxY = 1;
      let borderWidth = 0;
      const datasets = chart.config.data.datasets;
      datasets.forEach(set => {
        // get maximum Y value
        // get borderWidth of that dataset
        let point = set.data[activePoint._index].y
          ? set.data[activePoint._index].y
          : set.data[activePoint._index];

        if (point > maxY) {
          if (set.borderWidth) {
            borderWidth = parseFloat(set.borderWidth, 10);
            maxY = parseFloat(point, 10) - borderWidth;
          } else {
            maxY = parseFloat(point, 10);
          }
        }
      });

      // calculate the height of the line.
      // see function above in comment block.
      let yBRatio = bottomY * (maxY - tickLow);
      let tMRatio = yBRatio / (tickMax - tickLow);
      let highestDataY = bottomY - tMRatio + borderWidth * 2 + topY - 9;

      // if the calculated point has become too high it will extend below the chart
      if (highestDataY > bottomY) {
        highestDataY = bottomY - tickLow;
      }

      // draw line
      // save the context, destroy the canvas, draw a new line,
      // set the line settings (stroke) and then restore the canvas
      ctx.save();
      ctx.beginPath();
      if (!options.noDash) {
        ctx.setLineDash([10, 10]);
      }
      ctx.moveTo(x, highestDataY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = options.lineWeight ? options.lineWeight : 1.5;
      ctx.strokeStyle = options.color ? options.color : "#000";
      ctx.stroke();
      ctx.restore();
    }
  }
};

// if the environment is neither amd nor commonjs, register the plugin globally for the samples and tests
export default plugin;
if (
  !(typeof define === "function" && define.amd) &&
  !(typeof module === "object" && module.exports)
) {
  Chart.pluginService.register(plugin);
}
