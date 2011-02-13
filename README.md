/*
* The MIT License

* Copyright (c) 2011 Joshua Spohr

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

# What is xTwitter? #

xTwitter is a OAuth (using xAuth) library for HP Palm webOS  
Author: Joshua 'dawm' Spohr ([Biocandy Labs](http://www.biocandy.com))  

Current features/functions:  

  1. Authorize (via [xAuth](http://dev.twitter.com/pages/xauth))  
  2. Tweet (Send)  
  3. Follow  
  4. Unfollow  
  5. Logout


## Notes on xAuth ##

xTwitter relies on the use of [xAuth](http://dev.twitter.com/pages/xauth) to authenticate with Twitter. We do not distribute our consumer key and secret per Twitter's request. You will need to:

  1. [Register an application at Twitter](https://twitter.com/apps/new), and get your own consumer key and secret.  
  2. Request [xAuth](http://dev.twitter.com/pages/xauth) access by emailing <api@twitter.com> ([more info](http://dev.twitter.com/pages/xauth))  

For more information on Twitter's xAuth, dohtem (from #webos on irc.freenode.net) found a great [article on the subject](http://www.reynoldsftw.com/2010/03/using-xauth-an-alternate-oauth-from-twitter/).

---

## Trying out the sample application ##

Once you have xAuth access, enter your consumer key and consumer secret on the *lines 12 and 13* of sampleApplication/src/app/assistants/main-assistant.js, then package and install the application on your device or emulator.

---

# Using the library in your application #

At this time we have not this section finished, but you are welcome to browse the source of the sample application to see how we used the library in it. We tried to comment as much of the code that wasn't clearly obvious as to what it does or was doing.  

You do not have to modify any of the xTwitter library files (/library/app/assistants/xtwitter-assistant.js /library/app/models/xTwitter/`*.*` /library/app/views/xTwitter/`*.*`) as everything can be configured thru the creation of the library object.  

You **do need** to include the code from the library/sources.json in your applications sources.json  

Initial setup is simple, just put the following code inside your app using the objects below to initialize xTwitter.  

	appKeys = { // stores the Twitter application OAuth keys
		consumerKey: '',
		consumerSecret: ''
	};
	userKeys = { // stores the user authentication data
		username: '',
		authorized: false,
		token: '',
		secret: ''
	};

In the main library file (/library/app/models/xTwitter/xTwitter.js), the last line of the file is where we have setup our **Twitter** variable, you can rename this or not even use it but we added it for simplicity sake and some of our sample code relize on it.  

Using that variable **Twitter** which we already have setup we can assign and start the library.  

	if (Twitter.isLoaded === undefined) {
		Twitter = new xTwitter(appKeys, userKeys);
	}

xTwitter is now loaded and ready to use.  

---

# Authorization #

To authorize your app for access to the users twitter account use the function: **Twitter.authorize(username,password,*callback*);**  
username = the user's twitter account name.  
password = the user's twitter account password. (Note: we do not save the user's password)  
callback = the callback function to call when done (optional).  

**Example**:
	
	Twitter.authorize('username','password123',function (response) {
		if (response !== undefined && response.username !== undefined && response.token !== undefined &&
		    response.secret !== undefined && response.authorized !== undefined && response.authorized === true) {
			// authorization successful
		
			// you will need save the following variables (in a cookie perhaps?)
			// we reuse the information during the library initilization and so that we do not have to reauthorize every time

			userKeys.username = response.username;
			userKeys.token = response.token;
			userKeys.secret = response.secret;
			userKeys.authorized = true;		
		} else {
			// authorization failed
			console.log('Authorization failed, error:'+response);
		}
	);

---

# Sending a tweet #

To send a tweet after you have successfully authorized with Twitter use the function: **Twitter.tweet(tweetObj,*callback*);**  

tweetObj = Object containing the required tweet parameters. [Read more...](http://dev.twitter.com/doc/post/statuses/update)  
callback = the callback function to call when done (optional).  

**Example**:  

	Twitter.tweet(
		{ status: 'This is my test tweet' },
		function (response) { //this is our callback function
			if (response !== undefined && response.error === undefined) {
				console.log('Tweet successful');
			} else {
				console.log('Tweet failed, Error:'+response.error);
			}
		}
	);

---

# Following a user #

To follow a user (again you must have previously authorized successfully) use the function: **Twitter.follow(followObj,*callback*);**  

followObj = Object containing the required follow parameters. [Read more...](http://dev.twitter.com/doc/post/friendships/create)  
callback = the callback function to call when done (optional).  

**Example**:  

	Twitter.follow(
		{ screen_name: 'dawm' },
		function (response) {
			if (response !== undefined && response.error === undefined && response.following === true) {
				console.log('Follow successful');
			} else {
				console.log('Follow failed, error: "+response.error);
			}
		}
	);

---

# Unfollow a user #

To unfollow a user (again you must have previously authorized successfully) use the function: **Twitter.unfollow(unfollowObj,*callback*);**  

unfollowObj = Object containing the required follow parameters. [Read more...](http://dev.twitter.com/doc/post/friendships/destroy)  
callback = the callback function to call when done (optional).  

**Example**:  

	Twitter.unfollow(
		{ screen_name: 'dawm' },
		function (response) {
			if (response !== undefined && response.error === undefined && response.following === true) {
				// note that response.following will return true since it was true when you made the call
				// if you unfollow the user a second time it will fail, since you are not following them.
				console.log('Unfollow successful');
			} else {
				console.log('Unfollow failed, error: "+response.error);
			}
		}
	);

---

# Logout #

To logout a user (this only clears our data, the user must still unauthorize the app on Twitters Connections page), use the function: **Twitter.logout()**  
In order to access the user's Twitter data we need to reauthorize to get the user's **token** and **secret**.

**Example**:

	Twitter.logout();
	userKeys = { 
		username: '',
		authorized: false,
		token: '',
		secret: ''
	};
	// and clear any of this data we may have stored (cookies, depot ..etc)