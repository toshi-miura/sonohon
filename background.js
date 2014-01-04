chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
  	//contentscript.jsにlocal strogeを返す
    if (request.name == "get"){
 
      var systemid_list = localStorage["pref"];
      var prefName = localStorage["prefName"];
      var url_pc = localStorage["url_pc"];
      var address = localStorage["address"];
      var systemid_list02 = localStorage["pref02"];
      var prefName02 = localStorage["prefName02"];
      var url_pc02 = localStorage["url_pc02"];
      var address02 = localStorage["address02"];
      
      var cTag01 = localStorage["cTag"];
      var cTime01 = localStorage["cTime"];

      sendResponse({
      	pref: systemid_list,
	    prefName: prefName,
        url_pc: url_pc,
        address: address,
        pref02: systemid_list02,
	    prefName02: prefName02,
        url_pc02: url_pc02,
        address02: address02,
        cTag : cTag01,
        cTime : cTime01        
      });
       
    }
    
    if (request.name == "setTag"){
		localStorage["cTag"] = request.cTag;
    }
    
    if (request.name == "setTime"){
		localStorage["cTime"] = request.cTime;
    }
     
  });