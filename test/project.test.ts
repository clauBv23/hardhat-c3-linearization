import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import sinon from "sinon";

import {
  deletedSuccessfullyMsg,
  writtenSuccessfullyMsg,
} from "../src/constants";

import { readLinearizationFile, useEnvironment } from "./helpers";

chai.use(chaiAsPromised);

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

      const data = await readLinearizationFile();

      chai.assert.equal(data, null);
      chai.assert.isTrue(logStub.calledTwice);
      chai.assert.equal(logStub.args[0][0], writtenSuccessfullyMsg);
      chai.assert.equal(logStub.args[1][0], deletedSuccessfullyMsg);
    });

    describe("linearize task", function () {
      beforeEach("Clean the linearize file", async function () {
        logStub = sinon.stub(console, "log");

        await cleanLinearizeFile(this.hre);
      });

      it("linearize", async function () {
        await this.hre.run("linearize");
        const data = await readLinearizationFile();

        chai.assert.isNotNull(data);
        chai.assert.deepEqual(JSON.parse(data!), {
          A: ["A"],
          K: ["K"],
          B: ["B", "A"],
          C: ["C", "B", "K", "A"],
        });

        chai.assert.isTrue(logStub.called);
      });

      it("linearize specific path (existent path)", async function () {
        await this.hre.run("linearize", { filesPath: ["./contracts/A.sol"] });

        const data = await readLinearizationFile();

        chai.assert.isNotNull(data);
        chai.assert.deepEqual(JSON.parse(data!), {
          A: ["A"],
          K: ["K"],
        });

        chai.assert.isTrue(logStub.calledTwice);
        chai.assert.equal(logStub.args[0][0], deletedSuccessfullyMsg);
        chai.assert.equal(logStub.args[1][0], writtenSuccessfullyMsg);
      });

      it("linearize specific path (non existent path)", async function () {
        await chai
          .expect(
            this.hre.run("linearize", {
              filesPath: ["./contracts/L.sol"],
            })
          )
          .to.be.rejectedWith("HH1005");
      });

      it("linearize with lienarization issue", async function () {
        await this.hre.run("linearize", {
          filesPath: [
            "./newContracts/A.sol",
            "./newContracts/B.sol",
            "./newContracts/C.sol",
          ],
        });
        const data = await readLinearizationFile();

        chai.assert.isNotNull(data);
        chai.assert.deepEqual(JSON.parse(data!), {
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

        chai.assert.isTrue(logStub.called);
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

        const data = await readLinearizationFile();

        chai.assert.isNotNull(data);

        chai.assert.deepEqual(JSON.parse(data!), {
          A: ["A"],
          K: ["K"],
          B: ["B", "A"],
          C: ["C", "B", "K", "A"],
        });

        chai.assert.isTrue(logStub.called);
      });

      it("compile with linearize disabled", async function () {
        this.hre.config.linearization.enabled = false;
        await this.hre.run(TASK_COMPILE, { force: true, quiet: true });

        const data = await readLinearizationFile();
        chai.assert.equal(data, null);
      });
    });
  });
});
