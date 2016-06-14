var request = require('request');
var cheerio = require('cheerio');
var fs = require("fs");
var path = require('path');

var requrl = 'http://cn.bing.com/';
request(requrl, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		// console.log(body);    //返回请求页面的HTML
		acquireData(body);
		// save(body);
	}
});

function save(data){
	fs.writeFile('input2.html', data,  function(err) {
	   if (err) {
	       return console.error(err);
	   }
	   console.log("save complete")
	});
}


function acquireData(data) {
    var objIndex = data.indexOf("g_img={");
    var start = data.indexOf('"',objIndex) + 1;
    var end = data.indexOf('"',start);
    var imgUrl = data.substring(start,end)
    imgUrl = imgUrl.replace(/\\/g, "");
    var filename = path.basename(imgUrl);  //生成文件名
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
        fs.readdir("images2/",function(errR){
            if (errR) {
                if(errR.errno == -4058){
                    fs.mkdir("images2/",function(errM){
                        if (errM) {
                            return console.error(errM);
                        }
                        console.log("mkdir complete");
                        request(uri).pipe(fs.createWriteStream('images2/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
                    });
                }else{
                    return console.error(errR);
                }
            }else{
                request(uri).pipe(fs.createWriteStream('images2/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
            }
        });
    });
};