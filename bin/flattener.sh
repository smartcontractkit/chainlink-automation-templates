#!/bin/bash

rm -rf flatten
mkdir flatten
echo "// SPDX-License-Identifier: MIT" > flatten/BeefyHarvester.flat.sol
npx hardhat flatten | sed '/SPDX-License-Identifier/d' >> flatten/BeefyHarvester.flat.sol