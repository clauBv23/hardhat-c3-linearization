// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import path from "path";

import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("compile", async function () {
      await this.hre.run(TASK_COMPILE, { force: true, quiet: true });
    });
  });
});
