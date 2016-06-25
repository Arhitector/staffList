(function () {
	window.Staff =  {
		Models: {},
		Views: {},
		Collections: {},
		Router: {}
	};
	var vent = _.extend({}, Backbone.Events);
	var helpers = {
		options: {
			singleUserTemplateId: "user",
			listUsersTemplateId: "users",
			jsonPath: "http://jsonplaceholder.typicode.com/users"
		},
		getTemplate: function (idTemplate) {
			return _.template(document.getElementById(idTemplate).innerHTML)
		}
	};
	// USER MODEL
	Staff.Models.UserModel = Backbone.Model.extend({
		validate: function (attrs) {
			if (!attrs.email || !attrs.website) {
				return "Empty string";
			}
		},
		urlRoot: helpers.options.jsonPath
	});
	// USER VIEW
	Staff.Views.UserView = Backbone.View.extend({
		initialize: function () {
			vent.on("renderUser editSite editEmail", this.render, this);
		},
		className: "user",
		el:document.getElementById("block"),
		template: helpers.getTemplate("user"),
		events: {
			"click #editEmail": "editEmail",
			"click #editSite": "editSite",
			"click #save": "saveData"
		},
		validate: {
			checkForValue: function (str) {
				if (!str) {
					return "Field can't be empty";
				}
			},
			email: function (email) {
				if (!this.checkForValue(email)) {
					var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
					return pattern.test(email);
				}
			},
			site: function (site) {
				if (!this.checkForValue(site)) {
					var pattern = new RegExp(/^[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,2}/i);
					return pattern.test(site);
				}
			}
		},
		editEmail: function () {
			var newValue = prompt("Change email", this.model.get("email"));
			if (this.validate.email(newValue)) {
				this.model.set({"email": newValue});
			}
			vent.trigger("editEmail");
		},
		editSite: function (e) {
			var newValue = prompt("Change site", this.model.get("website"));
			if (this.validate.site(newValue)) {
				this.model.set({"website": newValue});
				// this.render();
			}
			vent.trigger("editSite");
		},
		saveData: function () {
			var response = this.model.save();
			if(response.status === 200) {
				alert("your data was sended to server");
			}
		},
		render: function (id) {
			this.model = this.model ? this.model : this.collection.get(id);
			this.el.innerHTML = this.template(this.model.toJSON());
			return this;
		}
	});


	// USERS MODEl (collection)
	Staff.Collections.UserCollection = Backbone.Collection.extend({
		model: Staff.Models.UserModel,
		url: helpers.options.jsonPath
	});
	// USERS VEIW (collection)
	Staff.Views.UsersView = Backbone.View.extend({
		initialize: function () {
			vent.on("renderListUsers", this.render, this);
		},
		el: document.getElementById("block"),
		template: helpers.getTemplate("usersList"),
		render: function () {
			var renderData = "";
			this.el.innerHTML = "";
			this.collection.each(function (userView) {
				renderData += this.template(userView.attributes);
			}, this);
				this.el.innerHTML = renderData;
			return this;
		}
	});
	// EVENTS VIEW
	var userCollection = new Staff.Collections.UserCollection();
	userCollection.fetch({
		async: false,
		success: function (response,xhr) {
		},
		error: function (model, xhr, options) {
			console.log(xhr);
		}
	});
	var usersView = new Staff.Views.UsersView({collection: userCollection});
	var userModel = new Staff.Models.UserModel();
	var userView = new Staff.Views.UserView({collection: userCollection});


	Staff.Router = Backbone.Router.extend({
		routes: {
			"": "list",
			"user/:id": "user"
		},
		list: function () {
			vent.trigger("renderListUsers");
		},
		user: function (id) {
			vent.trigger("renderUser", id);
		}
	});
	new Staff.Router;
	Backbone.history.start();
})();