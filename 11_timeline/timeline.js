/**
 * @module groupedBarChart
 */

function ganttChart() {

    function chart(selection) {

        var width,
            height;

        selection.each(function (data) {

            var tasks=data;
        console.log(tasks);

        var taskStatus = {
            "SUCCEEDED" : "bar",
            "FAILED" : "bar-failed",
            "RUNNING" : "bar-running",
            "KILLED" : "bar-killed"
        };

        var taskNames = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];

        tasks.sort(function(a, b) {
            return a.endDate - b.endDate;
        });

        var maxDate = tasks[tasks.length - 1].endDate;

        tasks.sort(function(a, b) {
            return a.startDate - b.startDate;
        });
        var minDate = tasks[0].startDate;

        var format = "%H:%M";
        var timeDomainString = "1day";

        var gantt = d3.gantt().height(450).width(800).taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);

        // gantt.timeDomainMode("fixed");
        changeTimeDomain(timeDomainString);
        gantt(tasks);

            function changeTimeDomain(timeDomainString) {
                this.timeDomainString = timeDomainString;
                switch (timeDomainString) {
                    case "1hr":
                        format = "%H:%M:%S";
                        gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -1), getEndDate() ]);
                        break;
                    case "3hr":
                        format = "%H:%M";
                        gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -3), getEndDate() ]);
                        break;

                    case "6hr":
                        format = "%H:%M";
                        gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -6), getEndDate() ]);
                        break;

                    case "1day":
                        format = "%H:%M";
                        gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -1), getEndDate() ]);
                        break;

                    case "1week":
                        format = "%a %H:%M";
                        gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -7), getEndDate() ]);
                        break;
                    default:
                        format = "%H:%M"

                }
                gantt.tickFormat(format);
                gantt.redraw(tasks);
            }

            function getEndDate() {
                var lastEndDate = Date.now();
                if (tasks.length > 0) {
                    lastEndDate = tasks[tasks.length - 1].endDate;
                }
                return lastEndDate;
            }

            function addTask() {

                var lastEndDate = getEndDate();
                var taskStatusKeys = Object.keys(taskStatus);
                var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
                var taskName = taskNames[Math.floor(Math.random() * taskNames.length)];

                tasks.push({
                    "startDate" : d3.timeHour.offset(lastEndDate, Math.ceil(1 * Math.random())),
                    "endDate" : d3.timeHour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
                    "taskName" : taskName,
                    "status" : taskStatusName
                });

                changeTimeDomain(timeDomainString);
                gantt.redraw(tasks);
            }

            function removeTask() {
                tasks.pop();
                changeTimeDomain(timeDomainString);
                gantt.redraw(tasks);
            }


            d3.selectAll("button")
                .on("click", function () {
                    addTask();
                });



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

    return chart;
}
