const QuizInterativo = {
  mixins: [window.markdownProcessor],
  props: {
    tema: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      quizIniciado: false,
      quizFinalizado: false,
      questaoAtual: 0,
      respostaSelecionada: null,
      respondeu: false,
      acertos: 0,
      erros: 0,
      acertouAtual: false,
      mostrarConfetti: false,
      questoesEmbaralhadas: [],
      mapeamentoRespostas: [],
    };
  },
  computed: {
    porcentagem() {
      return Math.round(
        (this.acertos / this.questoesEmbaralhadas.length) * 100
      );
    },
    questaoCorrente() {
      return this.questoesEmbaralhadas[this.questaoAtual] || {};
    },

    dificuldadeFormatada() {
      const nivel = this.questaoCorrente.dificuldade || 1;
      const estrelas = "⭐".repeat(nivel);
      const textos = {
        1: "Básico",
        2: "Intermediário",
        3: "Avançado",
      };
      return `${estrelas} ${textos[nivel] || "Básico"}`;
    },
  },
  methods: {
    iniciarQuiz() {
      this.quizIniciado = true;
      this.embaralharQuestoes();
    },
    embaralharQuestoes() {
      this.questoesEmbaralhadas = [...this.tema.questoes];
      this.mapeamentoRespostas = [];

      // Embaralha as questões
      for (let i = this.questoesEmbaralhadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.questoesEmbaralhadas[i], this.questoesEmbaralhadas[j]] = [
          this.questoesEmbaralhadas[j],
          this.questoesEmbaralhadas[i],
        ];
      }

      // Embaralha as opções de cada questão
      this.questoesEmbaralhadas.forEach((questao, questaoIndex) => {
        const opcoes = [...questao.opcoes];
        const mapeamento = opcoes.map((_, index) => index);

        // Embaralha o mapeamento
        for (let i = mapeamento.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [mapeamento[i], mapeamento[j]] = [mapeamento[j], mapeamento[i]];
        }

        // Reorganiza as opções
        questao.opcoes = mapeamento.map((indice) => opcoes[indice]);

        // Encontra onde ficou a resposta correta
        const novaRespostaCorreta = mapeamento.indexOf(questao.respostaCorreta);
        questao.respostaCorreta = novaRespostaCorreta;

        this.mapeamentoRespostas[questaoIndex] = mapeamento;
      });
    },
    responder(indice) {
      if (this.respondeu) return;
      this.respostaSelecionada = indice;
      this.respondeu = true;
      if (indice === this.questaoCorrente.respostaCorreta) {
        this.acertos++;
        this.acertouAtual = true;
        this.tocarSomAcerto();
      } else {
        this.erros++;
        this.acertouAtual = false;
        this.tocarSomErro();
      }
    },
    proximaQuestao() {
      if (this.questaoAtual < this.questoesEmbaralhadas.length - 1) {
        this.questaoAtual++;
        this.respondeu = false;
        this.respostaSelecionada = null;
        this.acertouAtual = false;
      } else {
        this.finalizarQuiz();
      }
    },
    finalizarQuiz() {
      this.quizFinalizado = true;
      this.quizIniciado = false;
      if (this.acertos === this.questoesEmbaralhadas.length) {
        this.mostrarConfetti = true;
        setTimeout(() => {
          this.mostrarConfetti = false;
        }, 5000);
      }
    },
    reiniciarQuiz() {
      this.quizIniciado = false;
      this.quizFinalizado = false;
      this.questaoAtual = 0;
      this.respostaSelecionada = null;
      this.respondeu = false;
      this.acertos = 0;
      this.erros = 0;
      this.acertouAtual = false;
      this.mostrarConfetti = false;
      this.mapeamentoRespostas = [];
    },
    getClasseOpcao(indice) {
      if (!this.respondeu) return "";
      if (indice === this.questaoCorrente.respostaCorreta)
        return "option-correct";
      if (
        indice === this.respostaSelecionada &&
        indice !== this.questaoCorrente.respostaCorreta
      )
        return "option-wrong shake";
      return "option-disabled";
    },
    getClasseLetra(indice) {
      if (!this.respondeu) return "";
      if (indice === this.questaoCorrente.respostaCorreta)
        return "letter-correct";
      if (
        indice === this.respostaSelecionada &&
        indice !== this.questaoCorrente.respostaCorreta
      )
        return "letter-wrong";
      return "letter-disabled";
    },
    getClasseResultado() {
      if (this.porcentagem >= 90) return "gradient-primary";
      if (this.porcentagem >= 70) return "gradient-success";
      if (this.porcentagem >= 60) return "gradient-warning";
      return "gradient-error";
    },
    getIconeResultado() {
      if (this.porcentagem === 100) return "fas fa-crown";
      if (this.porcentagem >= 90) return "fas fa-medal";
      if (this.porcentagem >= 70) return "fas fa-trophy";
      if (this.porcentagem >= 60) return "fas fa-thumbs-up";
      return "fas fa-heart";
    },
    getTituloResultado() {
      if (this.porcentagem === 100) return "PERFEITO! 👑";
      if (this.porcentagem >= 90) return "EXCELENTE! 🏆";
      if (this.porcentagem >= 80) return "MUITO BOM! 🎉";
      if (this.porcentagem >= 70) return "BOM! 👍";
      if (this.porcentagem >= 60) return "PODE MELHORAR! 💪";
      return "CONTINUE ESTUDANDO! 📚";
    },
    getClasseMensagem() {
      if (this.porcentagem >= 70) return "status-success";
      if (this.porcentagem >= 60) return "gradient-warning";
      return "status-error";
    },
    getMensagemPrincipal() {
      const tema = this.tema.nome;
      if (this.porcentagem === 100) {
        return `🎯 IMPRESSIONANTE! Você domina completamente ${tema}!`;
      }
      if (this.porcentagem >= 90) {
        return `🌟 FANTÁSTICO! Você tem excelente conhecimento em ${tema}!`;
      }
      if (this.porcentagem >= 80) {
        return `🎉 PARABÉNS! Você demonstrou bom domínio em ${tema}!`;
      }
      if (this.porcentagem >= 70) {
        return `👏 Bom trabalho! Você entende bem os conceitos de ${tema}!`;
      }
      if (this.porcentagem >= 60) {
        return `💪 Você está no caminho certo em ${tema}, mas pode melhorar.`;
      }
      return `📚 Continue estudando ${tema}! O conhecimento vem com a prática.`;
    },
    getMensagemSecundaria() {
      if (this.porcentagem === 100) {
        return "Você é um verdadeiro expert! Compartilhe esse conhecimento! 🌟";
      }
      if (this.porcentagem >= 90) {
        return "Continue assim! Você está pronto para desafios avançados! 🚀";
      }
      if (this.porcentagem >= 80) {
        return "Revisar alguns pontos pode te levar à excelência! 📈";
      }
      if (this.porcentagem >= 70) {
        return "Com mais estudo, você dominará todos os conceitos! ⭐";
      }
      if (this.porcentagem >= 60) {
        return "Foque nos tópicos que errou e tente novamente! 🎯";
      }
      return "Revise o material e pratique mais. Você consegue! 💝";
    },
    compartilharResultado() {
      const texto = `🎯 Quiz ${this.tema.nome} concluído!\n📊 Resultado: ${
        this.acertos
      }/${this.questoesEmbaralhadas.length} (${
        this.porcentagem
      }%)\n${this.getTituloResultado()}\n#Quiz #Educacao #${this.tema.nome.replace(
        /\s+/g,
        ""
      )}`;
      if (navigator.share) {
        navigator.share({
          title: `Quiz ${this.tema.nome} - Resultado`,
          text: texto,
        });
      } else {
        navigator.clipboard.writeText(texto).then(() => {
          alert("Resultado copiado! 📋");
        });
      }
    },
    tocarSomAcerto() {
      if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          1000,
          audioContext.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    },
    tocarSomErro() {
      if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          200,
          audioContext.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    },
  },
  template: `
    <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <!-- Header -->
      <header class="bg-white shadow-xl">
        <div class="container mx-auto px-4 py-6">
          <div class="text-center">
            <div class="flex items-center justify-center space-x-4 mb-2">
              <i class="fas fa-brain text-4xl text-blue-600"></i>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz {{ tema.nome }}
              </h1>
              <i :class="tema.icone" class="text-4xl text-purple-600"></i>
            </div>
            <p class="text-gray-600">{{ tema.descricao }}</p>
          </div>
        </div>
      </header>

      <!-- Tela Inicial -->
      <div v-if="!quizIniciado && !quizFinalizado" class="container mx-auto px-4 py-12">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div class="mb-8">
              <i class="fas fa-rocket text-6xl text-blue-600 mb-4 bounce"></i>
              <h2 class="text-3xl font-bold text-gray-800 mb-4">Pronto para o Desafio? 🚀</h2>
              <p class="text-gray-600 text-lg mb-6">
                Teste seus conhecimentos com {{ tema.questoes.length }} questões cuidadosamente elaboradas sobre todos os tópicos que estudamos!
              </p>
            </div>

            <div class="grid md:grid-cols-3 gap-4 mb-8">
              <div class="bg-blue-50 rounded-lg p-4">
                <i class="fas fa-clock text-2xl text-blue-600 mb-2"></i>
                <h3 class="font-bold text-blue-800">Sem Pressa</h3>
                <p class="text-sm text-blue-600">Tempo ilimitado para pensar</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <i class="fas fa-lightbulb text-2xl text-green-600 mb-2"></i>
                <h3 class="font-bold text-green-800">Feedback Imediato</h3>
                <p class="text-sm text-green-600">Explicações a cada resposta</p>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <i class="fas fa-trophy text-2xl text-purple-600 mb-2"></i>
                <h3 class="font-bold text-purple-800">Pontuação Final</h3>
                <p class="text-sm text-purple-600">Veja seu desempenho</p>
              </div>
            </div>

            <button @click="iniciarQuiz" 
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <i class="fas fa-play mr-2"></i>
              Começar Quiz!
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz em Andamento -->
      <div v-if="quizIniciado && !quizFinalizado" class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          
          <!-- Barra de Progresso -->
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">
                Questão {{ questaoAtual + 1 }} de {{ questoesEmbaralhadas.length }}
              </h3>
              <div class="text-sm text-gray-600">
                <i class="fas fa-check-circle text-green-600 mr-1"></i>
                {{ acertos }} acertos
                <i class="fas fa-times-circle text-red-600 ml-3 mr-1"></i>
                {{ erros }} erros
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="progress-bar bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" 
                   :style="{ width: ((questaoAtual / questoesEmbaralhadas.length) * 100) + '%' }"></div>
            </div>
            <div class="text-center mt-2 text-sm text-gray-500">
              {{ Math.round((questaoAtual / questoesEmbaralhadas.length) * 100) }}% concluído
            </div>
          </div>

          <!-- Questão -->
          <transition name="fade" mode="out-in">
            <div :key="questaoAtual" class="bg-white rounded-2xl shadow-2xl overflow-hidden">
              
              <!-- Cabeçalho da Questão -->
              <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <i :class="questaoCorrente.icone" class="text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-lg">{{ questaoCorrente.categoria }}</h3>
                    <p class="text-blue-100 text-sm">{{ dificuldadeFormatada }}</p>
                  </div>
                </div>
                <h2 class="text-xl font-bold leading-relaxed">
                  {{ questaoCorrente.pergunta }}
                </h2>
              </div>

              <!-- Contexto (se houver) -->
              <div v-if="questaoCorrente.contexto" class="bg-gray-50 p-4 border-l-4 border-blue-500">
                <p class="text-gray-700 text-sm">
                  <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                  {{ questaoCorrente.contexto }}
                </p>
              </div>

              <!-- Opções -->
              <div class="p-6">
                <div class="space-y-3">
                  <button v-for="(opcao, index) in questaoCorrente.opcoes" 
                          :key="index"
                          @click="responder(index)"
                          :disabled="respondeu"
                          :class="getClasseOpcao(index)"
                          class="w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100">
                    <div class="flex items-center space-x-3">
                      <div :class="getClasseLetra(index)" 
                           class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {{ String.fromCharCode(65 + index) }}
                      </div>
                      <span class="font-medium">{{ opcao }}</span>
                      <div class="ml-auto">
                        <i v-if="respondeu && index === questaoCorrente.respostaCorreta" 
                           class="fas fa-check text-green-600 text-xl"></i>
                        <i v-else-if="respondeu && index === respostaSelecionada && index !== questaoCorrente.respostaCorreta" 
                           class="fas fa-times text-red-600 text-xl"></i>
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Explicação -->
                <transition name="slide">
                  <div v-if="respondeu" class="mt-6 p-4 rounded-xl" 
                       :class="acertouAtual ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                    <div class="flex items-start space-x-3">
                      <i :class="acertouAtual ? 'fas fa-check-circle text-green-600' : 'fas fa-times-circle text-red-600'" 
                         class="text-xl mt-1"></i>
                      <div>
                        <h4 :class="acertouAtual ? 'text-green-800' : 'text-red-800'" 
                            class="font-bold mb-2">
                          {{ acertouAtual ? '🎉 Correto!' : '❌ Incorreto!' }}
                        </h4>
                        <p :class="acertouAtual ? 'text-green-700' : 'text-red-700'" 
                           class="mb-3">
                          {{ questaoCorrente.explicacao }}
                        </p>
                        <div v-if="!acertouAtual" 
                             class="bg-white p-3 rounded-lg border-l-4 border-green-500">
                          <p class="text-sm text-gray-700">
                            <strong class="text-green-700">Resposta correta:</strong> 
                            {{ questaoCorrente.opcoes[questaoCorrente.respostaCorreta] }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- Botão Próxima -->
                <div v-if="respondeu" class="mt-6 text-center">
                  <button @click="proximaQuestao" 
                          class="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    {{ questaoAtual === questoesEmbaralhadas.length - 1 ? 'Ver Resultado' : 'Próxima Questão' }}
                    <i :class="questaoAtual === questoesEmbaralhadas.length - 1 ? 'fas fa-flag-checkered' : 'fas fa-arrow-right'" 
                       class="ml-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Resultado Final -->
      <div v-if="quizFinalizado" class="container mx-auto px-4 py-12">
        <div class="max-w-2xl mx-auto">
          <transition name="fade">
            <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
              
              <!-- Cabeçalho do Resultado -->
              <div :class="getClasseResultado()" class="text-white p-8 text-center">
                <div class="mb-6">
                  <i :class="getIconeResultado()" class="text-6xl mb-4 bounce"></i>
                  <h2 class="text-3xl font-bold">{{ getTituloResultado() }}</h2>
                </div>
              </div>

              <!-- Estatísticas -->
              <div class="p-8">
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                  <div class="text-center">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i class="fas fa-check text-3xl text-green-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-green-600">{{ acertos }}</h3>
                    <p class="text-gray-600">Acertos</p>
                  </div>
                  
                  <div class="text-center">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i class="fas fa-times text-3xl text-red-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-red-600">{{ erros }}</h3>
                    <p class="text-gray-600">Erros</p>
                  </div>
                  
                  <div class="text-center">
                    <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i class="fas fa-percentage text-3xl text-blue-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-blue-600">{{ porcentagem }}%</h3>
                    <p class="text-gray-600">Aproveitamento</p>
                  </div>
                </div>

                <!-- Gráfico de Performance -->
                <div class="mb-8">
                  <h4 class="font-bold text-gray-800 mb-4 text-center">Sua Performance</h4>
                  <div class="relative">
                    <div class="w-full bg-gray-200 rounded-full h-8">
                      <div class="h-8 rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden"
                           :style="{ width: porcentagem + '%' }"
                           :class="porcentagem >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                                   porcentagem >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                                   'bg-gradient-to-r from-red-400 to-red-600'">
                        <span v-if="porcentagem > 20">{{ porcentagem }}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mensagem Personalizada -->
                <div class="text-center mb-8">
                  <div :class="getClasseMensagem()" class="p-6 rounded-xl">
                    <p class="text-lg font-medium mb-2">{{ getMensagemPrincipal() }}</p>
                    <p class="text-sm opacity-90">{{ getMensagemSecundaria() }}</p>
                  </div>
                </div>

                <!-- Botões de Ação -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                  <button @click="reiniciarQuiz" 
                          class="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    <i class="fas fa-redo mr-2"></i>
                    Tentar Novamente
                  </button>
                  
                  <button @click="compartilharResultado" 
                          class="bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    <i class="fas fa-share mr-2"></i>
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Confetti para pontuação perfeita -->
      <div v-if="mostrarConfetti" class="fixed inset-0 pointer-events-none z-50">
        <div v-for="n in 50" :key="n" 
             class="confetti absolute"
             :style="{ 
                 left: Math.random() * 100 + '%', 
                 animationDelay: Math.random() * 3 + 's',
                 backgroundColor: ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'][Math.floor(Math.random() * 5)]
             }"></div>
      </div>
    </div>
  `,
};

// Registro global para uso via <script>
window.QuizInterativo = QuizInterativo;
