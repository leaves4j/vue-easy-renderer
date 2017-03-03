v0.9.0 / 2017-03-03
---
## Breaking Change
  * remove vue-meta, but option head still work in server side render

v0.8.2 / 2017-03-02
---
## Fixed
  * state data doesn't work well when not in server render data bug

v0.8.1 / 2017-02-23
---
## Fixed
  * renderer with vuex bug

v0.8.0 / 2017-02-20
---
## New Features
  * add renderer options `watch`

v0.7.1 / 2017-02-17
---
## Changes
  * remove `css-loader` `sass-loader` `less-loader`, use `null-loader` to deal style

v0.7.0 / 2017-02-16
---
## New Features
  * add renderer options `onError`

v0.6.4 / 2017-02-15
---
## Fixed
  * sass and less support bug
  * client init state to vue options data bug

v0.6.3 / 2017-02-14
---
## Fixed
  * render multiple header bug

v0.6.2 / 2017-02-14
---
## Fixed
  * compiler bug when using plugins with string path and es6 `export default`

v0.6.1 / 2017-02-14
---
## Fixed
  * compiler bug when using plugins with string path 

v0.6.0 / 2017-02-14
---
## New Features
  * support using plugins with string path

v0.5.0 / 2017-02-13
---
## New Features
  * and `sass` and `less` internal support

v0.4.0 / 2017-02-13
---
## Breaking Change
  * remove renderer options `streamFlag`

v0.3.0 / 2017-02-09
---
## New Features
  * add vue plugin support
 
v0.2.1 / 2017-02-07
---
## Changes
  * change `vue-loader` to peer dependencies

## Fixed
  * scoped css bug

v0.2.0 / 2017-02-07
---
## New Features
  * add `vuex` store support

## Changes
  * change `vue` and `vuex` to peer dependencies

## Fixed
  * client-plugin set data to children component