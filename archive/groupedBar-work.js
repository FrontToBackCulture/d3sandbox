function groupedBarChart() {

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

        var dataset, bar;


        var svg = d3.select("svg"),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 560 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom,
            width_legend = width - margin.left - margin.right,
            height_legend = 25,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Melvin: The scale spacing the groups, setup an ordinal scale for x for the groups and set the output range
        var x0Scale = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);

        // Melvin: The scale for spacing each group's bar: setup an ordinal scale for x the individual items within the groups
        var x1Scale = d3.scaleBand()
            .padding(0.05);

        // Melvin: The scale for y axis which is linear in nature and set the output range
        var yScale = d3.scaleLinear()
            .rangeRound([height, 0]);

        // var z = d3.scaleOrdinal()
        //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // Melvin: Define the color scheme based on D3 schemeDart2
        var z = d3.scaleOrdinal(d3["schemeDark2"]);

        //Define X axis
        var xAxis = d3.axisBottom()
            .scale(x0Scale);

        //Define Y axis
        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(null, "s");

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScale);
        }

        d3.dsv(",", "data.csv", function (d, i, columns) {
            for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
            return d;
        }).then(function (data) {
            // if (error) throw error;

            dataset = data;
            console.log(data);

            var keys = data.columns.slice(1); //Melvin: make the columns as keys for the data

            x0Scale.domain(data.map(function (d) {
                return d.State;
            })); //Melvin: set the input value for the x scale with the defined domain

            x1Scale.domain(keys).rangeRound([0, x0Scale.bandwidth()]); //Melvin: set the range for individual item to meet the individual group width

            yScale.domain([0, d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return d[key];
                });
            })]).nice(); //Melvin: set the input and find the max value based on the max value by iterating through all of its value in the array

            svg.append("g")
                .attr("class", "grid")
                .call(make_y_gridlines()
                    .tickSize(-width)
                    .tickFormat("")
                );

            //Melvin: draw the rectangle on screen for each bar
            bar = g.append("g")
                .selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function (d) {
                    return "translate(" + x0Scale(d.State) + ",0)";
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
                .attr("x", function (d) {
                    return x1Scale(d.key);
                })
                .attr("y", function (d) {
                    return yScale(d.value);
                })
                .attr("width", x1Scale.bandwidth())
                .attr("height", function (d) {
                    return height - yScale(d.value);
                })
                .attr("fill", function (d) {
                    return z(d.key);
                })
                .on("mouseover", function (d) {

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
                });

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

            var svgLegned4 = d3.select(".legend4").append("svg")
                .attr("width", width_legend)
                .attr("height", height_legend);

            var dataL = 0;
            var offset = 55; //Melvin: space between legend

            var legend4 = svgLegned4.selectAll('.legend4')
                .data(keys.slice().reverse())
                .enter().append('g')
                .attr("class", "legend4")
                .attr("transform", function (d, i) {
                    if (i === 0) {
                        dataL = d.length + offset;
                        return "translate(0,0)";
                    } else {
                        var newdataL = dataL
                        dataL += d.length + offset;
                        return "translate(" + (newdataL) + ",0)";
                    }
                });

            legend4.append("circle")
                .attr("cx", 30)
                .attr("cy", 10)
                .attr("r", 5)
                .attr("fill", z)
                .attr("stroke", z)
                .on("click", function (d) {
                    update(d)
                });

            legend4.append('text')
                .attr("x", 40)
                .attr("y", 10)
                .attr("dy", ".32em")
                .text(function (d, i) {
                    return d.trunc(10);
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


            //Draw benchmark line
            svg.append("line")
                .attr("class", "line benchmark")
                .attr("x1", margin.left)
                .attr("x2", width)
                .attr("y1", yScale(5000000))
                .attr("y2", yScale(5000000));

            //Label benchmark line
            svg.append("text")
                .attr("class", "benchmarkLable")
                .attr("x", margin.left + 10)
                .attr("y", yScale(5000000) - 10)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Benchmark");

            //On button click, execute highlight or not to highlight
            d3.selectAll("input")
                .on("click", function () {

                    var view = d3.select(this).node().value;

                    //Reset all to black
                    bar.attr("fill", function (d) {
                        console.log(d.key);
                        return z(d.key);
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


            var filtered = [];

            ////
            //// Update and transition on click:
            ////

            function update(d) {

                console.log(d);
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
                x1Scale.domain(newKeys).rangeRound([0, x0Scale.bandwidth()]);
                yScale.domain([0, d3.max(data, function (d) {
                    return d3.max(keys, function (key) {
                        if (filtered.indexOf(key) == -1)
                            return d[key];
                    });
                })]).nice();

                // update the y axis:
                svg.select(".y")
                    .transition()
                    .call(yAxis)
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
                    .attr("x", function (d) {
                        return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
                    })
                    .attr("height", 0)
                    .attr("width", 0)
                    .attr("yScale", function (d) {
                        return height;
                    })
                    .duration(500);

                //
                // Adjust the remaining bars:
                //
                bars.filter(function (d) {
                    return filtered.indexOf(d.key) == -1;
                })
                    .transition()
                    .attr("x", function (d) {
                        return x1Scale(d.key);
                    })
                    .attr("y", function (d) {
                        return yScale(d.value);
                    })
                    .attr("height", function (d) {
                        return height - yScale(d.value);
                    })
                    .attr("width", x1Scale.bandwidth())
                    .attr("fill", function (d) {
                        return z(d.key);
                    })
                    .duration(500);

                // update legend:
                legend4.selectAll("circle")
                    .transition()
                    .attr("fill", function (d) {
                        if (filtered.length) {
                            if (filtered.indexOf(d) == -1) {
                                return z(d);
                            }
                            else {
                                return "white";
                            }
                        }
                        else {
                            return z(d);
                        }
                    })
                    .duration(100);
            }

            function highlight() {
                bar.filter(function (d) {
                    return d.value > 6000000;
                })
                    .attr("fill", "red");
            }

        });

}