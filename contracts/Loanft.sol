// Borrower (Dueño del NFT)
// Focus on EtherOrcs
/* 
  borrowOrder {
    Asset a solicitar: (Potion:1155, Dummie(1155), Fire Crystal(1155), Ice Crystal(1155), Luck Rune(1155), Lava Rock(1155),721(orc-allie), ERC20,
    Collaterall: 721(orc-allies)/1155(items),ERC20
    Time to pay: 1, 3, 7, 12 days
    interes rate: 1155
    comision para el contrato: 1 pzug
   }
*/
/*
   lendOrder {
       Asset a prestar: (Potion:1155, Dummie(1155), Fire Crystal(1155), Ice Crystal(1155), Luck Rune(1155), Lava Rock(1155),
       collateral a recibir: 721(orc-allies)/1155(items), en caso de que no se deposite el asset prestado de vuelta en el tiempo pactado,
       tiempo en el que se liquidara el prestamo,
       incentivo que recibira por llenar la orden
    }
*/

/*
    Factory pattern para deployar contratos de la orden, un child = una orden completa.
    El NFT de colateral del borrower se deposita en un tipo de vault y no al lender y se libera cuando:
        Al Lender:
            El tiempo de pago es mayor al pactado y no se ha recibido el asset de vuelta
            * Como comprobamos que el asset no se deposito en tiempo acordado para liberar el collateral?
                - Revisamos el balance del contrato?

        Al Borrower:
            Se le regresa el colateral si deposito el asset solicitado en el tiempo pactado.
            * Se habilita el withdraw para el borrower?
    
    Al crear la orden el borrower setea el tiempo de pago, setea el asset a solicitar, depostia el colateral, el interes y paga la comision,
        * Como hago para que el contrato solo acepte el deposito del asset solicitado?
            - por medio de la direccion de la colleccion?

    Como le aviso al borrower que ya aceptaron su orden para que se de cuenta a tiempo?
        * Darle 20 minutos de colchon?
        * haciendo un bot?
        * implementando push notifications?
*/

// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Loanft {

// use enum for set the asset type? ERC721, ERC115, ERC20
  address public collateralAssetAddress;
  address public assetToRequest;
  address public assetAsInterest;
  uint256 public assetToRequestId;
  uint256 public timeToPay;
  uint256 public currentTimeFillOrder;
  uint256 public constant LOAN_FEE = 1 ether;
  
  //Mapping of collaterall to staker
  mapping(address => uint256) internal stakerToCollateralId;
  mapping(address => uint256) internal stakerToInterestId;
  address public borrowerAddress;
  address public lenderAddress;
  address public COMMISSION_WALLET = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4; // example wallet

  constructor(address _collateralAssetAddress, address _assetToRequest, address _assetAsInterest, uint256 _assetToRequestId, uint256 _timeToPay) {
      require(_collateralAssetAddress != address(0), "Collaterall address can't be null");
      require(_assetToRequest != address(0), "Asset address can't be null");
      require(_assetAsInterest != address(0), "Interest address can't be null");
      require(_timeToPay > 0, "time can't be zero");
      collateralAssetAddress = _collateralAssetAddress;
      assetToRequest = _assetToRequest;
      assetAsInterest = _assetAsInterest;
      assetToRequestId = _assetToRequestId;
      timeToPay = _timeToPay * 1 days;
      borrowerAddress = msg.sender;
  }

 // wee need to execute setApprovalForAll
    function borrowOrder(uint256 collateralId, uint256 interestId) payable public {
      require(
        IERC721(collateralAssetAddress).ownerOf(collateralId) == borrowerAddress,
            "Token must be stakable by you!"
        );
        require(
          IERC1155(assetAsInterest).balanceOf(borrowerAddress, interestId) >= 1,
            "You need to have at least one!"
        );
        require(msg.value >= LOAN_FEE, "You have to pay the Loan fee");

        payable(COMMISSION_WALLET).transfer(msg.value);
        
        IERC721(collateralAssetAddress).safeTransferFrom(borrowerAddress, address(this), collateralId);
        stakerToCollateralId[borrowerAddress] = collateralId;

        IERC1155(assetAsInterest).safeTransferFrom(borrowerAddress, address(this), interestId, 1, "0x0");
        stakerToInterestId[borrowerAddress] = interestId;
    }

    function lendOrder() payable public {
        require(
          IERC1155(assetToRequest).balanceOf(lenderAddress, assetToRequestId) >= 1,
            "You need to have at least one!"
        );
        require(msg.value >= LOAN_FEE, "You have to pay the Loan fee");
        require(msg.sender != borrowerAddress, "You cannot be the lender if you are the borrower");
        lenderAddress = msg.sender;

        payable(COMMISSION_WALLET).transfer(msg.value);
        currentTimeFillOrder = block.timestamp + timeToPay + 10 minutes;

        IERC1155(assetToRequest).safeTransferFrom(lenderAddress, borrowerAddress, assetToRequestId, 1, "0x0");
    }

    function orderComplete() public {
        require(block.timestamp > currentTimeFillOrder, "You cannot complete the order yet");
        uint256 assetBalance = getAssetToRequestBalance();
        if(assetBalance > 0)
            borrowerPayInTime();
        else
            borrowerNotPayInTime();
    }

    function getAssetToRequestBalance() internal view returns(uint256) {
        return IERC1155(assetToRequest).balanceOf(address(this), assetToRequestId);
    }

    function borrowerPayInTime() internal {
        uint256 tokenInterestId = getInterestTokenStaked();
        uint256 tokenCollateralId = getCollateralTokenStaked();

        // pays the interest for the loan
        IERC1155(assetAsInterest).safeTransferFrom(address(this), lenderAddress, tokenInterestId, 1, "0x0");
        // return the asset that lender lend
        IERC1155(assetToRequest).safeTransferFrom(address(this), lenderAddress, assetToRequestId, 1, "0x0");
        // return the collateral of the borrower
        IERC721(collateralAssetAddress).safeTransferFrom(address(this), borrowerAddress, tokenCollateralId);
    }

    function borrowerNotPayInTime() internal {
        uint256 tokenInterestId = getInterestTokenStaked();
        uint256 tokenCollateralId = getCollateralTokenStaked();

        // return the asset interest for the loan
        IERC1155(assetAsInterest).safeTransferFrom(address(this), borrowerAddress, tokenInterestId, 1, "0x0");
        // send the collateral to the lender
        IERC721(collateralAssetAddress).safeTransferFrom(address(this), lenderAddress, tokenCollateralId);
    }

    function payAssetToRequested() public {
        require(block.timestamp > currentTimeFillOrder, "To late for pay the order");
        IERC1155(assetToRequest).safeTransferFrom(msg.sender, address(this), assetToRequestId, 1, "0x0");
    }

    function getInterestTokenStaked() public view returns (uint256) {
        return stakerToInterestId[borrowerAddress];
    }

    function getCollateralTokenStaked() public view returns (uint256) {
        return stakerToCollateralId[borrowerAddress];
    }

}
