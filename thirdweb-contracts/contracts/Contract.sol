//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

contract DEX is ERC20Base, PermissionsEnumerable {
    address public token;
    uint256 private constant PRECISION = 1e18;

    event LiquidityAdded(
        address indexed provider,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event Swap(address indexed user, uint256 ethAmount, uint256 tokenAmount);

    constructor(
        address _token,
        address _defaultAdmin,
        string memory _name,
        string memory _symbol
    ) ERC20Base(_defaultAdmin, _name, _symbol) {
        token = _token;
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
    }

    function getTokensInContract() public view returns (uint256) {
        return ERC20Base(token).balanceOf(address(this));
    }

    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint256 _liquidity;
        uint256 ethBalance = address(this).balance - msg.value;
        uint256 tokenReserve = getTokensInContract();
        ERC20Base _token = ERC20Base(token);

        if (tokenReserve == 0) {
            require(
                _token.transferFrom(msg.sender, address(this), _amount),
                "Token transfer failed"
            );
            _liquidity = ethBalance;
            _mint(msg.sender, _amount);
        } else {
            uint256 ethReserve = ethBalance;
            uint256 tokenAmount = (msg.value * tokenReserve) / ethReserve;
            require(_amount >= tokenAmount, "Insufficient token amount");

            require(
                _token.transferFrom(msg.sender, address(this), tokenAmount),
                "Token transfer failed"
            );
            _liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, _liquidity);
        }

        emit LiquidityAdded(msg.sender, msg.value, _amount);
        return _liquidity;
    }

    function removeLiquidity(
        uint256 _amount
    ) public returns (uint256, uint256) {
        require(_amount > 0, "Amount should be greater than zero");
        uint256 ethReserve = address(this).balance;
        uint256 _totalSupply = totalSupply();

        uint256 ethAmount = (ethReserve * _amount) / _totalSupply;
        uint256 tokenAmount = (getTokensInContract() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        require(
            ERC20Base(token).transfer(msg.sender, tokenAmount),
            "Token transfer failed"
        );

        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmount);
        return (ethAmount, tokenAmount);
    }

    function getAmountOfTokens(
    uint256 inputAmount,
    uint256 inputReserve,
    uint256 outputReserve
) public pure returns (uint256) {
    require(inputReserve > 0 && outputReserve > 0, "Invalid Reserves");
    uint256 inputAmountWithFee = inputAmount * 997;
    uint256 numerator = inputAmountWithFee * outputReserve;
    uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
    uint256 outputAmount = numerator / denominator;
    return outputAmount * 997 / 1000; 
}

    function swapEthToToken() public payable {
        uint256 tokenReserve = getTokensInContract();
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(
            ERC20Base(token).transfer(msg.sender, tokensBought),
            "Token transfer failed"
        );
        emit Swap(msg.sender, msg.value, tokensBought);
    }

    function swapTokenToEth(uint256 _tokensSold) public {
        uint256 tokenReserve = getTokensInContract();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );

        require(
            ERC20Base(token).transferFrom(
                msg.sender,
                address(this),
                _tokensSold
            ),
            "Token transfer failed"
        );
        payable(msg.sender).transfer(ethBought);
        emit Swap(msg.sender, ethBought, _tokensSold);
    }
}
