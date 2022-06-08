# Chainlink Keepers Templates

This is a monorepo containing real-world examples of [Chainlink Keepers](https://docs.chain.link/docs/chainlink-keepers/introduction/) use cases that can be used for reference or to be built upon.

Chainlink Keepers provide users with a decentralized network of nodes that are incentivized to perform all registered jobs (or Upkeeps) without competing with each other. The network provides developers with hyper-reliable, decentralized smart contract automation.

## Example Projects

- [Vault Harvesting/Compounding](/packages/harvester/)

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

## Setup

Clone repo:

```bash
git clone git@github.com:hackbg/chainlink-keepers-templates.git
```

Install the dependencies for all templates and save space from reusing node modules:

```bash
yarn install
```

To setup a single template, navigate to an example package and run the command from there.

## References

- [Hardhat](https://hardhat.org/getting-started/)
