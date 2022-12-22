pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BookToken is ERC721 {
    constructor() ERC721("BookToken", "BK") {}

    struct Book {
        string title;
        string description;
        string authorName;
        address owner;
        uint status;
        uint256 price;
    }

    mapping(uint256 => Book) public tokenIdToBookInfo;
    mapping(uint256 => uint256) public booksForSale;
    uint256[] public allTokens;

    event LogBookSold(uint _tokenId, string _title, string _authorName,
        uint256 _price, address _current_owner, address _buyer);

    event LogBookTokenCreate(uint _tokenId, string _title, string _authorName,
        uint256 price, address _owner);

    event LogBookPutUpForSale(uint _tokenId, uint _status, uint256 _price);

    function createBookToken(uint256 _tokenId, string memory _title, string memory _description,
        string memory _authorName, uint256 _price) public {

        require(tokenIdToBookInfo[_tokenId].owner == address(0x0), "Book exists");

        Book memory newBook = Book(_title, _description, _authorName, msg.sender, 0, _price);
        tokenIdToBookInfo[_tokenId] = newBook;
        allTokens.push(_tokenId);
        _mint(msg.sender, _tokenId);
        emit LogBookTokenCreate(_tokenId, _title, _authorName, _price, msg.sender);
    }

    function lookUpForBook (uint256 _tokenId) public view returns
         (string memory, string memory, string memory, uint status, address, uint256){

        require(tokenIdToBookInfo[_tokenId].owner != address(0x0), "Book does not exist");

        return (tokenIdToBookInfo[_tokenId].title, tokenIdToBookInfo[_tokenId].description,
        tokenIdToBookInfo[_tokenId].authorName, tokenIdToBookInfo[_tokenId].status,
        tokenIdToBookInfo[_tokenId].owner, tokenIdToBookInfo[_tokenId].price);
    }

    function putBookUpForSale(uint256 _tokenId, uint256 _price) public {
        require(tokenIdToBookInfo[_tokenId].owner != address(0x0), "Book does not exist");
        require(ownerOf(_tokenId) == msg.sender, "You can't sale book you don't owned");
        booksForSale[_tokenId] = _price;
        tokenIdToBookInfo[_tokenId].status = 1;
        tokenIdToBookInfo[_tokenId].price = _price;
        emit LogBookPutUpForSale(_tokenId, 1, _price);
    }

    function buyBook(uint256 _tokenId) payable public {
        (string memory _title,, string memory _authorName, uint status,
        address _current_owner, uint256 _price) =  lookUpForBook(_tokenId);

        require(_current_owner != address(0x0), "Book does not exist");
        require(msg.sender != address(0x0));
        require(msg.sender != _current_owner, "Message sender is already owner");
        require(msg.value >= _price, "Message value is too low");
        require(status != 0, "Book is not for sale");

        //transfer ownership of book
        _transfer(_current_owner, msg.sender, _tokenId);
        //return extra payment
        if(msg.value > _price) _make_payable(msg.sender).transfer(msg.value - _price);
        //make a payment
        _make_payable(_current_owner).transfer(_price);
        tokenIdToBookInfo[_tokenId].owner = msg.sender;
        tokenIdToBookInfo[_tokenId].status = 0;

        emit LogBookSold(_tokenId, _title, _authorName, _price, _current_owner, msg.sender);
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    function exchangeBooks (uint256 _firstBookTokenId, uint256 _secondBookTokenId) public payable{
        require(ownerOf(_firstBookTokenId)==msg.sender || ownerOf(_secondBookTokenId)==msg.sender);

        address bookOwner1 = ownerOf(_firstBookTokenId);
        address bookOwner2 = ownerOf(_secondBookTokenId);
        // Exchange the tokens.
        _transfer(bookOwner1, bookOwner2, _firstBookTokenId);
        _transfer(bookOwner2, bookOwner1, _secondBookTokenId);
    }

    function transferBook (address to, uint256 _tokenId) public payable{
        require(ownerOf(_tokenId)==msg.sender);
        _transfer(msg.sender, to, _tokenId);
    }

    function getAllWithStatusAvailableForSale () public view returns (Book[] memory){
        //check how many tokens
        uint256 tokensForSale = 0;
        for (uint i = 0; i < allTokens.length; i++) {
            //is for sale and sender is not a owner of a token
            if(tokenIdToBookInfo[allTokens[i]].status==1 && ownerOf(allTokens[i])!=msg.sender){
                tokensForSale++;
            }
        }
        //create list of available tokens
        Book[] memory tokens = new Book[](tokensForSale);
        uint256 index = 0;
        for (uint i = 0; i < allTokens.length; i++) {
            //is for sale and sender is not a owner of a token
            Book memory newBook = tokenIdToBookInfo[allTokens[i]];
            if(newBook.status==1 && ownerOf(allTokens[i])!=msg.sender){
                tokens[index] = newBook;
                index++;
            }
        }
        return tokens;
    }

    function getAll () public view returns (Book[] memory){

        Book[] memory tokens = new Book[](allTokens.length);
        for (uint i = 0; i < allTokens.length; i++) {
          tokens[i] = tokenIdToBookInfo[allTokens[i]];
        }
        return tokens;
    }
}
