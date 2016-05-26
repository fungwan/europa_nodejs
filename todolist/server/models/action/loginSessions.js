/**
 * Created by Administrator on 2016/5/20.
 */

var db = require('../db');
var jwt = require('jwt-simple'),
    moment = require('moment');

exports.use = function(server){

    server.get('/loginSessions', function(req, res, next) {
        res.json({
            date: new Date()
        });
    });

    server.post('/loginSessions', function(req, res, next) {

        var userModel = db.getDataModel('users');
        var userInfo = req.body;
        userModel.findOne(userInfo,function(err,person){
            if(err === null){
                if(person === null){
                    //user is not db
                    res.json({
                        result:'fail',
                        content:{
                            error_code : 10001,
                            error_msg : 'can not find specified user...'
                        }
                    });
                }else{

                    var _userInfo = person._doc;

                    //return access_token & refresh_token
                    var token_expires = moment().add(150,'seconds').valueOf();
                    //console.log('access_token生成时的预期时间：' + token_expires);
                    var access_token = jwt.encode({
                        iss: person._doc._id,
                        exp: token_expires
                    }, server.get('jwtTokenSecret'));

                    var refresh_token_expires = moment().add(1,'days').valueOf();
                    var refresh_token = jwt.encode({
                        iss: _userInfo._id,
                        exp: refresh_token_expires
                    }, server.get('jwtTokenSecret'));

                    var additionalBody = {
                        access_token : access_token,
                        refresh_token : refresh_token,
                        owner_id: _userInfo._id,
                        exp:token_expires
                    };
                    res.json({
                        result:'ok',
                        content:additionalBody
                    });

                    //store token to db
                    var tokenModel = db.getDataModel('tokens');
                    tokenModel.create(additionalBody,function(err){console.log('token has been inserted to db...')});
                }
            }else{
                res.json({
                    result:'fail',
                    content:{
                        error_code : 500,
                        error_msg : 'server may be internal error...'
                    }
                });
            }
        });

    });
};