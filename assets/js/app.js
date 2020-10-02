// Assign height and width to variables
var svgWidth = 960;
var svgHeight = 500;

// Assign margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Account for margins when declaring height/width
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "obesity";
var chosenYAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(demographicsData, chosenXAxis) {
  // create scale
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(demographicsData, d => d[chosenXAxis]) * 0.8,
    d3.max(demographicsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(demographicsData, chosenYAxis) {
  // create scale
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(demographicsData, d => d[chosenYAxis]) - 1,
    d3.max(demographicsData, d => d[chosenYAxis]) + 1
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
  return circlesGroup;
}
// function used for updating circles group with a transition to
// new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]))
  return circlesGroup;
}

// functions used for updating labels with a transition to
// new circles
function xLabels(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

function yLabels(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYAxis]) + 5);

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  // updating tooltip x-axis title text upon click on axis label
  var xlabel;
  if (chosenXAxis === "obesity") {
    xlabel = "Obesity";
  }
  else {
    xlabel = "Cigarette Use";
  }
    // updating tooltip y-axis title text upon click on axis label
  var ylabel;
  if (chosenYAxis === "poverty") {
    ylabel = "Poverty";
  }
  else {
    ylabel = "Healthcare";
  }
 // tooltip aesthetics and titles
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`)
    })


  circlesGroup.call(toolTip);

  // onmouseover event 
  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data, this);
    })

  return circlesGroup;
}
// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function (demographicsData) {
  console.log(demographicsData)

  // parse data
  demographicsData.forEach(function (data) {
    // console.log(data.obesity);
    data.obesity = +data.obesity;
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.healthcare = + data.healthcare;
  });

  // Create scale functions
  // LinearScale functions above csv import

  // Create x scale function
  var xLinearScale = xScale(demographicsData, chosenXAxis);
  // Create y scale function
  var yLinearScale = yScale(demographicsData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis to chart
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis to chart
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("g circle").data(demographicsData).enter().append("g")

  // define the circles
  var circlesAxes = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 9)
    .attr("fill", "skyblue")
    .attr("opacity", ".8")

  // add text labels to circles
  var circlesLabels = circlesGroup.append("text")
    //We return the abbreviation to .text, which makes the text the abbreviation.
    .text(function (d) {
      return d.state.slice(0, 2)
        .toUpperCase();
    })
    // Place the text using our scale.
    .attr("dx", function (d) {
      return xLinearScale(d['obesity']);
    })
    .attr("dy", function (d) {
      // When the size of the text is the radius,
      // adding a third of the radius to the height
      // pushes it into the middle of the circle.
      return yLinearScale(d['poverty']) + 10 / 2.5;
    })
    .attr("font-size", 9.5)
    .attr("class", "stateText");

  // Create group for x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var obesityLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity");

  var smokesLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Cigarette Use");

  // Create group for y-axis labels
  var yLabelsGroup = chartGroup.append("g")

  var healthCareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -55)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare");

  var povertyLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -35)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        // console.log(chosenXAxis)

        // updates x scale for new data
        xLinearScale = xScale(demographicsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesAxes = renderXCircles(circlesAxes, xLinearScale, chosenXAxis);

        // updates circles text with new x values
        circlesLabels = xLabels(circlesLabels, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    },
      // y axis labels event listener
      yLabelsGroup.selectAll("text")
        .on("click", function () {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;
            // console.log(chosenYAxis)

            // updates y scale for new data
            yLinearScale = yScale(demographicsData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new y values
            circlesAxes = renderYCircles(circlesAxes, yLinearScale, chosenYAxis);

            // updates circles text with new y values
            circlesLabels = yLabels(circlesLabels, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthCareLabel
                .classed("active", true)
                .classed("inactive", false);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              healthCareLabel
                .classed("active", false)
                .classed("inactive", true);
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        }
        ));
})



