document.addEventListener("DOMContentLoaded", function(event) {
    //get sectons to be inserted into template
    var insertions = document.querySelectorAll('[scrub-section]');
    var insertionsHTML = [];
    var lookup = []; //object to make lookups against insertionsHTML faster
    for(var i = 0; i < insertions.length; i++){
        var insertion = insertions[i];

        insertionsHTML.push({sectionName : insertion.attributes['scrub-section'].value, obj:insertion});
        lookup.push(insertion.attributes['scrub-section'].value);
    }

    var masterPage = document.all[3].firstChild.data;
    var url = getFileName(masterPage);

    //set masterpage
    getPage(url, function(pageData){
        document.write(pageData);
        var sections = document.querySelectorAll('[scrub-insert]');
        for(var i = 0; i < sections.length; i++){
            var section = sections[i];
            var sectionIndex = lookup.indexOf(section.attributes['scrub-insert'].value);
            if(sectionIndex >= 0){
                section.appendChild(insertionsHTML[sectionIndex].obj);
            }
        }
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

    function getFileName(requestedFile){
        return requestedFile.substring(requestedFile.indexOf('("') + 2, requestedFile.indexOf('")'));
    }
});