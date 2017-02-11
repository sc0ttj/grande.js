[![Build Status](https://travis-ci.org/mduvall/grande.js.png)](https://travis-ci.org/mduvall/grande.js)

grande.js
=========

#TL;DR

THIS IS A FORK WHICH REMOVES EVERYTHING NOT RELATED TO THE SELECTED TEXT POPUP MENU

------------------

This is a small Javascript library that implements features from Medium's editing experience. Take a look [here](http://mattduvall.com/grande.js/).

![image](http://f.cl.ly/items/0G280f2t1s123H3k3O2z/Screen%20Shot%202013-08-31%20at%203.08.44%20PM.png)

How to get started
------------------

### Installation
Bower is the preferred way to install `grande.js`, it is available as `grande` in the Bower package repository.

Simply `bower install grande`

Or add this just before the `</body>` tag in your page:
```
<script type="text/javascript">
  grande.bind(document.querySelectorAll(".content"));
</script>
```

### Usage

See the `index.html` in this repository for a functional example using the library.

To get up and running simply...

1. Make some elements on your page `contenteditable="true"`
2. Include the `grande.min.js` file (in `dist/` directory) at the bottom of your `<body>`
3. Enable Grande with `grande.bind(document.querySelectorAll(".myEditableItems"))`
4. You are set!

### Included files

- `menu.css`: this file provides the toolbar styling to appear as it does below

## Options to grande.bind

The `bind` function currently accepts two parameters: bindableNodes and an options list.

`bindableNodes` must be a querySelector result that contains elements with contenteditable="true"

The second parameter is an `options` object that accepts the following keys:

- `animate`: if true, will trigger CSS animations (defaults to true).

![image](http://f.cl.ly/items/0O1M1R1g2w1P213C0S3Z/Screen%20Shot%202013-08-21%20at%2011.53.55%20PM.png)

The following tag stylings are available: `<b>`, `<i>`, `<blockquote>`, `<a>`

Questions
---------
### This is very similar to Zenpen, why?
First off, major props to @tholman for the inspirational script. grande.js is a spiritual cousin of the fantastic plugin and aims to have feature parity with Medium. It adds multiple styles and will be diverging from the vision of being an in-browser editing experience to being a *provider* of the in-browser editing experience. grande.js will be providing the foundation for your website to have a wonderful editing experience.

Roadmap
-------
- Images (figure)
- execCommand to support `<strong>` and `<em>`
- CSS animations to match the `pop-upwards` on Medium
