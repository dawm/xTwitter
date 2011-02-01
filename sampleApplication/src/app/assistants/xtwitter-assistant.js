function XtwitterAssistant() {
	this.userKeys = {
		username: '',
		authorized: false,
		token: '',
		secret: ''
	};
}

XtwitterAssistant.prototype.setup = function() {
	this.controller.get('error').hide();
	this.controller.get('success').hide();
	this.controller.get('login').show();

	this.controller.get('username').focus();

	this.spinnerModel = {spinning: false};
	this.controller.setupWidget("progressSpinner",
		this.attributes = { spinnerSize: 'large'},
		this.spinnerModel
	);
	this.controller.get('scrim').hide();

	if (Twitter.isLoaded === undefined) {
		Twitter = new xTwitter(appKeys);
	}
};
XtwitterAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};
XtwitterAssistant.prototype.activate = function(appKeys) {
	// Setup button listeners
	this.controller.listen("deny", Mojo.Event.tap, this.denyButton.bindAsEventListener(this));
	this.controller.listen("allow", Mojo.Event.tap, this.allowButton.bindAsEventListener(this));
	this.controller.listen("goback", Mojo.Event.tap, this.gobackButton.bindAsEventListener(this));

	// Setup listener for enter key press
	this.controller.listen(this.controller.document, "keyup", this.keyupHandler.bindAsEventListener(this), true);
	//this.controller.document.addEventListener("keyup", this.keyupHandler, true);
};
XtwitterAssistant.prototype.deactivate = function(event) {
	this.controller.stopListening("deny", Mojo.Event.tap, this.denyButton.bindAsEventListener(this));
	this.controller.stopListening("allow", Mojo.Event.tap, this.allowButton.bindAsEventListener(this));
	this.controller.stopListening("goback", Mojo.Event.tap, this.gobackButton.bindAsEventListener(this));

	this.controller.stopListening(this.controller.document, "keyup", this.keyupHandler.bindAsEventListener(this), true);
	//this.controller.document.removeEventListener("keyup", this.keyupHandler.bindAsEventListener(this), true);
};
XtwitterAssistant.prototype.cleanup = function(event) {
	this.deactivate();
};
XtwitterAssistant.prototype.handleCommand = function (event) {
	if(event.type == Mojo.Event.back) {
		event.stop();
		event.stopPropagation();
		this.denyButton();
	}
};
XtwitterAssistant.prototype.keyupHandler = function(event) {
		if (Mojo.Char.isEnterKey(event.keyCode)) {
			if(event.srcElement.id == "password") {
				Mojo.Log.info('enter pressed!');
				this.allowButton();
				Mojo.Log.info('allowButton()');
				event.stop();
				event.stopPropagation();
			}
		}
};
XtwitterAssistant.prototype.showScrim = function() {
	this.controller.get('scrim').show();
	this.spinnerModel.spinning =  true;
	this.controller.modelChanged(this.spinnerModel);
};
XtwitterAssistant.prototype.hideScrim = function() {
	this.controller.get('scrim').hide();
	this.spinnerModel.spinning =  false;
	this.controller.modelChanged(this.spinnerModel);
};
XtwitterAssistant.prototype.showError = function (message) {
	this.controller.get('error').innerHTML = 'Error: '+message;
	this.controller.get('error').show();
};
XtwitterAssistant.prototype.denyButton = function (event) {
	this.gobackButton();
};
XtwitterAssistant.prototype.allowButton = function (event) {
	var username = this.controller.get('username').value;
	var password = this.controller.get('password').value;

	if (username.length === 0) {
		this.showError('Please enter your username or email address.');
	}
	else if (password.length === 0) {
		this.showError('Please enter your password.');
	}
	else {
		this.showScrim();
		Twitter.authorize(username, password,
			function(response) {
				this.hideScrim();
				if (response !== undefined && response.username !== undefined && response.token !== undefined &&
				    response.secret !== undefined && response.authorized !== undefined && response.authorized === true) {
					this.userKeys.username = response.username;
					this.userKeys.token = response.token;
					this.userKeys.secret = response.secret;
					this.userKeys.authorized = true;

					/*
						This is where you can save the users credentials.
						However in this example scene we do not save the credentials here
						we send them back to the previous scene which ends up in the previous
						scenes activate() method as
							{
								from: 'xTwitter',
								userKeys: this.userKeys
							}
					*/
					this.controller.get('login').hide();
					this.controller.get('success').show();
				}
				else {
					this.userKeys = {
						username: '',
						authorized: false,
						token: '',
						secret: ''
					};
					this.showError('Invalid login credentials or there was a problem communicating with Twitter.')
					/*
					Uncomment the following code to show the error message from twitter.
						"Invalid user name or password,,"
					*/
					//this.showError(response);
				}
			}.bind(this)
		);
	}
};
XtwitterAssistant.prototype.gobackButton = function() {
	this.controller.stageController.popScene({from: 'xTwitter', userKeys: this.userKeys});
};