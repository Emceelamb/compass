$(function() {
    console.log('hello world :o, G`day mates!');
    $('form#domainSearch').submit(function(event) {
    event.preventDefault();
    let domainInput = $('input').val();
    console.log(domainInput)
    $.post('/domain' , {domain:domainInput}, function() {
        $('input').val('');
        $('input').focus();
        });
    });
});

