var Hello = {
    connection: null,
    start_time: null,
	total: 0,
	count: 0,

    log: function (msg) {
        $('#log').append("<p>" + msg + "</p>");
    },

    send_ping: function (to) {
		var ping = $iq({
            to: to,
            type: "get",
			message: "Hello World",
            id: "ping"})
		.c("ping", {xmlns: "urn:xmpp:ping"});
		
        /*var ping = $msg({
            to: to,
            type: "chat",
            id: "ping"})
		.c("body", {xmlns: "urn:xmpp:ping"});*/		
		console.log('Objeto ping: ' + ping);
		
        Hello.log("Sending ping to " + to + ".");

        Hello.start_time = (new Date()).getTime();
        Hello.connection.send(ping);
    },

    handle_pong: function (iq) {
		console.log('iq -> ' + "from: " + $(iq).attr('from')
			+ ", message: " + $(iq).attr('message')
			+ ", type: " + $(iq).attr('type')
			+ ", id: " + $(iq).attr('id')
			+ ", to: " + $(iq).attr('to')
			+ ", ping: " + $(iq).attr('ping')
			+ ", getText: " + $(iq).toString());
			
        var elapsed = (new Date()).getTime() - Hello.start_time;
        Hello.log("Received pong from server in " + elapsed + "ms.");

		Hello.total += elapsed;
		Hello.count += 1;
		
        Hello.connection.disconnect();
        
        return true;
    },
	
	average: function() {
		console.log(`Média = ${Hello.total / Hello.count}`);
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
	var servidor = "http://localhost:5280/bosh/";	
	
	var i, total = 4;
	//for (i = 1; i <= total; i++) {	
		//console.log(`\n\nIteração ${i} de ${total}`);
		
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
		});
		
		Hello.connection = conn;	
	//}
});

$(document).bind('connected', function () {
    // inform the user
    Hello.log("Connection established.");

	//var i, total = 4;
	//for (i = 1; i <= total; i++) {	
		//console.log(`\n\nIteração ${i} de ${total}`);
	
		Hello.connection.addHandler(Hello.handle_pong, null, "iq", null, "ping");

		var domain = Strophe.getDomainFromJid(Hello.connection.jid);
		
		Hello.send_ping(domain);
	//}
});

$(document).bind('disconnected', function () {
    Hello.log("Connection terminated.");

    // remove dead connection object
    Hello.connection = null;
	
	Hello.average();
});