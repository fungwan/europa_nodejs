/**
 * Created by Administrator on 2015/11/25.
 */

var rolesArray = [];//所有角色，包含源对象和map对象,索引0是源对象、1是封装后的map对象
var selectedRoleId = '';
var selectedCraftsId = '';
var referenceCount = 0;//针对

$(document).ready(function(){


    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;
            //console.log(regionsAndRolesArray);

            rolesArray = regionsAndRolesArray[1];
            console.log(rolesArray);

            warpHtml();

        }
    });

    function warpHtml() {

        $("#roles-ul").empty();

        var orgRolesArray = rolesArray[0];
        for (x in orgRolesArray) {

            var roleInfo = orgRolesArray[x];

            var trHtml = '<li id="';
            trHtml += roleInfo['id'] + '"' + "><a name=\"roles\" href=\"javacript:void(0);\">" + roleInfo['name'] +"</a>" ;
            trHtml += '</li>';

            $("#roles-ul").append(trHtml);
        }

        $('a[name="roles"]').click(function($this){

            $("#crafts-ul").empty();
            $("#amountSetting-div").css({"display":"none"});

            var roleId = $this.currentTarget.parentNode.id;
            selectedRoleId = roleId;

            var rolesMap = rolesArray[1];
            var craftsArray = rolesMap[roleId]['crafts'];

            for (x in craftsArray) {

                var craftsInfo = craftsArray[x];

                var trHtml = '<li id="';
                trHtml += craftsInfo['id'] + '"' + "><a name=\"crafts\" href=\"javacript:void(0);\">" + craftsInfo['name'] +"</a>" ;
                trHtml += '</li>';

                $("#crafts-ul").append(trHtml);
            }

            $('a[name="crafts"]').click(function($this){

                selectedCraftsId = $this.currentTarget.parentNode.id;
                var amountSetInfo = rolesArray[1][selectedCraftsId];

                $("#amountSetting-div").css({"display":""});

                //show amount info
                var showRoleName = rolesArray[1][selectedRoleId]['name'];
                var showCraftsName = rolesArray[1][selectedCraftsId]['name'];
                $("#showRole-label").text(showRoleName + '-' + showCraftsName);
                $("#earnestSet-input").val(amountSetInfo['earnest']);
                $("#commission_basicSet-input").val(amountSetInfo['commission_basic']);
                $("#commission_floatSet-input").val(amountSetInfo['commission_float']);
                $("#margin_rateSet-input").val(amountSetInfo['margin_rate']);
                $("#margin_up_thresholdSet-input").val(amountSetInfo['margin_up_threshold']);
                $("#margin_down_thresholdSet-input").val(amountSetInfo['margin_down_threshold']);
            });
        });
    }

    $("#updateAmountSet-btn").click(function(){

        var f = $("#earnestSet-input").attr('format_verified');
        var e = $("#margin_up_thresholdSet-input").attr('format_verified');
        var n = $("#margin_down_thresholdSet-input").attr('format_verified');
        if(f === "false" || e === "false" || n === "false"){
            $("#updateAmountSet-btn").attr('disabled',true);
            $("#amountSetResult-info").text('请再次检查所输入的正整数金额配置格式是否正确!');
            return;
        }

        var g = $("#commission_basicSet-input").attr('format_verified');
        var y = $("#commission_floatSet-input").attr('format_verified');
        var u = $("#margin_rateSet-input").attr('format_verified');

        if(g === "false" || y === "false" || u === "false"){
            $("#updateAmountSet-btn").attr('disabled',true);
            $("#amountSetResult-info").text('请再次检查所输入的比例金额配置格式是否正确!');
            return;
        }

        $("#amountSetResult-info").text('');

        //$("#need_trustee-input").attr({"checked":"false"});

        /*var isNeedTrustee = $("#need_trustee-input").attr("checked");
        if(isNeedTrustee){
            alert('需要托管');
        }*/

        /*$.post("/amount",
            {
                roleId:'',
                craftId:'',
                earnest:'',
                need_trustee:'',
                commssion_basic:'',
                commssion_float:'',
                margin_rate:'',
                margin_up_threshold:'',
                margin_down_threshold:''
            },
            function (data) {

                //console.log(data);

            }
        );*/
    });

    $("input[name='check_float-input']").blur(function($this){

        var floatInputVal = $this.target['value'];
        var floatInputNum = 0;
        var regFloat = /^[0-9]*\.?[0-9]{1,2}$/;
        if(!floatInputVal.match(regFloat)){
            $this.target['attributes'][3].value = false;
            $("#updateAmountSet-btn").attr('disabled',true);
            $("#amountSetResult-info").text('输入金额格式有误！如果为小数请保留小数点后两位！');
            return;
        }else{
            $this.target['attributes'][3].value = true;
            floatInputNum = parseFloat(floatInputVal);
            $("#updateAmountSet-btn").attr('disabled',false);
        }

        if(floatInputNum > 100000000){
            $this.target['attributes'][3].value = false;
            $("#updateAmountSet-btn").attr('disabled',true);
            $("#amountSetResult-info").text('比例金额大小超出限制!');
            return;
        }else{$this.target['attributes'][3].value = true;}
    });

    $("input[name='check_int-input']").blur(function($this){

        var intInputVal = $this.target['value'];
        var intInputNum = 0;
        var regInt = /^[0-9][0-9]*$/;
        if(!intInputVal.match(regInt)){
            $this.target['attributes'][3].value = false;
            $("#updateAmountSet-btn").attr('disabled',true);
            $("#amountSetResult-info").text('输入金额格式有误！应为正整数！');
            return;
        }else{
            $this.target['attributes'][3].value = true;
            intInputNum = parseInt(intInputVal);
            $("#updateAmountSet-btn").attr('disabled',false);
        }

        if(intInputNum > 100000000){
            $this.target['attributes'][3].value = false;
            $("#updateAmountSet-btn").attr('disabled',true);
            alert('金额超出限制...');
            return;
        }else{$this.target['attributes'][3].value = true;}

    });


});

