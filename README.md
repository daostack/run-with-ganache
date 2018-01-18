# run-with-ganache
Runs commands with Ganache in the background. Install with:

```
npm i --save-dev run-with-ganache
```

Basic usage example:

```
./node_modules/.bin/run-with-ganache 'truffle test'
```

Note that the command is one shell argument.


You can run a Ganache sc fork instance using 32 addresses with:

```
./node_modules/.bin/run-with-ganache --ganache-cmd ganache-sc -a 32 'truffle migrate && truffle test'
```
