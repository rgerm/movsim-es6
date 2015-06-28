Requirements
============

Node and npm
------------

Installation:

precompiled [nodejs.org](https://nodejs.org/)

sources and [compile instructions](https://github.com/joyent/node)


Build
=====

Install dependencies
--------------------
Install build tool **broccoli command line** globally
```shell
npm install -g broccoli-cli
```

Install project dependencies in project root. Defined in [package.json](package.json).
```shell
npm install
```

start webserver
---------------
```shell
broccoli serve
```

-> **localhost:4200**

**broccoli watches automatically** for file changes and triggers rebuild

one time build
-------------
```shell
./run.sh

# or run
broccoli build dist
```
