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
  "4": {
    name: "rinkeby",
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: "500000",
    subscriptionId: "18739",
  },
};

export const developmentChains = ["31337"];
