var quill = new Quill('#editor', {
    theme: 'snow'
});

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