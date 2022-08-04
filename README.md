# sell-nft-multiple

A Solidity smart contract that allows any number of Creators to Sell a crypto asset to multiple parties by giving stake percentage.
Once a purchase is initiated, the owner of the Asset receives funds, while the buyer gets
stakes. 


# Features

1. Alow anyone to create an object with predefined attributes and fixed price.
2. Allow people to view list of sellable assets with price.
3. Allow multiple people to buy stake percentage in the asset (stake percentage is calculated based on the price paid against the total asset price).
4. Allow users to query contract via certain getter functions like list/count of created assets, purchased assests against any user address or AssetId.

# Assumptions:

1. Price for every Asset should be greater then 0.
2. Creator cannot purchase his/her own asset.
3. For new Asset creation, the creator should give a unique AssetId, the program could have auto generated it but it is kept as input by user for giving more control on the user web frontend.

4. Due to record keeping like 'list of created/purchased assets by an address' or 'list of owners of an asset' etc, the program has used certain storage mappings during 'Asset Purchase' process due to which gas consumption of purchase method is little higher, this can be reduced if such detailed storage/record keeping is not required on blockchain.

5. Options to pause/unpause contract and other controls could be given to owner but such is not given intentionally.

# Functions

1. createAsset : AnyOne can create asset by calling this method and giving the attributes like name, description and price and a unique Asset Id.

2. purchaseAsset: Mutiple users can purchase stake in an asset by giving the asset id and passing amount in ethereem. Stake percentage is calculated based on the price paid against the total asset price.

# Getter Methods (Methods for querying smart contract for showing data on web frontend using web3)

1. getUserPurchasedAssets	: List of all AssetIds purchased by a user address
2. getUserCreatedAssets		: List of all AssetIds created by a user address
3. getAssetOwners			: List of all owner addresses for an AssetId
4. getAllAssets				: List of all available assets

# Public Getter Variables (public variable that can be queried to get data from contract)

1. assetCount		: Count of all created assets.
2. userCreatedCnt	: Count of assets created by a user address.
3. userPurchasedCnt	: Count of assets purchased by a user address.
4. assetStakeCnt	: Count of owners for an AssetId
5. userStakes		: Stake Percentage owned by a user address on an AssetId
6. asset 			: Asset details for an AssetId


## List of Mappings

1. userCreatedAssests	: Mapping of User/Creator Address with Array of all assets created by him/her
2. userPurchasedAssests: Mapping of User/Staker Address with Array of all assests puchased
3. assetStakers		: Mapping of Asset_Id with Array of all purchaser addresses
4. allAssets			: Mapping/Array of all created assests
5. userStakes			: Mapping of purchaser Adress with Array of all assets and stake percentage .
6. asset 				: Mapping of Asset_id with Asset Object.