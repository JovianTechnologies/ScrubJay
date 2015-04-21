document.addEventListener("DOMContentLoaded", function(event) {
    //todo: Hide all elements when initially loaded so there is no flashing of page data
    //todo: remove all hardcoded strings
    //todo: replace string comparisons with regular expressions
    //todo: decide whether or not to implement without self loading

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
    var url = parseMasterFileName(masterPage);

    //set up page
    getPage(url, function(pageData){
        var page = parseMasterFileHead(pageData);

        document.body.innerHTML = page.body;
        document.head.innerHTML = page.head;;

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
        request.setRequestHeader("Accept", "text/html");
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == 200)
                callback(request.response);
        };
        request.send(null);
    }

    function parseMasterFileName(file){
        var useDirecive = "@sj-use";
        return file.substring(file.indexOf(useDirecive) + useDirecive.length + 2/*add two to take into the ( and " charcters into account */, file.indexOf('")'));
    }

    function parseMasterFileHead(file){
        //Copy body only and capture head data, which will be added after the body is set
        var beginHeadStartTagLocation = file.indexOf("<head");
        var tempPageData = file.substring(beginHeadStartTagLocation);
        var endHeadStartTagLocation = tempPageData.indexOf(">");
        var pageBody = file.substring(0, beginHeadStartTagLocation + endHeadStartTagLocation + 1) + file.substring(file.indexOf("</head>"));
        var pageHead = file.substring(beginHeadStartTagLocation + endHeadStartTagLocation + 6, file.indexOf("</head>"));

        return new MasterPage(pageHead, pageBody);
    }

    var MasterPage = function(head, body){
        this.head = head;
        this.body = body;
    };
});