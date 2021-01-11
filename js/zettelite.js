/**
 * Initialise Quill editor
 *
var quill = new Quill('#editor', {
    theme: 'snow'
});
*/
var cardData = {};
/**
 * Insert a link to a card into another card
 * TODO - finish this off.
 *
let insertLink = document.querySelector('#insertLink');
insertLink.addEventListener('click', e => {
    e.preventDefault();


})*/

/**
 * Load the drawers
 */
function getDrawers() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function()
    {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            cardData.drawers = JSON.parse(xmlHttp.responseText);
            let drawersNode = document.querySelector(".drawers-container");

            for (let drawer of cardData.drawers) {

                let drawerNode = document.createElement('div');
                drawerNode.setAttribute('data-drawer', drawer);
                drawerNode.classList.add('drawer');
                let drawerHeader = document.createElement("h2");
                drawerText = document.createTextNode(drawer);
                let cardContainer = document.createElement("div");
                cardContainer.setAttribute("data-drawer", drawer);

                drawerHeader.addEventListener('click', e => {
                    e.preventDefault();
                    getCards(cardContainer);
                });
                
                drawerHeader.appendChild(drawerText);
                drawerNode.appendChild(drawerHeader);
                drawerNode.appendChild(cardContainer);
                drawersNode.appendChild(drawerNode);
            }
        }
    }
    xmlHttp.open("GET", "/zettelite/api/getdrawers");
    xmlHttp.send();
}

/**
 * 
 * @param {HTML Node} cardContainer get cards for a given HTML drawer
 */
function getCards(cardContainer) {
    let drawer = cardContainer.getAttribute('data-drawer');
    cardContainer.innerHTML = '';
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function()
    {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            let cards = JSON.parse(xmlHttp.responseText);
            for(let card of cards) {
                if (card[0]) {
                cardNode = document.createElement('div');
                let cardText = document.createTextNode(card[1]);
                cardNode.appendChild(cardText);
                cardNode.addEventListener('click', e => {
                    getCard(drawer, card[0]);
                })
                cardContainer.appendChild(cardNode);
                }
            }

        }
    }
    xmlHttp.open("GET", "/zettelite/api/getdrawer/drawer/" + drawer);
    xmlHttp.send();
}

/**
 * 
 * @param {string} drawer The name of the drawer to retrieve the card from
 * @param {string} id The ID of the card to retrieve from the drawer
 */
function getCard(drawer, id) {

    if (document.getElementById(id) == null) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function()
        {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200)
            {
                let card = JSON.parse(xmlHttp.responseText);
                createCard(card);

            }
        }
        xmlHttp.open("GET", "/zettelite/cache/" + drawer + '/' + id + '.json' + "?v=" + Date.now() );
        xmlHttp.send();
    }
}

/**
 * createCard - create the HTML and interactions for a card
 * @param {card} card 
 */
function createCard(card) {
    let cardContainer = document.querySelector(".card-container");
    let cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.setAttribute('id', card.id);
    
    let cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeaderTitle = document.createElement('div');
    cardHeaderTitle.innerHTML = card.title + '&nbsp;<small>[[' + card.id + ']]</small>';
    cardHeaderTitle.classList.add('card-header-title');
    cardHeaderButtons = document.createElement('div');
    cardHeaderButtons.classList.add("card-header-buttons")

    let editButton = document.createElement('div');
    editButton.classList.add('card-button','card-edit-button');
    let editButtonText = document.createTextNode("Edit");
    editButton.appendChild(editButtonText);
    editButton.addEventListener('click', e => {
        quill = new Quill('#q'+card.id, {
            theme: 'snow'
        });        
    });
    cardHeaderButtons.appendChild(editButton);

    let saveButton = document.createElement('div');
    saveButton.classList.add('card-button','card-save-button');
    let saveButtonText = document.createTextNode("Save");
    saveButton.appendChild(saveButtonText);
    cardHeaderButtons.appendChild(saveButton);

    let cancelButton = document.createElement('div');
    cancelButton.classList.add('card-button','card-cancel-button');
    let cancelButtonText = document.createTextNode("Cancel");
    cancelButton.appendChild(cancelButtonText);
    cardHeaderButtons.appendChild(cancelButton);

    cardHeader.appendChild(cardHeaderTitle);
    cardHeader.appendChild(cardHeaderButtons);
    cardElement.appendChild(cardHeader);

    let cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    cardContent.setAttribute('id', 'q'+card.id);
    cardContent.innerHTML = card.content;
    cardElement.appendChild(cardContent);
    cardContainer.appendChild(cardElement);
}


/**
 * insertLink - insert a link to another card into a quill instance.
 */
function insertLink(id, title, drawer, quillInstance) {
    var delta = {
        ops: [
            {retain: quill.getSelection(true).index},
            {insert: title + ": [[" + id + "]]", attributes: {link: "http://wikipedia.org", "data-id": id, "data-drawer": drawer, "class": "card-link"}}
        ]
    };

    quillInstance.updateContents(delta);
}

/**
 * Add event listener to the backup button
 */
document.querySelector('#backup').addEventListener('click', e => {
    e.preventDefault();
    saveBlob();
})

/**
 * saveBlob - use the API to download and save the notes backup file.
 */
function saveBlob() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/zettelite/api/backup', true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
        if (this.status == 200) {
            // Create a new Blob object using the 
            //response data of the onload object
            var blob = new Blob([this.response], {type: 'octet/stream'});
            //Create a link element, hide it, direct 
            //it towards the blob, and then 'click' it programatically
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            //Create a DOMString representing the blob 
            //and point the link element towards it
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = 'backup.zip';
            //programatically click the link to trigger the download
            a.click();
            //release the reference to the file by revoking the Object URL
            window.URL.revokeObjectURL(url);
        }
    }
    xhr.send();
}

(function(){
    getDrawers();
})()