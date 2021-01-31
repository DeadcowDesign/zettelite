/**
 * Quill is missing some major features and has a developer who can best be described
 * as 'intransigent', so we have to make a bunch of fixes.
 */
var Parchment = Quill.import('parchment');
var Delta = Quill.import('delta');
let Break = Quill.import('blots/break');
let Embed = Quill.import('blots/embed');
let Block = Quill.import('blots/block');
function lineBreakMatcher() {
  var newDelta = new Delta();
  newDelta.insert({'break': ''});
  return newDelta;
}

Break.prototype.insertInto = function(parent, ref) {
    Embed.prototype.insertInto.call(this, parent, ref)
};
Break.prototype.length= function() {
    return 1;
}
Break.prototype.value= function() {
    return '\n';
}


 /**
  * Set up custom quill link for internal card links
  */
var InlineBlot = Quill.import('blots/inline');
class LinkBlot extends InlineBlot {
  static create(data) {
    console.log(data);
    const node = super.create(data);
    node.setAttribute('data-drawer', data.drawer);
    node.setAttribute('data-id', data.id);
    node.setAttribute('href', "javascript:;");
    node.setAttribute('onclick', 'internalLink(this)');
    node.innerText = '[[' + data.title + ']]';

    return node;
  }
  static value(domNode) {
		const { src, custom } = domNode.dataset;
		return { src, custom };
	}
}
LinkBlot.blotName = 'linkBlot';
LinkBlot.className = 'link-blot';
LinkBlot.tagName = 'a';
Quill.register({ 'formats/linkBlot': LinkBlot });
Quill.register("modules/imageUploader", ImageUploader);

var cardIndex = {};
var quillBuffer = '';   // This is what gets inserted into content when a card is updated
var cardCache = 'cache';
var isEditing = false;
var cardModal = document.getElementById("card-modal");
var drawerModal = document.getElementById("drawer-modal");
const quill = new Quill('#quill', {
    theme: 'snow',
    modules: {

   clipboard: {
      matchers: [
        ['BR', lineBreakMatcher] 
      ]
    },
    keyboard: {
      bindings: {
        linebreak: {
          key: 13,
          shiftKey: true,
            handler: function (range, context) {
              var nextChar = this.quill.getText(range.index + 1, 1)
              var ee = this.quill.insertEmbed(range.index, 'break', true, 'user');
              if (nextChar.length == 0) {
                // second line break inserts only at the end of parent element
                var ee = this.quill.insertEmbed(range.index, 'break', true, 'user');
              }
              this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
            }
          }
        }
      },
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic"],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ["clean"],
                ["image"]
              ]
        },

        imageUploader: {
            upload: file => {
              return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append("image", file);
                formData.append("drawer", document.getElementById("card-drawer-input").value);
                fetch(
                  "/api/newImage",
                  {
                    method: "POST",
                    body: formData
                  }
                )
                  .then(response => response.json())
                  .then(result => {
                    console.log(result);
                    resolve(result);
                  })
                  .catch(error => {
                    reject("Upload failed");
                    console.error("Error:", error);
                  });
              });
            }
          }
    }
});