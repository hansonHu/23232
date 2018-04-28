$(document).ready(function(){
	var indexDatas = common.getCache('indexData',true);
	
	if(common.getCache('isStarted',true)){
		if(indexDatas && indexDatas.pay_in_store == '1'){
			if($(window).height() > 526){
				$('.indexCashierTop .fl').css('padding',(($(window).height()*0.3-80)/2)+'px 0px');
			}
			if(common.checkIosApp()){
				$('.indexCashierTop .fl').css('padding-top',parseInt($('.indexCashierTop .fl').css('padding-top').replace('px',''))+20+'px');
			}
			
			$('#cashierPage').removeClass('hide');
		}else{
			$('#mainPage').removeClass('hide');
			$(".group_list a").each(function(){
				$(this).height($(this).width()*0.94);
			});
		}
		$('#startBg').addClass('hide');
	}else{
		common.setCache('isStarted','true',true);
		$('#startBg img').css({height:$(window).height(),width:$(window).width()});
		$('#startBg').removeClass('hide');
		$('#mainPage').addClass('hide');
		$('#cashierPage').addClass('hide');
	}
	
	if(common.checkLogin() == false){
		return false;
	}
	
	if(common.checkIosApp()){
		common.iosFunction('changecolor/#9a9a9a');
	}else if(common.checkAndroidApp()){
		window.maycmspackapp.changecolor('#9a9a9a');
	}
	
	var staffArr = common.getCache('store_staff',true);
	if(staffArr){
		indexDataObj(staffArr);
	}else{
		var client = common.checkAndroidApp()  ?  2 : (common.checkIosApp() ? 1 : 0);
		common.http('Storestaff&a=login',{noTip:true,'client':client}, function(data){
			common.setCache('ticket',data.ticket,true);
			common.setCache('store_staff',data.user,true);
			indexDataObj(data.user);
		},function(data){
			location.href = 'login.html';
		});
	}
	
	$('.group .group_list').height($(window).height()-(common.checkIosApp() ? 95 : 75)-40);
	common.onlyScroll($('.group .group_list'));
	
	
	if(!common.checkWeixin() && !common.checkApp()){
		$('#scanQrcodeBox').remove();
		$('#noScanShow').height($('#noScanShow').width()).removeClass('hide');
	}
	
	$('#scanQrcode,#cashierScanCode').click(function(){
		common.scan('scanResult');
	});
	
	$('.printer').click(function(){
		var content = '<div style="letter-spacing:2px;font-size:16px;">';
			content+= '	<div>终&nbsp;端&nbsp;号：'+ print_mcode+'</div>';
			content+= '	<div>密&nbsp;&nbsp;&nbsp;&nbsp;钥：'+ print_mkey+'</div>';
			content+= '	<div>纸张类型：'+ print_paper+'mm</div>';
			content+= '	<div>支持图片：'+ (print_image == '1' ? '支持' : '不支持')+'</div>';
			content+= '	<div>&nbsp;</div>';
			content+= '	<div style="font-size:12px;">添加打印机后，请重新启动本软件。</div>';
			content+= '</div>';
		layer.open({
			title:'打印机参数',
			content:content,
			btn:[]
		});  
	});
	
	if(common.checkAndroidApp()){
		window.maycmspackapp.get_printer('get_printer');
	}
	
	/*启动监听APP退出事件*/
	if(common.checkApp()){
		setInterval(function(){
			var isLogout = common.getCache('isLogout',true);
			if(isLogout){
				common.removeCache('isLogout',true);
				location.href = 'login.html';
			}
		},300);
	}
	
	$('#loginout').click(function(){
		layer.open({
			content: '您确定要退出吗？'
			,btn: ['确定', '取消']
			,yes: function(index){
				common.removeCache('ticket');
				common.removeCache('ticket',true);

				location.href = 'login.html';

				layer.close(index);
			}
		});
	});
});

function getParam(url,name){
	var reg = new RegExp("[&|?]"+name+"=([^&$]*)", "gi"); 
	var a = reg.test(url); 
	return a ? RegExp.$1 : ""; 
}

function scanResult(value){
	var result = value;
	if( result.length==14 ){
  		common.http('Storestaff&a=scan_payid_check',{'payid':result}, function(data){
	        if(data.uid>0){
	          	window.location.href="cashier_set.html?uid="+data.uid+"&from_scan=1&payid="+data.payid;
	        }
	  	});
	}else{
		if(result.indexOf('http://') !== 0){
			var strArr = result.split(',');
			if(strArr.length == 2){
				var barCode = strArr[1];
			}else{
				barCode = result;
			}
			if(barCode.length == 13){
				common.setCache('shopBarCode',barCode,true);
				window.location.href = "retail.html";
			}else{
				layer.open({title:['错误提示：','background-color:#9a9a9a;color:#fff;'],content:'您扫描的内容 “ <font color="red">'+result+'</font> ” 暂时无法识别',btn: ['确定'],end:function(){}});
			}
		}else{
			var ctype = getParam(result,'a'),id = getParam(result,'id'),c = getParam(result,'c');
			if(ctype != 'group_qrcode' || id== '' || c != 'Storestaff'){
				var indexData = common.getCache('indexData',true);
				layer.open({title:['错误提示：','background-color:#9a9a9a;color:#fff;'],content:'您扫描的内容不是有效的' + indexData.have_group_name + '验证二维码',btn: ['确定'],end:function(){}});
			}else{
				if(ctype == 'group_qrcode'){
					window.location.href = "group_detail.html?order_id="+getParam(result,'order_id');
				}
			}
		}	
	}
}

function scanCardResult(str){
	var code = str
	common.http('Storestaff&a=scan_payid_check',{'payid':str}, function(data){		
		if(data.uid>0){
			window.location.href="cashier_set.html?uid="+data.uid+"&from_scan=1&payid="+data.payid;
		}
	});
}

function indexDataObj(staffArr){
	if(staffArr){
		$('#staff_name,#footer_staff_name').html(staffArr.name);
		$('#footer_store_name').html(staffArr.store_name);
	}
	var indexData = common.getCache('indexData',true);
	if(indexData){
		editData(indexData);
	}else{
		common.http('Storestaff&a=index',{noTip:true}, function(data){
			common.setCache('indexData',data,true);
			editData(data);
		});
	}
}

function editData(data){
	var countArr = [];
	if(data.have_group != '1'){
		$('.groupBox').remove();
	}else{
		countArr.push('group');
		$('.groupName').html(data.have_group_name);
	}
	
	if(data.have_shop != '1'){
		$('.shopBox').remove();
	}else{
		countArr.push('shop');
		$('.shopName').html(data.have_shop_name);
	}
	
	if(data.have_meal != '1'){
		$('.mealBox').remove();
	}else{
		countArr.push('meal');
		$('.mealName').html(data.have_meal_name);
	}
	
	if(data.have_appoint != '1'){
		$('.appointBox').remove();
	}else{
		countArr.push('appoint');
		$('.appointName').html(data.have_appoint_name);
	}
	
	if(data.have_store != '1'){
		$('.storeBox').remove();
	}else{
		$('.storeName').html(data.have_store_name);
	}
	
	if(data.pay_in_store != '1'){
		$('.cashBox').remove();
	}else{
		$('.cashName').html(data.have_cash_name);
	}
	
	//页面布局
	if(data.pay_in_store == '1'){
		if($(window).height() > 526){
			$('.indexCashierTop .fl').css('padding',(($(window).height()*0.3-80)/2)+'px 0px');
		}
		if(common.checkIosApp()){
			$('.indexCashierTop .fl').css('padding-top',parseInt($('.indexCashierTop .fl').css('padding-top').replace('px',''))+20+'px');
		}
		
		$('#mainPage').addClass('hide');
		$('#cashierPage').removeClass('hide');
	}else{
		$('#cashierPage').addClass('hide');
		$('#mainPage').removeClass('hide');
		$(".group_list a").each(function(){
			$(this).height($(this).width()*0.94);
		});
	}
	$('#startBg').addClass('hide');
	
	//请求完页面参数判断是否需要直接跳转，例如页面列表，或订单详情。
	if(urlParam.gopage && !common.getCache('isGoOtherPage',true)){
		var href = location.protocol+'//'+location.host+'/packapp/'+visitWork+'/'+urlParam.gopage+'.html' + (urlParam.goparam ? '?'+urlParam.goparam : '');
		
		if(common.checkApp()){
			if(common.checkAndroidApp()){
				window.maycmspackapp.createwebview(href);
			}else{
				common.iosFunction('createwebview/'+window.btoa(href));
			}
		}else{
			common.setCache('isGoOtherPage','true',true);
			location.href = href;
			return false;
		}
	}
		
	//声音提醒
	$('body').append('<video id="playMp3Tip" controls="true" loop="loop" src="source/new_order.mp3" style="display:none;" webkit-playsinline playsinline></video>');
	HTMLVideoElement.prototype.stop = function(){
		this.pause(); 
		this.currentTime = 0.0; 
	}
	if(countArr.length > 0){
		var nowIndex = 0;
		var timeArr = {};
		var playMp3Tip = null;
		var newOrderTip = null;
		setInterval(function(){
			var nowType = countArr[nowIndex];
			$('.loader').removeClass('on');
			$('.'+nowType+'_loader').addClass('on').show();
			common.http('Storestaff&a='+nowType+'_count',{noTip:true,time:timeArr[nowType]}, function(data){
				timeArr[nowType] = data.time;
				$('.'+nowType+'_loader em').html(data.count);
				$('.loader').removeClass('on');
				
				if(data.count > 0){
					if(newOrderTip != null){
						$('#playMp3Tip').trigger('stop');
						layer.close(newOrderTip);
					}
					
					if(playMp3Tip == null){
						$('#playMp3Tip').trigger('play');
					}
					
					/*音乐播放5分钟*/
					playMp3Tip = setTimeout(function(){
						$('#playMp3Tip').trigger('stop');
					},300000);
					newOrderTip = layer.open({
						title:'新订单提示'
						,content:'您有新的订单需要处理。'
						,btn: ['确定']
						,end: function(index){
							$('#playMp3Tip').trigger('stop');
							clearTimeout(playMp3Tip);
							playMp3Tip = null;
							newOrderTip = null;
						}
					});
				}
			});
			if(nowIndex+1 == countArr.length){
				nowIndex = 0;
			}else{
				nowIndex++;
			}
		},5000);
	}
}

var exitLayer = -1;
function appbackmonitor(){
	if(exitLayer != -1){
		window.maycmspackapp.closewebview(2);
	}else{
		layer.closeAll();
		exitLayer = layer.open({
			content: '您确定要退出程序吗？再次按返回键将退出。'
			,btn: ['确定', '取消']
			,yes: function(index){
				window.maycmspackapp.closewebview(2);
				layer.close(index);
			}
			,end: function(index){
				exitLayer = -1;
			}
		});
	}
}

var print_mcode = '';
var print_paper = '';
var print_image = '';
var print_mkey = '';
function get_printer(arg1,arg2,arg3){
	if(arg1 != ''){
		$('.printer').show();
		print_mcode = arg1;
		print_paper = arg2;
		print_image = arg3;
		print_mkey  = common.getDeviceId();
		common.http('Storestaff&a=get_print_has',{noTip:true,mkey:print_mkey}, function(data){
			motify.log("打印模块开始每3秒自动请求打印");
			setInterval(function(){
				common.http('Storestaff&a=own_print_work',{noTip:true,mkey:print_mkey}, function(data){
					if(data.info != ''){
						window.maycmspackapp.printer_work(data.info,'');
					}
				},function(data){
					
				});
			},3000);
		},function(data){
			
		});
	}
}