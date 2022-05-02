// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyAsset is ERC721 {
    constructor() ERC721("MyAsset", "MAS") {}

    function safeMint(uint256 tokenId) public {
        _safeMint(msg.sender, tokenId);
    }

    function setApprovalForAll(address operator) public {
      setApprovalForAll(operator, true);
    }
}
