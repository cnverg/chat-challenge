# Cnverg Fun Chat Challenge

We have built this challenge as a Technical assesment of software developers interested in working with Cnverg in the capacity as a Front-End Developer.  We are running a MEAN Stack, and would like to assess your approach, technical abilities, and comfort.

The ideal candidate will possess strong CSS3 and Angular skills, and familiarity with WebSockets.  We are looking for someone who is also comfortable working with Node and Express, as much of the Front-End work will be connecting to existing code, but above all someone with as much passion for building cutting edge applications in JavaScript as much as we do, will fit in with our team.


## Goals

* ~~Build a basic chat interface~~
* ~~Integrate with [Giphy API](https://github.com/giphy/GiphyAPI)~~
* ~~Showing off your design skills is a BIG plus (it doesn't need to be production ready, but please don't make it look like shit). We are especially interested in Material Design - and Angular Material and Materialize CSS are both great things to consider.~~


### Features

* Notifications from chats
* Unlimited amount of rooms
* Unlimited users per room
* Private messaging
* Arguably acceptable design (tablet and up)


### Chat Interface

~~The chat should support a _room_ with unlimited number of participants and allow sending and receiving messages among them.~~


### Giphy Integration

~~Add some fun by integrating [Giphy](http://giphy.com) such that a message like `/giphy I'm so excited` searches the API and becomes the first image returned from the result set.~~


**Usage**
* Type `/giphy` (or `/g` for short) followed by the tag of what you want
  * If no tag provided, will show you a message saying it's invalid
  * If no image found, will show you a message saying no image was found


## Setup and Delivery

~~This repository provides a working, _arguably acceptable_ express application structure. Feel free to use it and change it as desired.~~

~~When ready, drop us a line at jobs@cnverg.com with either a link to a repository of your own or a pull request, and tell us something nice about yourself :)~~

**Pre Requisites**

* NodeJs >= 4.2.1 installed on you machine
* JSPM installed globally on your machine
  * Get by running `npm install -g jspm`

**Setting for Running**

1. Clone repository
2. run `npm install && jspm install`
3. (Optional) run `jspm bundle app/app --inject` to join modules in a single file for faster load on the browser
