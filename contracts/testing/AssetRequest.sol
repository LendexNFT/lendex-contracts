// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract RockToken is ERC1155 {
    uint256 public constant RockGOLD = 0;
    uint256 public constant RockSILVER = 1;
    constructor() ERC1155("") {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
    {
        _mint(account, id, amount, data);
    }

    function setApprovalForAll(address operator) public {
      setApprovalForAll(operator, true);
    }
}