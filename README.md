# hardhat-c3-linearization

![NPM](https://img.shields.io/npm/l/hardhat-c3-linearization)

Plugin to get the C3 linearization output from your project.

## What

This plugin will help you better simplify your project's inheritance graph and to solve the linearization issues in an easier way.

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

When running the compilation task, the linearization output will be in your project's `linearization/linearization.json` file.

## Usage

The plugin will be automatically executed when the project is compiled.

If there is any linearization problem during the compilation, even though the compilation will fail the linearization file will be generated showing the issue.

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
