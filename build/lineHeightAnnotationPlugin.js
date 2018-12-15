(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
  typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
  (global.PluginBarchartBackground = factory(global.Chart));
}(this, (function (Chart) { 'use strict';

  Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var plugin = {
    id: "lineHeightAnnotation",
    afterDatasetDraw: function afterDatasetDraw(chart) {
      var options = chart.options.lineHeightAnnotation ? chart.options.lineHeightAnnotation : false;
      var ctx = chart.ctx;

      if (options.shadow) {
        var shadow = options.shadow;
        var _stroke = ctx.stroke;

        ctx.stroke = function () {
          ctx.save();
          ctx.shadowColor = shadow.color ? shadow.color : "rgba(0,0,0,0.35)";
          ctx.shadowBlur = shadow.blur ? shadow.blur : 10;
          ctx.shadowOffsetX = shadow.offset ? shadow.offset.x : 0;
          ctx.shadowOffsetY = shadow.offset ? shadow.offset.y : 3;

          _stroke.apply(this, arguments);

          ctx.restore();
        };
      } // draw a dashed line when someone hovers over a data point


      if (chart.tooltip._active && chart.tooltip._active.length) {
        var activePoint = chart.tooltip._active[0];
        var x = activePoint.tooltipPosition().x;
        var yAxis = chart.scales["y-axis-0"]; // Activity pages don't need this functionality.

        if (!yAxis) {
          return;
        }

        var tickMax = yAxis.ticksAsNumbers[0]; // first index is always the tallest

        var tickLow = yAxis.ticksAsNumbers[yAxis.ticksAsNumbers.length - 1]; // lowest tick

        var topY = yAxis.top; // clientRect.top + chart.padding.y

        var bottomY = yAxis.bottom; // clientRect.bottom

        var maxY = 1;
        var borderWidth = 0;
        var datasets = chart.config.data.datasets;
        datasets.forEach(function (set) {
          // get maximum Y value
          // get borderWidth of that dataset
          var point = set.data[activePoint._index].y ? set.data[activePoint._index].y : set.data[activePoint._index];

          if (point > maxY) {
            if (set.borderWidth) {
              borderWidth = parseFloat(set.borderWidth, 10);
              maxY = parseFloat(point, 10) - borderWidth;
            } else {
              maxY = parseFloat(point, 10);
            }
          }
        }); // calculate the height of the line.
        // see function above in comment block.

        var yBRatio = bottomY * (maxY - tickLow);
        var tMRatio = yBRatio / (tickMax - tickLow);
        var highestDataY = bottomY - tMRatio + borderWidth * 2 + topY - 9; // if the calculated point has become too high it will extend below the chart

        if (highestDataY > bottomY) {
          highestDataY = bottomY - tickLow;
        } // draw line
        // save the context, destroy the canvas, draw a new line,
        // set the line settings (stroke) and then restore the canvas


        ctx.save();
        ctx.beginPath();

        if (!options.dash) {
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
  }; // if the environment is neither amd nor commonjs, register the plugin globally for the samples and tests

  if (!(typeof define === "function" && define.amd) && !((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports)) {
    Chart.pluginService.register(plugin);
  }

  return plugin;

})));
