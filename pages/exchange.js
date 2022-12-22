import {useAddress} from "@thirdweb-dev/react";
import Head from "next/head";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import Web3 from "web3";
import bookTokenArtifact from "../build/contracts/BookToken.json";

const web3 = new Web3(Web3.givenProvider);

function Exchange() {

    const address = useAddress();


    const router = useRouter();

    const create = async () => {
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = bookTokenArtifact.networks[networkId];
            const vendor = new web3.eth.Contract(
                bookTokenArtifact.abi,
                deployedNetwork.address
            );
            let bookId = document.getElementById("bookTokenId").value;
            let title = document.getElementById("bookName").value;
            let description = document.getElementById("bookDescription").value;;
            let authorName = document.getElementById("bookAuthor").value;;
            let price = document.getElementById("bookPrice").value;

            const request = await vendor.methods.createBookToken(
                bookId, title, description, authorName, price).send({
                from: address
            });

            await vendor.methods.putBookUpForSale(bookId, price).send({
                from: address
            });

            alert("Książka została dodana do Twojego zbioru!");
            console.log(request);
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd podczas próby dodania tokenu");
        }
    };

    const buy = async () => {
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = bookTokenArtifact.networks[networkId];
            const vendor = new web3.eth.Contract(
                bookTokenArtifact.abi,
                deployedNetwork.address
            );
            let bookId = document.getElementById("sellBookTokenId").value;
            let balance = document.getElementById("balance").value;

            const request = await vendor.methods.buyBook(bookId).send({
                from: address,
                value: balance,
            });

            alert("Książka została kupiona!");
            console.log(request);
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd podczas próby kupienia tokenu");
        }
    };

    const show = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = bookTokenArtifact.networks[networkId];
            const vendor = new web3.eth.Contract(
                bookTokenArtifact.abi,
                deployedNetwork.address
            );
           const request = await vendor.methods.getAll().call();

           removeTable();
            // creates a <table> element and a <tbody> element
            const tbl = document.createElement("table");
            tbl.setAttribute("id", "booksTable");
            const tblBody = document.createElement("tbody");

            // creating all cells
            for (let i = 0; i < request.length; i++) {
                if(i===0){
                    let row = document.createElement("tr");

                    let cell = document.createElement("td");
                    let cellText = document.createTextNode("Nazwa");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    cell = document.createElement("td");
                    cellText = document.createTextNode("Opis");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    cell = document.createElement("td");
                    cellText = document.createTextNode("Autor");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    cell = document.createElement("td");
                    cellText = document.createTextNode("Właściciel");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    cell = document.createElement("td");
                    cellText = document.createTextNode("Na sprzedaż?");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    cell = document.createElement("td");
                    cellText = document.createTextNode("Cena");
                    cell.appendChild(cellText);
                    row.appendChild(cell);

                    tblBody.appendChild(row);
                }
                // creates a table row
                const row = document.createElement("tr");

                for (let j = 0; j < 6; j++) {
                    // Create a <td> element and a text node, make the text
                    // node the contents of the <td>, and put the <td> at
                    // the end of the table row
                    const cell = document.createElement("td");
                    let cellText = "";
                    if(j===4){
                        cellText = document.createTextNode(isForSale(Number(Object.values(request[i])[j])));
                    }
                    else if(j===5){
                        cellText = document.createTextNode(Object.values(request[i])[j].toString() + " wei");
                    }
                    else {
                        cellText = document.createTextNode(Object.values(request[i])[j].toString());
                    }
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                // add the row to the end of the table body
                tblBody.appendChild(row);
            }

            // put the <tbody> in the <table>
            tbl.appendChild(tblBody);
            // appends <table> into <body>
            document.body.appendChild(tbl);
            // sets the border attribute of tbl to '2'
            tbl.setAttribute("border", "2");

            console.log(request);
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd podczas próby kupienia tokenu");
        }
    };

    function removeTable() {
        var removeTab = document.getElementById('booksTable');
        if((typeof(removeTab)) != 'undefined' && removeTab != null)
        {
            removeTab.remove();
        }
    }

    function isForSale(status){
        if(status===0){
            return "Nie";
        } else{
            return "Tak";
        }
    }

    useEffect(() => {
        if (!address) router.replace("/");
    }, [address]);

    return (
        <div>
            <Head>
                <title>Wymieniaj książki</title>
                <link rel="shortcut icon" href="favicon.ico"/>
            </Head>
            <div className="exchange__container">
                <h1>Dodaj książkę</h1>

                <div className="grid-container">
                    <div className="grid-item-label">
                        <label htmlFor="bookTokenId">ID:</label>
                    </div>
                    <div className="grid-item-input">
                        <input type="number" id="bookTokenId"/>
                    </div>
                    <div className="grid-item-label">
                        <label htmlFor="bookName">Tytuł:</label>
                    </div>
                    <div className="grid-item-input">
                        <input type="text" id="bookName"/>
                    </div>
                    <div className="grid-item-label">
                        <label htmlFor="bookAuthor">Autor:</label>
                    </div>
                    <div className="grid-item-input">
                        <input type="text" id="bookAuthor"/>
                    </div>
                    <div className="grid-item-label">
                        <label htmlFor="bookDescription">Opis:</label>
                    </div>
                    <div className="grid-item-input">
                    <textarea className="grid-item-input" id="bookDescription"/>
                    </div>
                    <div className="grid-item-label">
                        <label htmlFor="bookPrice">Cena(wei): </label>
                    </div>
                    <div className="grid-item-input">
                        <input type="number" id="bookPrice"/>
                    </div>

                </div>
                <button className="exchange__button" onClick={create}>
                    Dodaj
                </button>
                <h1>Kup książkę</h1>
                <div className="grid-container">
                    <div className="grid-item-label">
                        <label htmlFor="sellBookTokenId">ID:</label>
                    </div>
                    <div className="grid-item-input">
                        <input type="number" id="sellBookTokenId"/>
                    </div>
                    <div className="grid-item-label">
                        <label htmlFor="balance">Zapłać: </label>
                    </div>
                    <div className="grid-item-input">
                        <input type="number" id="balance"/>
                    </div>

                </div>
                <button className="buy_button" onClick={buy}>
                    Kup
                </button>
                <button className="buy_button" onClick={show}>
                    Pokaż listę tokenów
                </button>
            </div>

        </div>
    );
}

export default Exchange;
