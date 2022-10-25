export const networkConfig: Record<
  string,
  {
    name: string;
    vrfCoordinatorV2?: string;
    gasLane: string;
    callbackGasLimit: string;
    subscriptionId?: string;
    fundAmount?: string;
  }
> = {
  "31337": {
    name: "hardhat",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: "500000",
    fundAmount: "1000000000000000000",
  },
  "5": {
    name: "goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "500000",
    subscriptionId: "0",
  },
};

export const developmentChains = ["31337"];
