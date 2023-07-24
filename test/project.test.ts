// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import chai from "chai";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import { useEnvironment, readLinearizationFile } from "./helpers";

import {
  writtenSuccessfullyMsg,
  deletedSuccessfullyMsg,
} from "../src/constants";

describe("Integration tests examples", function () {
  let logStub: any;

  afterEach(() => {
    // Restore console.log after each test
    logStub.restore();
  });

  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    async function cleanLinearizeFile(hre: any) {
      await hre.run("clean-linearize");
    }

    it("clean-linearize task ", async function () {
      logStub = sinon.stub(console, "log");

      await this.hre.run("linearize");
      await this.hre.run("clean-linearize");

      logStub.restore();

      var data = await readLinearizationFile();

      assert.equal(data, null);
      expect(logStub.calledTwice).to.be.true;
      expect(logStub.args[0][0]).to.be.equal(writtenSuccessfullyMsg);
      expect(logStub.args[1][0]).to.be.equal(deletedSuccessfullyMsg);
    });

    describe("linearize task", function () {
      beforeEach("Clean the linearize file", async function () {
        logStub = sinon.stub(console, "log");

        await cleanLinearizeFile(this.hre);
      });

      it("linearize", async function () {
        await this.hre.run("linearize");
        var data = await readLinearizationFile();

        assert.isNotNull(data);
        assert.deepEqual(JSON.parse(data!), {
          A: ["A"],
          K: ["K"],
          B: ["B", "A"],
          C: ["C", "B", "K", "A"],
        });

        expect(logStub.called).to.be.true;
      });

      it("linearize specific path (existent path)", async function () {
        await this.hre.run("linearize", { filesPath: ["./contracts/A.sol"] });

        var data = await readLinearizationFile();

        assert.isNotNull(data);
        assert.deepEqual(JSON.parse(data!), {
          A: ["A"],
          K: ["K"],
        });

        expect(logStub.calledTwice).to.be.true;
        expect(logStub.args[0][0]).to.be.equal(deletedSuccessfullyMsg);
        expect(logStub.args[1][0]).to.be.equal(writtenSuccessfullyMsg);
      });

      it("linearize specific path (non existent path)", async function () {
        await expect(
          this.hre.run("linearize", {
            filesPath: ["./contracts/L.sol"],
          })
        ).to.be.rejectedWith("HH1005");
      });

      it("linearize with lienarization issue", async function () {
        await this.hre.run("linearize", {
          filesPath: [
            "./newContracts/A.sol",
            "./newContracts/B.sol",
            "./newContracts/C.sol",
          ],
        });
        var data = await readLinearizationFile();

        assert.isNotNull(data);
        assert.deepEqual(JSON.parse(data!), {
          A: ["A", "K"],
          K: ["K"],
          B: ["B", "A", "K"],
          C: [
            "C",
            "B",
            "Linearization of inheritance graph impossible",
            ["A", "K"],
            ["K"],
            ["A", "K"],
            ["K", "A"],
          ],
        });

        expect(logStub.called).to.be.true;
      });
    });

    describe("compile task", function () {
      beforeEach("Clean the linearize file", async function () {
        logStub = sinon.stub(console, "log");

        await cleanLinearizeFile(this.hre);
      });

      afterEach(() => {
        // Restore console.log after each test
        logStub.restore();
      });

      it("compile with linearize enabled", async function () {
        // const logStub = sinon.stub(console, "log");

        this.hre.config.linearization.enabled = true;
        await this.hre.run(TASK_COMPILE, { force: true, quiet: true });

        var data = await readLinearizationFile();

        assert.isNotNull(data);

        assert.deepEqual(JSON.parse(data!), {
          A: ["A"],
          K: ["K"],
          B: ["B", "A"],
          C: ["C", "B", "K", "A"],
        });

        expect(logStub.called).to.be.true;
      });

      it("compile with linearize disabled", async function () {
        this.hre.config.linearization.enabled = false;
        await this.hre.run(TASK_COMPILE, { force: true, quiet: true });

        var data = await readLinearizationFile();
        assert.equal(data, null);
      });
    });
  });
});
