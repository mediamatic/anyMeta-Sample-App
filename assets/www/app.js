function showInfoUploadPicture(auth_token, auth_token_secret) {
	AnyMeta.setTokens(auth_token, auth_token_secret);
	var content = document.getElementById("content")
	console.log("get logged in user's info")
	AnyMeta.user.info(
		function (person) {   // the success callback
    		var h2 = document.createElement('h2');
    		h2.innerHTML = 'Welcome <a href="http://www.mediamatic.net/person/' + person.id + '/en">' + person.title + '</a>!';
    		content.appendChild(h2);
    		var uploadPic = document.createElement("button")
    		uploadPic.innerHTML = "Upload a photo"
			uploadPic.addEventListener("click", function (evt) {
	    		// assume this works, as the emulator is buggy
				navigator.camera.getPicture(onSuccess, onFail, {quality: 20}); 
	    		function onSuccess(imageData) {
	    		    console.log("now we'd be calling attachment.create")
	    			var image = document.createElement('img');
	    		    image.src = "data:image/jpeg;base64," + imageData;
	    		    content.appendChild(image);
	    		    var p = document.createElement("p")
	    		    p.innerHTML = "Uploading..."
	    		    content.appendChild(p)
	    		    AnyMeta.attachment.create(
    		    		imageData,
    		    		"image/jpeg",
    		    		"Photo taken by " + person.title + " using the anyMeta Sample App",
    		    		function (resp) {
    		    			p.innerHTML = "Uploaded to <a href=\"" + resp.rsc_uri + "\">" + resp.rsc_uri + "</a>!";
    		    		},
    		    		function (err) {
	    		    		p.innerHTML = err;	
    		    		}
		    		);
	    		}
	    		function onFail(message) {
	    		    console.log('Image taking failed because: ' + message);
	    		}
			}, false)
    		content.appendChild(uploadPic)
		},
		function (error) {
			console.log("error: " + error)	
		}
	);	
}

function startApp() {
	console.log("app started");
	AnyMeta.currentSite = 'mediamatic.net';
	var auth_token = localStorage.getItem(AnyMeta.currentSite + '.oauth_token');
	var auth_token_secret = localStorage.getItem(AnyMeta.currentSite + '.oauth_token_secret');
	// getItem returns null if the key does not exist, so check that we have both values
	if (auth_token && auth_token != "undefined" && auth_token_secret && auth_token_secret != "undefined") {
		console.log("already logged in");
		showInfoUploadPicture(auth_token, auth_token_secret);
	} else {
		console.log("we need to login");
		// try to register for the following server with callback and errback
		AnyMeta.register(
    		function (url, callback) {
        		// show login button which will open iframe + done button to call callback()
    		    var content = document.getElementById("content")
    		    var login = document.createElement("button")
    		    login.innerHTML = "Connect to your Mediamatic.net account"
    		    login.addEventListener("click", function (evt) {
    		      var iframe = document.createElement("iframe")
    		      // quick hack to get around the horrible login UI
    		      iframe.src = 'http://www.mediamatic.net/logon?goto=' + url.substring(25)
    		      var connected = document.createElement("button")
    		      connected.innerHTML = "I authorized the app"
    		      connected.addEventListener("click", function (evt) {
    		        console.log("authorized!")
    		        iframe.style.display = "none"
    		        connected.style.display = "none"
	        		callback(
                		function (tokens) {
                    		// persist for later (don't use cookies because they'll get passed around and in plain text)
                    		localStorage.setItem(AnyMeta.currentSite + '.oauth_token', tokens.oauth_token);
                    		localStorage.setItem(AnyMeta.currentSite + '.oauth_token_secret', tokens.oauth_token_secret);
                    		showInfoUploadPicture(tokens.oauth_token, tokens.oauth_token_secret)
                		},
                		function (badRequest) {
                    		console.log('Failed to get an access token.');
                		}
            		);
    		      }, false)
    		      content.appendChild(iframe)
    		      content.appendChild(connected)
    		      login.style.display = "none"
    		    }, false);
    		    content.appendChild(login)
    		},
    		function (badRequest) {
        		console.log('Failed to get a request token.');
    		}
		);
	}
}
document.addEventListener("deviceready", startApp, false);