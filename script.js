const urlAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v6/uol";
let lastTime;
let nickName;

let tipoMensagem = "message";
let destinatario = "Todos";

function selecionarParticipante(participanteTo, elemento) {
  const selecionado = document.querySelector(".usuarios .selecionado");
  if (selecionado) {
    selecionado.classList.remove("selecionado");
  }

  elemento.classList.add("selecionado");
  destinatario = participanteTo;
  toggleMenu();
}

function renderizarParticipantes(resposta) {
  console.log(resposta.data);
  const usuarios = document.querySelector(".usuarios");

  for (let i = 0; i < resposta.data.length; i++) {
    const participanteTemplate = `
        <li class="visibilidade-publico" onclick="selecionarParticipante('${resposta.data[i].name}', this)">
            <ion-icon name="person-circle"></ion-icon><span class="nome">${resposta.data[i].name}</span><ion-icon class="check" name="checkmark-outline">
            </ion-icon>
        </li>`;

    usuarios.innerHTML += participanteTemplate;
  }
}

function carregarParticipantes() {
  console.log("CARREGAR PARTICIPANTEs");
  //Promise da função carregarParticipantes - escopo local
  const promise = axios.get(`${urlAPI}/participants`);
  promise.then(renderizarParticipantes); //callback
}

function errorEntrarSala() {
  console.log("DEU RUIMMM AII");
  nickName = undefined;
}

function rolarProFim(ultimaMensagem) {
  if (ultimaMensagem !== lastTime) {
    document
      .querySelector(".mensagens-caixa li:last-child")
      .scrollIntoView();
    lastTime = ultimaMensagem;
  }
}

function verMensagemPrivada(tempMsg) {
  if (
    tempMsg.type === "private_message" &&
    (tempMsg.from === nickName || tempMsg.to === nickName)
  ) {
    return true;
  }
  return false;
}

//Colocar no DOM
function renderizarMensagens(resposta) {
  console.log("renderizarMensagens");
  let caixaMensagens = document.querySelector(".mensagens-caixa");

  caixaMensagens.innerHTML = "";

  for (let i = 0; i < resposta.data.length; i++) {
    const tempMsg = resposta.data[i];
    if (verMensagemPrivada(tempMsg)) {
      //MENSAGEM PRIVADA
      caixaMensagens.innerHTML += `
                <li class="conversa-privada">
                    <span class="horario">(${tempMsg.time})</span>
                        <strong>${tempMsg.from}</strong>
                            <span> reservadamente para </span>
                        <strong>${tempMsg.to}: </strong>
                    <span>${tempMsg.text}</span>
                </li>
            `;
    }
    if (tempMsg.type === "message") {
      //MENSAGEM PUBLICA
      caixaMensagens.innerHTML += `
                <li class="conversa-publica">
                    <span class="horario">(${tempMsg.time})</span>
                        <strong>${tempMsg.from}</strong>
                            <span> para </span>
                        <strong>${tempMsg.to}: </strong>
                    <span>${tempMsg.text}</span>
                </li>
            `;
    }
    if (tempMsg.type === "status") {
      //MENSAGEM DE STATUS
      caixaMensagens.innerHTML += `
                <li class="entrada-saida">
                    <span class="horario">(${tempMsg.time})</span>
                        <strong>${tempMsg.from}</strong>
                            <span> para </span>
                        <strong>${tempMsg.to}: </strong>
                    <span>${tempMsg.text}</span>
                </li>
            `;
    }
  }

  const ultimaMensagem = resposta.data[resposta.data.length - 1].time;
  rolarProFim(ultimaMensagem);
}

function carregarMensagens() {
  if (nickName !== undefined) {
    const promise = axios.get(`${urlAPI}/messages`);
    promise.then(renderizarMensagens);
  }
}

function entrarSala() {
  nickName = prompt("Qual é a sua graça?");
  //Promise da função entrarSala - escopo local
  const promise = axios.post(`${urlAPI}/participants`, { name: nickName });
  promise.catch(errorEntrarSala);
  promise.then(carregarMensagens);
}

function manterLogado() {
  if (nickName) {
    console.log("status");
    axios.post(`${urlAPI}/status`, {
      name: nickName
    });
  }
}

function escolherVisibilidade(tipo, elemento) {
  tipoMensagem = tipo;

  const selecionado = document.querySelector(".visibilidades .selecionado");
  if (selecionado) {
    selecionado.classList.remove("selecionado");
  }

  elemento.classList.add("selecionado");
  toggleMenu();
}

function enviarMensagem() {
  const mensagem = document.querySelector("input").value;
  axios.post(`${urlAPI}/messages`, {
    from: nickName,
    to: destinatario,
    text: mensagem,
    type: tipoMensagem // ou "private_message" para o bônus
  });

  console.log({
    from: nickName,
    to: destinatario,
    text: mensagem,
    type: tipoMensagem // ou "private_message" para o bônus
  });

  document.querySelector("input").value = "";
}

function carregarChat() {
  carregarParticipantes();
  entrarSala();

  setInterval(carregarMensagens, 3000);
  setInterval(manterLogado, 5000);
}

function toggleMenu() {
  const menuLateral = document.querySelector(".menu");
  const conteudoChat = document.querySelector(".menu-fundo");

  menuLateral.classList.toggle("escondido");
  conteudoChat.classList.toggle("fundo-escondido");
}

document.addEventListener("keyup", function (evento) {
  if (evento.key === "Enter") {
    enviarMensagem();
  }
});
carregarChat();
