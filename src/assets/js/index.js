/*
 * Função para preencher os email que deseja enviar o evento 
 */

const btnAddEmails = document.getElementById("btn-add");
const emailElement = document.getElementById("email-input");
const containerEmail = document.getElementById("email-students");

const emails = [];

function renderEmails() {

    containerEmail.innerHTML = "";

    emails.map((email, index) => {
        const newBadge = document.createElement("span");
        //newBadge.setAttribute("href", "#");
        newBadge.setAttribute("class", "badge badge-pill badge-dark");
        newBadge.setAttribute("onclick", `removeEmail(${index})`);
        newBadge.appendChild(document.createTextNode(`${email} | X`));

        containerEmail.appendChild(newBadge);
    });
}

function removeEmail(index) {
    emails.splice(index, 1);
    renderEmails();
}

btnAddEmails.onclick = function (event) {

    event.preventDefault(event);

    emails.push(emailElement.value);
    
    // Adicionando o array de emails dentro do formulario do evento 
    document.forms["eventForm"]["students"].value = emails;
    
    emailElement.value = "";

    renderEmails();
}

renderEmails();

/* ---------------------------------------------------------------------------------------------------- */

axios({
    method: 'get',
    url: 'http://localhost:3000/data',
    responseType: 'json'
})
    .then(function (response) {
        console.log(response.data);
        /*let elementP = document.createElement('p');
        elementP.appendChild(document.createTextNode(response.data));
        document.getElementById("main").appendChild(elementP);*/
    });