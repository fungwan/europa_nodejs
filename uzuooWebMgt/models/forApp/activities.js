/**
 * Created by Administrator on 2015/12/31.
 */


var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');

exports.getActivities = function(req,res){

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            get_activities: ['get_token', function (callback, results) {

                var token = results.get_token;
                var path = '/activities?'+'accessToken=' + token;

                var item = {};
                item['path'] = path;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var array = jsonConvert.stringToJson(result.get_activities)['activities'];

                res.json({
                    result: 'success',
                    content: array})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};

exports.getActivityById = function(req,res){

    var activityId = req.params.id;

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            get_activity: ['get_token', function (callback, results) {

                var token = results.get_token;
                var path = '/activities/' + activityId +'?accessToken=' + token;

                var item = {};
                item['path'] = path;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var info = jsonConvert.stringToJson(result.get_activity);

                res.json({
                    result: 'success',
                    content: info})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};

exports.setActivityStatus = function(req,res){

    var status = req.body.enabled;
    var activityId = req.body.id;

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            set_activity: ['get_token', function (callback, results) {

                var token = results.get_token;
                var path = '/activities/' + activityId + '/enable?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = {
                    enabled:status//parseInt(verifiedContent.verified)
                };

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,result){
            if(err === null){

                res.json({
                    result: 'success',
                    content: ''})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};