/**
 * Created by Administrator on 2015/12/5.
 */

var request = require('./request.js');
var jsonConvert = require('../lib/jsonFormat.js');
var settings = require('../conf/settings');
var async = require('async');
var connectAddr = "http://" + settings.bgMgtIpAddr + ':' + settings.bgMgtPortAddr;

exports.delLogsById = function(req,res){

    var idArray = req.body.ids;
    async.map(idArray, function(item, callback) {

        var delIdPath = '/logs(' + item + ')';
        var optionItem = {};
        optionItem['path'] = delIdPath;
        request.del(optionItem,callback);

    }, function(err,results) {
        if(err !== null){
            res.json({
                    result: 'fail',
                    content:err}
            );
        }else{
            res.json({
                    result: 'success',
                    content: 'ok'}
            );
        }
    });
};

exports.findLogsByPage = function(req,res){

    var currPage = req.query.page - 1;

    async.auto(
        {
            get_all: function (callback) {
                var options = connectAddr + '/logs?$count=true';
                request.get(options,callback);
            },
            get_currPage: function (callback) {

                var skipValue = currPage * 10;
                var options = connectAddr + '/logs?$top=10&$skip=' + skipValue+'&$orderby=operator_date desc';//
                request.get(options,callback);
            }
        },
        function(err, results) {
            if(err !== null){
                res.json({ result: 'fail',
                    content:err});
            }else{


                var allUserCounts = jsonConvert.stringToJson(results.get_all)['@odata.count'];

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                //第一页留痕记录数组
                var logArray = jsonConvert.stringToJson(results.get_currPage)['value'];

                res.json({
                        result: 'success',
                        pages:pageCounts,
                        content:logArray}
                );
            }
        }
    );
};

exports.findLogsByDate = function(req,res){

    var currPage = req.query.page - 1;

    var startStamp = req.query.startDate;
    var endStamp = req.query.endDate;

    async.auto(
        {
            get_all: function (callback) {
                var options = connectAddr + '/logs?$filter=operator_date le ' + endStamp + ' and operator_date gt ' + startStamp;
                request.get(options,callback);
            },
            get_currPage: [ 'get_all',function (callback,results) {

                //        var arr=[1,2,3,4,5];
                //　　　　 arr.slice(1,3); --- 2,3  左开右闭区间 ，若省略第二个参数，表示删除index后面所有的元素
                //　　　　 arr.slice(1,-1); --- 2,3,4  -1表示从最后一个元素

                var array = jsonConvert.stringToJson(results['get_all'])["value"];
                var skipValue = currPage * 10;
                callback(null,array.slice(skipValue,skipValue + 10));

            }]
        },
        function(err, results) {
            if(err !== null){
                res.json({ result: 'fail',
                    content:err});
            }else{


                var allCounts = jsonConvert.stringToJson(results['get_all'])["value"].length;

                //get product list
                var pageCounts = 1;
                if(allCounts > 0){
                    var over = (allCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allCounts) / 10) + 1 :  pageCounts = parseInt((allCounts) / 10) ;
                }

                //第一页留痕记录数组
                var logArray = results.get_currPage;

                res.json({
                        result: 'success',
                        pages:pageCounts,
                        content:logArray}
                );
            }
        }
    );
};

var resMatchArray = [
    {
        'reg':"^workers'/'\w?",
        'option':{
            'GET':'提交了认证信息'
        }
    }
];

var recordFunc = function(URI,action){
    for(var x = 0;x<resMatchArray.length;++x){
        var regStr = resMatchArray[x].reg;
        var reg =new RegExp(regStr);
        if (!reg.test(URI)) {
            continue;
        }else{
            return resMatchArray[x].options[action];
        }

    }

    return null;
}


exports.addLogs = function(req,res,next){

    var str = req.url;
    var resource = str;//.substr(1,str.indexOf('?',0)-1);
    var action = req.method;
    var webUsr = req.session.user;
    var ds = recordFunc(resource,action);
    if(ds === null){
        next();
        return;
    }

    var operatorDesc = '';

    var logString = JSON.stringify({
         'username':webUsr.username,
         'operator_date':new Date().getTime(),
         'role':webUsr.role,
         'action':operatorDesc
     });

     var logOptionItem = {};
     logOptionItem['path'] = '/logs';
     request.post(logOptionItem,logString,function(err,results){
         if(err !== null){
            console.log('日志插入出错，路径为:' + resource+'，方式为:' + action);
         }
     });

    next();
};

exports.addLogsEx = function(req,res,desc){

    var webUsr = req.session.user;

    var logString = JSON.stringify({
        'username':webUsr.username,
        'operator_date':new Date().getTime(),
        'role':webUsr.role,
        'action':desc
    });

    var logOptionItem = {};
    logOptionItem['path'] = '/logs';
    request.post(logOptionItem,logString,function(err,results){
        if(err !== null){
            console.log('日志插入出错，路径为:' + resource+'，方式为:' + action);
        }
    });
};