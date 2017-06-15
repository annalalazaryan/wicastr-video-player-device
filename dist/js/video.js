$(document).ready(function () {
    var VideoPlayer = function () {
        var self = this;
        self.liveUrl = "gghgh";
        self.playUrl = "";
        this.check = "";
        this.hlsobj;
        this.player;
        this.videoControl;
        this.video;
        this.currentUrl;

        this.settings = {
            videoItemsVideo: items.playlist,
            videoStrem: items.stream,
            ajaxTime: 500,
            count: 0,
            num: 0,
            strem: 0
        };

        this.loadPlaylist = function () {
            var obj = [];
            if (self.settings.videoStrem.isEnabled) {
                obj.push({name: "stream", url: self.settings.videoStrem.streamUrl});
            }
            var vid = self.settings.videoItemsVideo;
            var len = Object.keys(this.settings.videoItemsVideo).length

            for (var i = 0; i < len; i++) {
                obj.push({name: vid[i].name, url: vid[i].url})
            }
            return obj;
        };

        this.requestPlaylistWithDelay = function () {
            setTimeout(function () {
                self.requestPlaylist()
            }, this.settings.ajaxTime);
        };

        this.requestPlaylist = function () {
            $.post("/url", {data: "data"}, function (data) {
                self.settings.videoItemsVideo = data.playlist
                self.settings.videoStrem = data.stream
                var chekos = self.checkedOs()
                if (chekos == 3) {
                    if (data.stream.isEnabled && self.liveUrl !== data.stream.streamUrl) {
                        console.log(self.liveUrl)
                        self.liveUrl = data.stream.streamUrl
                        self.liveStream()
                    } else if (!data.stream.isEnabled) {
                        if (self.settings.strem == 1) {
                            self.liveUrl = ""
                            self.endStream()
                        }
                    }
                } else {
                    if (data.stream.isEnabled ) {
                        console.log(self.liveUrl)
                        self.playUrl = data.stream.streamUrl

                        $("#videoUrl .stream").remove();
                        $("#videoUrl .videoitems").eq(0).before("<a class='videoitems btn-block text-center stream' rel=" + self.playUrl + ">stream</a>")
                    } else if (!data.stream.isEnabled) {
                        $("#videoUrl").children("a.stream").remove()
                    }
                }
                self.settings.ajaxTime = 3000;
                self.requestPlaylistWithDelay()
            })
        };

        this.createVideo = function () {
            $(".divteg").html("<video id='video' width='100%' controls></video>");
            self.video = $(".divteg video");

            self.player = plyr.setup(video[0]);

            self.video.on("ended", function(){
                self.playNextVideo();
            });
        };

        this.resetVideo = function () {
            self.video[0].srcObject = null;
            self.video[0].src ="";
            self.video[0].load();
        };

        this.setupVideoControl = function() {
            this.videoControl = new VideoControl();

            this.videoControl.setup(self.player[0], self.hlsobj);
        };

        this.setupHls = function() {
            if (!Hls.isSupported()) {
                return;
            }

            self.hlsobj = new Hls({
                debug: false,
                maxBufferHole: 1,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 4,
                manifestLoadingRetryDelay: 500
            });

            self.hlsobj.on(Hls.Events.MEDIA_ATTACHED, function () {
                self.hlsobj.loadSource(self.currentUrl);
            });

            self.hlsobj.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
                self.videoControl.setHlsLevels(data);

                self.video[0].play();
            });

            self.hlsobj.on(Hls.Events.ERROR, function (event, data) {
                console.log("HLS Error");
                console.log(data);

                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:

                            console.log("Hls.ErrorTypes.NETWORK_ERROR");

                            // try to recover network error
                            self.hlsobj.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("Hls.ErrorTypes.MEDIA_ERROR");

                            self.hlsobj.recoverMediaError();
                            break;
                        default:
                            // cannot recover

                            self.destroy();
                            self.setup();

                            break;
                    }
                } else {
                    if (data.details ===  Hls.ErrorDetails.INTERNAL_EXCEPTION) {
                        console.log('Internal exception', data);

                        self.destroy();
                        self.setup();
                    }
                }
            });
        };

        this.checkedOs = function () {
            var isAndroid = /(android)/i.test(navigator.userAgent);

            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                return "1"
            } else if (isAndroid) {
                return "2";
            } else {
                return "3"
            }
        };

        this.setup = function () {
            //this.requestPlaylistWithDelay();
            
            this.createVideo();

            if (Hls.isSupported()) {
                this.setupHls();
            }

            this.setupVideoControl();

            var os = this.checkedOs();
            if (os == 1) {
                self.check = "ios";
            } else if (os == 2) {
                self.check = "android";
            } else {
                self.check = "browser";
            }

            this.start();
        };

        this.start = function (item) {
            self[self.check]();
        };

        this.android = function () {
            var videoItems = self.loadPlaylist()
            $("#videoUrl").html(" ")
            for (var k = 0; k < videoItems.length; k++) {
                $("#videoUrl").append("<a class='videoitems btn-block btn text-center " + videoItems[k].name + "' rel=" + videoItems[k].url + ">" + videoItems[k].name + "</a>")
            }
            self.browser()
        };

        this.ios = function () {
            init.init()
        };

        this.browser = function () {
            var url = "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";

            this.playVideo(url);
        };

        this.playVideo = function(url) {
            var u = url.indexOf("mp4")

            if (u < 0 && Hls.isSupported()) {
                this.playWithHls(url);
            } else {
                this.playWithVideoTag(url);
            }
        };

        this.playWithHls = function (url) {
            self.currentUrl = url;

            self.hlsobj.attachMedia(self.video[0]);
        };

        this.playWithVideoTag = function(url) {
            self.video[0].src = url;
            self.video[0].play(url);
        };

        this.playNextVideo = function () {
            this.pauseVideo();

            self.settings.num += 1;

            self.hlsobj.detachMedia();

            self.resetVideo();

            self.onEnd();
        };

        this.pauseVideo = function() {
            self.video[0].pause();
        };

        this.onEnd = function () {
            var len = self.settings.videoItemsVideo.length

            if (len <= self.settings.num) {
                self.settings.num = 0;
            }
            this.start();
        };

        this.destroy = function() {
            this.settings.num = 0;
            this.check = "";
            this.currentUrl = "";

            this.pauseVideo();

            this.videoControl.destroy();
            this.videoControl = null;

            this.resetVideo();
            this.player[0].destroy();
            this.player = null;
            this.video = null;

            this.hlsobj.destroy();
            this.hlsobj = null;
        };

        this.liveStream = function () {
            self.settings.strem = 1;
            self.playVideo(self.liveUrl);
        };

        this.endStream = function () {
            self.settings.strem = 0;
            self.destroy();
            self.setup();
        };
    };

    var Ios = function () {
        var self = this;
        var videoItems = play.loadPlaylist();
        this.num = 0;

        this.init = function (url) {
            for (var k = 0; k < videoItems.length; k++) {
                $("#videoUrl").append("<a class='videoitems btn-block  text-center " + videoItems[k].name + "' rel=" + videoItems[k].url + ">" + videoItems[k].name + "</a>");
            }

            self.firstPlay();
        };

        this.firstPlay = function () {
            play.createVideo();

            var video = play.video[0];
            video.src = videoItems[self.num].url;
            video.play();
            video.addEventListener('ended', function () {
                self.num += 1;
                self.end();
            }, false);
        };

        this.end = function () {
            var len = videoItems.length;

            if (len <= self.num) {
                self.num = 0;
            }
            self.firstPlay();
        };

        this.play = function (url) {
            play.createVideo();

            var video = play.video[0];
            video.src = url;
            video.play();
            self.click();
        };
    };

    var play = new VideoPlayer();
    play.setup();

    var init = new Ios();
    
    $("#videoUrl").on("click", "a", function () {
        var os = play.checkedOs();
        var rel = $(this).attr("rel");

        if (os == 1) {
            init.play(rel);
        } else if (os == 2) {
            play.hls(rel);
        }

    });
});