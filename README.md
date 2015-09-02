# Jet Framework

This framework was made to simplify creation of Node.js apps, using (M)VC pattern.

It's built on top of Express.js and Socket.io. Although this is not its full implementation,
it can be used for simple apps, or for educational purposes.

## Building a Jet app

Test app can be found in the test directory, and can be used as a **HelloWorld** example (only requirements are to add
package.json and index.js file to your app).

The app must have *controllers* and *views* directories. Controllers handle responses, and which controller is responsible
for which url is defined in *routes.js* in the root directory of the app. In addition to url and controller name, it is 
also possible to define a method which will handle the request, and a verb for which this controller and method will 
process the request. Controllers use prototype paradigm, and on each request new instance of the controller is created.

Views directory holds all the views for the app. Views are organized by controllers and common views, although it is 
possible to add alternative directories and then reference them from the controllers. Which view is used is set in the
controller by calling **this.setTemplate('template_name')**. All templates should be written with **Jade** syntax.
They are compiled to HTML on response (for production environment they would be compiled only once, and then reused,
only updating the variables).

From the controller, when all the work is done, we need to call **this.send()** to send the response back to client.
There are other methods that can be used, and can be found in *core/JetBaseObject*, from which all controllers inherit.

The app should have a *default.config.js* which is then copied, and *config.js* file is created, which is then used to
control the app behaviour.

Test app is missing **index.js** file, because it relies on the index_dev.js. Jet app should have index file which
should at leas require the framework and call it.

```
require('jet-framework')();
```

**more detailed documentation will be added soon**

## Running Jet tests

Tests are run by using jasmine-node module. They are testing the basic functionality of the framework.
Because in this version the framework is not fully implemented, some tests are missing (eg. Socket.io tests).

To run the tests:

```
./node_modules/jasmine-node/bin/jasmine-node test/spec --captureExceptions --forceexit
```

## LICENCE

Released under [MIT licence](http://mit-license.org/)
