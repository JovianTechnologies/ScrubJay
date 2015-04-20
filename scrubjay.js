document.addEventListener("DOMContentLoaded", function(event) {
    //todo: Hide all elements when initially loaded so there is no flashing of page data

    //get sectons to be inserted into template
    var insertions = document.querySelectorAll('[sj-section]');
    var insertionsHTML = [];
    var lookup = []; //object to make lookups against insertionsHTML faster
    for(var i = 0; i < insertions.length; i++){
        var insertion = insertions[i];

        insertionsHTML.push({sectionName : insertion.attributes['sj-section'].value, obj:insertion});
        lookup.push(insertion.attributes['sj-section'].value);
    }

    var masterPage = document.body.firstChild.data;
    var url = parseFileName(masterPage);

    //set masterpage
    getPage(url, function(pageData){
        var scrubJay = document.getElementById('scriptjay');
        var scrubJayLocation = scrubJay.getAttribute('src');
        var newPageData = pageData.substring(0,pageData.indexOf("</head>")) + "<script src='"+ scrubJayLocation+ "'></script>" + pageData.substring(pageData.indexOf("</head>"));
        var test = newPageData;
        //document.write(newPageData);
        var head = document.createElement('head');
        document.head.removeChild(document.head.firstChild);
        //
        //add scriptjay itself to header
        var newScrubJay = document.createElement('script');
        //newScrubJay.setAttribute("src", scrubJayLocation);
        //document.head.appendChild(newScrubJay);
        //
        //var sections = document.querySelectorAll('[sj-insert]');
        //for(var i = 0; i < sections.length; i++){
        //    var section = sections[i];
        //    var sectionIndex = lookup.indexOf(section.attributes['sj-insert'].value);
        //    if(sectionIndex >= 0){
        //        section.appendChild(insertionsHTML[sectionIndex].obj);
        //    }
        //}
    });

    function getPage(url, callback){
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader("Accept", "text/html");
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == 200)
                callback(request.responseText);
        };
        request.send(null);
    }

    function parseFileName(requestedFile){
        return requestedFile.substring(requestedFile.indexOf('("') + 2, requestedFile.indexOf('")'));
    }
});