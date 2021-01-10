/**
 * Initialise Quill editor
 */
var quill = new Quill('#editor', {
    theme: 'snow'
});

var cardData = {};
/**
 * Insert a link to a card into another card
 * TODO - finish this off.
 */
let insertLink = document.querySelector('#insertLink');
insertLink.addEventListener('click', e => {
    e.preventDefault();

    var delta = {
        ops: [
            {retain: quill.getSelection(true).index},
            {insert: "[[Learn more from this resource]]", attributes: {link: "http://wikipedia.org"}}
        ]
    };

    quill.updateContents(delta);
})

/**
 * Form functions
 */
let cardForm = document.querySelector("#newNote");

cardForm.addEventListener('submit', e => {
    e.preventDefault();
    let content = quill.root.innerHTML;
    let title = document.getElementById("title").value;
    let drawer = document.getElementById("drawer").value;
    var formData = new FormData();
    formData.append('content', content);
    formData.append('title', title);
    formData.append('drawer', drawer);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function()
    {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            alert(xmlHttp.responseText);
        }
    }
    xmlHttp.open("post", "/zettelite/api/addNote"); 
    xmlHttp.send(formData); 
});

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
            let drawersNode = document.querySelector(".drawers");

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
                let cardText = document.createTextNode('[['+card[0]+']]'+ ' ' + card[1]);
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

function getCard(drawer, id) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function()
    {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            let card = JSON.parse(xmlHttp.responseText);

            let cardContainer = document.querySelector(".card-container");
            let cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.setAttribute('id', card.id);
            let cardHeader = document.createElement('div');
            cardHeader.innerText = '[[' + card.id + ']] ' + card.title;
            cardElement.appendChild(cardHeader);
            let cardContent = document.createElement('div');
            cardContent.innerHTML = card.content;
            cardElement.appendChild(cardContent);
            cardContainer.appendChild(cardElement);

            cardElement.addEventListener('click', e => {

                setQuillContent(card);
            })

        }
    }
    xmlHttp.open("GET", "/zettelite/cache/" + drawer + '/' + id + '.json');
    xmlHttp.send();
}

function setFormContent(card) {
    let quillContainer = document.querySelector('.ql-editor');
    quillContainer.innerHTML = card.content;
    let titleField = 
}
(function(){
    getDrawers();
})()