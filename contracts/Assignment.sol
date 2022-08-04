// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Context.sol";

contract Assignment is Context{
    event AssetPurchased(address indexed id, uint256 amount,uint256 per);
    event NewAssetAdded(address owner,uint256 id,string name, uint256 price);

    struct Asset {
        address owner;
        string name;
        string desc;
        uint256 price_wei;
        uint256 price_filled;
    }

    /* Count of Assets */
    uint256 public assetCount;

    // Mapping creator address to asset count
    mapping(address => uint256) public userCreatedCnt;

    /* address->array index->assetId */    
    mapping(address => mapping(uint256 => uint256)) userCreatedAssests;

    // Mapping owner address to stake asset count
    mapping(address => uint256) public userPurchasedCnt;
    
    /* address->array index->assetId */    
    mapping(address => mapping(uint256 => uint256)) userPurchasedAssets;

    // Mapping asset Id to owner count
    mapping(uint256 => uint256) public assetStakeCnt;

    // assetId->array index->owner address */
    mapping(uint256 => mapping(uint256 => address))  assetStakers;

     /* array index->assetId */    
    mapping(uint256 => uint256) allAssets;
    
    /* address->assetId->stakePercentage */
    mapping(address => mapping(uint256 => uint256)) userStakes;

    /* Mapping of Asset Id with Asset */
    mapping(uint256 => Asset) public asset;

    function createAsset(
        uint256 _assetId,
        uint256 _price,
        string calldata _name,
        string calldata _desc
    ) external{
        require(asset[_assetId].owner ==address(0),'Asset Id already exists');
        require(_price >0,'Invalid Price');

        asset[_assetId].owner=_msgSender();
        asset[_assetId].name = _name;
        asset[_assetId].desc = _desc;
        asset[_assetId].price_wei = _price;
        asset[_assetId].price_filled = 0;
        allAssets[assetCount]=_assetId;
        assetCount++;
        
        userCreatedAssests[_msgSender()][userCreatedCnt[_msgSender()]]=_assetId;
        userCreatedCnt[_msgSender()]++;
        emit NewAssetAdded(_msgSender(),_assetId,_name, _price);
    }

    function purchaseAsset(uint256 _assetId) external payable {
        require(asset[_assetId].owner !=address(0),'Invalid Asset Id');
        require(asset[_assetId].owner !=_msgSender(),'Asset creator prohibited');
        require(msg.value >0, 'Invalid Amount');
        require (asset[_assetId].price_filled  < asset[_assetId].price_wei,'Asset is sold');
        require(msg.value <= (asset[_assetId].price_wei - asset[_assetId].price_filled),'Amount higher then available asset price');
        
        /* Calculate stake percentage */
        uint256 stakePer = msg.value * 100/asset[_assetId].price_wei;

        asset[_assetId].price_filled+=msg.value;
        userStakes[_msgSender()][_assetId]=userStakes[_msgSender()][_assetId]+stakePer;                
        userPurchasedAssets[_msgSender()][userPurchasedCnt[_msgSender()]] = _assetId;
        assetStakers[_assetId][assetStakeCnt[_assetId]]=_msgSender();
        userPurchasedCnt[_msgSender()]++;
        assetStakeCnt[_assetId]++;
        
        emit AssetPurchased(_msgSender(),_assetId,stakePer);

        (bool success, ) = asset[_assetId].owner.call{value: msg.value}("");
        require(success, "Transfer failed.");
    }

    function getUserPurchasedAssets(address _owner) external view returns  (uint256[] memory){
        uint256 userStakeCount = userPurchasedCnt[_owner];
        uint256[] memory result = new uint256[](userStakeCount);
            
        for(uint i = 0; i < userStakeCount; i++) {
            result[i]=userPurchasedAssets[_owner][i];
        }
        return result;
    }

    function getuserStakePercent(address _user,uint256 _assetId) external view returns (uint256) {
        return userStakes[_user][_assetId];
    }

    function getUserCreatedAssets(address _owner) external view returns  (uint256[] memory){
        uint256 userCreatedCount = userCreatedCnt[_owner];
        uint256[] memory result = new uint256[](userCreatedCount);
            
        for(uint i = 0; i < userCreatedCount; i++) {
            result[i]=userCreatedAssests[_owner][i];
        }
        return result;
    }

    function getAssetOwners(uint256 _assetId) external view returns  (address[] memory){
        uint256 assetStakeCount = assetStakeCnt[_assetId];
        address[] memory result = new address[](assetStakeCount);
            
        for(uint i = 0; i < assetStakeCount; i++) {
            result[i]=assetStakers[_assetId][i];
        }
        return result;
    }

    function getAllAssets() external view returns  (uint256[] memory){
        uint256[] memory result = new uint256[](assetCount);
            
        for(uint i = 0; i < assetCount; i++) {
            result[i]=allAssets[i];
        }
        return result;
    }
}
