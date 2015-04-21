document.addEventListener("DOMContentLoaded", function(event) {
    ScrubJay.init();
});

(function(window, document){
    //todo: Hide all elements when initially loaded so there is no flashing of page data
    //todo: remove all hardcoded strings
    //todo: replace string comparisons with regular expressions
    //todo: decide whether or not to implement without self loading

    window.ScrubJay = {
        init: function(){
            var insertions = document.querySelectorAll('[sj-section]');
            var insertionsHTML = [];
            var lookup = []; //object to make lookups against insertionsHTML faster
            for(var i = 0; i < insertions.length; i++){
                var insertion = insertions[i];

                insertionsHTML.push({sectionName : insertion.attributes['sj-section'].value, obj:insertion, innerH: insertion.innerHTML});
                lookup.push(insertion.attributes['sj-section'].value);
            }

            var masterPage = document.body.firstChild.data;
            var url = this.getMasterFileUrl(masterPage);

            var self = this;
            //set up page
            this.getPage(url, function(pageData){
                var page = self.parseMasterFileHead(pageData);

                document.body.innerHTML = page.body;
                document.head.innerHTML = page.head;

                //place section data into template
                var sections = document.querySelectorAll('[sj-insert]');
                for(var i = 0; i < sections.length; i++){
                    var section = sections[i];
                    var sectionIndex = lookup.indexOf(section.attributes['sj-insert'].value);
                    if(sectionIndex >= 0){
                        var child = section.appendChild(insertionsHTML[sectionIndex].obj);
                        child.innerHTML = insertionsHTML[sectionIndex].innerH;
                    }
                }
            });
        },
        getPage: function(url, callback){
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader("Accept", "text/html");
            request.onreadystatechange = function(){
                if(request.readyState == 4 && request.status == 200)
                    callback(request.response);
            };
            request.send(null);
        },

        getMasterFileUrl: function(file){
            var useDirecive = "@sj-use";
            return file.substring(file.indexOf(useDirecive) + useDirecive.length + 2, file.indexOf('")'));
        },

        parseMasterFileHead: function(file){
            //Copy body only and capture head data, which will be added after the body is set
            var beginHeadStartTagLocation = file.indexOf("<head");
            var tempPageData = file.substring(beginHeadStartTagLocation);
            var endHeadStartTagLocation = tempPageData.indexOf(">");
            var headEndTagLocation = file.indexOf("</head>");
            var pageBody = file.substring(0, beginHeadStartTagLocation + endHeadStartTagLocation + 1) + file.substring(headEndTagLocation);
            var pageHead = file.substring(beginHeadStartTagLocation + endHeadStartTagLocation + 6, headEndTagLocation);

            //var headAttrs = pageBody.substring(beginHeadStartTagLocation, end);

            return {head: pageHead, body: pageBody};
        }
    }
})(window, document);