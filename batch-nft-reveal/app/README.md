# Batch NFT Reveal App

[LIVE DEMO](https://automation.chainlink-demo.app)

This is a complementary app for the [Chainlink Automation Template: Batch NFT Reveal](https://github.com/smartcontractkit/chainlink-automation-templates/tree/main/batch-nft-reveal) contract repo. It helps you setup and play with batch-revealed NFT collections powered by Chainlink VRF & Automation.

## Requirements

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [Git](https://git-scm.com/downloads)

## Quick Start

Install all dependencies:

```bash
yarn install
```

Start up the local development server:

```bash
yarn dev
```

## Configure

Copy `.env.example` over to `.env` and fill the values with your own.

| Name                     | Description                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_INFURA_KEY` | Required for read-only mode in collection page and using WalletConnect. Obtain key from [Infura's site](https://infura.io). |

## Build and Deploy

If you want to run this site in production, you should install modules then build the site and start it like this:

```bash
yarn install
yarn build
yarn start
```

## References

- [Next.js Docs](https://nextjs.org/docs/getting-started)
- [Chainlink Fullstack Starter](https://github.com/hackbg/chainlink-fullstack)
