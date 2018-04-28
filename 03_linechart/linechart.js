/**
 * @module lineChart
 */

function lineChart() {
    var width,
        height,
        margin = {top: 30, right: 20, bottom: 70, left: 50},
        color = d3.scaleOrdinal(d3["schemeDark2"]);

    var benchMarkLine,
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

            var width_legend = width - margin.left - margin.right,
                height_legend = 25;

            var dataL = 0;
            var legendOffSet = 55; //Melvin: space between legend
            var newdataL;
            var keys = [];

            var svgLegned4 = d3.select(".legend").append("svg")
                .attr("width", width_legend)
                .attr("height", height_legend);

            var dataNest = d3.nest()
                .key(function(d) {return d.symbol;})
                .entries(data);

            //Scale Start ===============================================================================================================

            // Set the ranges
            var xScale = d3.scaleTime().range([0, width]);
            var yScale = d3.scaleLinear().range([height, 0]);

            // Scale the range of the data
            xScale.domain(d3.extent(data, function(d) { return d.date; }));
            yScale.domain([0, d3.max(data, function(d) { return d.price; })]);
            //Scale End ===============================================================================================================

            // Define the line
            var priceline = d3.line()
                .x(function(d) { return xScale(d.date); })
                .y(function(d) { return yScale(d.price); });

            //Axis Start ===============================================================================================================

            //Define X axis
            var xAxis = d3.axisBottom().scale(xScale);

            //Define Y axis
            var yAxis = d3.axisLeft().scale(yScale);

            //Axis End ===============================================================================================================

            var svg = selection.append("svg")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


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
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            //Melvin: draw the y axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("x", 2)
                .attr("y", yScale(yScale.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Price"); //axes label

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

            var dots=svg.selectAll(".dot")
                .data(data)
                .enter().append("circle") // Uses the enter().append() method
                .attr("class", "dot") // Assign a class for styling
                .attr("cx", function(d, i) { return xScale(d.date) })
                .attr("cy", function(d) { return yScale(d.price) })
                .attr("r", 3)
                .attr("fill","orange")
                .attr("opacity",0.50)
                .on("mouseover", function(d) {

                    //Get this bar's x/y values, then augment for the tooltip
                    // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                    var xPosition = d3.event.pageX+10;
                    var yPosition = d3.event.pageY;

                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select("#value")
                        .text(d.date + " , " + d.price);

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);

                })
                .on("mouseout", function() {

                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
                });



            // Loop through each symbol / key
            dataNest.forEach(function(d,i) {

                keys.push(d.key);

                svg.append("path")
                    .attr("class", "line")
                    .style("stroke", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                    .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign an ID
                    .attr("d", priceline(d.values));



                svgLegned4.append("circle")
                    .attr("transform", function () {
                        if (i === 0) {
                            dataL = (d.key).length + legendOffSet;
                            return "translate(0,0)";
                        } else {
                            newdataL = dataL;
                            dataL += (d.key).length + legendOffSet;
                            return "translate(" + (newdataL) + ",0)";
                        }
                    })
                    .attr("cx", 30)
                    .attr("cy", 10)
                    .attr("r", 5)
                    .attr("fill", color(d.key))
                    .attr("stroke", color(d.key))
                    .on("click", function(){
                        // Determine if current line is visible
                        var active   = d.active ? false : true,
                            newOpacity = active ? 0 : 1;
                        // Hide or show the elements based on the ID
                        d3.select("#tag"+d.key.replace(/\s+/g, ''))
                            .transition().duration(100)
                            .style("opacity", newOpacity);
                        // Update whether or not the elements are active
                        d.active = active;
                        d3.select(this).transition()
                            .attr("fill",function(){
                                console.log(active)
                                if (active == true) {
                                    return "white";
                                } else{
                                    return color(d.key);
                                }
                            });
                        update(d.key);

                    });

                // Add the Legend
                svgLegned4.append("text")
                    .attr("transform", function () {
                        if (i === 0) {
                            dataL = (d.key).length + legendOffSet;
                            return "translate(0,0)";
                        } else {
                            //var newdataL = dataL;
                            //dataL += (d.key).length + legendOffSet;
                            return "translate(" + (newdataL) + ",0)";
                        }
                    })
                    .attr("x", 40)  // space legend
                    .attr("y", 15)
                    .attr("class", "legendText")    // style the legend
                    .style("fill", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                    .text(d.key)
                    .on("mouseover", function() {

                        //Get this bar's x/y values, then augment for the tooltip
                        // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                        var xPosition = d3.event.pageX+10;
                        var yPosition = d3.event.pageY;

                        //Update the tooltip position and value
                        d3.select("#legend_tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .select("#legend_value")
                            .text(d.key);

                        //Show the tooltip
                        d3.select("#legend_tooltip").classed("hidden", false);

                    })
                    .on("mouseout", function() {

                        //Hide the tooltip
                        d3.select("#legend_tooltip").classed("hidden", true);
                    });

            });

            //Draw End ===============================================================================================================


            //Highlight Button Start =================================================================================================

            d3.selectAll("input")
                .on("click", function () {

                    var view = d3.select(this).node().value;

                    //Reset all to black
                    dots.attr("fill", function (d) {
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

                });

                console.log(filtered);

                filtered_data = data.filter(function(sdata){
                    return filtered.indexOf(sdata.symbol) < 0;
                });
                console.log(filtered_data);

                removed_data = data.filter(function(sdata){
                    return filtered.indexOf(sdata.symbol) > -1;
                });
                console.log(removed_data);

                svg.selectAll(".dot")
                    .remove();

                svg.selectAll(".dot")
                    .data(filtered_data)
                    .enter().append("circle") // Uses the enter().append() method
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function(d, i) { return xScale(d.date) })
                    .attr("cy", function(d) { return yScale(d.price) })
                    .attr("r", 3)
                    .attr("fill","orange")
                    .attr("opacity",0.50)
                    .on("mouseover", function(d) {

                        //Get this bar's x/y values, then augment for the tooltip
                        // var xPosition = parseFloat(d3.select(this).attr("x")) + x1Scale.bandwidth() / 2;
                        var xPosition = d3.event.pageX+10;
                        var yPosition = d3.event.pageY;

                        //Update the tooltip position and value
                        d3.select("#tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .select("#value")
                            .text(d.date + " , " + d.price);

                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", false);

                    })
                    .on("mouseout", function() {

                        //Hide the tooltip
                        d3.select("#tooltip").classed("hidden", true);
                    });

                /*
                                yScale.domain([0, d3.max(filtered_data, function(d) { return d.price; })]);
                
                                svg.select(".y")
                                    .transition()
                                    .call(yAxis)
                                    .duration(500);
                                */
            }


            /**
             * @summary Highlight the bar based on the defined criteria
             * @description Highlight the bar in red for bars that meet the criteria
             * @function highlight
             * @public
             * @instance
             */
            function highlight() {
                dots.filter(function (d) {
                    return d.price > 110;
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

    return chart;
}