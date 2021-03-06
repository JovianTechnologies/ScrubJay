if (typeof Array.prototype.forEach != 'function') {
    Array.prototype.forEach = function(callback){
        for (var i = 0; i < this.length; i++){
            callback.apply(this, [this[i], i, this]);
        }
    };
}

document.addEventListener("DOMContentLoaded", function(event) {
    ScrubJay.init();

    //remove reference so that it can't be accidentally manipulated
    window.ScrubJay = null;
});

(function(window, document){
    //todo: flashing still occurring, speed is better but want it gone
    //todo: create simple custom parser for DOM

    //large css framewoks load slowly if linked via cdn etc., so place code in project for better performance
    window.ScrubJay = {
        init: function(){
            var self = this;

            //don't display body until the page has been altered with template
            var body = document.getElementsByTagName("body")[0];
            body.setAttribute("style", "display:none");

            var insertions = document.querySelectorAll('[sj-section]');
            var insertionsHTML = [];
            var lookup = []; //object to make lookups against insertionsHTML faster
            for(var i = 0; i < insertions.length; i++){
                var insertion = insertions[i];

                insertionsHTML.push({sectionName : insertion.attributes['sj-section'].value, obj:insertion, innerH: insertion.innerHTML});
                lookup.push(insertion.attributes['sj-section'].value);
            }

            var masterPage = document.body.firstChild.data;
            var url = this.getMasterPageUrl(masterPage);

            this.getMasterPage(url, function(pageData){
                // convert page string into object
                var parser = new DOMParser();

                var isIE9orOlder = (document.all && !window.atob);

                var pageObject;
                if(isIE9orOlder) {
                    pageObject = SpiderParse.parse(pageData)

                    var currentHeadTags = [];

                    for(var i = 0; i < document.head.childElementCount; i++){
                        currentHeadTags.push(document.head.children[i]);
                    }

                    //remove the current head tags from head so we can add them to the bottom after adding
                    //the master page scripts
                    currentHeadTags.forEach(function(tag){
                        document.head.removeChild(tag);
                    });

                    //Add tags from masterpage
                    pageObject.head.childNodes.forEach(function(tag){
                        var newTag = document.createElement(tag.name);
                        tag.attributes.forEach(function(attr){
                            newTag[attr.name] = attr.value;
                        });
                        document.head.appendChild(newTag);
                    });

                    //Reapply child page tags
                    currentHeadTags.forEach(function(tag){
                        document.head.appendChild(tag);
                    });
                }else {
                    pageObject = parser.parseFromString(pageData, "text/html");
                    document.head.innerHTML = pageObject.head.innerHTML;
                }

                document.body.innerHTML = pageObject.body.innerHTML;

                //apply all attributes for head
                self.setObjAttributes(pageObject.head.attributes, document.head);

                //apply all attributes for html tag
                var htmlObj = document.getElementsByTagName("html")[0];
                var htmlAttrs =  [];
                for(var i = 0; i < pageObject.childNodes.length; i++){
                    var childNode = pageObject.childNodes[i];
                    if(childNode.localName == "html")
                        htmlAttrs = childNode.attributes;
                };
                self.setObjAttributes(htmlAttrs, htmlObj);

                //set Doctype, only works in ie 9+
                if(document.addEventListener){
                    //var newDoctype = document.implementation.createDocumentType(
                    //    pageObject.doctype.nodeName,
                    //    pageObject.doctype.publicId,
                    //    pageObject.doctype.systemId
                    //);
                    //document.doctype.parentNode.replaceChild(newDoctype,document.doctype);
                }

                //place section data into template
                var sections = document.querySelectorAll('[sj-section]');
                for(var i = 0; i < sections.length; i++) {
                    var section = sections[i];
                    var sectionIndex = lookup.indexOf(section.attributes['sj-section'].value);
                    if (sectionIndex >= 0) {
                        var child = section.appendChild(insertionsHTML[sectionIndex].obj);
                        child.innerHTML = insertionsHTML[sectionIndex].innerH;
                    }
                }

                //display after page alteration complete
                body.setAttribute("style", "display:block");
            });
        },

        /**
         * Retrieve Master-page
         * @param url
         * @param callback
         */
        getMasterPage: function(url, callback){
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader("Accept", "text/html");
            request.onreadystatechange = function(){
                if(request.readyState == 4 && request.status == 200)
                        callback(request.responseText);
            };
            request.send(null);
        },
        /**
         * Get Master-page URL from @sj-use portion of the page
         * @param file
         * @returns {string}
         */
        getMasterPageUrl: function(file){
            var useDirecive = "@sj-use";
            return file.substring(file.indexOf(useDirecive) + useDirecive.length + 2, file.indexOf('")'));
        },

        setObjAttributes: function(attrs, obj){
            for(var i = 0; i < attrs.length; i++){
                var attr = attrs[i];
                obj.setAttribute(attr.nodeName, attr.nodeValue);
            }
        }
    };


})(window, document);