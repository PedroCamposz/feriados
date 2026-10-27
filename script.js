const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const formulario = document.getElementById('formulario');
const campoAno = document.getElementById('ano');
const mensagem = document.getElementById('mensagem');
const resultado = document.getElementById('resultado');
const total = document.getElementById('total');
const corpoTabela = document.getElementById('corpo-tabela');
const proximo = document.getElementById('proximo');
const proximoNome = document.getElementById('proximo-nome');
const proximoDetalhe = document.getElementById('proximo-detalhe');

// 1) Campo já preenchido com o ano atual
campoAno.value = new Date().getFullYear();

formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  consultar(campoAno.value.trim());
});

// ---------- Consulta à API ----------
function consultar(ano) {
  limparTela();

  if (ano === '') {
    mostrarMensagem('Digite um ano para consultar.');
    return;
  }

  mostrarMensagem('Carregando feriados...', false);

  fetch('https://brasilapi.com.br/api/feriados/v1/' + encodeURIComponent(ano))
    .then(function (response) {
      // 5) response.ok é false quando a API responde com erro (ex.: ano inválido)
      if (!response.ok) {
        throw new Error('ANO_INVALIDO');
      }
      return response.json();
    })
    .then(function (feriados) {
      mostrarFeriados(ano, feriados);
    })
    .catch(function (erro) {
      if (erro.message === 'ANO_INVALIDO') {
        mostrarMensagem('A API não aceitou o ano "' + ano + '". Digite um ano válido, como 2026.');
      } else {
        mostrarMensagem('Não foi possível consultar agora. Verifique sua conexão e tente novamente.');
      }
    });
}

// ---------- Montagem da página ----------
function mostrarFeriados(ano, feriados) {
  esconderMensagem();

  if (feriados.length === 0) {
    mostrarMensagem('Nenhum feriado encontrado para ' + ano + '.', false);
    return;
  }

  // 3) Total de feriados usando .length
  total.textContent = feriados.length === 1
    ? '1 feriado nacional em ' + ano
    : feriados.length + ' feriados nacionais em ' + ano;

  // Para o desafio extra: "hoje" ao meio-dia, igual ao horário usado nas datas
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  let proximoFeriado = null;
  let diasAteProximo = 0;

  feriados.forEach(function (feriado) {
    // Dica do enunciado: evita erro de fuso horário
    const data = new Date(feriado.date + 'T12:00:00');
    const diaDaSemana = data.getDay(); // 0 = domingo, 6 = sábado

    const linha = document.createElement('tr');

    // 4) Destaque para sábado e domingo
    if (diaDaSemana === 0 || diaDaSemana === 6) {
      linha.classList.add('fim-de-semana');
    }

    // 2) Data brasileira (25/12/2026), dia da semana e nome
    linha.appendChild(criarCelula(data.toLocaleDateString('pt-BR')));
    linha.appendChild(criarCelula(DIAS_SEMANA[diaDaSemana]));
    linha.appendChild(criarCelula(feriado.name));
    corpoTabela.appendChild(linha);

    // Desafio extra: guarda o feriado futuro mais próximo
    const dias = Math.round((data - hoje) / 86400000);
    if (dias >= 0 && (proximoFeriado === null || dias < diasAteProximo)) {
      proximoFeriado = { nome: feriado.name, data: data };
      diasAteProximo = dias;
    }
  });

  resultado.hidden = false;
  mostrarProximoFeriado(ano, proximoFeriado, diasAteProximo);
}

function mostrarProximoFeriado(ano, feriado, dias) {
  if (feriado === null) {
    mostrarMensagem('Não há mais feriados em ' + ano + ' a partir de hoje.', false);
    return;
  }

  let quando;
  if (dias === 0) {
    quando = 'É hoje!';
  } else if (dias === 1) {
    quando = 'Falta 1 dia.';
  } else {
    quando = 'Faltam ' + dias + ' dias.';
  }

  proximoNome.textContent = feriado.nome;
  proximoDetalhe.textContent =
    DIAS_SEMANA[feriado.data.getDay()] + ', ' + feriado.data.toLocaleDateString('pt-BR') + '. ' + quando;
  proximo.hidden = false;
}

// ---------- Funções auxiliares ----------
function criarCelula(texto) {
  const celula = document.createElement('td');
  celula.textContent = texto; // textContent evita inserir HTML vindo da API
  return celula;
}

function mostrarMensagem(texto, ehErro = true) {
  mensagem.textContent = texto;
  mensagem.classList.toggle('erro', ehErro);
  mensagem.hidden = false;
}

function esconderMensagem() {
  mensagem.hidden = true;
}

function limparTela() {
  esconderMensagem();
  resultado.hidden = true;
  proximo.hidden = true;
  corpoTabela.innerHTML = '';
}
