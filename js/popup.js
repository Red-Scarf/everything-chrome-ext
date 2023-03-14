$('#button').click(() => {
    let val = $('#input').val();
    console.log(val);
    $('#list').innerHTML = val;
});