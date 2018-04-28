$(document).ready(function(){
	if(urlParam.order_id){
		var order_id = urlParam.order_id;
	}else{
		redirect('index.html','openLeftWindow');
		return false;
	}
	
	common.http('Storestaff&a=store_order_detail',{'order_id':order_id},function(data){
		common.setData(data);
		if(!data.user){
			$('#userInfo').hide();
		}
	});
});