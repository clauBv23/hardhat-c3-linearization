import "hardhat/types/config";
import "hardhat/types/runtime";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    linearization?: LinearizationConfig;
  }

  export interface HardhatConfig {
    linearization: LinearizationConfig;
  }
}

export interface LinearizationConfig {
  enabled: boolean;
}
