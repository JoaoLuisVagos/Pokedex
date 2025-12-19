class Pokedex {
    constructor() {

        this.URL_API = 'https://pokeapi.co/api/v2';
        this.POKEMONS_POR_PAGINA = 11;
        this.LARGURA_MINIMA_CARD = 200;
        this.LINHAS_POKEMON = 2;

        this.TIPOS_POKEMON = {
            plant: 'type/12',
            poison: 'type/4',
            fire: 'type/10',
            water: 'type/11',
            flying: 'type/3',
            bug: 'type/7',
            normal: 'type/1',
            electric: 'type/24',
            ground: 'type/5',
            fairy: 'type/18',
            fighting: 'type/2',
            psychic: 'type/14',
            rock: 'type/6',
            ghost: 'type/8',
            ice: 'type/15',
            dragon: 'type/16',
            dark: 'type/17',
            steel: 'type/9',
        };

        this.todosPokemon = [];
        this.pokemonFiltrado = [];
        this.paginaAtual = 1;
        this.carregando = false;
        this.termoBusca = '';

        this.gridPokemon = document.getElementById('pokemonGrid');
        this.inputBusca = document.getElementById('searchInput');
        this.botaoAnterior = document.getElementById('prevBtn');
        this.botaoProximo = document.getElementById('nextBtn');
        this.numeroPaginas = document.getElementById('pageNumbers');
        this.indicadorCarregamento = document.getElementById('loadingIndicator');
        this.nenhumResultado = document.getElementById('noResults');
        this.logo = document.getElementById('logo');

        this.init();
    }

    async init() {
        try {
            await this.buscarTodosPokemon();
            this.configurarOuvintes();
            this.atualizarItensPerPagina();
            this.renderizar();
            window.addEventListener('resize', this.rebote(() => {
                const anterior = this.POKEMONS_POR_PAGINA;
                this.atualizarItensPerPagina();
                if (this.POKEMONS_POR_PAGINA !== anterior) this.renderizar();
            }, 200));
        } catch (erro) {
            console.error('Erro na inicialização:', erro);
            this.mostrarErro('Erro ao carregar os pokémons. Tente novamente mais tarde.');
        }
    }

    async buscarTodosPokemon() {
        this.mostrarCarregando(true);
        try {
            const resposta = await fetch(`${this.URL_API}/pokemon?limit=1025&offset=0`);
            const dados = await resposta.json();

            const promessasPokemon = dados.results.map(pokemon =>
                this.buscarDetalhesPokemon(pokemon.url)
            );

            this.todosPokemon = await Promise.all(promessasPokemon);
            this.pokemonFiltrado = [...this.todosPokemon];

            this.mostrarCarregando(false);
        } catch (erro) {
            console.error('Erro ao buscar pokémons:', erro);
            this.mostrarCarregando(false);
            throw erro;
        }
    }

    async buscarDetalhesPokemon(url) {
        try {
            const resposta = await fetch(url);
            const dados = await resposta.json();

            return {
                id: dados.id,
                name: dados.name,
                image: dados.sprites.other['official-artwork'].front_default || 
                       dados.sprites.front_default,
                types: dados.types.map(tipo => tipo.type.name),
                height: dados.height,
                weight: dados.weight,
                stats: dados.stats,
            };
        } catch (erro) {
            console.error(`Erro ao buscar detalhe do pokémon de ${url}:`, erro);
            return null;
        }
    }

    configurarOuvintes() {
        this.inputBusca.addEventListener('input', (e) => this.manipularBusca(e));

        this.botaoAnterior.addEventListener('click', () => this.paginaAnterior());
        this.botaoProximo.addEventListener('click', () => this.proximaPagina());

        this.logo.addEventListener('click', () => this.reiniciarApp());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.paginaAnterior();
            if (e.key === 'ArrowRight') this.proximaPagina();
        });
    }
    atualizarItensPerPagina() {
        try {
            const grade = document.getElementById('pokemonGrid');
            if (!grade) return;
            const larguraGrade = grade.clientWidth || grade.offsetWidth || window.innerWidth;
            const colunas = Math.max(1, Math.floor(larguraGrade / this.LARGURA_MINIMA_CARD));
            const novaQuantidade = Math.max(6, colunas * this.LINHAS_POKEMON);
            if (novaQuantidade !== this.POKEMONS_POR_PAGINA) {
                this.POKEMONS_POR_PAGINA = novaQuantidade;
                const totalPaginas = this.obterTotalPaginas();
                if (this.paginaAtual > totalPaginas) this.paginaAtual = totalPaginas || 1;
            }
        } catch (e) {
            console.warn('Erro ao atualizar itens por página', e);
        }
    }

    rebote(fn, espera = 200) {
        let tempo;
        return (...args) => {
            clearTimeout(tempo);
            tempo = setTimeout(() => fn.apply(this, args), espera);
        };
    }

    manipularBusca(e) {
        this.termoBusca = e.target.value.toLowerCase().trim();
        this.paginaAtual = 1;

        if (this.termoBusca === '') {
            this.pokemonFiltrado = [...this.todosPokemon];
        } else {
            this.pokemonFiltrado = this.todosPokemon.filter(pokemon =>
                pokemon.name.toLowerCase().includes(this.termoBusca) ||
                pokemon.id.toString().includes(this.termoBusca) ||
                pokemon.types.some(tipo => tipo.toLowerCase().includes(this.termoBusca))
            );
        }

        this.atualizarItensPerPagina();
        this.renderizar();
    }

    obterPokemonPaginado() {
        const indiceInicio = (this.paginaAtual - 1) * this.POKEMONS_POR_PAGINA;
        const indiceFim = indiceInicio + this.POKEMONS_POR_PAGINA;
        return this.pokemonFiltrado.slice(indiceInicio, indiceFim);
    }

    obterTotalPaginas() {
        return Math.ceil(this.pokemonFiltrado.length / this.POKEMONS_POR_PAGINA);
    }

    paginaAnterior() {
        if (this.paginaAtual > 1) {
            this.paginaAtual--;
            this.renderizar();
            this.rolarParaTopo();
        }
    }

    proximaPagina() {
        const totalPaginas = this.obterTotalPaginas();
        if (this.paginaAtual < totalPaginas) {
            this.paginaAtual++;
            this.renderizar();
            this.rolarParaTopo();
        }
    }

    irParaPagina(pagina) {
        if (pagina >= 1 && pagina <= this.obterTotalPaginas()) {
            this.paginaAtual = pagina;
            this.renderizar();
            this.rolarParaTopo();
        }
    }

    reiniciarApp() {
        this.termoBusca = '';
        this.inputBusca.value = '';
        this.paginaAtual = 1;
        this.pokemonFiltrado = [...this.todosPokemon];
        this.atualizarItensPerPagina();
        this.renderizar();
    }

    rolarParaTopo() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    mostrarCarregando(mostrar) {
        if (mostrar) {
            this.indicadorCarregamento.classList.remove('hidden');
        } else {
            this.indicadorCarregamento.classList.add('hidden');
        }
    }

    mostrarErro(mensagem) {
        alert(mensagem);
    }

    obterClasseTipo(tipo) {
        const mapaTipos = {
            grass: 'plant',
            poison: 'poison',
            fire: 'fire',
            water: 'water',
            flying: 'flying',
            bug: 'bug',
            normal: 'normal',
            electric: 'electric',
            ground: 'ground',
            fairy: 'fairy',
            fighting: 'fighting',
            psychic: 'psychic',
            rock: 'rock',
            ghost: 'ghost',
            ice: 'ice',
            dragon: 'dragon',
            dark: 'dark',
            steel: 'steel',
        };
        return mapaTipos[tipo] || tipo;
    }

    criarCardPokemon(pokemon) {
        if (!pokemon) return '';

        const tipos = pokemon.types
            .map(tipo => `<span class="pokemon-type type-${this.obterClasseTipo(tipo)}">${tipo}</span>`)
            .join('');

        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <div class="pokemon-card-header">
                <div>
                    ${tipos}
                </div>
                <span class="pokemon-id">#${pokemon.id.toString().padStart(4, '0')}</span>
            </div>
            <div class="pokemon-image-container">
                <img 
                    src="${pokemon.image}" 
                    alt="${pokemon.name}" 
                    class="pokemon-image"
                    loading="lazy"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EImagem não encontrada%3C/text%3E%3C/svg%3E'"
                >
            </div>
            <h3 class="pokemon-name">${pokemon.name}</h3>
        `;

        card.addEventListener('click', () => {
            this.mostrarDetalhesPokemon(pokemon);
        });

        return card;
    }

    mostrarDetalhesPokemon(pokemon) {
        console.log('Detalhe do pokémon:', pokemon);
        alert(`${pokemon.name} (#${pokemon.id})\nTipos: ${pokemon.types.join(', ')}`);
    }
    
    renderizarPaginacao() {
        const totalPaginas = this.obterTotalPaginas();

        this.botaoAnterior.disabled = this.paginaAtual === 1;
        this.botaoProximo.disabled = this.paginaAtual === totalPaginas || totalPaginas === 0;

        this.numeroPaginas.innerHTML = '';

        const maxPaginasExibir = window.innerWidth <= 768 ? 3 : 5;
        let paginaInicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginasExibir / 2));
        let paginaFim = Math.min(totalPaginas, paginaInicio + maxPaginasExibir - 1);

        if (paginaFim - paginaInicio + 1 < maxPaginasExibir) {
            paginaInicio = Math.max(1, paginaFim - maxPaginasExibir + 1);
        }

        if (paginaInicio > 1) {
            const btn = this.criarBotaoPagina(1);
            this.numeroPaginas.appendChild(btn);

            if (paginaInicio > 2) {
                const reticencias = document.createElement('span');
                reticencias.textContent = '...';
                reticencias.style.padding = '0 0.5rem';
                this.numeroPaginas.appendChild(reticencias);
            }
        }

        for (let i = paginaInicio; i <= paginaFim; i++) {
            const btn = this.criarBotaoPagina(i);
            this.numeroPaginas.appendChild(btn);
        }

        if (paginaFim < totalPaginas) {
            if (paginaFim < totalPaginas - 1) {
                const reticencias = document.createElement('span');
                reticencias.textContent = '...';
                reticencias.style.padding = '0 0.5rem';
                this.numeroPaginas.appendChild(reticencias);
            }

            const btn = this.criarBotaoPagina(totalPaginas);
            this.numeroPaginas.appendChild(btn);
        }
    }

    criarBotaoPagina(numeroPagina) {
        const btn = document.createElement('button');
        btn.className = `page-number ${numeroPagina === this.paginaAtual ? 'active' : ''}`;
        btn.textContent = numeroPagina;
        btn.addEventListener('click', () => this.irParaPagina(numeroPagina));
        return btn;
    }

    renderizar() {
        const pokemonPaginado = this.obterPokemonPaginado();

        if (this.pokemonFiltrado.length === 0) {
            this.gridPokemon.innerHTML = '';
            this.nenhumResultado.classList.remove('hidden');
        } else {
            this.nenhumResultado.classList.add('hidden');
            this.gridPokemon.innerHTML = '';

            pokemonPaginado.forEach(pokemon => {
                const card = this.criarCardPokemon(pokemon);
                if (card) {
                    this.gridPokemon.appendChild(card);
                }
            });
        }

        this.renderizarPaginacao();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pokedex = new Pokedex();
});
