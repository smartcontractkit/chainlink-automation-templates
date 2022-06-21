# Chainlink Keepers Templates

This is a multi-project repo containing real-world examples of [Chainlink Keepers](https://keepers.chain.link) use cases that can be used for reference or to be built upon.

Chainlink Keepers provide users with a decentralized network of nodes that are incentivized to perform all registered jobs (or Upkeeps) without competing with each other. The network provides developers with hyper-reliable, decentralized smart contract automation.

## Example Projects

- [Vault Harvesting/Compounding](/vault-harvester/)
- [Batch NFT Reveal](/batch-nft-reveal/)

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an output like: `vx.x.x`
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to install it with npm

## Getting Started

Clone the repo:

```bash
git clone git@github.com:hackbg/chainlink-keepers-templates.git
```

Navigate to a template subdirectory and follow the instructions in the included `README.md` file:

```bash
cd <template>
```

Install the template's dependencies:

```bash
yarn install
```

## References

- [Chainlink Keepers Docs](https://docs.chain.link/docs/chainlink-keepers/introduction/)
- [Hardhat Docs](https://hardhat.org/getting-started/)

> :warning: **Disclaimer**: The code used in Chainlink Keepers Quickstarts templates comes from Chainlink community members and has not been audited. The Chainlink team disclaims and shall have no liability with respect to any loss, malfunction, or any other result of deploying a Quickstart Template. By electing to deploy a Quickstart Template you hereby acknowledge and agree to the above.