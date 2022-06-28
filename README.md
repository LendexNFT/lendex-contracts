# Koomuna Labs

## Tutorial Básico para correr el proyecto en REMIX IDE.

  1. En tu navegador visita [Remix](http://remix.ethereum.org/).
  2. Crea un archivo nuevo con nombre ``Factory.sol`` y otro con nombre ``Loanft.sol`` dentro de la carpeta contracts
  3. Copia el codigo de los contratos que estan en este proyecto en la carpeta contracts y
    pegalos respectivamente en los nuevos archivos que creaste.
  4. Compila el contrato de ``Factory.sol``.
  5. Deployar el contrato de ``Factory.sol``.
  6. Deployar un contrato de tipo ERC721 y dos de tipo ERC1155 en Remix, puedes tomar los contratos de ejemplo que
    estan en la carpeta testing esto para probar la creacion de ordenes más adelante.
  Hasta este punto debemos tener 4 contratos desplegados, Factory.sol, ERC721, ERC1155, ERC1155.
  7. En el contrato de Factory ejecutaremos la funcion de createLoan, pasandole como parametros:  
    _collateralAsset: Direccion del contrato ERC721.
    _interestAsset: Direccion del contrato ERC1155.
    _requestAsset: Direccion del contrato ERC1155.
    _requestAssetId: Id del asset que solicitamos que pertenece a la colección de _requestAsset.
    _timeToPay: Corresponde al tiempo multiplicado por dias, ej. 1 = 1 día, 2 = 2 dias, etc.
  8. Si la transaccion se ejecuto correctamente nos retornara como resultado el address de nuestra orden.(IMG)
  9. Compilamos el contrato ``Loanft.sol``, copiamos la direccion que resulta de la transaccion anterior y  
    pegamos en el input de ``At Address``, esto nos genera el contrato de Loanft con la direccion que el factory genero.(IMG)

  Ahora podemos interactuar con las funciones de nuestro contrato ``Loanft.sol``, como requisito el Owner de la orden debe tener  
  NFT's de la  coleccion que se puso como colateral y de la coleccion que se ofrece como interes, la cuenta que llenara la orden debe contar con un NFT de la coleccion que se solicita y que corresponda al Id.
  Se debe ejecutar el ``setApprovalForAll`` de cada contrato de los NFT's para autorizar que el contrato de la orden (``Loanft.sol``)  pueda transferir los assets segun su funcion.

## Tutorial basico para correr el proyecto en Hardhat de forma local.

  * Prerequisitos:
    Tener instalado [NodeJS](https://nodejs.org/) >=12.0

  1. Clonar este repositorio.
  2. Entrar a la carpeta del proyectoo y ejecutar ``npm i` para instalar los paquetes necesarios.
  3. Una vez instalados los paquetes ejecutar el comando ``npx hardhat compile``.
  4. Para correr el testing ejecutar ``npx hardhat test``.
  ....
  

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
