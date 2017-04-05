$(document).ready(function () {
    var monitorURL = "http://monitor.wicastr.in";
    var monitorDelay = 20000;
    var monitorRemoveDelay = 60000;
    var currSysState;

    var requestSysInfo = function() {
        $.get(monitorURL+'/sysinfo', function (data) {
            setupMonitorIframe(data.info);

            currSysState = data.info;
        });

        setTimeout(requestSysInfo, monitorDelay);
    };

    var setupMonitorIframe = function(sysinfo) {
        var connected = (sysinfo.inet.status == "success");

        if (currSysState && connected) {
            setTimeout(function(){
                $("#monitor-iframe").remove();
            }, monitorRemoveDelay); 
        } else {
            iframe = $('<iframe id="monitor-iframe" frameBorder="0" allowtransparency="true" src="' + monitorURL + '"></iframe>');
            $("#monitor-overlay").html(iframe);
            $("#monitor-iframe").show();
        }
    };

    requestSysInfo();
});

