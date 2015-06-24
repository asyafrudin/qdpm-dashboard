var ongoingStatusChart; // Status of Ongoing Projects chart
var populationChart; // Project Population chart
var chartColors = []; // Global colors for project status
chartColors['overdue'] = '#BB0000';
chartColors['delayed'] = '#FFCC00';
chartColors['ontrack'] = '#009900';
chartColors['onhold'] = '#888888';
chartColors['cancelled'] = '#444444';

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
    var selectedProjectType = $('#project-type').val(); // Get selected project type
    refreshChart(selectedProjectType);

    // Submit event handler for filter
    $('#chart-filter form').submit(function(e) {
        e.preventDefault();
        selectedProjectType = $('#project-type').val();
        refreshChart(selectedProjectType);
    });

    // Function to load or refresh charts
    function refreshChart(projectType) {
        var ontrackProject = 0; // Number of On Track projects
        var delayedProject = 0; // Number of Delayed projects
        var overdueProject = 0; // Number of Overdue projects

        $.getJSON('index.php/project/get_ongoing_status/' + projectType, function(json) {
            if (json.length == 0) {
                alert('No projects available!');
                return false;
            }
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

            // Set height for ongoingStatusChart (Uses populationChart's height as default height)
            $("#ongoingstatus").height((json.length > 40) ? json.length * 20 : $("#population").height());

            // Load ongoingStatusChart
            ongoingStatusChart = new Highcharts.Chart({
                chart: {
                    renderTo: 'ongoingstatus',
                    type: 'bar'
                },
                title: {
                    text: 'Status of Ongoing Projects'
                },
                legend: {
                    enabled: false
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
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true
                        },
                        cursor: 'pointer', // Added click handler for each bar/column in series
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
                    useHTML: true,
                    formatter: function() {
                        return '<a href="' + qdpmUrl + 'index.php/tasks?projects_id=' + this.point.myID + '" target="_blank">' +
                            '<b>' + this.point.name + '</b> ' +                             
                            '<span class="glyphicon glyphicon-new-window" aria-hidden="true"></span></a><br/>' +
                            'Work/Time Score: ' + this.point.y;
                    }
                },
                series: [{
                    name: 'Ongoing Project Status',
                    data: projectData
                }],
            });

            $.getJSON('index.php/project/get_population/' + projectType, function(json) {
                var closedProject = (typeof json['Closed'] != "undefined") ? json['Closed'] : 0; // Number of closed projects
                var onholdProject = (typeof json['On Hold'] != "undefined") ? json['On Hold'] : 0; // Number of on hold projects
                var cancelledProject = (typeof json['Cancelled'] != "undefined") ? json['Cancelled'] : 0; // Number of cancelled projects
                var maxProject = 
                    Math.ceil(Math.max(ontrackProject + delayedProject + overdueProject + onholdProject, 
                                        closedProject + cancelledProject) / 10) * 10 + 5;
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
                    legend: {
                        itemWidth: 85,
                        reversed: true
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
                            pointWidth: 80,
                            dataLabels: {
                                enabled: true,
                                formatter: function() {
                                    if (this.y == 0 ) return ''; // Don't show dataLabel if value is 0
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
                        name: 'On Hold',
                        data: [onholdProject],
                        color: chartColors['onhold']
                    }, {
                        name: 'Cancelled',
                        data: [cancelledProject],
                        color: chartColors['cancelled']
                    }, {
                        name: 'Closed',
                        data: [closedProject]
                    }]
                });
            });
        });
    }
});
