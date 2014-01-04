var apiKey = '8f4a9a72b71ed467b3a8b4cf320e47f9';
var cities = new Array();

$(document).ready(function(){
	
	/**
	* 初期動作
	**/
	//現在の設定情報をセット
	setSaveLibraries();
	
	//保存時
	$("#save").click(function(){ 
		var result = $('input[name="pref"]:checked').val();
		var prefName = $('input[name="pref"]:checked').attr('data-name');
		var url_pc = $('input[name="pref"]:checked').attr('data-url');
		var address = $('input[name="pref"]:checked').attr('data-address');	
		
		//登録する図書館判定
		var saveLibraryNum = $('input[name="saveLibrary"]:checked').val();
		if( saveLibraryNum == '01' ){
			//図書館1の時
			localStorage["pref"] =  result;
			localStorage["prefName"] =  prefName;
			localStorage["url_pc"] =  url_pc;
			localStorage["address"] =  address;
		}
		else if( saveLibraryNum == '02' ){
			//図書館1の時
			localStorage["pref02"] =  result;
			localStorage["prefName02"] =  prefName;
			localStorage["url_pc02"] =  url_pc;
			localStorage["address02"] =  address;
		}
		
		//保存後
		alert('「'+prefName+'」を保存しました。');
		setSaveLibraries();
		
	});	
	


	//図書館検索
	//県を選んだ時
	$("#prefSelect").change(function(){ 
		var pref = $('select[name="pref"] option:selected').val();
		
		//リセット
		$('#output').empty();
		$('#citySelect').empty();
		$('#saveBlock').fadeOut();
		displayLoding();			
		searchLibrariesCity(pref);
	});
	
	//市を選んだ時
	$("#citySelect").change(function(){ 
		var city = $('select[name="city"] option:selected').val();
		var pref = $('select[name="city"] option:selected').attr('data-pref');
		
		//リセット
		$('#output').empty();
		$('#saveBlock').fadeIn();
		displayLoding();
		searchLibraries(pref, city);
	});
	
	
	//設定解除
	$(".outBtn").click(function(){ 
		var outLib = $(this).attr('id');
		if( outLib == 'outLib01'){
			localStorage.removeItem("pref");
			localStorage.removeItem("prefName");
			localStorage.removeItem("url_pc");
			localStorage.removeItem("address");
		}
		else if( outLib == 'outLib02'){
			localStorage.removeItem("pref02");
			localStorage.removeItem("prefName02");
			localStorage.removeItem("url_pc02");
			localStorage.removeItem("address02");	
		}
		setSaveLibraries();
	});
	
	

});


/* * *
* 図書館検索
* * */
function searchLibraries(pref, city){
    var xhr = new XMLHttpRequest();
    //xhr.open("GET", 'http://api.calil.jp/library?appkey='+apiKey+'&pref='+pref+'&format=xml', true);
    xhr.open("GET", 'http://api.calil.jp/library?appkey='+apiKey+'&pref='+pref+'&city='+city+'&format=xml', true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
        	//戻りをParse
        	var hash = xhr.responseText;
          	console.log(hash);
          	
          	//ローディング
          	$('#prog').fadeOut();
          	
        	$(hash).find('Library').each(function(){
        		//html作成
        		var formal = $(this).find("formal").text();
        		var systemid = $(this).find("systemid").text();
        		var url_pc = $(this).find("url_pc").text();
        		var address = $(this).find("address").text();
        		var city = $(this).find("city").text();
        		
        		$('#output').prepend('<tr><th nowrap="nowrap"><label><input type="radio" name="pref" class="pref" value="'+systemid+'" data-name="'+formal+'" data-url="'+url_pc+'" data-address="'+address+'" />'+formal+'</label></th><td class="address">'+address+'</td><td class="url"><a href="'+url_pc+'" target="_blank">URL</a></td></tr>');
        		
        	});
        	
        		//tableでwrap
        		$('#output').prepend('<thead><tr><th>図書館名</th><td nowrap="nowrap">住所</td><td>HP</td></tr></thead>');
        		$('#output').wrapInner('<table id="libTable"></table>');
        		//ソート機能
        		//$('#libTable').stupidtable();
        		//$('#libTable').css('width','100%');
        		        	
        }
    }
}



function searchLibrariesCity(pref){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'http://api.calil.jp/library?appkey='+apiKey+'&pref='+pref+'&format=xml', true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
        	//戻りをParse
        	var hash = xhr.responseText;
          	console.log(hash);
          	
          	//ローディング
          	$('#prog').fadeOut();
          	
          	//xx = new Array(3);
        	$(hash).find('Library').each(function(){
        		//html作成
        		var city = $(this).find("city").text();
        		//setCities(city);
        		var n = cities.indexOf(city);
        		if (n == -1)
        		{
	        		cities.push(city);
	        	}
        	});
        	console.log(cities);
        	
        	//市のプルダウン追加
        	for (var i = 0; i < cities.length; i ++) {
        		$('#citySelect').prepend('<option value="'+cities[i]+'" data-pref="'+pref+'">'+cities[i]+'</option>');
        	}
        	$('#citySelect').prepend('<option value="">市を選択してください</option>');        	
        	
        }
    }
}
function displayLoding(){
		var progSrc = chrome.extension.getURL("images/ajax-loader.gif");
		$('#outputArea').prepend('<p class="aC" id="prog"><img src="'+progSrc+'" width="56" height="21"  /></p>');	
}



function setSaveLibraries(){

	//図書館1の登録状況チェック
	if ( localStorage["prefName"] == null || localStorage["prefName"] == undefined )
	{
		$('#prefName').html('設定されていません。');	
		$('#address').html('');
		$('#url_pc').html('');
		$('#outLib01').hide();
	}
	else
	{
		$('#prefName').html(localStorage["prefName"]);	
		$('#address').html(localStorage["address"]);
		$('#url_pc').html('<a href="'+localStorage["url_pc"]+'" target="_blank">URL</a>');
		$('#outLib01').show();
	}
	
	//図書館2の登録状況チェック
	if ( localStorage["prefName02"] == null || localStorage["prefName02"] == undefined )
	{
		$('#prefName02').html('設定されていません。');
		$('#address02').html('');
		$('#url_pc02').html('');
		$('#outLib02').hide();	
	}
	else
	{
		$('#prefName02').html(localStorage["prefName02"]);	
		$('#address02').html(localStorage["address02"]);
		$('#url_pc02').html('<a href="'+localStorage["url_pc02"]+'" target="_blank">URL</a>');
		$('#outLib02').show();			
	}
	
}