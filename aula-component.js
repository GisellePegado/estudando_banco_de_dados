const AulaInterativa = {
  mixins: [window.markdownProcessor],
  props: {
    disciplina: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentTema: 0,
      expandedItems: {},
      interactiveData: {},
    };
  },
  computed: {
    temaAtual() {
      return this.disciplina.temas[this.currentTema] || {};
    },
    progressoPercentual() {
      return Math.round(
        ((this.currentTema + 1) / this.disciplina.temas.length) * 100
      );
    },
  },
  methods: {
    mudarTema(index) {
      this.currentTema = index;
    },
    toggleExpansion(key) {
      this.expandedItems[key] = !this.expandedItems[key];

      const content = document.getElementById(`content-${key}`);
      const icon = document.getElementById(`icon-${key}`);
      const details = document.getElementById(`details-${key}`);

      if (content) {
        content.style.display = this.expandedItems[key] ? "block" : "none";
      }

      if (details) {
        details.style.display = this.expandedItems[key] ? "block" : "none";
      }

      if (icon) {
        icon.className = this.expandedItems[key]
          ? "fas fa-chevron-up transition-transform"
          : "fas fa-chevron-down transition-transform";
      }
    },
    isExpanded(key) {
      return this.expandedItems[key] || false;
    },
    setInteractiveData(key, value) {
      this.interactiveData[key] = value;
    },
    getInteractiveData(key, defaultValue = false) {
      return this.interactiveData[key] !== undefined
        ? this.interactiveData[key]
        : defaultValue;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    mostrarNavegacao() {
      return this.disciplina.temas && this.disciplina.temas.length > 1;
    },

    // Método para elementos interativos gerados via markdown
    toggleInteractiveMarkdown(key, textoInativo, textoAtivo) {
      const content = document.getElementById(`content-${key}`);
      const btn = document.getElementById(`btn-${key}`);

      if (!content || !btn) {
        console.error(
          "Elementos não encontrados:",
          `content-${key}`,
          `btn-${key}`
        );
        return;
      }

      const isVisible = content.style.display !== "none";

      // Toggle da visibilidade
      content.style.display = isVisible ? "none" : "block";

      // Atualiza o texto do botão
      if (btn) {
        const icon = btn.querySelector("i");
        const iconHtml = icon
          ? icon.outerHTML
          : '<i class="fas fa-eye mr-2"></i>';
        btn.innerHTML = `${iconHtml} ${isVisible ? textoInativo : textoAtivo}`;
      }

      // Atualiza o estado interno
      this.interactiveData[key] = !isVisible;

      console.log("Toggle executado:", {
        key,
        isVisible: !isVisible,
        contentDisplay: content.style.display,
      });
    },
  },

  mounted() {
    window.aulaComponent = this;
  },

  template: `
    <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <!-- Header -->
      <header class="bg-white shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <i :class="disciplina.icone || 'fas fa-book'" class="text-3xl text-blue-600"></i>
              <h1 class="text-2xl font-bold text-gray-800">{{ disciplina.nome || 'Disciplina' }}</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">{{ disciplina.professores || 'Professor' }}</span>
              <div class="w-8 h-1 bg-blue-600 rounded"></div>
            </div>
          </div>
          
          <!-- Barra de Progresso -->
          <div v-if="mostrarNavegacao()" class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Progresso do Curso</span>
              <span class="text-sm font-semibold text-blue-600">{{ progressoPercentual }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                   :style="{ width: progressoPercentual + '%' }"></div>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav v-if="mostrarNavegacao()" class="bg-blue-600 text-white sticky top-20 z-40">
        <div class="container mx-auto px-4">
          <div class="flex space-x-1 overflow-x-auto custom-scrollbar">
            <button 
                v-for="(tema, index) in disciplina.temas" 
                :key="index"
                @click="mudarTema(index)"
                :class="['px-4 py-3 whitespace-nowrap transition-colors flex items-center space-x-2', 
                        currentTema === index ? 'bg-blue-800 border-b-2 border-white' : 'hover:bg-blue-700']">
                <i :class="tema.icone || 'fas fa-circle'" class="text-sm"></i>
                <span class="text-sm">{{ tema.titulo }}</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <transition name="fade" mode="out-in">
          <div :key="currentTema" class="bg-white rounded-lg shadow-xl overflow-hidden">
            
            <!-- Cabeçalho do Tema -->
            <div v-if="temaAtual.cabecalho" 
                 :class="['p-6 text-white', temaAtual.cabecalho.cor || 'bg-gradient-to-r from-blue-500 to-purple-600']">
              <div class="flex items-center space-x-4 mb-4">
                <i :class="temaAtual.icone || 'fas fa-book'" class="text-4xl"></i>
                <div>
                  <h2 class="text-3xl font-bold">{{ temaAtual.titulo }}</h2>
                  <p v-if="temaAtual.subtitulo" class="text-lg opacity-90">{{ temaAtual.subtitulo }}</p>
                </div>
              </div>
              
              <p v-if="temaAtual.descricao" class="text-lg leading-relaxed">
                {{ temaAtual.descricao }}
              </p>
              
              <!-- Tags/Chips -->
              <div v-if="temaAtual.tags" class="flex flex-wrap gap-2 mt-4">
                <span v-for="tag in temaAtual.tags" :key="tag"
                      class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Conteúdo do Tema -->
            <div class="p-8">
              <div v-for="(secao, indexSecao) in temaAtual.secoes" :key="indexSecao" class="mb-12 last:mb-0">
                
                <!-- Título da Seção -->
                <h3 v-if="secao.titulo" class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i :class="secao.icone || 'fas fa-bookmark'" class="mr-3"></i>
                  {{ secao.titulo }}
                </h3>

                <!-- Descrição da Seção -->
                <div v-if="secao.descricao" class="mb-6 text-lg text-gray-700">
                  <div v-html="processarMarkdown(secao.descricao)"></div>
                </div>

                <!-- Conteúdo processado via Markdown -->
                <div v-for="(item, indexItem) in secao.conteudo" :key="indexItem">
                  <div v-html="processarMarkdown(item)"></div>
                </div>
              </div>
            </div>

            <!-- Navegação entre temas -->
            <div v-if="mostrarNavegacao()" class="bg-gray-50 p-6 flex justify-between items-center">
              <button v-if="currentTema > 0" 
                      @click="mudarTema(currentTema - 1); scrollToTop()"
                      class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-arrow-left"></i>
                <span>Tema Anterior</span>
              </button>
              <div v-else></div>
              
              <span class="text-gray-600 font-medium">
                {{ currentTema + 1 }} de {{ disciplina.temas.length }}
              </span>
              
              <button v-if="currentTema < disciplina.temas.length - 1" 
                      @click="mudarTema(currentTema + 1); scrollToTop()"
                      class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <span>Próximo Tema</span>
                <i class="fas fa-arrow-right"></i>
              </button>
              <div v-else></div>
            </div>
          </div>
        </transition>
      </main>

      <!-- Footer -->
      <footer v-if="disciplina.footer" class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
          <div class="flex items-center justify-center space-x-4 mb-4">
            <i :class="disciplina.icone || 'fas fa-book'" class="text-2xl text-blue-400"></i>
            <h3 class="text-xl font-bold">{{ disciplina.nome }}</h3>
          </div>
          <p class="text-gray-400 mb-2">{{ disciplina.professores }}</p>
          <p class="text-gray-500 text-sm">{{ disciplina.footer }}</p>
        </div>
      </footer>
    </div>
  `,
};

// Registro global para uso via <script>
window.AulaInterativa = AulaInterativa;
