var Hello = {
    connection: null,
    start_time: null,

    log: function (msg) {
        $('#log').append("<p>" + msg + "</p>");
    },

    send_ping: function (to) {
        var ping = $iq({
            to: to,
            type: "get",
            id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});

        Hello.log("Sending ping to " + to + ".");

        Hello.start_time = (new Date()).getTime();
        Hello.connection.send(ping);
    },

    handle_pong: function (iq) {
        var elapsed = (new Date()).getTime() - Hello.start_time;
        Hello.log("Received pong from server in " + elapsed + "ms.");

        Hello.connection.disconnect();
        
        return false;
    }
};

$(document).ready(function () {
    $('#login_dialog').dialog({
        autoOpen: true,
        draggable: false,
        modal: true,
        title: 'Connect to XMPP',
        buttons: {
            "Connect": function () {
                $(document).trigger('connect', {
                    jid: $('#jid').val().toLowerCase(),
                    password: $('#password').val()
                });
                
                $('#password').val('');
                $(this).dialog('close');
            }
        }
    });
});

$(document).bind('connect', function (ev, data) {
	var servidor = "http://localhost:5280/bosh/"
	// "http://bosh.metajack.im:5280/xmpp-httpbind"

	var conn = new Strophe.Connection(servidor);
	
	conn.connect(data.jid, data.password, function (status) {
	/*console.log('---> status: ' + status
	+ ' : Strophe.Status.CONNECTED ' + Strophe.Status.CONNECTED
	+ ' : Strophe.Status.DISCONNECTED ' + Strophe.Status.DISCONNECTED
	+ ' : Strophe.Status.AUTHENTICATING ' + Strophe.Status.AUTHENTICATING
	+ ' : Strophe.Status.DISCONNECTING ' + Strophe.Status.DISCONNECTING
	+ ' : Strophe.Status.CONNECTING ' + Strophe.Status.CONNECTING
	+ ' : Strophe.Status.CONNFAIL ' + Strophe.Status.CONNFAIL
	+ ' : Strophe.Status.AUTHFAIL ' + Strophe.Status.AUTHFAIL);*/
	if (status === Strophe.Status.CONNECTED) {
		$(document).trigger('connected');
	} else if (status === Strophe.Status.DISCONNECTED) {
		$(document).trigger('disconnected');
	} else if (status === Strophe.Status.CONNECTING) {
		console.log('Tentando se conectar...');
	}
	Hello.connection = conn;
});

$(document).bind('connected', function () {
    // inform the user
    Hello.log("Connection established.");

    Hello.connection.addHandler(Hello.handle_pong, null, "iq", null, "ping1");

    var domain = Strophe.getDomainFromJid(Hello.connection.jid);
    
    Hello.send_ping(domain);
});

$(document).bind('disconnected', function () {
    Hello.log("Connection terminated.");

    // remove dead connection object
    Hello.connection = null;
});