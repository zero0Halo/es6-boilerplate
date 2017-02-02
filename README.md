# es6-boilerplate

This is a basic boilerplate that provides ES6 transcoding to ES5 with support for modules via Browserify.

##Features

* LESS
* Sourcemaps for both CSS and JS
* Uglified and minified CSS and JS files
* Basic server with live-reload
* Simple 3 file build output, `index.html`, `bundle.js` and `index.css`.

##Requirments

* git
* npm
* Gulp

##Installation and Usage

1. Clone this repo
2. `> npm install`
3. `> gulp`

Work in the `/src` folder, and use what's rendered out in the `/build` folder for production use.

All CSS work should be done in `index.less`, using `@import` statements to bring in other stylesheets.
This is a personal preference as this is how I code most/all of my SPA's, however it can be easily changed in the `less` task in `gulpfile.js`.

###notes
Yeah, this is pretty basic, I know, but that's the point. I wanted to create a simple boilerplate that gave me the bare minimum to take a project where I wanted to go without heavy frameworks. If you're like me and don't want to use React/Angular2/Flavor-of-the-year, but you enjoy coding in pure Javascript then this is for you.