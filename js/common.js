function checkVersion(){
    var current_version = $('#current_version').text().replace('.', '-').split('-')[1];
    alert(current_version);
}