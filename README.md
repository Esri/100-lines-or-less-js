#(ArcGIS.js <= 100) Responsive Edition
###Welcome to the Esri Mapping App Code Challenge

Everybody loves a cool mapping app, but everyone loves a cool, [responsive](http://en.wikipedia.org/wiki/Responsive_web_design) mapping app even more! The challenge again is to write the best mapping app with the [ArcGIS API for JavaScript](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html) in 100 lines or less, except this time we'll be giving extra marks for apps that run well across mutiple devices (desktops, tablets and phones). 

The prizes include one-year subscriptions to [ArcGIS Online](http://www.esri.com/software/arcgis/arcgisonline) ($2500 each) and also a free 2015 Esri Dev Summit pass ($1000) for the overall winner.

To enter just make a pull request to submit your code (see [How to Enter](#how-to-enter) below).
We'll be announcing the winners live on stage at the [2014 Esri International Developer Summit](http://www.esri.com/events/devsummit/index.html), but don't worry, **you don't need to attend the conference to win**. Just submit your code on time and you are good to go.

Best of luck!

<div style="text-align:center;"><img src="http://esri.github.io/img/100-lines-responsive.gif"></div>

## Contest Period
- Starts: 9:00 AM PST Friday, Feb 1, 2014
- Closes: 6:00 PM PST Sunday Mar 9, 2014 (No entries will be accepted after this time.)

## Entries
* [View all of the entries here](http://esri.github.io/100-lines-or-less-js/index.html)
* Check back here on Wednesday March 12th, 2014 to see the winners!

## How to Enter
1. Fork and then clone this repo.
2. Add a sub-folder with your app in it (see [example](basemaptour)).
3. Make a pull request on the **master** branch to submit your entry. This request represents your agreement to the [Terms and Conditions](Terms%20and%20Conditions%20Agreement.md).

NOTE: 
* Be sure to Pull and Merge from this repo to get the latest before making your pull request!  We'll publish the app on gh-pages for you.
* Please create an Issue if you have a question.

## Rules

1. Max 100 (sloc) lines of client-side JavaScript code. Max 100 chars per line. Not compressed.
2. Must use the [ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/index.html).
3. All ArcGIS JavaScript code must be in a single .js file (see Example below).
4. Each project must contain an index.html file (see Example below).
5. All project code (HTML, css, js...) must reside beneath a single root-level folder.
6. Application must be fully functional, portable, deployable and accessible from any public web-enabled directory.  
7. Applications must be freely distributable via Apache 2.0 license.
8. IMPORTANT: Libraries other than the ArcGIS API for JavaScript can be used and do not count toward the 100 line limit. Libraries referenced must be published and publicly available prior to February 1, 2014.  So that means you can't write libraries to hide your ArcGIS code!  You can use previously published ArcGIS libraries however.

See all rules, terms and conditions [here](Terms%20and%20Conditions%20Agreement.md).

## What can I win?
* 1st Place - One year ArcGIS Online Subscription & Esri Developer Summit Pass for 2015
* 2st Place - One year ArcGIS Online Subscription
* 3st Place - One year ArcGIS Online Subscription

## Judging Criteria

1. Effective use of the ArcGIS API for JavaScript
2. UX and UI
3. Coding style
4. Responsive design

## Judges
- [@AL_Laframboise](https://twitter.com/AL_Laframboise) 
- [@derekswingley](https://twitter.com/derekswingley)
- [@jerrysievert](https://twitter.com/jerrysievert)
- [@geeknixta](https://twitter.com/geeknixta)

## Example Entry

Follow the structure of [this](basemaptour) example.  View it live [here](http://esri.github.io/100-lines-or-less-js/basemaptour).


```
\project\
\project\index.html
\project\js\arcgis.js
\project\css\
\project\images\
\project\info.json
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=7,IE=9">   
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <title>Your App</title>
  <link rel="stylesheet" href="http://js.arcgis.com/3.8/js/esri/css/esri.css">
  <script src="http://js.arcgis.com/3.8compact/"></script>
  <!-- Load your project JavaScript and CSS -->
  <link rel="stylesheet" type="text/css" href="css/project.css">
  <!-- ArcGIS.js contains the code for the contest entry --> 
  <script src="js/arcgis.js"></script>  
</head>
  <body>
    <div id="mapDiv"></div>
  </body>
</html>
```

Please also include a `\project\info.json` file to specify how your project is listed in the [code challenge entries page](http://esri.github.io/100-lines-or-less-js/).
```json
{
  "projectName": "Your App Title",
  "githubAuthor": "Your Github Username"
}
```

## Resources

* [Esri International Developer Summit](http://www.esri.com/events/devsummit)
* [ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/index.html)
* [ArcGIS Blog](http://blogs.esri.com/esri/arcgis/)
* [@esridevsummit](http://twitter.com/esridevsummit) Follow #devsummit

## Licensing
Copyright 2014 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](https://raw.github.com/Esri/100-lines-or-less-js/master/license.txt) file.

[](Esri Tags: ArcGIS Web Mapping Contest 100-lines-or-less Code-Challenge Responsive Mobile)
[](Esri Language: JavaScript)
