import { resetHardhatContext } from "hardhat/plugins-testing";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import fsExtra from "fs-extra";
import { defaultFileLocation } from "../src/constants";

declare module "mocha" {
  interface Context {
    hre: HardhatRuntimeEnvironment;
  }
}

export function useEnvironment(fixtureProjectName: string) {
  beforeEach("Loading hardhat environment", function () {
    process.chdir(path.join(__dirname, "fixture-projects", fixtureProjectName));

    this.hre = require("hardhat");
  });

  afterEach("Resetting hardhat", function () {
    resetHardhatContext();
  });
}

export async function readLinearizationFile(): Promise<string | null> {
  const fileExists = await fsExtra.pathExists(defaultFileLocation);
  if (fileExists) {
    return fsExtra.readFile(defaultFileLocation, "utf8");
  } else return null;
}
