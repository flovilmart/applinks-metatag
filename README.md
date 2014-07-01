applinks-metatag
================

Express JS AppLinks injection middleware


##Installation
	
	npm install --save applinks-metatag
	
##Usage

	var express = require('express');
	var AppLinks = require('applinks-metatag');
	var app = Express();
	
	app.use(AppLinks([{
  		platform: "ios",
  		url: "myApp://",
  		app_name: "My Awesome app"
	}, {
  		platform: "android",
  		url: "myApp://",
  		package: "com.example.awesomeapp"
	}]));
	
	
That will inject in all your pages :
		
	<head>
		...
		<meta property="al:ios">
		<meta property="al:ios:url" content="myApp://">
		<meta property="al:ios:app_name" content="My Awesome app">
		<meta property="al:android">
		<meta property="al:android:url" content="myApp://">
		<meta property="al:android:package" content="com.example.awesomeapp">
	</head>
	
	
Or you can use at page scope:

	app.get("/home", AppLinks([{
  		platform: "ios",
  		url: "myApp://",
  		app_name: "My Awesome app"
	}], function(req, res){
		res.render("home.ejs");
	});
	
Or Based on request parameters:

	app.get("/profile/:profile_id", AppLinks(function(req, res){
		return {
  			platform: "ios",
  			url: "myApp://profile/"+req.params.profile_id,
  			app_name: "My Awesome app"
		},
	}),function(req, res){
		res.render('profile.ejs');
	})