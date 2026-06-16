// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReferralRegistry {
    struct Referral {
        address referrer;
        uint256 earnedAmount;
        uint256 referralCount;
    }

    mapping(address => Referral) public referrals;
    mapping(address => bool) public authorizedGames;

    address public owner;

    event ReferralCreated(address indexed referee, address indexed referrer);
    event ReferralEarnings(address indexed referrer, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyAuthorized() {
        require(authorizedGames[msg.sender], "Not authorized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setReferrer(address referee, address referrer) external onlyAuthorized {
        if (referrals[referee].referrer == address(0)) {
            referrals[referee].referrer = referrer;
            referrals[referrer].referralCount++;
            emit ReferralCreated(referee, referrer);
        }
    }

    function recordEarning(address referrer, uint256 amount) external onlyAuthorized {
        referrals[referrer].earnedAmount += amount;
        emit ReferralEarnings(referrer, amount);
    }

    function getReferral(address user) external view returns (Referral memory) {
        return referrals[user];
    }

    function authorizeGame(address gameAddress) external onlyOwner {
        authorizedGames[gameAddress] = true;
    }

    function deauthorizeGame(address gameAddress) external onlyOwner {
        authorizedGames[gameAddress] = false;
    }
}
