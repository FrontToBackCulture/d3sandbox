/**
 * @module stackedBarChart
 */

function stackedBarChart() {
    var width,
        height,
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
     * @summary Draw stacked bar chart
     * @description Draw stacked bar chart
     * @function chart
     * @public
     * @instance
     * @param {d3_selection} selection - d3 selection from html including the data to process
     * @returns {svg} stacked bar chart svg
     */
    function chart(selection) {
        selection.each(function (data) {
            var dataset, keys, fKeys;

            var width_legend = width - margin.left - margin.right,
                height_legend = 25;

            dispatch.on("statechange.test", function(d) {
               console.log(d)
                update(d);
            });

            dataset = data;
            keys = data.columns.slice(1); //Melvin: make the columns as keys for the data
            fKeys = keys.slice();

            //calculate total for each keys
            dataset.forEach(function (d, i) {
                d.total = d3.sum(d3.values(d).slice(1));
            });

            //var stackedData = d3.stack().keys(fKeys)(dataset);
            //console.log(stackedData);
            //console.log("smart");


            var test = d3.stack().keys(fKeys);
            test3 = test(dataset);
            //console.log(test3);

            // console.log(test3[0][0]);
            // console.log(test3[0].length);
            // console.log(test3[0][0][1]);

            for (i = 0; i < test3.length; i++) {
                // console.log(test3[i]);
                // console.log(test3[i].key);
                for (k=0; k < test3[i].length; k++){
                    // console.log(test3[i][k]);
                    //test3[i][k].push(['label',test3[i].key])
                    test3[i][k].label = test3[i].key;
                }
            }

            // console.log(test3);
            var stackedData = test3;

            var maxDataY = 1.2 * d3.max(stackedData.map(function (d) {
                return d3.max(d, function (innerD) {
                    return innerD[1];
                });
            }));

            //Scale Start ===============================================================================================================

            // Melvin: The scale for spacing each group's bar: setup an ordinal scale for x the individual items within the groups
            var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);

            // Melvin: The scale for y axis which is linear in nature and set the output range
            var yScale = d3.scaleLinear().rangeRound([height, 0]);

            xScale.domain(dataset.map(function (d) {
                return d.State;
            }));

            yScale.domain([0, maxDataY])
                .nice();

            //Scale End ===============================================================================================================

            //Axis Start ===============================================================================================================

            //Define X axis
            var xAxis = d3.axisBottom().scale(xScale).tickSizeInner(2).tickSizeOuter(0);

            //Define Y axis
            var yAxis = d3.axisLeft().scale(yScale).ticks(null, "s");

            //Axis End ===============================================================================================================

            var svg = selection.append("svg")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var gg = svg.append('g').attr("class", "d3-group-wrap"); // keep d3 groups organized and used for correct clipping

            /**
             * @summary Draw y axis gridlines
             * @description Draw y axis gridlines
             * @function make_y_gridlines
             * @public
             * @instance
             * @returns {yScale} Constructs a new left-oriented axis generator for the given scale, with empty tick arguments, a tick size of 6 and padding of 3. In this orientation,
             * ticks are drawn to the left of the vertical domain path.
             */
            function make_y_gridlines() {
                return d3.axisLeft(yScale);
            }

            //Draw Start ===============================================================================================================

            //Melvin: draw the x axis
            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            //Melvin: draw the y axis
            g.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("x", 2)
                .attr("y", yScale(yScale.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Population"); //axes label

            //Melvin: draw the gridline to show behind the chart
            svg.append("g")
                .attr("class", "grid")
                .call(make_y_gridlines()
                    .tickSize(-width)
                    .tickFormat("")
                );

            //Draw benchmark line
            svg.append("line")
                .attr("class", "line benchmark")
                .attr("x1", margin.left)
                .attr("x2", width)
                .attr("y1", yScale(benchMarkLine)+20)
                .attr("y2", yScale(benchMarkLine)+20);

            //Label benchmark line
            svg.append("text")
                .attr("class", "benchmarkLable")
                .attr("x", margin.left + 10)
                .attr("y", yScale(benchMarkLine) +20 - 10)
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
                    var xPosition = d3.event.pageX + 10;
                    var yPosition = d3.event.pageY;

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


            //Melvin: draw the rectangle
            // update selection
            stackedBars = gg
                .selectAll(".d3-group")
                .data(stackedData, function (__data__, i, group) {
                    return __data__.key;
                });

            // enter selection
            stackedBarsEnter = stackedBars
                .enter()
                .append("g")
                .attr("fill", function (d) {
                    return color(d.key);
                })
                .attr("class", function (d, i) {
                    return "d3-group d3-group-" + i;
                });

            var tool_tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-8, 0])
                .html(function(d) {
                    // console.log(d);
                    return  d.label + " : " + (d[1]-d[0]);
                });
            svg.call(tool_tip);

            // add path on enter
            bars = stackedBarsEnter
                .selectAll('rect')
                .data(function (d) {
                    return d;
                })
                .enter().append("rect")
                .attr('class', 'd3-rect')
                .attr("x", function (d) {
                    return xScale(d.data.State) + 40;
                })
                .attr("y", function (d) {
                    return yScale(d[1]) + 20;
                })
                .attr("height", function (d) {
                    return yScale(d[0]) - yScale(d[1]);
                })
                .attr("width", xScale.bandwidth())
                .on('mouseover', tool_tip.show)
                .on('mouseout', tool_tip.hide);
/*
                .on("mouseover", function(d) {

                    //Get this bar's x/y values, then augment for the tooltip
                    // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                    var xPosition = d3.event.pageX+10;
                    // var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;
                    var yPosition = d3.event.pageY;

                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select("#value")
                        .text(d[1]-d[0]);

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);

                })
                .on("mouseout", function() {

                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
                });
*/

            //Draw End ===============================================================================================================


            //Highlight Button Start =================================================================================================

            d3.selectAll("input")
                .on("click", function () {

                    var view = d3.select(this).node().value;

                    //Reset all to black
                    stackedBarsEnter.attr("fill", function(d) {
                        return color(d.key);
                    });

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

                // Go through both keys and fKeys to find out proper
                // position to insert keyToToggle if it is to be inserted
                var i, j;
                for (i = 0, j = 0; i < keys.length; i++) {
                    // If we hit the end of fKeys, keyToToggle
                    // should be last
                    if (j >= fKeys.length) {
                        fKeys.push(d);
                        break;
                    }
                    // if we found keyToToggle in fKeys - remove it
                    if (fKeys[j] == d) {
                        // remove it
                        fKeys.splice(j, 1);
                        break;
                    }

                    // we found keyToToggle in the original collection
                    // AND it was not found at fKeys[j]. It means
                    // it should be inserted to fKeys at position "j"
                    if (keys[i] == d) {
                        // add it
                        fKeys.splice(j, 0, d);
                        break;
                    }

                    if (keys[i] == fKeys[j])
                        j++;
                }

                //
                // Update the array to filter the chart by:
                //

                // add the clicked key if not included:
                if (filtered.indexOf(d) == -1) {
                    filtered.push(d);
                    // if all bars are un-checked, reset:
                    if(filtered.length == keys.length) filtered = [];
                }
                // otherwise remove it:
                else {
                    filtered.splice(filtered.indexOf(d), 1);
                }

                //
                // Update the scales for each group(/states)'s items:
                //
                var newKeys = [];
                keys.forEach(function(d) {
                    if (filtered.indexOf(d) == -1 ) {
                        newKeys.push(d);
                    }
                })

                test = d3.stack().keys(fKeys);
                test3 = test(dataset);
                //console.log(test3);

                // console.log(test3[0][0]);
                // console.log(test3[0].length);
                // console.log(test3[0][0][1]);

                for (i = 0; i < test3.length; i++) {
                    // console.log(test3[i]);
                    // console.log(test3[i].key);
                    for (k=0; k < test3[i].length; k++){
                        // console.log(test3[i][k]);
                        //test3[i][k].push(['label',test3[i].key])
                        test3[i][k].label = test3[i].key;
                    }
                }

                stackedData = test3;

                maxDataY = 1.2 * d3.max(stackedData.map(function (d) {
                    return d3.max(d, function (innerD) {
                        return innerD[1];
                    });
                }));


                xScale.domain(dataset.map(function (d) {
                    return d.State
                }));

                yScale.domain([0, maxDataY])
                    .rangeRound([height, 0]);


                // update the y axis:
                svg.select(".y")
                    .transition()
                    .call(yAxis)
                    .duration(500);

                // update selection
                stackedBars = gg
                    .selectAll(".d3-group")
                    .data(stackedData, function (__data__, i, group) {
                        return __data__.key;
                    });

                // exit the whole group
                stackedBars
                    .exit().remove();


                // enter selection
                stackedBarsEnter = stackedBars
                    .enter()
                    .append("g")
                    .attr("fill", function (d) {
                        return color(d.key);
                    })
                    .attr("class", function (d, i) {
                        return "d3-group d3-group-" + i;
                    });

                // add path on enter
                bars = stackedBarsEnter
                    .selectAll('rect')
                    .data(function (d) {
                        return d;
                    })
                    .enter().append("rect")
                    .attr('class', 'd3-rect');

                // update + enter
                stackedBars = stackedBars.merge(stackedBarsEnter);

                stackedBars.selectAll('.d3-rect')
                    .data(function (d) {
                        return d;
                    })
                    .transition()
                    .attr("x", function (d) {
                        return xScale(d.data.State) + 40;
                    })
                    .attr("y", function (d) {
                        return yScale(d[1]) + 20;
                    })
                    .attr("height", function (d) {
                        return yScale(d[0]) - yScale(d[1]);
                    })
                    .attr("width", xScale.bandwidth())
                    .duration(500);


                /*bars.on("mouseover", function(d) {

                        //Get this bar's x/y values, then augment for the tooltip
                        // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                        var xPosition = d3.event.pageX+10;
                        // var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;
                        var yPosition = d3.event.pageY;

                        //Update the tooltip position and value
                        d3.select("#tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .select("#value")
                            .text(d[1]-d[0]);

                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", false);

                    })
                    .on("mouseout", function() {

                        //Hide the tooltip
                        d3.select("#tooltip").classed("hidden", true);
                    });*/

                //Draw benchmark line
                svg.selectAll(".benchmark")
                    .attr("x1", margin.left)
                    .attr("x2", width)
                    .attr("y1", yScale(5000000) + 20)
                    .attr("y2", yScale(5000000) + 20);

                //Label benchmark line
                svg.selectAll(".benchmarkLable")
                    .attr("x", margin.left + 10)
                    .attr("y", yScale(5000000) - 10 + 20)
                    .attr("dy", "0.32em")
                    .attr("fill", "#000")
                    .attr("font-size", "10px")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "start")
                    .text("Benchmark");


                // update legend:
                legend.selectAll("circle")
                    .transition()
                    .attr("fill",function(d) {
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
            }


            /**
             * @summary Highlight the bar based on the defined criteria
             * @description Highlight the bar in red for bars that meet the criteria
             * @function highlight
             * @public
             * @instance
             */
            function highlight() {
                bars.filter(function (d) {
                    return (d[1]-d[0]) > highlightValue;
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