# Personal Coding Challenge

**Design an application using Electron that displays the last ten bitcoin transactions**

This app uses three main dependencies:
 - jQuery due to the simplicity of the design goals
 - Axios to demonstrate a variety of asynchronous server calls
 - jQueryFlipster for a fun visual design.

**Design Decisions**

I wanted to demonstrate an understanding of various API calls in addition
to a basic level of design theory. Due to time constraints I also chose to skip
coding in any popular library (angular, react, etc) in favor of a simple
IIFE module.

**File Structure**

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - Contains anchor targets for the apps **renderer process**.
- `app.js` - contains entire IIFE application and logic

## Links

- [github](https://github.com/ProductivePerson)
- [linkedin](https://www.linkedin.com/)

#### License [CC0 (Public Domain)](LICENSE.md)
