// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import path from "path";

import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    // todo add checks
    useEnvironment("hardhat-project");

    it("compile with linearize enabled", async function () {
      this.hre.config.linearization.enabled = true;
      await this.hre.run(TASK_COMPILE, { force: true, quiet: true });
    });

    it("compile with linearize disabled", async function () {
      this.hre.config.linearization.enabled = false;
      await this.hre.run(TASK_COMPILE, { force: true, quiet: true });
    });

    it("linearize", async function () {
      await this.hre.run("linearize");
    });

    it("linearize specific path", async function () {
      await this.hre.run("linearize", { path: "./contracts/L.sol" });
    });
  });
});
