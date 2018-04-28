var checkPayTimer = null;
$(document).ready(function(){
	$('#confirmOrder').css({display:'block',width:$('#orderForm').width()-50});
	common.http('Storestaff&a=store_arrival_add_info',{},function(data){
		if(data.has_discount == true){
			if(data.discount_type == 1){	//1.打折
				var discountTxt = data.discount_percent+'折优惠';
			}else if(data.discount_type == 2){    //2.满减
				var discountTxt = '满'+data.condition_price+'元减'+data.minus_price+'元';
			}
			$('#discountTxt').html(discountTxt);
					
			$(".switch div").click(function(){
				$(this).addClass("on").siblings().removeClass("on");
				if($(this).hasClass('off')){
					$('#price').html($('#total_price').val());
					$('.offDiscount').hide();
				}else{
					$('#total_price').trigger('keyup');
					$('.offDiscount').show();
				}
			});
	
			$('#total_price,#no_discount_money').keyup(function(){
				var no_discount_money = parseFloat($('#no_discount_money').val()), total_money = parseFloat($('#total_price').val()),price = 0,minus_price = 0;
				if(isNaN(no_discount_money)){
					no_discount_money = 0;
				}
				if(isNaN(total_money)){
					total_money = 0;
				}
				
				if(total_money > no_discount_money){
					if($('.switch .no').hasClass('on')){		
						if(data.discount_type == 1){
							price = eval(total_money - no_discount_money) * eval(data.discount_percent)/ 10 + no_discount_money;
							minus_price = eval(total_money - no_discount_money) * (100 - data.discount_percent * 10) / 100;
						}else if(data.discount_type == 2){
							minus_price = Math.floor(eval(total_money - no_discount_money) / eval(data.condition_price)) * data.minus_price;
							price = total_money - minus_price;
						}else{
							minus_price = 0;
							price = total_money;
						}
					}else{
						minus_price = 0;
						price = total_money; 
					}
					if(minus_price > 0){
						$('#show_minus').html('-￥<span id="discount_money">' + common.floatVal(minus_price) + '</span>');
					}else{
						$('#show_minus').html('');
					}
					$('#price').html(common.floatVal(price));
				}else{
					$('#price').val(common.floatVal(total_money));
					$('#show_minus').html('');
				}
			});
		}else{
			$('.hasDiscount').hide();
			$('#total_price').keyup(function(){
				var total_money = parseFloat($('#total_price').val());
				if(isNaN(total_money)){
					total_money = 0;
				}
				$('#price').html(total_money);
			});
		}
		
		if(urlParam.business_type){
			common.http('Storestaff&a=store_arrival_get_info',{business_type:urlParam.business_type,business_id:urlParam.business_id},function(data){
				$('#total_price').val(data.go_pay_price).trigger('keyup');
			});
		}else{
			$('#total_price').focus();
		}
		
		$('#orderForm').submit(function(){
			var total_price = parseFloat($('#total_price').val());
			if(isNaN(total_price) || total_price == 0){
				motify.log('请输入订单金额');
				return false;
			}
			var postData = {};
			postData.total_price = total_price;
			if(!$('#offDiscount').hasClass('on')){
				postData.discount_money = parseFloat($('#discount_money').html());
				if(isNaN(postData.discount_money)){
					postData.discount_money = 0;
				}
			}else{
				postData.discount_money = 0;
		 	}
			
			postData.pay_money = parseFloat($('#price').html());
			postData.txt_info = $('#txt_info').val();
			
			if(urlParam.business_type){
				postData.business_type = urlParam.business_type;
				postData.business_id = urlParam.business_id;
			}
			if(urlParam.from_scan && urlParam.uid && urlParam.payid){
				postData.from_scan = urlParam.from_scan;
				postData.uid = urlParam.uid;
				postData.payid = urlParam.payid;
			}
			// console.log(postData);return false;
			common.http('Storestaff&a=store_arrival_add',postData,function(saveData){
				$('#total_price,#txt_info,#no_discount_money').val('');
				$('#show_minus,#price').html('');
				if(saveData.code=='SCAN_PAY_SUCCESS'){
					layer.open({
						title:'订单信息'
						,shadeClose:false
						,content: '订单创建成功，等待用户支付'
					});
					
					checkPayTimer = setInterval(function(){
						common.http('Storestaff&a=check_store_arrival_order',{order_id:saveData.order_id,noTip:true},function(data){
							common.removeCache('cashier_order_info',true);
							layer.open({
								content:'订单已经支付成功！'
								,shadeClose:false
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
				}else{					
					saveData.total_price = postData.total_price;
					saveData.discount_money = postData.discount_money;
					saveData.pay_money = postData.pay_money;
					saveData.txt_info = postData.txt_info;
					common.setCache('cashier_order_info',saveData,true);
					location.href = 'cashier_success.html';
				}
			});
			return false;
		});
	});
});