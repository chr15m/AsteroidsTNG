#!/bin/bash

rm -rf explorercanvas
svn export http://explorercanvas.googlecode.com/svn/trunk/ explorercanvas
rm -rf jsgamesoup
bzr export static/jsGameSoup http://mccormick.cx/dev/jsgamesoup
