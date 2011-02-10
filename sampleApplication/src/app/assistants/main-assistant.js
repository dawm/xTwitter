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

function MainAssistant() {}

MainAssistant.prototype.setup = function() {

	// Load up our app cookie where we store the users credentials.
	this.cookie = new Mojo.Model.Cookie('xTwitter');

	// The users Twitter credentials (OAUTH Keys)
	this.userKeys = this.cookie.get();

	// Your application's Twitter OAUTH Keys
	this.appKeys = {
		consumerKey: "",
		consumerSecret: ""
	};

	// Check to see if we have stored userKeys, if not create defaults.
	if (this.userKeys === undefined) {
		this.userKeys = {
			username: '',
			authorized: false,
			token: '',
			secret: ''
		};
	}

	// Check to see if xTwitter is loaded.
	if (Twitter.isLoaded === undefined) {
		// xTwitter was not loaded, lets do that now.
		Twitter = new xTwitter(this.appKeys, this.userKeys);
	}

	// Setup the app menu
	this.appMenuModel = {
		visible: true,
		items: [
			Mojo.Menu.editItem,
			Mojo.Menu.prefsItem,
			{
				label: 'Logout',
				command: 'do-logout'
			},
			Mojo.Menu.helpItem
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu,{omitDefaultItems: true}, this.appMenuModel);

	// Setup our button widgets
	this.controller.setupWidget("buttonAuth", {},
		this.buttonAuthModel = {
			label: "Authorize this app",
			disabled: false
		}
	);
	this.controller.setupWidget("buttonTweet", {},
		this.buttonTweetModel = {
			label: "Send a test Tweet",
			// If we are already authorized lets enable this button.
			disabled: (this.userKeys.authorized === true) ? false : true
		}
	);
	this.controller.setupWidget("buttonFollow", {},
		this.buttonFollowModel = {
			label: "Follow @dawm",
			// If we are already authorized lets enable this button.
			disabled: (this.userKeys.authorized === true) ? false : true
		}
	);

	this.controller.get('showKeys').innerHTML = Object.toJSON(this.userKeys);
};
MainAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};
MainAssistant.prototype.activate = function(event) {
	if (event !== undefined) {
		if (event.from !== undefined && event.from === 'xTwitter') {
			if (event.userKeys !== undefined && event.userKeys.authorized === true) {
				// xTwitter has successfully authorized the user via xAuth/OAuth

				// Dump the returned userKeys to our key output element.
				this.controller.get('showKeys').innerHTML = Object.toJSON(event.userKeys);

				// Save the users credentials in our app cookie.
				this.cookie.put(event.userKeys);

				// Enable the test tweet button
				this.buttonTweetModel.disabled = false;
				this.controller.modelChanged(this.buttonTweetModel);

				// Enable the follow button
				this.buttonFollowModel.disabled = false;
				this.controller.modelChanged(this.buttonFollowModel);
			}
		}
	}

	// Setup button listeners
	this.buttonAuthHandler = this.buttonAuth.bindAsEventListener(this);
	this.controller.listen("buttonAuth", Mojo.Event.tap, this.buttonAuthHandler);

	this.buttonTweetHandler = this.buttonTweet.bindAsEventListener(this);
	this.controller.listen("buttonTweet", Mojo.Event.tap, this.buttonTweetHandler);

	this.buttonFollowHandler = this.buttonFollow.bindAsEventListener(this);
	this.controller.listen("buttonFollow", Mojo.Event.tap, this.buttonFollowHandler);
};

MainAssistant.prototype.deactivate = function(event) {
	this.controller.stopListening("buttonAuth", Mojo.Event.tap, this.buttonAuthHandler);
	this.controller.stopListening("buttonTweet", Mojo.Event.tap, this.buttonTweetHandler);
	this.controller.stopListening("buttonFollow", Mojo.Event.tap, this.buttonFollowHandler);
};

MainAssistant.prototype.cleanup = function(event) {
	this.deactivate();
};
MainAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'do-logout':
				this.logout();
			break;
		}
	}
};
MainAssistant.prototype.buttonAuth = function(event) {
	this.controller.stageController.pushScene('xtwitter', this.appKeys);
};
MainAssistant.prototype.buttonTweet = function(event) {
	var randString = function() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}
	Twitter.tweet(
		{
			status: 'Testing out #xTwitter by @biocandy/@dawm for #webOS (rand string:'+randString()+')',
			trim_user: true,
			include_entities: false

		},
		function(response) {
			if (response !== undefined && response.error === undefined && response.id_str > 0) {
				this.controller.get('info').innerHTML = "Tweet successful.<br />Tweet ID:"+response.id_str+"<a href=\"http://twitter.com/"+this.userKeys.username+"/status/"+response.id_str+"\">URL to Tweet</a>";
			}
			else {
				this.controller.get('info').innerHTML = "Tweet failed. <br />Error:" +response.error;
			}
		}.bind(this)
	);
};
MainAssistant.prototype.buttonFollow = function(event) {
	Twitter.follow(
		{
			screen_name: 'dawm',
			include_entities: false
		},
		function(response) {
			if (response !== undefined && response.error === undefined && response.following === true) {
				this.controller.get('info').innerHTML = "Follow of @dawm successful.";
			}
			else {
				this.controller.get('info').innerHTML = "Follow of @dawm failed. <br />Error: "+response.error;
			}
		}.bind(this));
}
MainAssistant.prototype.logout = function() {
	this.userKeys = {
		username: '',
		authorized: false,
		token: '',
		secret: ''
	};
	Twitter.logout();
	this.cookie.remove();

	// Disable the tweet button
	this.buttonTweetModel.disabled = true;
	this.controller.modelChanged(this.buttonTweetModel);

	// Disable the follow button
	this.buttonFollowModel.disabled = true;
	this.controller.modelChanged(this.buttonFollowModel);

	this.controller.get('info').innerHTML = 'Logout complete, cookie cleared.'
	this.controller.get('showKeys').innerHTML = Object.toJSON(this.userKeys);
};