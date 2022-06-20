#!/bin/bash

rm -rf flatten
mkdir flatten
echo "// SPDX-License-Identifier: MIT" > flatten/NFTCollection.flat.sol
npx hardhat flatten | sed '/SPDX-License-Identifier/d' >> flatten/NFTCollection.flat.sol