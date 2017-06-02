(function() {
    VideoControl = function(){
        var self = this;

        self.plyr;
        self.hls;
        self.hlsLevels = [];
        self.hlsFirstLevel;

        this.init = function() {
            var plyrStatus = $('#video-info .play-status');
            plyrStatus.on('click', function(e){
                self.plyr.togglePlay();
            });

            var plyrVolume = $('#video-info .play-volume');
            plyrVolume.on('click', function(e){
                self.plyr.toggleMute();
            });
        };

        this.init();

        this.setup = function(plyr, hls) {
            this.plyr = plyr;
            this.hls = hls;

            this.setupPlyrStatus();
            this.setupPlyrVolume();
            this.setupPlyrTime();

            this.setupHlsErrorHandler();
            this.setupHlsLevels();
        };

        this.setHlsLevels = function(data) {
            this.hlsLevels = data.levels;
            this.hlsFirstLevel = data.firstLevel;
        };

        this.setupPlyrStatus = function() {
            this.plyr.on('play', function(e) {
                self.togglePlyrStatus(false);
            });

            this.plyr.on('pause', function(e) {
                self.togglePlyrStatus(true);
            });
        };

        this.togglePlyrStatus = function(paused) {
            var plyrStatus = $('#video-info .play-status');
            if (paused) {
                plyrStatus.addClass("paused");
            } else {
                plyrStatus.removeClass("paused");
            }

            plyrStatus.show();
        };

        this.setupPlyrVolume = function() {
            this.togglePlyrVolume(self.plyr.isMuted());
            
            this.plyr.on('volumechange', function(e) {
                if(self.plyr.isMuted()) {
                    self.togglePlyrVolume(true);
                } else {
                    self.togglePlyrVolume(false);
                }
            });
        };

        this.togglePlyrVolume = function(muted) {
            var plyrVolume = $('#video-info .play-volume');
            if (muted) {
                plyrVolume.addClass("muted");
            } else {
                plyrVolume.removeClass("muted");
            }

            plyrVolume.show();
        };

        this.setupPlyrTime = function() {
            this.plyr.on('timeupdate', function(e) {
                var dt = new Date(null);
                dt.setSeconds(self.plyr.getCurrentTime());

                var time = dt.toISOString().substr(11, 8);
                $('#video-info .play-time span').html(time);
            });
        };

        this.setupPlyrErrorHandler = function() {
            this.plyr.on('error', function(e) {
                var err = self.plyr.getContainer().error;
                $('#video-info .play-error span').append(err);
            });
        };

        this.setupHlsErrorHandler = function() {
            this.hls.on(Hls.Events.ERROR, function (event, data) {
                var msg = '';

                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // try to recover network error
                            msg = "Network error, trying to recover.";
                            console.log(msg);
                            $('#video-info .play-error span').html(msg);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            msg = "Media error, trying to recover.";
                            console.log(msg);
                            $('#video-info .play-error span').html(msg);
                            break;
                        default:
                            msg = data.type + ' Error. Will move to the next video.';
                            console.log(msg);
                            $('#video-info .play-error span').html(msg);
                            break;
                    }
                } else {
                    if (data.details ===  Hls.ErrorDetails.INTERNAL_EXCEPTION) {
                        msg = 'Internal HLS Error. Will reload the page.';
                        console.log(msg);
                        $('#video-info .play-error span').html(msg);
                    }
                }
            });
        };


        this.setupHlsLevels = function() {
            this.hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
                if (!self.hlsLevels[data.level]) {
                    return;
                }

                var levelDetails = self.hlsLevels[data.level];
                var levelBitrate = Math.round((levelDetails.bitrate / (1024 * 1024)) * 100) / 100;
                $('#video-info .play-hls-level .hls-levels').html(data.level + ' (' + levelBitrate + ' Mbps) of ' + self.hlsLevels.length);
            });
        };

        this.destroy = function() {
            $('#video-info .play-error span').html("");
            $('#video-info .play-hls-level .hls-levels').html("");
            $('#video-info .play-time span').html("");

            this.plyr = null;
            this.hls = null;
            this.hlsLevels = [];
            this.hlsFirstLevel = null;
        };
    };
})();