﻿/**
*create by codesmith
**/
var verifier=require('../../common/tool').verifier;
var returnData=require('../../common/returnData');
var extend = require('./prolottery.extend');

/**
*模型
*/
var prolottery = {
    createnew: function(){
        var info = extend.createnew();
        //----------------------------------
        //此处添加自定义扩展属性
        //----------------------------------
        return info;
    }
    //如果需要校验增加以下定义
    //verify:{
    //}    
    
};
module.exports = prolottery;
