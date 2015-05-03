function initXHR(x) {
	
	console.log(x);
	
	if (x == 'envelopes') {
	
		retrieveJsonFileFromServer
			('envelopes/1', populateTable);
			//('envelopes.json', populateTable);
	}
	else if (x == 'main')
	{
		retrieveJsonFileFromServer
			('envelopes/1', populateMain);
			//('envelopes.json', populateMain);
	}
}

function retrieveJsonFileFromServer(url, fillMethod) {
	var xmlhttp = new XMLHttpRequest();
	var envelopeList;

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var envelopeList = JSON.parse(xmlhttp.responseText);
			fillMethod(envelopeList);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function populateMain(envelopeList) {

	element = document.getElementById('main');

	var tableRows = "";

	for (var i = 0; i < envelopeList.length; i++) {
		tableRows += "<div class=\"box\">"; 
		tableRows += "<p class=\"balance\">" + envelopeList[i].balance  + "</p>";
		tableRows += "<h4>" + envelopeList[i].category  + "</h4>";
		tableRows += "</div>"
	}

	element.innerHTML = tableRows;
}

function populateTable(envelopeList) {

	element = document.getElementById('envelopes')
		.getElementsByTagName('tbody')[0];

	var tableRows = "";
	
	for (var i = 0; i < envelopeList.length; i++) {
	
		tableRows += "<tr>"; 
		
		tableRows += "<td class=\"category\">" 
			+ envelopeList[i].category  + "</td>";		
					
		tableRows += "<td class=\"amount\">" 
			+ envelopeList[i].amount  + "</td>";
			
		tableRows += "<td>" + envelopeList[i].spent  + "</td>";
		tableRows += "<td>" + envelopeList[i].balance  + "</td>";
		
		tableRows += "<td id=\"edit\"><a href=\"javascript:void(0);\""
			+ "class=\"glyphicon glyphicon-pencil\"></a>"
			+ "<input hidden type=\"radio\" name=\"select\"></input></td>";
			
		tableRows += "<td id=\"delete\"><a href=\"javascript:void(0);\""
			+ "class=\"glyphicon glyphicon-trash\"></a></td>";
			
		tableRows += "</tr>"
	}

	element.innerHTML = tableRows;
}