var order_info = common.getCache('cashier_order_info',true);
var checkPayTimer = null;
var re_call = false;
$(document).ready(function(){
	if(!order_info){
		window.history.go(-1);
	}
	$('#scan_code_img').attr('src',order_info.img);
	common.setData(order_info);
	if(order_info.txt_info == ''){
		$('#txt_info_dom').hide();
	}
	if(order_info.discount_money == ''){
		$('#discount_money_dom').hide();
	}
	
	$('#scanQrcode').click(function(){
		common.scan('scanResult');
	});
	
	$(".user_code,.scan_code").each(function(){
		$(this).height($(this).width());
	});
	
	$(".scan_code").click(function(){
		$(".fix_ewm").show();
	});
	
	$(".del").click(function(){
		$(".fix_ewm").hide();
	});
	
	$("#printOrder").click(function(){
		common.http('Storestaff&a=store_arrival_print',{order_id:order_info.order_id},function(data){
			motify.log('请求打印成功');
		});
	});
	
	
	checkPayTimer = setInterval(function(){
		common.http('Storestaff&a=check_store_arrival_order',{order_id:order_info.orderid,noTip:true},function(data){
			common.removeCache('cashier_order_info',true);
			layer.open({
				content:'订单已经支付成功！'
				,btn: ['确定']
				,yes: function(index){
					window.history.go(-1);
				}
			});
			clearInterval(checkPayTimer);
		},function(data){
			// console.log(data);
		});	
	},2000);
});

function scanResult(value){
	common.http('Storestaff&a=store_arrival_pay',{order_id:order_info.orderid,auth_code:value,re_call:re_call ? 1 : 0},function(data){
		layer.open({
			content:'订单已经支付成功！'
			,btn: ['确定']
			,yes: function(index){
				window.history.go(-1);
			}
		});
		clearInterval(checkPayTimer);
	},function(data){
		if(data.errorCode == '20130035'){
			re_call = true;
			data.errorMsg = data.errorMsg + '，请在用户输入密码后再点击';
			layer.open({
				content:'需要用户输入支付密码，用户输入完成后点击按钮重新请求。'
				,btn: ['确定']
				,yes: function(index){
					scanResult(value);
				}
			});
		}else{
			re_call = false;
			layer.open({
				content:data.errorMsg
				,btn: ['确定']
				,yes: function(index){
					layer.closeAll();
				}
			});
		}
	});
}