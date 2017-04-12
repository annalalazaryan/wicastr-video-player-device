(function() {
    VideoMonitor = function(){
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

            this.setupPlyrStatus();
            this.setupPlyrVolume();
            this.setupPlyrTime();
        };

        this.setupHls = function(hls, data) {
            this.hls = hls;
            this.hlsLevels = data.levels;
            this.hlsFirstLevel = data.firstLevel;

            this.setupHlsErrorHandler();
            this.setupHlsLevels();
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
                $('#video-info .play-error span').append(data.type + ' ' + data.details);
            });
        };


        this.setupHlsLevels = function() {
            this.hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
                $('#video-info .play-hls-level .hls-levels').html(data.level + '/' + self.hlsLevels.length);
            });
        };

    };
})();