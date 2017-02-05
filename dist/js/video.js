$(document).ready(function () {
    var Video = function () {
        var self = this;
        self.liveUrl = "";
        self.playUrl = "";

        this.settings = {
            videoItemsVideo: items.video,
            videoStrem: items.stream,
            ajaxTime: 500,
            count: 0,
            num: 0,
            strem: 0
        }

        this.hls = function (url) {
            if (Hls.isSupported()) {
                var video = document.getElementById('video');
                var hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                var player = plyr.setup(video);
                player[0].on("ended", function () {
                    self.onEnd()
                })
            }
        }

        this.start = function (item) {
            var url = this.settings.videoItemsVideo[this.settings.num].url
            return this.hls(url)
        }

        this.onEnd = function () {
            var len = Object.keys(this.settings.videoItemsVideo).length
            var k = len - 1;
            this.settings.num += 1;
            if (k >= this.settings.num) {
                console.log(this.settings.num, k)

                this.start();

            } else {
                this.settings.num = 0;
                this.start();
                console.log("asxsdcsdcd", k)

            }

        }
        this.liveStream = function () {
            self.liveUrl = self.settings.videoStrem.url
            self.settings.strem = 1;
            this.hls(self.settings.videoStrem.url)
        }
        this.endStream = function () {
            self.settings.strem = 0;
            self.initial()
        }
        this.next = function () {

        }

        this.android = function () {

        }

        this.ios = function () {

        }

        this.browser = function () {
            console.log("brouwsee")
            if (Hls.isSupported()) {
                this.hls();
            } else {

            }
        }

        this.time = function () {
            setTimeout(function () {
                self.ajax()
            }, this.settings.ajaxTime);
        }

        this.ajax = function () {
            $.post("/url", {data: "data"}, function (data) {
                self.settings.videoItemsVideo = data.video
                self.settings.videoStrem = data.stream
                if (data.stream.isEneblid == "true" && self.liveUrl != data.stream.url) {
                    self.liveStream()
                } else if(data.stream.isEneblid == "false"){
                    if (self.settings.strem == 1) {
                        self.endStream()
                    }
                }
                self.settings.ajaxTime = 3000;
                self.time()
            })
        }

        this.checkedOs = function () {
            var isAndroid = /(android)/i.test(navigator.userAgent);

            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                return "ios"
            } else if (isAndroid) {
                return "android";
            } else {
                return "browser"
            }
        }

        this.initial = function () {
            this.time();
            console.log(Object.keys(this.settings.videoItemsVideo).length)
            var os = this.checkedOs()
            if (os == 1) {
                this.start("ios")
            } else if (os == 2) {
                this.start("android")
            } else {
                this.start("browser")
            }
        }
    }

    var play = new Video()
    play.initial()
})
