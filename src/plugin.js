import Chart from "chart.js";

/**
 * @name AnnotationRenderer
 * AnnotationRenderer is responsible for affecting changes on the canvas.
 * It handles styling options and drawing from context. It takes in context
 * and the options from the chart config.
 * @param ctx context from chart.ctx
 * @param options options from chart.config.option.lineHeightAnnotation
 */
export class AnnotationRenderer {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
  }

  /**
   * Add shadow on the line from options. Affects all lines on canvas.
   * Shadow Options: shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY.
   */
  shadow() {
    let options = this.options;
    if (options.shadow) {
      let ctx = this.ctx;
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
  }

  /**
   * Draw the line height annotation to the highest data point on the chart.
   * @param {int} x horizontal coordinate on canvas
   * @param {int} bottomY bottom Y dimension of the chart
   * @param {float} highestDataY highest possible Y value on the chart, taking padding and border offsets into consideration.
   */
  drawLineHeightAnnotation(x, bottomY, highestDataY) {
    let ctx = this.ctx;
    let options = this.options;

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

/**
 * @name LineChartUtils
 * LineChartUtils calculates metrics about the chart for annotations.
 * @param chart chartjs instance
 */
export class LineChartUtils {
  constructor(chart) {
    this.chart = chart;
  }

  /**
   * calculate the highest possible Y value to draw the line to
   * @param {array} pointMetrics array of dimensions
   */
  calculateHighestDataY(pointMetrics) {
    let [bottomY, topY, maxY, tickMax, tickLow, borderWidth] = pointMetrics;
    let yBRatio = bottomY * (maxY - tickLow);
    let tMRatio = yBRatio / (tickMax - tickLow);
    return bottomY - tMRatio + borderWidth * 2 + topY - 9;
  }

  isTooltipActive() {
    return this.tooltip._active && this.tooltip._active.length;
  }

  isPointTooHigh(highestDataY, bottomY, tickLow) {
    if (highestDataY > bottomY) {
      highestDataY = bottomY - tickLow;
    }
    return highestDataY;
  }

  getPointFromDataset(set, activePoint) {
    return set.data[activePoint._index].y
      ? set.data[activePoint._index].y
      : set.data[activePoint._index];
  }

  getPointMetrics(set, point, pointProps) {
    let [maxY, borderWidth] = pointProps;
    if (point > maxY) {
      if (set.borderWidth) {
        borderWidth = set.borderWidth;
        maxY = point - borderWidth;
      } else {
        maxY = point;
      }
    }
    return [maxY, borderWidth];
  }

  getMaximumDimensions(axis) {
    if (axis.ticksAsNumbers) {
      const tickMax = axis.ticksAsNumbers[0]; // first index is always the tallest
      const tickLow = axis.ticksAsNumbers[axis.ticksAsNumbers.length - 1]; // lowest tick
      let { top, bottom } = axis;
      return [tickMax, tickLow, top, bottom];
    }

    const tickLow = Number(axis.ticks[0]);
    const tickMax = Number(axis.ticks[axis.ticks.length - 1]);
    let { top, bottom } = axis;
    return [tickMax, tickLow, top, bottom];
  }

  get options() {
    return this.chart.options.lineHeightAnnotation
      ? this.chart.options.lineHeightAnnotation
      : false;
  }

  get tooltip() {
    return this.chart.tooltip;
  }

  get datasets() {
    return this.chart.config.data.datasets;
  }

  get ticks() {
    return this.chart.scales["x-axis-0"].ticks;
  }

  get chartArea() {
    return this.chart.chartArea;
  }
}

const plugin = {
  id: "lineHeightAnnotation",
  afterDatasetDraw: chart => {
    const lineChartUtils = new LineChartUtils(chart);
    const options = lineChartUtils.options;
    const ctx = chart.ctx;

    const optionsHandler = new AnnotationRenderer(ctx, options);
    optionsHandler.shadow();

    const xAxis = chart.scales[options.xAxis ? options.xAxis : "x-axis-0"];
    const yAxis = chart.scales[options.yAxis ? options.yAxis : "y-axis-0"];

    // Activity pages don't need this functionality.
    if (!yAxis) {
      return;
    }

    if (!xAxis) {
      return;
    }

    let [tickMax, tickLow, topY, bottomY] = lineChartUtils.getMaximumDimensions(
      yAxis
    );

    const datasets = lineChartUtils.datasets;
    let meta = [];

    let always = options.always === undefined ? true : options.always;
    if (always) {
      datasets.forEach((set, i) => {
        meta.push(chart.getDatasetMeta(i).data);
      });

      let ticks = lineChartUtils.ticks;

      for (let k = 0; k < ticks.length; k++) {
        let xSpace = xAxis.getPixelForTick(k);
        meta.map(set => {
          let points = set.filter(point => {
            return point._model.x === xSpace;
          });

          points.forEach(point => {
            optionsHandler.drawLineHeightAnnotation(
              xSpace,
              bottomY,
              point._model.y
            );
          });
        });
      }
    }

    let hover = options.hover || false;
    // draw a dashed line when someone hovers over a data point
    if (hover && lineChartUtils.isTooltipActive()) {
      const activePoint = lineChartUtils.tooltip._active[0];
      const x = activePoint.tooltipPosition().x;
      let maxY = 1;
      let borderWidth = 0;

      datasets.forEach(set => {
        // get maximum Y value
        // get borderWidth of that dataset
        let point = lineChartUtils.getPointFromDataset(set, activePoint);
        [maxY, borderWidth] = lineChartUtils.getPointMetrics(set, point, [
          maxY,
          borderWidth
        ]);
      });
      // calculate the height of the line.
      // see function above in comment block.
      let highestDataY = lineChartUtils.calculateHighestDataY([
        bottomY,
        topY,
        maxY,
        tickMax,
        tickLow,
        borderWidth
      ]);

      // if the calculated point has become too high it will extend below the chart
      lineChartUtils.isPointTooHigh(highestDataY, bottomY, tickLow);

      // draw line
      // save the context, destroy the canvas, draw a new line,
      // set the line settings (stroke) and then restore the canvas
      optionsHandler.drawLineHeightAnnotation(x, bottomY, highestDataY);
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
