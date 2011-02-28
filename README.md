# anyMeta Sample App

This sample application shows how to make an application that interacts with the anyMeta API. Specifically, it is an Android 2.2 application written in Javascript using [PhoneGap](http://www.phonegap.com) and [anyMeta.js](https://github.com/mediamatic/anymeta.js). If you have Eclipse and the Android SDK installed, you can simply load the project in Eclipse and build it.

## Getting Started

Add anyMeta.js to your app, perhaps as a git submodule.

Add a listener to the event indicating PhoneGap has loaded with some code to execute:

    document.addEventListener("deviceready", startApp, false);

Write a `startApp` function to first get user authorization and then do your app actions. See the [anyMeta.js README](https://github.com/mediamatic/anymeta.js/blob/master/README.md) for information on correctly configuring the library and getting an auth token.

Because the user will need to go to the anyMeta site to authorize the app, it is nice if you open the signed request URL for the user. This app uses an iframe, though you may prefer to use [ChildBrowser](https://github.com/phonegap/phonegap-plugins/tree/master/Android/ChildBrowser) or similar.

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
                            // do something with the auth tokens now that we have them
                        }
                    )
                })
            })
        }
    )

Once authorized, take a picture:

    navigator.camera.getPicture(onSuccess, onFail, {quality: 20})

Write a `onSuccess` function to take the base64 encoded image data and upload it to the anyMeta site:


    function onSuccess(imageData) {
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
        		}
    		)
    }

_Note:_ The Android 2.2 emulator is buggy and will consistently crash when you attempt to take a picture. For testing you may want to use the Gallery image picker instead of the camera:

    navigator.camera.getPicture(onSuccess, onFail, {quality: 20, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY});

Finally, build and run your application.

## Other Platforms

While this sample app is for Android, it should be quite easy to port it to other platforms that PhoneGap supports.