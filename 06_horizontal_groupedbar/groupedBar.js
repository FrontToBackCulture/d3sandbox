/**
 * @module groupedBarChart
 */

function h_groupedBarChart() {
    var width,
        height,
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        color = d3.scaleOrdinal(d3["schemeDark2"]);

    var benchMarkLine,
        legendLoc,
        legendTrunc,
        legendOffSet,
        highlightValue; //Melvin: space between legend

    String.prototype.trunc =
        function (n, useWordBoundary) {
            if (this.length <= n) {
                return this;
            }
            var subString = this.substr(0, n - 1);
            return (useWordBoundary
                ? subString.substr(0, subString.lastIndexOf(' '))
                : subString) + "...";
        };

    /**
     * @summary Draw grouped bar chart
     * @description Draw grouped bar chart
     * @function chart
     * @public
     * @instance
     * @param {d3_selection} selection - d3 selection from html including the data to process
     * @returns {svg} Grouped bar chart svg
     */
    function chart(selection) {
        selection.each(function (data) {
            var bar;

            var width_legend = width - margin.left - margin.right,
                height_legend = 25;

            var keys = data.columns.slice(1); //Melvin: make the columns as keys for the data

            //Scale Start ===============================================================================================================

            // Melvin: The scale spacing the groups, setup an ordinal scale for x for the groups and set the output range
            var y0Scale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

            // Melvin: The scale for spacing each group's bar: setup an ordinal scale for x the individual items within the groups
            var y1Scale = d3.scaleBand().padding(0.1);

            // Melvin: The scale for y axis which is linear in nature and set the output range
            var xScale = d3.scaleLinear().rangeRound([0, width]);

            //Melvin: set the input value for the x scale with the defined domain
            y0Scale.domain(data.map(function (d) {
                return d.State;
            }));

            //Melvin: set the range for individual item to meet the individual group width
            y1Scale.domain(keys).rangeRound([0, y0Scale.bandwidth()]);

            //Melvin: set the input and find the max value based on the max value by iterating through all of its value in the array
            xScale.domain([0, d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return d[key];
                });
            })]).nice();

            //Scale End ===============================================================================================================

            //Axis Start ===============================================================================================================

            //Define X axis
            // var xAxis = d3.axisBottom().scale(x0Scale);
            var xAxis = d3.axisBottom().scale(xScale).ticks(null, "s");

            //Define Y axis
            // var yAxis = d3.axisLeft().scale(yScale).ticks(null, "s");
            var yAxis = d3.axisLeft().scale(y0Scale);

            //Axis End ===============================================================================================================

            var svg = selection.append("svg")
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom);

            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            /**
             * @summary Draw y axis gridlines
             * @description Draw y axis gridlines
             * @function make_y_gridlines
             * @public
             * @instance
             * @returns {yScale} Constructs a new left-oriented axis generator for the given scale, with empty tick arguments, a tick size of 6 and padding of 3. In this orientation,
             * ticks are drawn to the left of the vertical domain path.
             */

            function make_x_gridlines() {
                return d3.axisBottom(xScale);
            }


            //Draw Start ===============================================================================================================

            //Melvin: draw the x axis
            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("x", width-50)
                .attr("y", -10)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Population"); //axes label


            //Melvin: draw the y axis
            g.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            //Melvin: draw the gridline to show behind the chart
            svg.append("g")
                .attr("class", "grid")
                .call(make_x_gridlines()
                    .tickSize(width)
                    .tickFormat("")
                );

            //Draw benchmark line
            svg.append("line")
                .attr("class", "line benchmark")
                .attr("x1", xScale(benchMarkLine) + 40)
                .attr("x2", xScale(benchMarkLine) + 40)
                .attr("y1", 0)
                .attr("y2", height);

            //Label benchmark line
            svg.append("text")
                .attr("class", "benchmarkLable")
                .attr("x", xScale(benchMarkLine) + 45)
                .attr("y", 5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Benchmark");

            var svgLegned4 = d3.select('.'+legendLoc).append("svg")
                .attr("width", width_legend)
                .attr("height", height_legend);

            var dataL = 0;

            var legend = svgLegned4.selectAll('.'+legendLoc)
                .data(keys.slice().reverse())
                .enter().append('g')
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    if (i === 0) {
                        dataL = d.length + legendOffSet;
                        return "translate(0,0)";
                    } else {
                        var newdataL = dataL
                        dataL += d.length + legendOffSet;
                        return "translate(" + (newdataL) + ",0)";
                    }
                });

            legend.append("circle")
                .attr("cx", 30)
                .attr("cy", 10)
                .attr("r", 5)
                .attr("fill", color)
                .attr("stroke", color)
                .on("click", function (d) {
                    update(d)
                });

            legend.append('text')
                .attr("x", 40)
                .attr("y", 10)
                .attr("dy", ".32em")
                .text(function (d, i) {
                    return d.trunc(legendTrunc);
                })
                .attr("fill", "#000")
                .attr("font-size", "10px")
                .style("text-anchor", "start")
                .on("mouseover", function (d) {

                    //Get this bar's x/y values, then augment for the tooltip
                    // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                    var xPosition = d3.event.pageX;
                    var yPosition = d3.event.pageY - 10

                    //Update the tooltip position and value
                    d3.select("#legend_tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select("#legend_value")
                        .text(d);

                    //Show the tooltip
                    d3.select("#legend_tooltip").classed("hidden", false);

                })
                .on("mouseout", function () {

                    //Hide the tooltip
                    d3.select("#legend_tooltip").classed("hidden", true);
                });

            var tool_tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-8, 0])
                .html(function(d) { return d.key + " : " + d.value; });
            svg.call(tool_tip);

            //Melvin: draw the rectangle on screen for each bar
            bar = g.append("g")
                .selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function (d) {
                    return "translate(0," + y0Scale(d.State) + ")";
                })
                .selectAll("rect")
                .data(function (d) {
                    return keys.map(function (key) {
                        return {
                            key: key,
                            value: d[key]
                        };
                    });
                })
                .enter().append("rect")
                .attr("x", 0)
                .attr("y", function (d) {
                    return y1Scale(d.key);
                })
                .attr("width", function (d){
                    return xScale(d.value);
                })
                .attr("height", y1Scale.bandwidth())
                .attr("fill", function (d) {
                    return color(d.key);
                })
                .on('mouseover', tool_tip.show)
                .on('mouseout', tool_tip.hide);
               /* .on("mouseover", function (d) {
                    //Get this bar's x/y values, then augment for the tooltip
                    // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                    var xPosition = d3.event.pageX + 10;
                    var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select("#value")
                        .text(d.value);

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);

                })
                .on("mouseout", function () {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
                });*/


            //Draw End ===============================================================================================================


            //Highlight Button Start =================================================================================================

            d3.selectAll("input")
                .on("click", function () {

                    var view = d3.select(this).node().value;

                    //Reset all to black
                    bar.attr("fill", function (d) {
                        return color(d.key);
                    })

                    //Filter and highlight based on different conditions
                    switch (view) {

                        case "highlight":

                            highlight();

                            break;

                        case "none":
                        default:
                        //Do nothing more
                    }

                });

            //Highlight Button End =================================================================================================

            var filtered = [];

            /**
             * @summary Update the chart with the selection done on screen
             * @description Trigger the redraw of the chart based on the legend toggle
             * @function update
             * @public
             * @instance
             * @param   {String} key - the key which indicates the legend being toggled
             */
            function update(d) {
                //
                // Update the array to filter the chart by:
                //

                // add the clicked key if not included:
                if (filtered.indexOf(d) == -1) {
                    filtered.push(d);
                    // if all bars are un-checked, reset:
                    if (filtered.length == keys.length) filtered = [];
                }
                // otherwise remove it:
                else {
                    filtered.splice(filtered.indexOf(d), 1);
                }

                //
                // Update the scales for each group(/states)'s items:
                //
                var newKeys = [];
                keys.forEach(function (d) {
                    if (filtered.indexOf(d) == -1) {
                        newKeys.push(d);
                    }
                })
                y1Scale.domain(newKeys).rangeRound([0, y0Scale.bandwidth()]);
                xScale.domain([0, d3.max(data, function (d) {
                    return d3.max(keys, function (key) {
                        if (filtered.indexOf(key) == -1)
                            return d[key];
                    });
                })]).nice();

                // update the x axis:
                svg.select(".x")
                    .transition()
                    .call(xAxis)
                    .duration(500);

                //
                // Filter out the bands that need to be hidden:
                //
                var bars = svg.selectAll(".bar").selectAll("rect")
                    .data(function (d) {
                        return keys.map(function (key) {
                            return {key: key, value: d[key]};
                        });
                    })

                bars.filter(function (d) {
                    return filtered.indexOf(d.key) > -1;
                })
                    .transition()
                    .attr("y", function (d) {
                        return (+d3.select(this).attr("y")) + (+d3.select(this).attr("height")) / 2;
                    })
                    .attr("height", 0)
                    .attr("width", 0)
                    .attr("xScale", function (d) {
                        return width;
                    })
                    .duration(500);

                //
                // Adjust the remaining bars:
                //
                bars.filter(function (d) {
                    return filtered.indexOf(d.key) == -1;
                })
                    .transition()
                    .attr("x", 0)
                    .attr("y", function (d) {
                        return y1Scale(d.key);
                    })
                    .attr("height", function (d) {
                        return y1Scale.bandwidth();
                    })
                    .attr("width", function (d){
                        return xScale(d.value);
                    })
                    .attr("fill", function (d) {
                        return color(d.key);
                    })
                    .duration(500);

                // update legend:
                legend.selectAll("circle")
                    .transition()
                    .attr("fill", function (d) {
                        if (filtered.length) {
                            if (filtered.indexOf(d) == -1) {
                                return color(d);
                            }
                            else {
                                return "white";
                            }
                        }
                        else {
                            return color(d);
                        }
                    })
                    .duration(100);

                //Draw benchmark line
                svg.append("line")
                    .attr("class", "line benchmark")
                    .attr("x1", xScale(benchMarkLine) + 40)
                    .attr("x2", xScale(benchMarkLine) + 40)
                    .attr("y1", 0)
                    .attr("y2", height);

                //Label benchmark line
                svg.append("text")
                    .attr("class", "benchmarkLable")
                    .attr("x", xScale(benchMarkLine) + 45)
                    .attr("y", 5)
                    .attr("dy", "0.32em")
                    .attr("fill", "#000")
                    .attr("font-size", "10px")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "start")
                    .text("Benchmark");
            }


            /**
             * @summary Highlight the bar based on the defined criteria
             * @description Highlight the bar in red for bars that meet the criteria
             * @function highlight
             * @public
             * @instance
             */
            function highlight() {
                bar.filter(function (d) {
                    return d.value > highlightValue;
                })
                    .attr("fill", "red");
            }
        })

    }


    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.benchMarkLine = function(value) {
        if (!arguments.length) return benchMarkLine;
        benchMarkLine = value;
        return chart;
    };

    chart.legendTrunc = function(value) {
        if (!arguments.length) return legendTrunc;
        legendTrunc = value;
        return chart;
    };

    chart.legendOffSet = function(value) {
        if (!arguments.length) return legendOffSet;
        legendOffSet = value;
        return chart;
    };

    chart.highlightValue = function(value) {
        if (!arguments.length) return highlightValue;
        highlightValue = value;
        return chart;
    };

    chart.legendLoc = function(value) {
        if (!arguments.length) return legendLoc;
        legendLoc = value;
        return chart;
    };

    return chart;

}