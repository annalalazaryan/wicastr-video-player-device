$(document).ready(function () {
    var Monitor = function() {
        var self = this;
        this.currSysState;
        this.monitorRemoveTimeout;

        this.settings = {
            "url": "http://monitor.wicastr.in",
            "monitorDelay": 20000,
            "monitorRemoveDelay": 60000
        };

        this.requestSysInfo = function() {
            $.get(self.settings.url + '/sysinfo', function (data) {
                self.setupMonitorIframe(data.info);

                self.refreshDigitalSignage(data.info);

                self.currSysState = data.info;
            });

            setTimeout(self.requestSysInfo, self.settings.monitorDelay);
        };

        this.setupMonitorIframe = function(sysinfo) {
            var connected = (sysinfo.inet.status == "success");

            if (self.currSysState && connected) {
                self.removeIframeWithDelay();
            } else {
                self.cancelIframeRemoval();
                self.displayIframe();
            }
        };

        this.displayIframe = function() {
            if (!$("#monitor-iframe").length) {
                iframe = $('<iframe id="monitor-iframe" frameBorder="0" allowtransparency="true" src="' + self.settings.url + '"></iframe>');
                $("#monitor-overlay").html(iframe);
            }
        };

        this.refreshDigitalSignage = function(data) {
            var connectionRestored = self.currSysState && 
                self.currSysState.inet.status == "danger" && 
                data.inet.status == "success";

            if (connectionRestored) {
                location.reload();
            }
        };

        this.removeIframeWithDelay = function() {
            self.monitorRemoveTimeout = setTimeout(function(){
                self.removeIframe();
            }, self.settings.monitorRemoveDelay);
        };

        this.removeIframe = function() {
            $("#monitor-iframe").remove();
        };

        this.cancelIframeRemoval = function() {
            clearTimeout(self.monitorRemoveTimeout);
        };

        $(document).keyup(function(e){
            switch(e.keyCode) {
                // ESC
                case 27:
                    self.removeIframe();

                    break;

                default:
                    self.cancelIframeRemoval();
                    self.displayIframe();

                    break;
            }

        });
    };

    var monitorInst = new Monitor();
    monitorInst.requestSysInfo();
});

