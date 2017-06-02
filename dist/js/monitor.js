$(document).ready(function () {
    var Monitor = function() {
        var self = this;
        this.currSysState;
        this.monitorRemoveTimeout;
        this.forceDisplay = false;

        this.settings = {
            "url": "http://monitor.wicastr.in",
            "monitorDelay": 20000,
            "monitorRemoveDelay": 60000
        };

        this.requestSysInfo = function() {
            $.get(self.settings.url + '/sysinfo', function (data) {
                self.setupMonitorIframe(data.info);

                self.reloadIfConnectionRestored(data.info);

                self.currSysState = data.info;
            });

            setTimeout(self.requestSysInfo, self.settings.monitorDelay);
        };

        this.reloadIfConnectionRestored = function(data) {
            var connectionRestored = self.currSysState && 
                self.currSysState.inet.status == "danger" && 
                data.inet.status == "success";

            if (connectionRestored) {
                location.reload();
            }
        };

        this.setupMonitorIframe = function(sysinfo) {
            var connected = (sysinfo.inet.status == "success");

            if (!self.currSysState) {
                self.cancelHideMonitor();
                self.displayMonitor();

                return;
            }

            if (!connected) {
                self.cancelHideMonitor();
                self.forceToDisplay();
                self.displayMonitor();
            }
        };

        this.displayMonitor = function() {
            $("#monitor-overlay").show();

            if (!$("#monitor-iframe").length) {
                iframe = $('<iframe id="monitor-iframe" frameBorder="0" allowtransparency="true" src="' + self.settings.url + '"></iframe>');
                $("#iframe-cnt").html(iframe);
            }

            if (!self.isForcedToDisplay()) {
                self.hideMonitorWithDelay();
            }
        };

        this.isForcedToDisplay = function() {
            return self.forceDisplay;
        };

        this.forceToDisplay = function() {
            self.forceDisplay = true;
        };

        this.hideMonitorWithDelay = function() {
            self.monitorRemoveTimeout = setTimeout(function(){
                self.hideMonitor();
            }, self.settings.monitorRemoveDelay);
        };

        this.isMonitorVisible = function() {
            return $("#monitor-overlay").is(":visible");
        };

        this.hideMonitor = function() {
            $("#monitor-iframe").remove();
            $("#monitor-overlay").hide();
        };

        this.cancelHideMonitor = function() {
            clearTimeout(self.monitorRemoveTimeout);
        };

        $(document).keyup(function(e){
            switch(e.keyCode) {
                // ESC
                case 27:
                    self.cancelHideMonitor();
                    self.hideMonitor();

                    break;

                default:
                    self.cancelHideMonitor();
                    self.forceToDisplay();
                    self.displayMonitor();

                    break;
            }

        });

        this.adaptIframeHeight = function() {
            window.addEventListener("message", receiveMessage, false);

            function receiveMessage(event) {
                if (!$('#monitor-iframe').length) {
                    return;
                }
                
                var origin = event.origin || event.originalEvent.origin;
                if (origin !== self.settings.url) {
                    return;
                }

                if (event.data) {
                    $('#monitor-iframe').css('height', parseInt(event.data));
                    $('#iframe-cnt').css('height', parseInt(event.data));
                    $('#video-info').show();
                }
            }
        }
    };

    var monitorInst = new Monitor();
    monitorInst.requestSysInfo();
    monitorInst.adaptIframeHeight();
});

