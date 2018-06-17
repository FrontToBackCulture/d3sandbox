var tasks = [
    {"startDate":new Date("Sun Dec 09 00:00:45 EST 2012"),"endDate":new Date("Sun Dec 09 02:36:45 EST 2012"),"taskName":"E Job","status":"RUNNING"},
    {"startDate":new Date("Sun Dec 09 08:49:53 EST 2012"),"endDate":new Date("Sun Dec 09 06:34:04 EST 2012"),"taskName":"D Job","status":"RUNNING"},
    {"startDate":new Date("Sun Dec 09 03:27:35 EST 2012"),"endDate":new Date("Sun Dec 09 03:58:43 EST 2012"),"taskName":"P Job","status":"SUCCEEDED"},
    {"startDate":new Date("Sun Dec 09 03:27:35 EST 2012"),"endDate":new Date("Sun Dec 09 03:58:43 EST 2012"),"taskName":"N Job","status":"KILLED"}
];  

// var svg2 = d3.select("body").append("svg")
// .attr("width", 960)
// .attr("height", 100)

// svg2.append("text")
//   .text(d3.timeDay.offset(getEndDate(), -7))
//   .attr("y", 50)

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

