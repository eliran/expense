# Simple Expense Tracking Web Client

Web client uses Angular framework. The only configuration required is to set the REST API Server's address @ `src/app.js`

* `bower` to download the javascript packages required
* `grunt` to prepare the */public* folder with minified app.min.js
* `npm start` to run local webserver

It is possible to copy the contents of **/public** folder to the REST Server's **/public** folder to run it as a 
single unit (but **src/app.js** must be updated with the correct REST API URL)