$(document).ready(function () {
    var videoMonitor = new VideoMonitor();

    var Video = function () {
        var self = this;
        self.liveUrl = "gghgh";
        self.playUrl = "";
        this.check = "";

        this.settings = {
            videoItemsVideo: items.playlist,
            videoStrem: items.stream,
            ajaxTime: 500,
            count: 0,
            num: 0,
            strem: 0
        }

        this.getElements = function () {
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
        }

        this.hls = function (url) {
            var u = url.indexOf("mp4")
            if(u < 0) {
                if (Hls.isSupported()) {


                    var video = self.createVideo()
                    console.log(url)
                    var hls = new Hls({
                        debug: false,
                        maxBufferLength: 15,
                        maxBufferHole: 1,
                        maxSeekHole: 2,
                        startFragPrefetch: false,
                        manifestLoadingTimeOut: 10000,
                        manifestLoadingMaxRetry: 4,
                        manifestLoadingRetryDelay: 500,
                        enableCEA708Captions: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
                        // console.log(video)
                        var player = plyr.setup(video, {'controls':[]});
                        player[0].play()
                        player[0].on("ended", function () {
                            player[0].pause()
                            self.settings.num += 1
                            $(".divteg").html(" ")
                            self.onEnd()
                        })

                        videoMonitor.setup(player[0], hls);
                        videoMonitor.setupHls(hls, data);
                    });

                }
            }else{
                var video = self.createVideo()

                video.src = url;
                video.play(url)
                video.addEventListener('ended', function () {
                    video.pause()
                    self.settings.num += 1
                    $(".divteg").html(" ")
                    self.onEnd()
                })
            }
        }

        this.start = function (item) {
            console.log("aaaa")
            self[self.check]()
        }

        this.onEnd = function () {
            var len = self.settings.videoItemsVideo.length

            if (len <= self.settings.num) {
                self.settings.num = 0
            }
            this.start();


        }
        this.liveStream = function () {
            self.settings.strem = 1;
            self.hls(self.liveUrl)
        }
        this.endStream = function () {
            self.settings.strem = 0;
            self.initial()
        }

        this.android = function () {
            var videoItems = self.getElements()
            $("#videoUrl").html(" ")
            for (var k = 0; k < videoItems.length; k++) {
                $("#videoUrl").append("<a class='videoitems btn-block btn text-center " + videoItems[k].name + "' rel=" + videoItems[k].url + ">" + videoItems[k].name + "</a>")
            }
            self.browser()
        }

        this.ios = function () {
            console.log("asxasxasxsx")
            init.init()

        }

        this.browser = function () {
            var url = this.settings.videoItemsVideo[this.settings.num].url

            if (Hls.isSupported()) {
                this.hls(url);
            } else {
                console.log("asxasxasx")
            }
        }

        this.time = function () {
            setTimeout(function () {
                self.ajax()
            }, this.settings.ajaxTime);
        }

        this.ajax = function () {
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
                self.time()
            })
        }

        this.checkedOs = function () {
            var isAndroid = /(android)/i.test(navigator.userAgent);

            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                return "1"
            } else if (isAndroid) {
                return "2";
            } else {
                return "3"
            }
        }
        this.createVideo = function () {
            $(".divteg").html(" ")

            $(".divteg").append("<video id='video' width='100%' controls></video>")
            var video = document.getElementById('video')
            return video;
        }
        this.initial = function () {
            console.log(items)
            this.time();
            var os = this.checkedOs()
            if (os == 1) {
                self.check = "ios"
                //this.start("ios")
            } else if (os == 2) {
                self.check = "android"
                //this.start("android")
            } else {
                self.check = "browser"
            }
            this.start()
        }
    }

    var Ios = function () {
        var self = this;
        var videoItems = play.getElements()
        this.num = 0;

        this.init = function (url) {

            for (var k = 0; k < videoItems.length; k++) {
                $("#videoUrl").append("<a class='videoitems btn-block  text-center " + videoItems[k].name + "' rel=" + videoItems[k].url + ">" + videoItems[k].name + "</a>")
            }

            self.firstPlay()

        }
        this.firstPlay = function () {

            var video = play.createVideo();
            video.src = videoItems[self.num].url;
            video.play()
            video.addEventListener('ended', function () {
                self.num += 1;
                self.end()
            }, false);

        }
        this.end = function () {
            var len = videoItems.length

            if (len <= self.num) {
                self.num = 0
            }
            self.firstPlay();
        }
        this.play = function (url) {

            var video = play.createVideo();
            video.src = url;
            video.play()
            self.click()

        }


    }

    var play = new Video()
    var init = new Ios()
    play.initial()

    $("#videoUrl").on("click", "a", function () {
        var os = play.checkedOs()
        var rel = $(this).attr("rel")

        if (os == 1)
            init.play(rel);
        else if (os == 2)
            play.hls(rel)

    })

    var v = document.getElementById("aa");
    var player = plyr.setup(v);
    player[0].play()
    player[0].on("ended", function () {

    })
})