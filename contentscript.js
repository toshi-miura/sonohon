/* --- 初期変数 ---*/
var progSrc = chrome.extension.getURL("images/ajax-loader.gif"); //画像パス
var options_page = chrome.extension.getURL("options.html"); 
var apiKey = 'b9c13324e6420f8408f09cfc8925bc8a';
var session = null;
var libraryDatas = new Array();


/* * *
 * スクリプトスタート
 * * */
$(document).ready(function(){
	

    //systemidをlocal storageから読み込み
    chrome.extension.sendRequest({name: "get"}, function(response) {
    	
    	
		//図書館IDを入れる
		systemid = response.pref;
        prefName = response.prefName;
        url_pc = response.url_pc;
        address = response.address;
        systemid02 = response.pref02;
        prefName02 = response.prefName02;
        url_pc02 = response.url_pc02;
        address02 = response.address02;
        cTag = response.cTag;
        cTime = response.cTime;
        //chrome.extension.sendRequest({name: "setTag", cTag: null});
        //console.log(cTag);
        
        
        
        //URL関係
		var u = new Url();
		var prams = u.getUrlVars(); /* パラメータ */
		var urls = u.getUrlArray(); /* URLs */
				
	
        
        //図書館の配列作成
	    libraryDatas = [[systemid, prefName], [systemid02, prefName02]];
        
        //図書館2があればカンマ区切りに
        if (systemid02 != null ){
	        systemid = systemid+','+systemid02;
        }
        //図書館2があれば名前連結
        if (prefName02 != null ){
	        prefName = prefName+'と'+prefName02;
        }
        
        
        //開いているamazon からISBN13を取得
		var ISBN13 = $("li:contains('ISBN-13')").text();
		ISBN13 = replaceAll(ISBN13, " ", ""); 
		ISBN13 = replaceAll(ISBN13, "ISBN-13:", "");  
	
		//ISBN判定
		if(ISBN13.match(/^[1-9]{3}-?[0-9]{10}$/)){
			//変数に代入
			isbn_list = ISBN13;
		}
		else
		{
			//無いなら終了
			return;
		}
	
	
        //amazonにdiv追加
        $("#olpDivId").after('<div id="output"><p id="libLead">この本が図書館にあるか検索<span class="calilName">by <a href="http://www.kigurumi.asia/imake/1369/" target="_blank">その本、図書館にあります。</a></span></p><div id="prog"><img src="'+progSrc+'" width="56" height="21" /><p>"'+prefName+'"から検索中</p></div><table id="disTable"></table></div>');

        //図書館IDがセットされているかどうか
        if( systemid == null){
	        $('#prog img').fadeOut(function(){
	         	$('#prog').html('<p class="optionLink"><a href="'+options_page+'" target="_blank">ここから検索する図書館を設定してください</a></p>');
	        });
	        return;
        }
         
        console.log(systemid);
		//図書館API検索開始
		searchCalil(systemid, isbn_list, session);
	});
	
	
});



/* * *
* 図書館API検索
* * */
function searchCalil(systemid, isbn_list, session){
    var xhr = new XMLHttpRequest();
    //1回目の検索かどうか
    if( session == null )
    {
	   var apiURL = 'http://api.calil.jp/check?appkey='+apiKey+'&isbn='+isbn_list+'&systemid='+systemid+'&format=xml';
	   //console.log(apiURL);
    }
    else
    {
        var apiURL = 'http://api.calil.jp/check?appkey='+apiKey+'&session='+session+'&format=xml';
    }
    xhr.open("GET", apiURL, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
        	//戻りをコールバック
        	var xml = xhr.responseText;
            var xmlContinue = $(xml).find("continue").text();
        	var xmlSession = $(xml).find("session").text();
        	searchCalilCheck(xml, xmlContinue, xmlSession);
        }
    }
}

//リクエストの戻りをチェック
function searchCalilCheck(xml, xmlContinue, xmlSession){

	//検索できたなかった時はポーリング
	if (xmlContinue == 1)
	{
		setTimeout(searchCalil(systemid, isbn_list, session), 1500);
	}        		
    else if (xmlContinue == 0)
    {
        //検索できれば結果描画へ
		callback(xml);
    }	
}



/* * *
* josnpのコールバック
* * */
function callback(data){
	//console.log(data);
    //ローディングを消す
    $('#prog').fadeOut(function(){

        ////domを取得と描画
        $(data).find('book').each(function(){
            //本詳細のdomを取得
            var that = $(this);
            var bookISBN = that.attr('isbn');
            var calilurl = that.attr('calilurl');
            /*
            var systemid = that.find('system').attr('systemid');
            var reserveurl = that.find('reserveurl').text();
            var status = that.find('status').text();
            */
            
            //HTMLを描画
            if ( $(data).find('libkey').length != 0){
            
            	//console.log(data);
            	//本があれば
                $(data).find('system').each(function(){
                		                	
               	 	var systemid = $(this).attr('systemid');
               	 	var reserveurl = $(this).find('reserveurl').text();
               	 	var status = $(this).find('status').text();

           		 	//図書館名を取得
               	 	for (var i in libraryDatas) {
	               		if (libraryDatas[i][0] == systemid){
		               		var libName = libraryDatas[i][1];
		               	}
		            }
                	
                	//見出しを描画
	                $('#disTable').append( '<tr><th colspan="2" class="tHead"><span id="reserveURL">「'+libName+'」の貸出状況<a href="'+reserveurl+'" target="_blank">予約する &gt;</a></span><td></tr>');
	                
                	//本があれば
                	if( $(this).find('libkey').length != 0){
		                $(this).find('libkey').each(function(){
	                		var libName = $(this).attr('name');
	                		var libState = $(this).text();

	                		//貸出可の時だけ色を変える
							if ( libState == "貸出可" )
							{
								var font_color = "#9a0000";
							}
							else if ( libState == "貸出中" )
							{
								var font_color = "#59a057";
							}
							else if ( libState == "蔵書あり" )
							{
								var font_color = "#9a0000";
							}
							else
							{
								var font_color = "#666";
							}
				
	                		//HTMLを描画
	                		$('#disTable').append( '<tr><th>'+libName + '：</th><td><b style="color:'+font_color+';">' + libState + '</b><td></tr>');
	                	});
          			}
	                else
	                {
	                	//本がない時
	                	$('#disTable').append( '<tr><td colspan="2">この図書館からは検索されませんでした。<td></tr>');
	                }
	                

                });
                
                //カーリルへのリンク
                $('#output').append('<p id="calilurl"><a href="'+calilurl+'" target="_blank">この本の詳細をcalil.jpで見る</a></p>');
            }
            else
            {
            	//検索されなかった時
                $('#output').append('<p id="calilurl">この本は、図書館から検索されませんでした。<span id="calilurlto"><a href="'+calilurl+'" target="_blank">本の詳細をcalil.jpで見る &gt;</a></span>');
            }

        });

    });
}





/* * * * * *
Common Functions
* * * * * */
// 文字列expressionの org を dest に置き換える
function replaceAll(expression, org, dest){
	return expression.split(org).join(dest);
}



/* * * * * *
Class Url
* * * * * */
function Url(){

	//URLのパラメーター取得
	this.getUrlVars = function() { 
	    var vars = [], hash; 
    	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'); 
    	for(var i = 0; i < hashes.length; i++) { 
        	hash = hashes[i].split('='); 
	        vars.push(hash[0]); 
    	    vars[hash[0]] = hash[1]; 
	    } 
    	return vars; 
	}
	
	//URLをスラッシュ区切りで配列に
	this.getUrlArray = function(){
		var url = document.URL;
		url = url.split("http://").join(""); //http://を削除
		url = url.split('/');
		return url;
	}
	
}


/* * * * * *
Class Cookie
* * * * * */
function Cookie() {
	
	//プライベート
	var _deadtime = 24;//期限20時間
	
	//読み込み｜ex：http://blog.wonder-boys.net/?p=208
	this.get = function(value){
		if(value){
			var c_data = document.cookie + ";";
			c_data = unescape(c_data);
			var n_point = c_data.indexOf(value);
			var v_point = c_data.indexOf("=",n_point) + 1;
			var end_point = c_data.indexOf(";",n_point);
			if(n_point > -1){
				c_data = c_data.substring(v_point,end_point);
				//alert("cookieは" + c_data + "です");
				return c_data;
			}
		}
	}

	//書き込み
	this.set = function(cookie_name,value){
		var ex = new Date();
		ex.setHours(ex.getHours() + _deadtime);
		ex = ex.toGMTString();
		var c = escape(cookie_name) + "=" + escape(value) + ";expires=" + ex;
		document.cookie = c;
	}
	
}
