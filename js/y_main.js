document.getElementById('dateIcon').addEventListener('click', function() {
    let dateInput = document.getElementById('dateInput');
    dateInput.focus(); 
    dateInput.showPicker();
});