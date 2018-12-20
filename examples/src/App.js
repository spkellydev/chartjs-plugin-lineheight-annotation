import React, { Component } from "react";
import { Line } from "react-chartjs-2";
import "./plugin.js";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        labels: ["1", "2", "3", "4", "5"],
        datasets: [
          {
            label: "Videos Made",
            backgroundColor: "rgba(52, 152, 219, 0.75)",
            data: [15, 20, 45, 30, 50, 20, 10, 5, 5]
          },
          {
            label: "Subscription Rate",
            backgroundColor: "rgba(231, 76, 60, 0.75)",
            data: [5, 10, 20, 10, 15, 30, 60, 40, 60]
          }
        ]
      }
    };
  }

  setGradientColor = (canvas, color) => {
    if (!color) return;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 100, 900, 195);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.95, "rgba(155, 55, 55,0.65)");
    return gradient;
  };

  getChartData = canvas => {
    let data = this.state.data;
    if (data.datasets) {
      let color = ["rgba(0, 255, 0, 0.85)", "rgba(255, 0, 255, 0.65)"];
      data.datasets.forEach((set, i) => {
        set.backgroundColor = this.setGradientColor(canvas, color[i]);
        set.borderColor = "white";
        set.borderWidth = 2;
        set.hoverBackgroundColor = "rgba(0, 255, 0, 0.85)";
        set.hoverBorderColor = color;
      });
    }

    return data;
  };

  render() {
    return (
      <div
        style={{
          position: "relative",
          width: 900
        }}
      >
        <h1>Chart JS Samples</h1>
        <Line
          options={{
            responsive: true,
            lineHeightAnnotation: true
          }}
          data={this.getChartData}
        />
      </div>
    );
  }
}
