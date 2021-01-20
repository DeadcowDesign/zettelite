/**
 * What this needs to be able to do:
 * 
 * Download a list of cards from a given drawer and store in a data structure
 * for later reference (to build parent links for cards)
 * 
 * Create a card item.
 * Card Item needs to have:
 * Card title
 * Parent Card title +  link
 * Edit buttons.
 */




// SECTION Drawer/Index Functions

// SECTION Drawer Functions

// ANCHOR - getDrawerData
/**
 * get a list of drawers from the zettelite.
 * This will return an array. 
 */
function getDrawerData(callback) {
    let drawers = [];
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            drawers = JSON.parse(xmlHttp.responseText);

            // Create empty arrays for our drawer indeces
            drawers.forEach( drawer => {
                cardIndex[drawer] = [];
            });

            callback();
        }
    }
    
    xmlHttp.open("GET", baseURL + "/api/getdrawers");
    xmlHttp.send();
}

// ANCHOR - buildDrawer
/**
 * create the HTML for a drawer. Just requires a string which is the name of the
 * drawer.
 * 
 * @param {String} drawer The name of the drawer
 */
function buildDrawer(drawer) {
    let drawerNode = document.createElement('div');
    drawerNode.setAttribute('data-drawer', drawer);
    drawerNode.classList.add('drawer');
    let drawerHeader = document.createElement("h2");
    drawerHeader.classList.add("drawer-title");
    drawerText = document.createTextNode(drawer);
    let cardContainer = document.createElement("div");
    cardContainer.classList.add("drawer-container");

    drawerHeader.addEventListener('click', e => {
        e.preventDefault();
        drawerNode.classList.toggle('open');
        if (drawerNode.classList.contains('open')) {
            getIndex(drawer, false, buildIndex);
        }
    });
    
    drawerHeader.appendChild(drawerText);
    drawerNode.appendChild(drawerHeader);
    drawerNode.appendChild(cardContainer);

    return drawerNode;
}

// ANCHOR - refreshDrawers
/**
 * Reload the drawers
 */
function refreshDrawers() {
    getDrawerData(buildDrawers);
}

// ANCHOR - buildDrawers
/**
 * buildDrawers - given a list of drawer names, will build a set of HTML drawers
 * with events for the drawers column.
 * 
 * @param {array} drawers An array of drawer names
 */
function buildDrawers() {

    // First empty the drawers HTML so we can use this for both loading and
    // reloading
    let drawersNode = document.querySelector(".drawers-container");
    drawersNode.innerHTML = "";

    for(let drawer in cardIndex) {
        drawersNode.appendChild(buildDrawer(drawer));
    };
}

// ANCHOR - createNewDrawer
/**
 * Takes a drawer name and sends to the Zettelite, creating a new
 * drawer to store cards in. Server-side, this creates a new folder and an empty
 * index.csv file for cards
 * 
 * @param {String} title The name of the drawer to be created
 * @param {function} callback A callback to run once the operation has completed
 */
function createNewDrawer(title, callback) {
    var data = new FormData();
    data.append('drawer', title);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/zettelite/api/makeDrawer/', true);
    xhr.onload = function () {
        if (this.status == 200) {
            document.getElementById('new-folder').value = '';
            callback();
        }
    };
    xhr.send(data);
}
// !SECTION

// SECTION Index functions
// ANCHOR refreshIndex
/**
 * refreshIndex - when card information changes (specficially card title), update
 * the drawer that contains the card to reflect the change.
 * @param {string} drawerName The name of the drawer to refresh
 */
function refreshIndex(drawerName) {
    let drawer = document.querySelector('[data-drawer="' + drawerName + '"]');
    drawer.querySelector('.drawer-container').innerHTML = '';
    getIndex(drawerName, true, () => {
        buildIndex(drawerName);
    });
}

// ANCHOR getIndex
/**
 * getIndex - get an index of cards from the API. If the targeted drawer already
 * has cards in it, we dont get the cards again to save the server being hammered
 * 
 * @param {HTML element} drawer The drawer container
 * @param {boolean} forceUpdate Whether to ignore that there are cards already in the drawer
 */
function getIndex(drawerName, forceUpdate, callback) {

    forceUpdate = forceUpdate || false;

    if (!drawerName) {
        return false;
    }

    let drawer = document.querySelector('[data-drawer="' + drawerName + '"]');

    let hasCards = !!drawer.querySelectorAll('.drawer-container > .drawer-card').length;

    if ( (!hasCards) || (forceUpdate == true) ) {

        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = function()
        {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

                let cards = JSON.parse(xmlHttp.responseText)

                // Create empty arrays for our drawer indeces
                cards.forEach( card => {

                    cardIndex[drawerName][card[0]] = {"id": card[0], "title": card[1]};
                });

                callback(drawerName);
            }
        }
        
        xmlHttp.open("GET", baseURL + "/api/getdrawer/drawer/" + drawerName);
        xmlHttp.send();
    }

    return cardIndex;
}

// ANCHOR buildIndex
/**
 * buildIndex - build the HTML that contains the list of cards
 * 
 * @param {array} cards An array of cards
 * @param {HTML Node} cardContainer The div that will contain cards
 */
function buildIndex(drawerName) {
    let drawer = document.querySelector('[data-drawer="' + drawerName + '"]');

    let cards = cardIndex[drawerName];

    let container = drawer.querySelector(".drawer-container");

    let newButtonNode = document.createElement("button");
    newButtonNode.classList.add("button", 'positive-button');
    newButtonNode.setAttribute('data-drawer', drawerName);
    newButtonNode.innerText = "Add new Card";
    newButtonNode.addEventListener('click', e => {
        e.preventDefault();
        cardModal.classList.add("active");
        document.getElementById("card-drawer-input").value = drawerName;
        document.getElementById("card-title-input").focus();
    });

    container.appendChild(newButtonNode);

    for(let card in cards) {
        let data = cards[card];
        let cardNode = document.createElement('div');
        cardNode.classList.add("drawer-card");
        let cardText = document.createTextNode(data.title);
        cardNode.appendChild(cardText);
        cardNode.addEventListener('click', e => {
            if (document.getElementById('card-modal').classList.contains('active')) {
                insertAtCaret(drawerName, data.id, data.title);
            } else {
                getCard(drawerName, data.id, buildCard);
            }
        })

        container.appendChild(cardNode);
    }
}
// !SECTION

// !SECTION

// SECTION Card functions

// ANCHOR - clearCardEditor
/**
 * clearCardEditor - empty all the inputs for the card editor. Reset the contents
 * of the Quill Editor
 */
function clearCardEditor() {
    let cardEditor = document.getElementById("card-modal");
    let inputs = cardEditor.querySelectorAll('input');

    for (input of inputs) {
        input.value = '';
    }

    quill.root.innerHTML = '';

    return true;
}

// ANCHOR - saveCard
/**
 * saveCard - get card Data from the card modal, transform it into POST data and
 * send it to the Zettelite
 * 
 * @param {function} callback Function to run after a successful return from the server
 */
function saveCard(callback) {
    let id      = document.getElementById('card-id-input').value,
        title   = document.getElementById('card-title-input').value,
        parent  = document.getElementById('card-parent-input').value,
        drawer = document.getElementById('card-drawer-input').value;
        children = document.getElementById('card-children-input').value;

    let formData = new FormData();
        formData.append('id', id);
        formData.append('title', title);
        formData.append('parent', parent);
        formData.append('drawer', drawer);
        if (children) {
            formData.append('children', JSON.stringify(children.split("|")));
        }
        formData.append('content', quill.root.innerHTML);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/zettelite/api/addNote/', true);
    xhr.onload = function () {
        if (this.status == 200) {
            callback();
            clearCardEditor();
            getCard(drawer, id, (cardData) => {
                buildCard(cardData, true);
            });
        }
    };
    xhr.send(formData);

}

// ANCHOR getCard
/**
 * getCard - get card data from the zettelite. Cards are flat json files stored
 * in 
 * @param {string} drawerName The name of the drawer the card resides in
 * @param {string} cardId The id of the card
 */
function getCard(drawerName, cardId, callback) {

    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            let cardData = JSON.parse(xmlHttp.responseText);
            callback(cardData);
        }
    }
    
    xmlHttp.open("GET", [baseURL, cardCache, drawerName, cardId + '.json'].join('/') + '?v=' + Date.now());
    xmlHttp.send();
}

// ANCHOR buildCard
/**
 * buildCard - build the HTML for a card and attach it to the desk from a given
 * card object.
 * @param {object} cardData A card data object
 */
function buildCard(cardData, force) {
    force = force || false;

    let cardElement = null;

    if (!force && !!document.querySelector(`[data-card-id="${cardData.id}"]`)) {
        return false;
    }

    if (document.querySelector(`[data-card-id="${cardData.id}"]`)) {
        document.querySelector(`[data-card-id="${cardData.id}"]`).innerHTML = '';
        cardElement = document.querySelector(`[data-card-id="${cardData.id}"]`);
    } else {
        cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-card-id', cardData.id);
        cardElement.setAttribute('drawer', cardData.drawer);
    }

    let cardContainer = document.querySelector(".card-container");
 
    let cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeaderTitle = document.createElement('div');
    if (cardData.parent) {
        let cardParent = document.createElement("a");
        if (cardIndex[cardData.drawer].hasOwnProperty(cardData.parent)) {
            cardParent.setAttribute('data-id', cardIndex[cardData.drawer][cardData.parent].id);
            cardParent.innerText = `${cardIndex[cardData.drawer][cardData.parent].title} > `;
            cardParent.addEventListener('click', e => {

                    getCard(cardData.drawer, cardIndex[cardData.drawer][cardData.parent].id, (cardData) => {
                        buildCard(cardData, false);
                    });
            });
        }
        cardParent.classList.add("subtle");
        
        cardHeaderTitle.appendChild(cardParent);    
    }
    let cardHeaderTitleText = document.createElement('b');
    cardHeaderTitleText.innerText = cardData.title;
    cardHeaderTitle.appendChild(cardHeaderTitleText);
    cardHeaderTitle.classList.add('card-header-title');
    cardHeaderButtons = document.createElement('div');
    cardHeaderButtons.classList.add("card-header-buttons")

    let editButton = document.createElement('div');
    editButton.classList.add('button','card-edit-button', 'positive-button');
    let editButtonText = document.createTextNode("Edit");
    editButton.appendChild(editButtonText);
    editButton.addEventListener('click', e => {
        document.getElementById('card-id-input').value = cardData.id;
        document.getElementById('card-parent-input').value = cardData.parent;
        document.getElementById('card-drawer-input').value = cardData.drawer;
        if (cardData.children) {
            document.getElementById('card-children-input').value = cardData.children.join("|");
        }
        cardModal.classList.add("active");
        document.getElementById("card-title-input").value = cardData.title;
        document.getElementById("card-title-input").focus();
        quill.root.innerHTML = cardData.content;
        buffer = cardData.content;
    });

    cardHeaderButtons.appendChild(editButton);

    let cancelButton = document.createElement('div');
    cancelButton.classList.add('button','card-cancel-button', 'negative-button');
    let cancelButtonText = document.createTextNode("Close");
    cancelButton.appendChild(cancelButtonText);
    cancelButton.addEventListener('click', e => {
        document.querySelector(`[data-card-id="${cardData.id}"]`).remove();
    });

    cardHeaderButtons.appendChild(cancelButton);

    cardHeader.appendChild(cardHeaderTitle);
    cardHeader.appendChild(cardHeaderButtons);
    cardElement.appendChild(cardHeader);

    let cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    cardContent.setAttribute('id', 'q'+cardData.id);
    cardContent.innerHTML = cardData.content;
    cardElement.appendChild(cardContent);

    let cardStatus = document.createElement('div');
    cardStatus.classList.add("card-status-bar");
    let cardChildButton = document.createElement("button");
    cardChildButton.classList.add("button", "positive-button");
    cardChildButton.innerText = "Add child Card";
    cardStatus.appendChild(cardChildButton);
    cardStatus.addEventListener('click', e => {
        e.preventDefault();
        cardModal.classList.add("active");
        document.getElementById("card-drawer-input").value = cardData.drawer;
        document.getElementById('card-parent-input').value = cardData.id;
    });
    let cardDate = document.createElement('div');
    cardDate.classList.add("subtle", "status-bar-subtle");
    cardDate.innerHTML = `<div>In: ${cardData.drawer}</div>`;
    cardDate.innerHTML += `<div>Created on: ${cardData.id.substring(0,4)}/${cardData.id.substring(4,6)}/${cardData.id.substring(6,8)} ${cardData.id.substring(8,10)}:${cardData.id.substring(10,12)}</div>`;
    cardStatus.appendChild(cardDate);
    
 
    let childContainer = document.createElement('p');
    childContainer.innerText = 'No Children';


    if (cardData.hasOwnProperty('children')) {
        let linksContainer = document.createElement('div');
        linksContainer.classList.add("child-links-container");

        if (cardData.children.length) {

            childContainer = document.createElement('details');
            childContainer.classList.add("card-child-links");

            let summary = document.createElement('summary');
            summary.innerHTML = cardData.children.length + ' children';
            childContainer.appendChild(summary);

            let link = null;

            cardData.children.forEach( child => {
                if (cardIndex[cardData.drawer].hasOwnProperty(child)) {

                    link = document.createElement('a');
                    link.setAttribute("href", "javascript:;");
                    link.setAttribute("data-id", child);
                    link.innerText = '[[' + cardIndex[cardData.drawer][child].title + ']]';
                    
                    link.addEventListener('click', e => {
                        getCard(cardData.drawer, cardIndex[cardData.drawer][child].id, (cardData) => {
                            buildCard(cardData, false);
                        });
                    });

                    linksContainer.appendChild(link);
                };

            });
            
            childContainer.appendChild(linksContainer);
        }

    }
    cardElement.appendChild(cardStatus);
    cardElement.appendChild(childContainer);

    cardContainer.appendChild(cardElement);

}

/**
 * Insert a link to a clicked card at the caret.
 * @param {string} drawer The name of the drawer
 * @param {string} id the card id
 * @param {string} title The card title
 */
function insertAtCaret(drawer, id, title) {
    let index = quill.getSelection(true).index;
    console.log(index);
    quill.insertEmbed(index, 'linkBlot', {
        'title': title,
        'drawer': drawer,
        'id': id,
      }, 'user');
}

function internalLink(self) {
    let drawer = self.getAttribute('data-drawer');
    let id = self.getAttribute('data-id');
    getCard(drawer, id, (cardData) => {
        buildCard(cardData, false);
    });
}

// ANCHOR reloadCard
// ANCHOR removeQuill
/**
 * removeQuill - given a card Id strip Quill from the card
 * @param {string} cardId 
 */
function removeQuill(cardId) {
    let card = document.querySelector(`[data-card-id="${cardId}"]`);

    if (!quill) {
        return false;
    }

    quill.enable(false);
    if (buffer == '') {
        buffer = quill.root.innerHTML;
    }

    card.querySelector('.ql-toolbar').remove();
    let contentElem = card.querySelector('.card-content');
    contentElem.classList.remove("ql-container", "ql-snow", "ql-disabled");
    contentElem.innerHTML = buffer;

    quill = null;
    card.classList.remove("edit-mode");
    isEditing = false;
    return true;
}

// !SECTION

// SECTION - Backup cards

// ANCHOR - saveBlob Function
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
// !SECTION

// SECTION - Event Listeners

// ANCHOR - Drawer Modal Events
/* Event Listener for the "Add Drawer" button */
document.getElementById("add-drawer-button").addEventListener('click', e => {
    document.getElementById("folder-modal").classList.add("active");
    document.getElementById("new-folder").focus();
})

/* Event Listener for the "Save Drawer" button */
document.getElementById("folder-modal-save").addEventListener('click', e => {
    e.preventDefault();
    createNewDrawer(document.getElementById('new-folder').value, () => {
        refreshDrawers();
        document.getElementById("folder-modal").classList.remove("active");
    });
});

/* Event Listener for the "Cancel" button for the folder modal */
document.getElementById("folder-modal-cancel").addEventListener('click', e => {
    e.preventDefault();
    document.getElementById("folder-modal").classList.remove("active");
    document.getElementById('new-folder').value = '';

});

// ANCHOR - Card Event Listeners

/* Event Listener for the Card edit Cancel button */
document.getElementById("card-modal-cancel").addEventListener('click', e => {
    e.preventDefault();
    document.getElementById("card-modal").classList.remove("active");
    clearCardEditor();

});

/* Event Listener for the Card edit Save button */
document.getElementById("card-modal-save").addEventListener('click', e => {
    e.preventDefault();

    saveCard(() => {
        let drawer = document.getElementById('card-drawer-input').value;
        document.getElementById("card-modal").classList.remove("active");
        refreshIndex(drawer);
    });

});

// ANCHOR - Backup Cards Events

/* Add event listener for the backup cards footer link */
document.querySelector('#backup').addEventListener('click', e => {
    e.preventDefault();
    saveBlob();
});

// !SECTION

/*******************************************************************************
 * LET'S GOOOOO!
 ******************************************************************************/
(function(){
    getDrawerData(buildDrawers);
})()