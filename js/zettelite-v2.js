class Zettelite {
    
    constructor() {
        this.CabinetModal = document.getElementById('text-input-modal');
        this.CardModal = document.getElementById('card-modal');
        this.DrawerModal  = document.getElementById('modal-drawer');
        this.CardContainer = document.querySelector('.card-container');
        this.CabinetData = null;
        this.CallBack = null;
        this.SelectedCabinet = null;
    }

    init() {
        const self = this;

        this.getCabinets(() => {

            if (!Object.keys(this.CabinetData).length) {
     
                self.openInputModal('createCabinet', "You need to create your first Cabinet.", null, (data) => {
                    let url = `/api/${this.CabinetModal.dataset.action}`;
                    let formData = new FormData();
                    formData.append('title', document.getElementById('new-cabinet').value);
                    formData.append('id', this.CabinetModal.dataset.id);

                    self.apiRequest(url, 'POST', formData).then(() => {
                        self.closeInputModal();
                        self.reset();
                    })
                })

            } else {

                self.buildCabinetSelect();
                let cabinetSelect = document.getElementById('cabinet-select');
                document.getElementById('cabinet-name').innerText = cabinetSelect.options[cabinetSelect.selectedIndex].text;

                this.buildCabinetDrawers(cabinetSelect.value);            
            }
        });

        document.getElementById('new-cabinet-button').addEventListener('click', e => {
            self.openInputModal('createCabinet', "Give your cabinet a name", null, (data) => {
                let url = `/api/${this.CabinetModal.dataset.action}`;
                let formData = new FormData();
                formData.append('title', document.getElementById('new-cabinet').value);
                formData.append('id', this.CabinetModal.dataset.id);

                self.apiRequest(url, 'POST', formData).then(() => {
                    self.closeInputModal();
                    self.reset();
                })
            })
        })

        document.getElementById('add-drawer-button').addEventListener('click', e => {
            self.openInputModal('createDrawer', "Give your drawer a name", document.getElementById('cabinet-select').value, (data) => {
                let url = `/api/${this.CabinetModal.dataset.action}`;
                let formData = new FormData();
                formData.append('title', document.getElementById('new-cabinet').value);
                formData.append('cabinet', this.CabinetModal.dataset.id);
                this.SelectedCabinet = document.getElementById('cabinet-select').value;
                self.apiRequest(url, 'POST', formData).then(() => {
                    self.closeInputModal();
                    self.reset();
                })
            })
        })

        document.getElementById('text-input-modal-save').addEventListener('click', e => {
            self.CallBack();
        })

        document.getElementById('text-input-modal-cancel').addEventListener('click', e => {
            self.closeInputModal();
        })

        document.getElementById('card-modal-save').addEventListener('click', e => {
            let cardId  = document.getElementById('card-id-input').value,
                title   = document.getElementById('card-title-input').value,
                parent  = document.getElementById('card-parent-input').value,
                url     = '';


            if (!cardId) {
                url = '/api/createCard';
            } else {
                url = '/api/updateCard'
            }

            let formData = new FormData();
            formData.append('id', cardId);
            formData.append('title', title);
            formData.append('parent', parent);
            formData.append('content', quill.root.innerHTML);

            this.apiRequest(url, 'POST', formData).then(() => {
                self.closeCardModal();
                self.reset();
            })
        })

        document.getElementById('card-modal-cancel').addEventListener('click', e => {
            self.closeCardModal();
        })
    }

    /**
     * reset - reload Zettelite's cabinets, drawers and cards.
     */
    reset() {
        const self = this;
        this.getCabinets((cabinets) => {
            let cabinetSelect = document.getElementById('cabinet-select');
            cabinetSelect.innerHTML = "";
            self.buildCabinetSelect();
            document.getElementById('cabinet-name').innerText = cabinetSelect.options[cabinetSelect.selectedIndex].text;
            this.buildCabinetDrawers(this.SelectedCabinet);
        })
    }

    /**
     * getCabinets - get a list of Zettelite cabinets from the API
     * 
     * @param {function} callback A function to run once the data fetch is complete
     */
    getCabinets(callback) {
        const self = this;

        this.apiRequest('/api/readCabinet').then((cabinets) => {
            this.CabinetData = cabinets;
            callback(cabinets);
        })
    }

    /**
     * createCabinetSelect - create the Option input for selecting which cabinet
     * to display from a list of cabinets from Zettelite.
     * 
     * @param {object} cabinets A list of cabinets from Zettelite
     */
    buildCabinetSelect() {
        const self = this;
        let cabinetSelect = document.getElementById('cabinet-select');
        cabinetSelect.innerHTML = '';
        for (const[index, cabinet] of Object.entries(this.CabinetData)) {
            
            let option = document.createElement('option');
            option.setAttribute('value', cabinet.id);
            option.innerText = cabinet.title;
            cabinetSelect.appendChild(option);
            if (this.SelectedCabinet == cabinet.id) {
                option.selected = true;
            }
        };

        cabinetSelect.addEventListener('change', (e) => {
            this.SelectedCabinet = e.target.value;
            document.getElementById('cabinet-name').textContent = e.target.options[e.target.selectedIndex].text;
                self.buildCabinetDrawers(this.SelectedCabinet);
        })

        this.SelectedCabinet = document.getElementById('cabinet-select').value;
    }
    
    /**
     * getCabinetDrawers - get a list of drawers from the Zettelite API and then
     * run a callback. getDrawers returns a list of drawers and their cards in
     * JSON format.
     * 
     * @param {int} cabinet The id of the cabinet to get the drawers from
     * @param {function} callback A callback function to run after the reqeust has finished
     */
    getCabinetDrawers(cabinet, callback) {
        this.apiRequest('/api/getDrawers/id/' + cabinet).then((data) => {

            callback(data);
        });
    }

    /**
     * 
     * @param {object} drawers A list of drawers from Zettelite
     */
    buildCabinetDrawers(cabinetId) {
        const self = this;

        this.CabinetData.forEach((cabinet) =>{

            if (cabinet.id == cabinetId) {
                let drawers = cabinet.drawers;
                let containerElem = document.querySelector('.drawers-container');
                containerElem.innerHTML = '';
                for (const [index, drawer] of Object.entries(drawers)) {
        
                    containerElem.appendChild(this.buildDrawer(drawer));
        
                };
            }
        });


    }

    buildDrawer(drawer) {
        const self = this;

        let drawerElem = document.querySelector(`[data-drawer="${drawer.id}"]`);

        if (!drawerElem){
            drawerElem = document.createElement('div');
            drawerElem.classList.add("drawer");
            drawerElem.setAttribute("data-drawer", drawer.id);
        } else {
            drawElem.innerHTML = "";
        }

        let drawerHeaderElem = document.createElement('h2');
        drawerHeaderElem.classList.add("drawer-title");
        drawerHeaderElem.innerHTML = `<i class="fas fa-folder"></i>${drawer.title}`;

        drawerElem.appendChild(drawerHeaderElem);

        let cardContainerElem = document.createElement("div");
        cardContainerElem.classList.add('drawer-container');
        drawerElem.appendChild(cardContainerElem);
        
        drawer.cards.forEach((card) => {
            cardContainerElem.appendChild(self.buildDrawerCardLink(card));
        });

        let newButtonNode = document.createElement("button");
        newButtonNode.classList.add("button", 'positive-button', 'add-card-button');
        newButtonNode.setAttribute('data-drawer', drawer.id);
        newButtonNode.innerHTML = '<i class="icofont-plus"></i>Add new Card';
        newButtonNode.addEventListener('click', e => {
            e.preventDefault();
            self.openCardModal(drawer.id);
        });

        cardContainerElem.appendChild(newButtonNode);

        drawerHeaderElem.addEventListener('click', e => {
            e.preventDefault();
            drawerElem.classList.toggle('open');
            if (drawerElem.classList.contains('open')) {
                drawerHeaderElem.innerHTML = `<i class="icofont-folder-open"></i>${drawer.title}`;
            } else {
                drawerHeaderElem.innerHTML = `<i class="icofont-folder"></i>${drawer.title}`;
            }
        });

        return drawerElem;
    }

    /**
     * buildDrawerCard - build the drawer link for a card and return it
     * @param {object} card The card to be built
     * @return {HTMLNode} The card link HTML
     */
    buildDrawerCardLink(card, isSub) {
        const self = this;

        if (isSub) {
            cardContainer.classList.add("drawer-card-sub-container");
        }


        let cardHeading = document.createElement('div');
        cardHeading.classList.add("drawer-card");
        let cardNode = document.createElement('div');
        cardNode.classList.add("drawer-card-title");
        cardNode.innerHTML = `<i class="icofont-page"></i>${card.title}`;
        cardNode.addEventListener('click', (e) => {
            self.getCard(card.id);
        })
        cardHeading.appendChild(cardNode);

        if (card.children.length) {
            let cardContainer = document.createElement('div');
            cardContainer.classList.add("drawer-card-container");

            let expandNode = document.createElement('div');
            expandNode.classList.add("drawer-expand");
            expandNode.innerHTML = '<i class="fas fa-angle-down"></i>';
            expandNode.addEventListener('click', e => {
                cardContainer.classList.toggle("active");
            });

            cardHeading.appendChild(expandNode);

            card.children.forEach(card => {
                cardContainer.appendChild(self.buildDrawerCardLink(card));
            });

            cardHeading.appendChild(cardContainer);
        }

        return cardHeading;
    }

    getCard(cardId, callback) {
        const self = this;

        let formData = new FormData();
        formData.append('id', cardId);
        this.apiRequest('/api/readCard/', 'POST', formData).then((card) => {
            self.buildCard(card, true);
        })
    }
    /**
 * buildCard - build the HTML for a card and attach it to the desk from a given
 * card object.
 * @param {object} cardData A card data object
 */
buildCard(cardData, force) {
    const self = this;
    force = force || false;
    let cardElement = null;

    cardData = cardData[0];
    
    console.log(cardData);
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
    let cardHeaderTitle = document.createElement('div');
    
    /*if (cardData.parent) {
        let cardParent = document.createElement("a");
        if (CabinetData[document.getElementById['cabinet-select'].value][cardData.drawer].hasOwnProperty(cardData.parent)) {
            cardParent.setAttribute('data-id', cardIndex[cardData.drawer][cardData.parent].id);
            cardParent.innerText = `${cardIndex[cardData.drawer][cardData.parent].title}`;
            cardParent.addEventListener('click', e => {

                    getCard(cardData.drawer, cardIndex[cardData.drawer][cardData.parent].id, (cardData) => {
                        buildCard(cardData, false);
                    });
            });
            
        }
        cardParent.classList.add("subtle");
        
        cardHeaderTitle.appendChild(cardParent);
        let linkSpacer = document.createElement('span');
        linkSpacer.innerText = ' > ';
        cardHeaderTitle.appendChild(linkSpacer);

    }*/

    let cardHeaderTitleText = document.createElement('b');
    cardHeaderTitleText.innerText = cardData.title;
    cardHeaderTitle.appendChild(cardHeaderTitleText);
    cardHeaderTitle.classList.add('card-header-title');
    let cardHeaderButtons = document.createElement('div');
    cardHeaderButtons.classList.add("card-header-buttons")

    let editButton = document.createElement('div');
    editButton.classList.add('button','card-edit-button', 'positive-button');
    editButton.innerHTML = '<i class="icofont-edit"></i>Edit';
    cardHeaderButtons.appendChild(editButton);

    editButton.addEventListener('click', e => {

        this.openCardModal(cardData.parent, cardData.id, cardData.content, cardData.title);
    });


    let cancelButton = document.createElement('div');
    cancelButton.classList.add('button','card-cancel-button', 'negative-button');
    cancelButton.innerHTML = '<i class="icofont-close"></i>Close';
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
        self.openCardModal(cardData.id);
    });
    /*let cardDate = document.createElement('div');
    cardDate.classList.add("subtle", "status-bar-subtle");
    cardDate.innerHTML = `<div>In: ${cardData.drawer}</div>`;
    cardDate.innerHTML += `<div>Created on: ${cardData.id.substring(0,4)}/${cardData.id.substring(4,6)}/${cardData.id.substring(6,8)} ${cardData.id.substring(8,10)}:${cardData.id.substring(10,12)}</div>`;
    cardStatus.appendChild(cardDate);
    
 
    let childContainer = document.createElement('p');
    childContainer.innerText = 'No Children';

        if (cardData.children.length) {
            let linksContainer = document.createElement('div');
            linksContainer.classList.add("child-links-container");

            childContainer = document.createElement('details');
            childContainer.classList.add("card-child-links");

            let summary = document.createElement('summary');
            summary.innerHTML = cardData.children.length + ' children';
            childContainer.appendChild(summary);

            let link = null;

            let childData = self.CabinetData['cabinet-' + self.SelectedCabinet].drawers['drawer-' + cardData.drawer].cards;

            cardData.children.forEach( childId => {
                    childData.forEach(child => {

                        if (child.id == childId) {
                            link = document.createElement('a');
                            link.setAttribute("href", "javascript:;");
                            link.setAttribute("data-id", childId);
                            link.innerText = '[[' + child.title + ']]';
                            
                            link.addEventListener('click', e => {
                                self.getCard(child.id, (cardData) => {
                                    self.buildCard(cardData, false);
                                });
                            });

                            linksContainer.appendChild(link);
                        }
                    })

            });

            childContainer.appendChild(linksContainer);
        }*/


    cardElement.appendChild(cardStatus);
    //cardElement.appendChild(childContainer);

    cardContainer.appendChild(cardElement);

}

    openInputModal(action, title, id, callback) {
        this.CabinetModal.dataset.action = action;
        this.CabinetModal.dataset.id = id;
        document.getElementById('text-input-modal-title').textContent = title;
        document.getElementById("text-input-modal").classList.add("active");
        document.querySelector(".overlay").classList.add("active");
        document.getElementById('new-cabinet').focus()
        this.CallBack = callback;
    }

    closeInputModal() {
        this.CabinetModal.dataset.action = '';
        this.CabinetModal.dataset.id = '';
        document.getElementById('new-cabinet').value = '';
        this.CabinetModal.classList.remove("active");
        document.querySelector(".overlay").classList.remove("active");
    }

    openCardModal(parentId, cardId, content, title) {
        cardId = cardId || null;
        parentId = parentId || null;
        content = content || '';
        title = title || '';
        cardModal.classList.add("active");
        document.querySelector(".overlay").classList.add("active");
        document.getElementById('card-id-input').value = cardId,
        document.getElementById('card-parent-input').value = parentId,
        document.getElementById("card-title-input").value = title;
        quill.root.innerHTML = content;
        document.getElementById("card-title-input").focus();
    }

    closeCardModal() {
        document.getElementById('card-id-input').value = '',
        document.getElementById('card-parent-input').value = '',
        document.getElementById('card-title-input').value = '';
        quill.root.innerHTML = '';
        this.CardModal.classList.remove("active");
        document.querySelector(".overlay").classList.remove("active");
    }

    /**
     * apiRequest - run a getRequest to the Zettelite API. We always assume that
     * we are returning valid JSON from these requests.
     * 
     * @param {string} url The url to request data from
     * @param {string} formData The data to be posted to the form
     */
    apiRequest(url, type, formData) {

        let httpRequest = new XMLHttpRequest();

        if (!type) type = 'GET';

        if (!formData) formData = null;

        return new Promise((resolve, reject) => {

            httpRequest.onreadystatechange = () => {

                if (httpRequest.readyState === XMLHttpRequest.DONE) {

                    if (httpRequest.status === 200) {

                        let responseData = JSON.parse(httpRequest.responseText);

                        resolve(responseData);

                    } else {

                        reject('There was a problem contacting the Zettelite. Please try again later.');
                    }
                }
            }

            httpRequest.open('POST', url, true);
        
            httpRequest.send(formData);
        });
    }


}