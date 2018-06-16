/**
 * @module groupedBarChart
 */

function ganttChart() {
    var width,
        height,
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        color = d3.scaleOrdinal(d3["schemeDark2"]);

    var legendLoc,
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