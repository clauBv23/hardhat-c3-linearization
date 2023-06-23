// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";

import { useEnvironment } from "./helpers";

// todo add tests to the linearization flow
describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("compile", async function () {
      await this.hre.run(TASK_COMPILE, { force: true, quiet: true });
    });

    // it("The example field should say hello", function () {
    //   assert.equal(this.hre.example.sayHello(), "hello");
    // });
  });

  // describe("HardhatConfig extension", function () {
  //   useEnvironment("hardhat-project");

  //   it("Should add the newPath to the config", function () {
  //     assert.equal(
  //       this.hre.config.paths.newPath,
  //       path.join(process.cwd(), "asd")
  //     );
  //   });
  // });
});

// describe("Unit tests examples", function () {
//   describe("ExampleHardhatRuntimeEnvironmentField", function () {
//     describe("sayHello", function () {
//       before(async function () {
//         await this.hre.run(TASK_COMPILE, { force: true, quiet: true });
//       });

//       it("Should say hello", function () {
//         const field = new ExampleHardhatRuntimeEnvironmentField();
//         assert.equal(field.sayHello(), "hello");
//       });
//     });
//   });
// });
