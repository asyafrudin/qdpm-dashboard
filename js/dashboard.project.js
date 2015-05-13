var ongoingStatusChart;
var populationChart;

$(document).ready(function() {
    // Set chart options
    Highcharts.setOptions({
        plotOptions: {
            series: {
                events: {
                    legendItemClick: function () {
                            return false; // Disable clicking on chart legends
                    }
                }
            }
        }
    });

    // Load chart for the first time
    refreshChart();

    var now = new Date();
    var refreshTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
    if (refreshTime < 0) {
         refreshTime += 86400000; // It's already past 10:00 AM today, set refreshTime to 10:00 AM tomorrow.
    }
    // Refresh chart every 24 hours starting from refreshTime (i.e. 10:00 AM)
    setTimeout(function() { refreshChart(); setInterval(refreshChart, 86400000); }, refreshTime);
});

function refreshChart() {
    // Load ongoingStatusChart
    $.getJSON('index.php/project/get_ongoing_status', function(json) {
        ongoingStatusChart = new Highcharts.Chart({
            chart: {
                renderTo: 'ongoingstatus',
                type: 'column'
            },
            title: {
                text: 'Status of Ongoing Projects'
            },
            xAxis: {
                categories: json.name
            },
            yAxis: {
                max: 2,
                min: -1,
                title: {
                    text: 'Project Status'
                }
            },
            series: [{
                data: json.numeric_status,
                name: 'Status',
                color: '#009900',
                negativeColor: '#BB0000'
            }],
        });
    });

    // Load populationChart
    $.getJSON('index.php/project/get_population', function(json) {
        var categories = ['Projects'];
        var openProject = json['open']; // Number of open projects that is not overdue
        var overdueProject = json['overdue']; // Number of overdue projects
        var closedProject = json['closed']; // Number of closed projects
        var maxProject = 
            Math.ceil(Math.max(openProject, closedProject) / 10) * 10; // Max number of projects "ceil"-ed to nearest 10
        populationChart = new Highcharts.Chart({
            chart: {
                renderTo: 'population',
                type: 'bar'
            },
            title: {
                text: 'Project Population'
            },
            xAxis: [{
                categories: categories,
                labels: {
                    step: 1
                }
            }, { // mirror axis on right side
                opposite: true,
                categories: categories,
                linkedTo: 0,
                labels: {
                    step: 1
                }
            }],
            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    formatter: function () {
                        return (Math.abs(this.value));
                    }
                },
                max: maxProject,
                min: -maxProject
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    pointWidth: 50
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + ' ' + this.point.category + '</b>: ' 
                        + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                }
            },
            series: [{
                name: 'Ongoing',
                data: [-openProject],
                color: '#009900'
            }, {
                name: 'Overdue',
                data: [-overdueProject],
                color: '#BB0000'
            }, {
                name: 'Closed/On Hold/Cancelled',
                data: [closedProject]
            }]
        });
    });
}
