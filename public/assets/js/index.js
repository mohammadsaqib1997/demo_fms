var ChartLoader = function() {
    'use strict';
	var chart3Handler = function() {
		// Chart.js Data
		var data = [{
			value: 300,
			color: '#F7464A',
			highlight: '#FF5A5E',
			label: 'Monthly'
		}, {
			value: 50,
			color: '#46BFBD',
			highlight: '#5AD3D1',
			label: 'Yearly'
		}];

		// Chart.js Options
		var options = {

			// Sets the chart to be responsive
			responsive: false,

			//Boolean - Whether we should show a stroke on each segment
			segmentShowStroke: true,

			//String - The colour of each segment stroke
			segmentStrokeColor: '#fff',

			//Number - The width of each segment stroke
			segmentStrokeWidth: 2,

			//Number - The percentage of the chart that we cut out of the middle
			percentageInnerCutout: 50, // This is 0 for Pie charts

			//Number - Amount of animation steps
			animationSteps: 100,

			//String - Animation easing effect
			animationEasing: 'easeOutBounce',

			//Boolean - Whether we animate the rotation of the Doughnut
			animateRotate: true,

			//Boolean - Whether we animate scaling the Doughnut from the centre
			animateScale: false,

			//String - A legend template
			legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'

		};
		// Get context with jQuery - using jQuery's .get() method.
		var ctx = $("#chart3").get(0).getContext("2d");
		// This will get the first returned node in the jQuery collection.
		var chart3 = new Chart(ctx).Doughnut(data, options);
		//generate the legend
		var legend = chart3.generateLegend();
		//and append it to your page somewhere
		$('#chart3Legend').append(legend);
	};
	return {
		init: function() {
			//chart1Handler();
			//chart2Handler();
			chart3Handler();
			//chart4Handler();
			//sparklineHandler();
		}
	};
}();



