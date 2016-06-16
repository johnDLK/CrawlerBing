/** 
爬虫下载必应时间区间内的壁纸

基于一个名为HPImageArchive.aspx的get请求，必应服务器会返回一个json，其中就包含了壁纸的url
而从HPImgVidViewer_c.js的代码可以看出这个请求的组成,
function sr(n, t, i) {
    var r = sj_gx(),
        u = hp_pushparams(["format=js", "idx=" + n, "n=" + t, "nc=" + sb_gt(), "pid=hp"]),
        e;
    _w.g_vidOn && u.push("video=1"), _H.quiz && u.push("quiz=1"), _H.favs && u.push("fav=1"), e = "/HPImageArchive.aspx?" + u.join("&"), r.open("GET", e, !0), sj_be(r, "readystatechange", function() { r.readyState == 4 && r.status == 200 && (f = gr(r.responseText), it = Math.min(ei, n + (f && f.images && f.images.length) || 0), i(!!f)) }), r.send(null) }
其中sb_gt()返回的是时间戳

*/

var request = require('request');
var cheerio = require('cheerio');
var fs = require("fs");
var path = require('path');

var startDate = new Date("2016-06-10"),
    endDate = new Date("2016-06-16");

(function(){
    var sDay = 0,
        eDay = 0;
    var daysObj = differToday(startDate, endDate);
    // console.log(daysObj)
    if(daysObj){
        sDay = daysObj.sDay;
        eDay = daysObj.eDay;
    }else{
        return;
    }
    var requrl = 'http://cn.bing.com/HPImageArchive.aspx?';
    var params = [
            'format=js',
            'idx',
            'n=1',
            'nc=',
            'pid=hp',
            'video=1'
        ];
    for(var i = sDay; i >= eDay; i--){
        params[1] = 'idx=' + i;
        params[3] = 'nc=' + (new Date()).getTime();
        reqImgJson(requrl + params.join('&'));
    }
})();

function reqImgJson(jsonUrl){
    request(jsonUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body);    //返回请求页面的HTML
            var json = JSON.parse(body);
            saveImg(json.images[0].url);
        }
    });
}

function saveImg(imgUrl){
    var filename = path.basename(imgUrl);
    downloadImg(imgUrl,filename,function() {
        // console.log(filename + ' done');
    });
}


var downloadImg = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
	    if (err) {
	        console.log('err: '+ err);
	        return false;
	    }
        fs.readdir("images/",function(errR){
            if (errR) {
                if(errR.errno == -4058){    //没有images目录
                    fs.mkdir("images/",function(errM){
                        if (errM) {
                            return console.error(errM);
                        }
                        console.log("mkdir complete");
                    });
                }else{
                    return console.error(errR);
                }
            }
            request(uri).pipe(fs.createWriteStream('images/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
        });
    });
};

function differToday(sd, ed){
    var today = new Date(),
        tms = today.getTime();
    if(ems > tms){
        console.error("------结束时间不能大于今天");
        return null;
    }
    var sd0 = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), 0, 0, 0),
        ed0 = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate(), 0, 0, 0),
        sms = sd0.getTime(),
        ems = ed0.getTime();
    if(sms > ems){
        console.error("------结束时间不能小于开始时间");
        return null;
    }
    var sDay = parseInt((tms - sms) / (1000 * 60 * 60 * 24));
    var eDay = parseInt((tms - ems) / (1000 * 60 * 60 * 24));
    if(eDay - sDay > 365){
        console.error("------结束时间不能与开始时间相差365天");
        return null;
    }
    return {
        "sDay" : sDay,
        "eDay" : eDay
    };
}