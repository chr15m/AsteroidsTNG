#!/bin/bash

rm -rf explorercanvas
svn export http://explorercanvas.googlecode.com/svn/trunk/ explorercanvas
rm -rf jsgamesoup
bzr export jsgamesoup -r74 http://mccormick.cx/dev/jsgamesoup
rm js/mt.js
wget http://homepage2.nifty.com/magicant/sjavascript/mt.js -O js/mt.js
