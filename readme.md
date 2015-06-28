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
```shell
npm install -g broccoli-cli
npm install
```

start webserver
---------------
```shell
broccoli serve
```

-> localhost:4200
broccoli watches for file changes and triggers rebuild

one time build
-------------
```shell
./run.sh

# or run
broccoli build dist
```


watch files for changes -> trigger build
----------------------------------------
```shell
broccoli serve
```
