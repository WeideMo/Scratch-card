function Scratch(canvas, width, height){
    this.mousedown = false;
    this.pre = [0, 0];
    this.cur = [0, 0];

    this.canvas = document.querySelector('canvas');
    this.canvas.style.backgroundColor = 'transparent';

    this.width = width || this.canvas.clientWidth;
    this.height = height || this.canvas.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.context = this.canvas.getContext('2d');

    var that = this;

    this.init = function(images, cover, callback){

        that.callback = callback;

        var bgImg = new Image();
        bgImg.src = images;
        bgImg.onload = function(e) {
            that.canvas.style.backgroundImage = 'url(' + bgImg.src + ')';
            that.canvas.style.backgroundRepeat = 'no-repeat';
            that.canvas.style.backgroundPosition = 'center';

            that.setCover(cover);
        }
    }

    this.setCover = function(images){
        that.context.fillStyle = 'transparent';
        that.context.fillRect(0, 0, that.width, that.height);

        var coverImg = new Image();
        coverImg.src = images;

        coverImg.onload = function() {

            that.coverImg = coverImg;

            that.context.rect(0, 0, that.width, that.height);

            //图片缩放覆盖
            that.context.scale(that.width / coverImg.width, that.width / coverImg.width);
            that.context.fillStyle = that.context.createPattern(coverImg, 'no-repeat');
            that.context.fill();
            that.context.globalCompositeOperation = 'destination-out';
        }
    }

    this.eventDown = function(e) {
        e.preventDefault();
        that.mousedown = true;
    }

    this.eventMove = function(e) {
        e.preventDefault();
        if (that.mousedown) {

            that.pre = that.cur;

            if (e.changedTouches) e = e.changedTouches[e.changedTouches.length - 1];

            var x = (e.clientX + document.body.scrollLeft || e.pageX) - that.canvas.offsetLeft || 0,
            y = (e.clientY + document.body.scrollTop || e.pageY) - that.canvas.offsetTop || 0;

            that.setDot( x * that.coverImg.width / that.width, y * that.coverImg.width / that.width );

            that.cur = [x, y];

            if (that.pre[0] != 0 && that.pre[1] != 0) {
                var lX = that.cur[0] - that.pre[0],
                lY = that.cur[1] - that.pre[1];
                var l = Math.sqrt(Math.pow(lX, 2) + Math.pow(lY, 2));

                if (l > 5) {

                    var dN = Math.floor(l / 5);
                    for (var i = 1; i <= dN; i++) {
                        var ndX = that.cur[0] + lX * i / dN,
                        ndY = that.cur[1] + lY * i / dN;
                        that.setDot(ndX * that.coverImg.width / that.width, ndY * that.coverImg.width / that.width);
                    }
                }
            }
        }
    }

    this.eventUp = function(e) {
        e.preventDefault();
        that.mousedown = false;

        that.cur = [0, 0];
        that.pre = [0, 0];

        var data = that.context.getImageData(0, 10, that.width, that.height).data;
        for (var i = 0, j = 0; i < data.length; i += 4) {
            if (data[i] && data[i + 1] && data[i + 2] && data[i + 3]) {
                j++;
            }
        }
        if (j <= that.width * that.height * 0.35) {
            that.context.clearRect(0, 0, that.width, that.height);
            //回调操作
            that.callback();
        }
    }

    this.setDot =function(x, y) {
        with(that.context) {
            beginPath();
            arc(x, y, 10, 0, 2 * Math.PI);
            fill();
            stroke();
        }
    }

    this.canvas.addEventListener('touchstart', this.eventDown);
    this.canvas.addEventListener('touchend', this.eventUp);
    this.canvas.addEventListener('touchmove', this.eventMove);
    this.canvas.addEventListener('mousedown', this.eventDown);
    this.canvas.addEventListener('mouseup', this.eventUp);
    this.canvas.addEventListener('mousemove', this.eventMove);

}