const ethers = require("ethers");
require("dotenv").config();

const NODE_1_URL = process.env.NODE_1_URL || "https://l2geth.testnet.boba.boba.network:8545";
const NODE_2_URL = process.env.NODE_2_URL || "https://verifier.rinkeby.boba.network";

const main = async () => {
  // nodes
  const nodes = [
    new ethers.providers.JsonRpcProvider(NODE_1_URL),
    new ethers.providers.JsonRpcProvider(NODE_2_URL),
  ];

  // addresses
  const contractAddresses = [
    "0xd0b2234eb9431e850a814bcdcbcb18c1093f986b",
    "0xA46522D682929078C77Ce4be9a7b40bCBA0797dA",
    "0x2cdf86E735F2000ebfF5fC43C078c409294A5DEA",
    "0xC7Db45424a3d0aD88E2ee586FcEDaD6f6eCf2D01",
    "0x78aC41c7797BEe54282C16C912DD4ccDe1D44Cfa",
  ];

  // run eth_getLogs
  const L1BlockNumber = Math.min(
    await nodes[0].getBlockNumber(),
    await nodes[1].getBlockNumber()
  );

  for (const node of nodes) {
    let pendingQueries = []
    let count = 0

    let start = process.hrtime()

    for (const contractAddress of contractAddresses) {
        // The block range is 5000
        let lastBlock = L1BlockNumber
        while (lastBlock - 5000 > 0) {
            pendingQueries.push(queryEvents(node, contractAddress, lastBlock - 5000, lastBlock))
            lastBlock -= 5000
            count += 1
        }

        await Promise.all(pendingQueries)
    }

    let end = process.hrtime(start);

    console.info(`-> Total queries: ${count}`)
    console.info("-> Execution time (hr): %ds %dms", end[0], end[1] / 1000000);
  }
};


const queryEvents = async (node, contractAddress, fromBlock, toBlock) => {
    await node.getLogs(
        contractAddress,
        fromBlock,
        toBlock,
    )
}

main().catch(console.error);
