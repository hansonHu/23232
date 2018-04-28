$(document).ready(function(){
    

  //修改金额
    $(document).on('click', '.amount', function(){
    	$('#order_id').val($(this).data('id'));
    	$('#change_price, #change_price_reason').val('');
    	$('#now_price').html($(this).data('price'));
        $(".mask,.amend").show();
    });
    $(document).on('click', '.button .section_recovery, .button .section_ensure', function(e){
    	e.stopPropagation();
        var type = $(this).data('type'), order_id = $('#order_id').val(), change_price_reason = $('#change_price_reason').val(), change_price = $('#change_price').val();
        if (change_price == '') {
        	motify.log('金额不能为空');
        	return false;
        }
        common.http('Storestaff&a=shopChangePrice',{'type':type, 'order_id':order_id, 'change_price':change_price, 'change_price_reason':change_price_reason, noTip:true}, function(data){
        	$('.change_' + order_id).html('￥' + data + ' <em class="xgh">'+ change_price_reason + '</em>');
            $('.modify_' + order_id).data('price', data);
            $(".mask,.amend").hide();
            location.reload();
        });
    });

    
    common.http('Storestaff&a=shopDetail', {'order_id':urlParam.order_id}, function(data){
    	console.log(data);
    	laytpl($('#allTpl').html()).render(data, function(html){
			$('.g_details').html(html);
			$(".kd_dl .hx").height($(".kd_dl").height()-65);
		});
	});
    
    
    //确认消费
    $(document).on('click', '.mask, .seek .close, .seek .del', function(){
        $(".mask,.seek").hide();
    });

    //顶部按钮
    $(window).scroll(function(){
        if($(this).scrollTop() > 200){
           $(".coping").show(); 
        }else{
           $(".coping").hide();  
        }
    });
    $(".coping .top").click(function(){
        $("body,html").animate({
            scrollTop: 0
        },500);
    });

	
	// 配送弹窗
	$(".flat").css({"top":($(window).height()-$(".flat").height())/2});
	
	
	//接单
    $(document).on('click', '.kd_rob', function(){
        var order_id = $(this).data('id');
        common.http('Storestaff&a=shopOrderEdit',{'status':1, 'order_id':order_id, noTip:true}, function(data){
        	location.reload();
        });
    });
	
	//发货到自提点
    $(document).on('click', '.send', function(){
        var order_id = $(this).data('id');
        common.http('Storestaff&a=shopOrderEdit', {'status':8, 'order_id':order_id, noTip:true}, function(data){
        	location.reload();
        });
    });
	
	//确认消费弹窗提示
    $(document).on('click', '.sure', function(){
    	$('.div_ensure').data('id', $(this).data('id'))
    	$(".seek,.mask").show();
    });

    
	//快递配送时候
    $(document).on('click', '.express', function(){
        common.http('Storestaff&a=getExpress',{'order_id':$(this).data('id'), noTip:true}, function(data){
        	laytpl($('#expressTpl').html()).render(data, function(html){
    			$('.flat').html(html);
    		});
        	$(".flat,.mask").show();
        	$('.flat').css({"top":($(window).height()-$(".flat").height())/2});
        });
    });
    
    //确认消费
    $(document).on('click', '.div_ensure', function(){
        var order_id = $(this).data('id');
        common.http('Storestaff&a=shopOrderEdit',{'status':2, 'order_id':order_id, noTip:true}, function(data){
        	location.reload();
        });
    });
    $(document).on('click', '.express_save', function(){
        var order_id = $(this).data('id'), express_id = $('#express_id').val(), express_number = $('#express_number').val();
        if (express_id.length < 1) {
        	motify.log('请选择快递公司');
        	return false;
        }
        if (express_number.length < 1) {
        	motify.log('请填写快递单号');
        	return false;
        }
        common.http('Storestaff&a=shopOrderEdit',{'status':2, 'order_id':order_id, 'express_number':express_number, 'express_id':express_id, noTip:true}, function(data){
        	location.reload();
        });
    });
	
	//取消订单
    $(document).on('click', '.cancel', function(){
        var order_id = $(this).data('id');
        common.http('Storestaff&a=shopOrderEdit',{'status':5, 'order_id':order_id, noTip:true}, function(data){
        	location.reload();
        });
    });
    
	//更换配送方式
    $(document).on('click', '.change_deliver', function(){
        common.http('Storestaff&a=mallOrderDetail',{'order_id':$(this).data('id'), noTip:true}, function(data){
        	laytpl($('#deliverTpl').html()).render(data, function(html){
    			$('.flat').html(html);
    		});
        	$(".flat,.mask").show();
        	$('.flat').css("margin-top",-$('.flat').height()/2);
        	$('#demo').scroller('destroy').scroller($.extend(opt['dateYMD'],opt['default']));
        });
    });
    $(document).on('click', '.con .sub', function(){
        common.http('Storestaff&a=checkDeliver',{'order_id':$(this).data('id'), 'expect_use_time':$('#demo').val(), noTip:true}, function(data){
        	location.reload();
        });
    });
    
    //------------pick address-------------------
    $(document).on('click', '.kd_since', function(e){
    	e.stopPropagation();
    	common.http('Storestaff&a=getPickAddress', {'order_id':$(this).data('id'), noTip:true}, function(data){
    		laytpl($('#pcikTpl').html()).render(data, function(html){
    			$('.since').html(html);
    			$(".mask, .since").show();
    			$('.since').css("margin-top", -$('.since').height()/2);
    			new IScroll('.since .ul',{ click: true});
            });
    	});
    });
    $(document).on('click', '.since li', function(e){
    	e.stopPropagation();
        $(this).addClass("on").siblings().removeClass("on");
    });
    $(document).on('click', '.determine', function(e){
    	e.stopPropagation();
    	var pick_id = $('.since').find('.on').data('id'), order_id = $(this).data('id');
    	if (pick_id == undefined) {
    		motify.log('请选择自提点');
    		return false;
    	}
    	common.http('Storestaff&a=pick', {'order_id':$(this).data('id'), 'pick_id':pick_id, noTip:true}, function(data){
    		if (data == 'SUCCESS') {
    			location.reload();
    		}
    		$('.mask, .since').hide();
    	});
    });
    
    
	$(document).on('click', '.mask, .del', function(){
        $('.mask, .flat, .since, .amend').hide();
    });

//插件日历
    var currYear = new Date().getFullYear();
    var opt = {  
        'dateYMD': {
            preset: 'datetime',
            dateFormat: 'yyyy-mm-dd',
//            theme: 'android-ics light', //皮肤样式
            display: 'modal',           //显示方式
            mode: 'scroller',           //日期选择模式
//            showNow: true,
//            nowText: "现在",
            startYear: currYear,    //开始年份
//            endYear: currYear + 1, //结束年份
            minDate: new Date()    //只能选择
        },'select': {
            preset: 'select'
        }
    };
});