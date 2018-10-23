# nodebro
Run node commands directly from the command line. Call `nodebro` followed by a string of code to execute.

### Installation
Use [npm](https://www.npmjs.com/) to install `nodebro`.

```
npm i nodebro
```

Or install `nodebro` globally so you can run it from anywhere on your machine.

```
npm i -g nodebro
```

Depending on where your gloabl `node_modules` dir is located, unix users may have to run
```
sudo npm i -g nodebro
```

### Useage

Simply call `nodebro` followed by a string of node code to execute.

Example:

```
nodebro "console.log(require('util').inspect({ foo: 'bar' }))"
```

Because your code will be executed in your local node environment, you can use things like `require` or `async/await` depending on your node version.