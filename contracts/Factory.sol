// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.8;

import "./Loanft.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract FactoryLoans is Ownable {
    address public COMMISSION_WALLET = 0xA54720B9cA096434DDe92754b1c4a96547d84b5E;
    uint256 public fee = 1 ether;
    event LoanCreated(Loanft loan);
    function createLoan(
        IERC721 _collateralAsset,
        IERC1155 _interestAsset,
        IERC1155 _requestAsset,
        uint256 _requestAssetId,
        uint256 _timeToPay
    ) external returns(address) {
        Loanft newLoan = new Loanft(
            msg.sender,
            _collateralAsset,
            _requestAsset,
            _interestAsset,
            _requestAssetId,
            _timeToPay,
            fee,
            COMMISSION_WALLET
        );
        emit LoanCreated(newLoan);
        return address(newLoan);
    }

    function setCommissionWallet (address _newWallet) public onlyOwner {
        COMMISSION_WALLET = _newWallet;
    }

    function setFee (uint256 _newFee) public onlyOwner {
        fee = _newFee;
    }

}
