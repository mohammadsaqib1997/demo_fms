var Dashboard = function() {"use strict";
    var warningbar = function(el) {
        var alertbar = $('.alertsbar');
        alertbar.show();
        setTimeout(function () {
            alertbar.fadeOut();

		},5000);
    };
	return {
		init: function() {
			warningbar();
		}
	};
}();
