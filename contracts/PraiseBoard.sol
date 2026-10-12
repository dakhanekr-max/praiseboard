// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PraiseBoard {
    struct Tip {
        address sender;
        uint256 amount;
        uint256 timestamp;
        string note;
    }

    Tip[] public tips;
    address public owner;

    event TipReceived(
        address indexed sender,
        uint256 amount,
        string note,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    function sendTip(string calldata note) external payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(bytes(note).length > 0, "Note cannot be empty");
        require(bytes(note).length <= 280, "Note is too long");

        tips.push(Tip({
            sender: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            note: note
        }));

        emit TipReceived(msg.sender, msg.value, note, block.timestamp);
    }

    function getTips() external view returns (Tip[] memory) {
        return tips;
    }

    function getTipsCount() external view returns (uint256) {
        return tips.length;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
