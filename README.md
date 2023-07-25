# hardhat-c3-linearization

[![npm](https://img.shields.io/npm/v/hardhat-c3-linearization)](https://www.npmjs.com/package/hardhat-c3-linearization) [![npm type definitions](https://img.shields.io/npm/types/hardhat-c3-linearization)](https://www.npmjs.com/package/hardhat-c3-linearization) [![NPM](https://img.shields.io/npm/l/hardhat-c3-linearization)](https://www.npmjs.com/package/hardhat-c3-linearization)

Plugin to get the C3 linearization output from your project.

## What

This plugin will help you to simplify your project's inheritance graph and to solve the linearization issues in an easier way.

## Installation

```bash
npm install hardhat-c3-linearization
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-c3-linearization");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-c3-linearization";
```

## Tasks

The plugin adds a linearize task to get the c3 linearization output from a project.

To do so just run

```
npx hardhat linearize
```

and the linearization output of your entire project will be in your project's `linearization/linearization.json` file.

You can add a specific path to get the linearization output of those specified files,

```
npx hardhat linearize ./contracts/MyContract.sol
```

The linearization output can also be generated when compiling, it will work over the entire project and is disabled by default.

```
npx hardhat clean-linearize
```

Task to clean the current linearization output file.

## Configuration

To configure the linearization to run while compiling, this plugin extends the `HardhatUserConfig`'s `ProjectPathsUserConfig` object with an optional `linearization` field to enable it.

This can be set as follows:

```js
module.exports = {
  linearization: {
    enabled: true,
  },
};
```

## Usage

The plugin will be automatically executed when the project is compiled (if it is enabled).

And if there is any linearization problem during the compilation, even though the compilation will fail, the linearization file will be generated showing the issue.

For example in the following scenario,

```solidity
 contract A{}
 contract B is A{}
 contract C is B, A{}
```

the linearization output will be:

```json
{
  "A": ["A"],
  "B": ["B", "A"],
  "C": [
    "C",
    "Linearization of inheritance graph impossible",
    ["A"],
    ["B", "A"],
    ["A", "B"]
  ]
}
```

showing the linearization issue in contract C and the problem source when merging the linearization of contract B with the contract C inheritance order.

In any case, the same linearization output will be generated if the `npx hardhat linearize` task is executed.
