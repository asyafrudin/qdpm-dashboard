var ongoingStatusChart; // Status of Ongoing Projects chart
var populationChart; // Project Population chart
var chartColors = []; // Global colors for project status
chartColors['overdue'] = '#BB0000';
chartColors['delayed'] = '#FFCC00';
chartColors['ontrack'] = '#009900';

$(document).ready(function() {
    // Set chart options
    Highcharts.setOptions({
        legend: {
            itemHoverStyle: {
                cursor: 'default'
            }
        },
        plotOptions: {
            series: {
                events: {
                    legendItemClick: function() {
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
    var ontrackProject = 0; // Number of On Track projects
    var delayedProject = 0; // Number of Delayed projects
    var overdueProject = 0; // Number of Overdue projects

    $.getJSON('index.php/project/get_ongoing_status', function(json) {
        var projectData = [];
        var projectColors = []; // Status colors for each project
        $.each(json, function(key, value) {
            projectData.push({
                name: value[0],
                y: value[1],
                myID: value[2]
            });
            if (value[1] >= 0.5) { // On Track projects
                projectColors.push(chartColors['ontrack']);
                ontrackProject++;
            } else if (value[1] >= 0) { // Delayed projects
                projectColors.push(chartColors['delayed']);
                delayedProject++;
            } else { // Overdue projects
                projectColors.push(chartColors['overdue']);
                overdueProject++;
            }
        });

        // Load ongoingStatusChart
        ongoingStatusChart = new Highcharts.Chart({
            chart: {
                renderTo: 'ongoingstatus',
                type: 'bar'
            },
            title: {
                text: 'Status of Ongoing Projects'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Work/Time'
                },
                tickInterval: 0.5
            },
            plotOptions: {
                series: {
                    colorByPoint: true,
                    colors: projectColors,
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                window.open(qdpmUrl + 'index.php/tasks?projects_id=' + this.myID, '_blank');
                            }
                        }
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.point.name + '</b><br/>' +
                        'Work/Time Score: ' + this.point.y;
                }
            },
            series: [{
                name: 'Ongoing Project Status',
                data: projectData
            }],
        });

        $.getJSON('index.php/project/get_population', function(json) {
            var closedProject = json['closed']; // Number of closed projects
            var maxProject = 
                Math.ceil(Math.max(ontrackProject + delayedProject + overdueProject, closedProject) / 10) * 10 + 5;
                // The "+ 5" above was simply to prevent stackLabels from being hidden when maxProject is a multiple of 10
            var populationCategories = ['Projects'];

            // Load populationChart (Must be loaded after ongoingStatusChart)
            populationChart = new Highcharts.Chart({
                chart: {
                    renderTo: 'population',
                    type: 'column'
                },
                title: {
                    text: 'Project Population'
                },
                xAxis: [{
                    categories: populationCategories
                }, { // mirror axis on right side
                    opposite: true,
                    categories: populationCategories,
                    linkedTo: 0
                }],
                yAxis: {
                    title: {
                        text: null
                    },                    
                    labels: {
                        formatter: function() {
                            return Math.abs(this.value);
                        }
                    },
                    stackLabels: {
                        enabled: true,
                        formatter: function() {
                            return "Total: " + Math.abs(this.total);
                        }
                    },
                    max: maxProject,
                    min: -maxProject
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        pointWidth: 100,
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Math.abs(this.y);
                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.series.name + ' ' + this.point.category + '</b>: ' 
                            + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                    }
                },
                series: [{
                    name: 'Overdue',
                    data: [-overdueProject],
                    color: chartColors['overdue']
                }, {
                    name: 'Delayed',
                    data: [-delayedProject],
                    color: chartColors['delayed']
                }, {
                    name: 'On Track',
                    data: [-ontrackProject],
                    color: chartColors['ontrack']
                }, {
                    name: 'Closed/On Hold/Cancelled',
                    data: [closedProject]
                }]
            });
        });
    });
}
