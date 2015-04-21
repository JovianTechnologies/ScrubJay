document.addEventListener("DOMContentLoaded", function(event) {

    //todo: Hide all elements when initially loaded so there is no flashing of page data

    //get sectons to be inserted into template
    var insertions = document.querySelectorAll('[sj-section]');
    var insertionsHTML = [];
    var lookup = []; //object to make lookups against insertionsHTML faster
    for(var i = 0; i < insertions.length; i++){
        var insertion = insertions[i];

        insertionsHTML.push({sectionName : insertion.attributes['sj-section'].value, obj:insertion, innerH: insertion.innerHTML});
        lookup.push(insertion.attributes['sj-section'].value);
    }

    var masterPage = document.body.firstChild.data;
    var url = parseFileName(masterPage);

    //set up page
    getPage(url, function(pageData){
        //Copy body only and capture head data, which will be added after the body is set
        var beginHeadStartTagLocation = pageData.indexOf("<head");
        var tempPageData = pageData.substring(beginHeadStartTagLocation);
        var endHeadStartTagLocation = tempPageData.indexOf(">");
        var pageDataNoHead = pageData.substring(0, beginHeadStartTagLocation + endHeadStartTagLocation + 1) + pageData.substring(pageData.indexOf("</head>"));
        var pageHead = pageData.substring(beginHeadStartTagLocation + endHeadStartTagLocation + 6, pageData.indexOf("</head>"));

        document.body.innerHTML = pageDataNoHead;
        document.head.innerHTML = pageHead;

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

    //utility functions
    function getPage(url, callback){
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader("Accept", "document");
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == 200)
                callback(request.response);
        };
        request.send(null);
    }

    function parseFileName(requestedFile){
        return requestedFile.substring(requestedFile.indexOf('("') + 2, requestedFile.indexOf('")'));
    }
});