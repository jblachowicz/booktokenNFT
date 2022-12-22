const BookToken = artifacts.require("BookToken");

var accounts;
var owner;
let instance;

contract('BookToken', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

before(async () => {
    instance = await BookToken.deployed();
});

it('user can create a book', async() => {
    //when
    let tokenId = 1;
    let title = "Mały Ksiaże";
    let description = "Powiastka filozoficzna opowiada o podrozy Malego Ksiecia " +
        "na rozne planety w tym Ziemie. Ksiazka uzywana, w dobrym stanie.";
    let authorName = "Antoine de Saint-Exupery";
    let price = 10;
    //then
    await instance.createBookToken(tokenId, title,description, authorName, price,
        {from: accounts[0]})
    //given
    let results = await instance.lookUpForBook(tokenId);
    let resultTitle = Object.values(results)[0]

    assert.equal(resultTitle, "Mały Ksiaże");
});

it('user can put up his book for sale', async() => {
    //when
    let user = accounts[1];
    let tokenId = 2;
    let title = "Duma i uprzedzenie";
    let description = "Powiesc opowiada o losach bohaterów ze srodowiska " +
        "angielskich wyzszych sfer i pozwala zapozna się z ich zyciem na " +
        "przełomie XVIII i XIX wieku. Ksiazka uzywana, w dobrym stanie.";
    let authorName = "Jane Austen";
    let price = web3.utils.toWei(".01", "ether");
    //then
    await instance.createBookToken(tokenId, title,description, authorName, price,
        {from: user})
    assert.equal(Object.values(await instance.lookUpForBook(tokenId))[3], 0);
    await instance.putBookUpForSale(tokenId, price, {from: user});
    //given
    let results = await instance.lookUpForBook(tokenId);
    let resultTitle = Object.values(results)[0]
    let resultStatus = Object.values(results)[3]

    assert.equal(resultTitle, "Duma i uprzedzenie");
    assert.equal(resultStatus, 1);

});


it('user gets the funds after the sale', async() => {
    //when
    let user1 = accounts[1];
    let user2 = accounts[2];
    let tokenId = 3;
    let title = "Kubuś Puchatek";
    let description = "Bajka dla dzieci. Ksiazka uzywana, w dobrym stanie.";
    let authorName = "Alan Alexander Milne";
    let price = web3.utils.toWei(".03", "ether");
    //then
    await instance.createBookToken(tokenId, title,description, authorName, price,
        {from: user1})
    await instance.putBookUpForSale(tokenId, price,
        {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyBook(tokenId, {from: user2, value: price});
    //given
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(price);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('user2 can buy a book, if it is put up for sale by user1', async() => {
    //when
    let user1 = accounts[1];
    let user2 = accounts[2];
    let tokenId = 4;
    let title = "Zbrodnia i kara";
    let description = "Powieść opowiadający o mężczyźnie, niweczącym swoje " +
        "ideały poprzez popełnioną zbrodnię. Ksiazka posiada ślady użytkowania.";
    let authorName = "Fiodor Dostojewski";
    let price = web3.utils.toWei(".03", "ether");
    //then
    await instance.createBookToken(tokenId, title,description, authorName, price,
        {from: user1})
    await instance.putBookUpForSale(tokenId, price, {from: user1});
    let balance = web3.utils.toWei(".05", "ether");
    await instance.buyBook(tokenId, {from: user2, value: balance});
    //given
    assert.equal(await instance.ownerOf.call(tokenId), user2);
});

it('can user2 buy a book and decreases its balance in ether', async() => {
    //when
    let user1 = accounts[1];
    let user2 = accounts[2];
    let tokenId = 5;
    let title = "Rok 1984";
    let description = "Ksiązka nowa.";
    let authorName = "George Orwell";
    let price = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createBookToken(tokenId, title,description, authorName, price,
        {from: user1})
    await instance.putBookUpForSale(tokenId, price, {from: user1});
    //then
    const balanceOfUser2BeforeTransaction = web3.utils.toBN(await web3.eth.getBalance(user2));
    const txInfo = await instance.buyBook(tokenId, {from: user2, value: balance});
    const balanceAfterUser2BuysTreasure = web3.utils.toBN(await web3.eth.getBalance(user2));

    // calculate the gas fee
    const tx = await web3.eth.getTransaction(txInfo.tx);
    const gasPrice = web3.utils.toBN(tx.gasPrice);
    const gasUsed = web3.utils.toBN(txInfo.receipt.gasUsed);
    const txGasCost = gasPrice.mul(gasUsed);

    // make sure that [final_balance == initial_balance - book_price - gas_fee]
    const tokenPriceBN = web3.utils.toBN(price); // from string
    //given
    const expectedFinalBalance = balanceOfUser2BeforeTransaction.sub(tokenPriceBN).sub(txGasCost);
    assert.equal(expectedFinalBalance.toString(), balanceAfterUser2BuysTreasure.toString());
});

it('check name of a book by tokenId', async() => {
    //when
    let user1 = accounts[1];
    let tokenId = 6;
    let title = "Anna Karenina";
    let description = "Klasyczna powieść psychologiczna rosyjskiego pisarza Lwa Tołstoja.";
    let authorName = "Lew Tołstoj";
    let price = web3.utils.toWei(".01", "ether");
    //then
    await instance.createBookToken(tokenId, title,description, authorName, price,
        {from: user1})
    assert.equal(Object.values(await instance.lookUpForBook(tokenId))[3], 0);
    await instance.putBookUpForSale(tokenId, price, {from: user1});
    //given
    let results = await instance.lookUpForBook(tokenId);
    let resultTitle = Object.values(results)[0]
    assert.equal(resultTitle, "Anna Karenina");

});

it('lets user1 exchange book with user2 ', async() => {
    //when
    let user1 = accounts[1];
    let user2 = accounts[2];
    let firstBookId = 7;
    let firstBookTitle = "Emma";
    let description = "Powiesc opowiada o losach bohaterów ze srodowiska angielskich " +
        "wyzszych sfer i pozwala zapoznaa się z ich zyciem na przełomie XVIII i XIX wieku. " +
        "Ksiazka uzywana, w dobrym stanie.";
    let authorName = "Jane Austen";
    let price = web3.utils.toWei(".01", "ether");
    //then
    await instance.createBookToken(firstBookId, firstBookTitle, description, authorName, price,
        {from: user1})
    let secondBookId = 8;
    let secondBookTitle = "Perswazje";
    await instance.createBookToken(secondBookId, secondBookTitle, description, authorName, price,
        {from: user2})
    await instance.exchangeBooks(firstBookId, secondBookId, {from: user2});
    //given
    assert.equal(await instance.ownerOf.call(firstBookId), user2)
    assert.equal(await instance.ownerOf.call(secondBookId), user1)
});

it('lets user1 transfer book to user2 ', async() => {
    //when
    let user1 = accounts[1];
    let user2 = accounts[2];
    let bookId = 9;
    let title = "Harry Potter i Kamień Filozoficzny";
    let description = "Książka fantasy. Ksiazka uzywana, w dobrym stanie.";
    let authorName = "Rowling J. K.";
    let price = web3.utils.toWei(".01", "ether");
    //then
    await instance.createBookToken(bookId, title,description, authorName, price,
        {from: user1})
    await instance.transferBook(user2, bookId, {from: user1});
    //given
    assert.equal(await instance.ownerOf.call(bookId), user2)
});

it('check name and symbol', async() => {
    assert.equal(await instance.name(), 'BookToken')
    assert.equal(await instance.symbol(), 'BK')
});

it('can return a list of books for sale', async() => {
    let results = await instance.getAllWithStatusAvailableForSale();
    assert.equal(results.length, 2)
});

it('can return a list of all books in blockchain', async() => {
    let results = await instance.getAll();
    assert.equal(results.length, 9)
});