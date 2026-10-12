# Thank You Application (PraiseBoard)

This project contains the `PraiseBoard` smart contract, designed to demonstrate a simple decentralized application (dApp) using Hardhat.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

## Installation

Clone the repository and install the dependencies:

```bash
npm install
```

## Running the Project

### Compile the Contracts
To compile the smart contracts, run:
```bash
npx hardhat compile
```

### Run Tests
To execute the test cases, use the following command:
```bash
npx hardhat test
```

### Deploy
To deploy the contract to a local network or a testnet, you can run:
```bash
npx hardhat run scripts/deploy.ts
```
*(Make sure your `hardhat.config.ts` is configured with the appropriate network and keys before deploying to a live network.)*

## Project Structure
- `contracts/`: Smart contracts (e.g., `PraiseBoard.sol`)
- `test/`: Test files for testing your contracts
- `scripts/`: Deployment and interaction scripts
- `hardhat.config.ts`: Configuration file for Hardhat
