![Panic Press Logo](http://panic.press/logo.png "Panic Press Logo")

Requirements:
---

* [PhoneGap v3.6+](http://phonegap.com/install/)
* [Xcode](http://docs.phonegap.com/en/3.5.0/guide_platforms_ios_index.md.html#iOS%20Platform%20Guide)
* [Android SDK](http://docs.phonegap.com/en/3.5.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide)
* [Node.js v10+](http://nodejs.org/) ( For Application Development )

Installation
===

To use this repository you will first need to create a PhoneGap application.  You can do so by manually running the commands below in your terminal window, or run the shell script in ./build/scripts/install.sh which contains the same content.

Automatic Installation:
---

You can install the Panic Press App via the command line with either `curl` or `wget` which will run this [Shell Script](https://raw.githubusercontent.com/manifestinteractive/panic-press-app/stable/build/scripts/install.sh).

### via `curl`:

```bash
cd /your/development/folder
curl -L https://raw.githubusercontent.com/manifestinteractive/panic-press-app/stable/build/scripts/install.sh | sh
```

### via `wget`:

```bash
cd /your/development/folder
wget --no-check-certificate https://raw.githubusercontent.com/manifestinteractive/panic-press-app/stable/build/scripts/install.sh -O - | sh
```

### NOTE:

You will need to modify `./src/js/settings.js` to your projects specifications.  Also, you will still need to make the changes listed below in the __iOS Build Settings__.



Manual Install:
---

If you would like to manually install this application, please follow the instructions in the [Installation Script](https://raw.githubusercontent.com/manifestinteractive/panic-press-app/stable/build/scripts/install.sh).


Open Panic Press in Browser:
---

To work on `panic-press-app` locally for development:

```bash
cd /path/to/panic-press-app
npm install
```

To view `panic-press-app` in the browser:

```bash
cd /path/to/panic-press-app
npm start
```

The `panic-press-app` app will open in your default browser at [http://127.0.0.1:8080](http://127.0.0.1:8080)

Project Structure:
---

The following is a description of the folders in this project, and how they are used.  Our Application Stack is Bootstrap (HTML), Sass (CSS) & AngularJS (Javascript)


__Application Source__ HTML, CSS (Sass) & Javascript Files:

* __`assets`__: Application Assets
	* __`css`__: Compile Project CSS Files _( !.gitignored )_
	* __`img`__: Folder for Images used in app
	* __`js`__: Compile Project JS Files _( !.gitignored )_
* __`src`__: Application Source Code
	* __`img`__: Image Assets ( Photoshop & Illustrator )
	* __`js`__: Main AngularJS project files
		* __`controllers`__: AngularJS Controllers
		* __`directives`__: AngularJS Directives
		* __`filters`__: AngularJS Filters
		* __`libs`__: Third Party Libraries needed for app
		* __`services`__:  AngularJS Services
		* __`app.js`__: AngularJS Bootstrap File
		* __`config.js`__: AngularJS Config
		* __`config.routes.js`__: AngularJS Routes ( maps URL parameters to specific templates & controllers )
		* __`main.js`__: Main AngularJS App Controller
		* __`phonegap.js`__: Library to connect AngularJS to PhoneGap specific commands
	* __`scss`__: This folder contains Sass files used to manage the style of the application
* __`templates`__: AngularJS Template files and partials as configured by `config.routes.js`
* __`index.html`__: Development HTML file

__Development Content__ used to automate development & testing:

* __`grunt`__: A directory containing individual Grunt tasks
* __`hooks`__: A directory containing PhoneGap Build Instructions
* __`bowser.json`__: Package file for Bower that gets used during `npm install`
* __`gruntfile.js`__: Main Grunt configuration file
* __`package.json`__:  Package file for Node that gets used during `npm install`
* __`README.md`__: Developer Instructions
* __`CHANGELOG.md`__: Do not edit manually, generated automatically by running `grunt changelog:release`.  Looks for commit messages with the keywords `feature`, `fix` & `fixes`.

__Third Party Content__ _( !.gitignored )_:

* __`bower_components`__: Third Party Libraries installed via `bower.json` during `npm install`
* __`node_modules`__: Third Party Libraries installed via `package.json` during `npm install`
* __`src/vendor`__: Third Party files copied over for Application Use

Grunt Terminal Commands:
---

You can use the following build commands via terminal:

#### Build for Distribution:

The following command will compile Sass Styles into a CSS and Concat JS files for Distribution.

This is the most common command you will want to use and is required to view any changed you made in a browser or simulator.

```bash
grunt build:dist
```

#### Build for iOS or Android:

The following commands will build either iOS or Android versions of the app to their respective ./platorms folder.

```bash
grunt build:app_ios
```

```bash
grunt build:app_androind
```

#### Running iOS Simulator:

The following commands will first Build for Distribution and run iOS Simulation for the respective device.

```bash
grunt emulate:iphone_4s
```

```bash
grunt emulate:iphone_5
```

```bash
grunt emulate:iphone_5s
```

```bash
grunt emulate:iphone_6
```

```bash
grunt emulate:iphone_6_plus
```

```bash
grunt emulate:iphone_resizable
```

```bash
grunt emulate:ipad_2
```

```bash
grunt emulate:ipad_retina
```

```bash
grunt emulate:ipad_air
```

```bash
grunt emulate:ipad_resizable
```

#### Compile Sass files into CSS:

This will compile all the files in `src/scss` and generate the `assets/css/app.css` file

```bash
grunt sass:app
```

#### Create a Release:

```bash
grunt release
```

#### Create a Major Release:

The following will:

1. Increase the build's major number ( e.g. v __0__.5.1 => v __1__.0.0 )
2. Build & Package Distribution Files
3. Perform a git commit

```bash
grunt release-major
```

#### Create a Minor Release:

The following will:

1. Increase the build's minor number ( e.g. v 0.__5__.1 => v 0.__6__.0 )
2. Build & Package Distribution Files
3. Perform a git commit

```bash
grunt release-minor
```

#### Create a Release Patch:

The following will:

1. Increase the build's patch number ( e.g. v 0.5.__1__ => v 0.5.__2__ )
2. Build & Package Distribution Files
3. Perform a git commit

```bash
grunt release-patch
```

#### Create a Pre-Release:

The following will:

1. Build & Package Distribution Files
2. Perform a git commit

```bash
grunt prerelease
```