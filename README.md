# Pokédex Interativa

Aplicação frontend simples em Vanilla JavaScript que consome a PokéAPI e permite buscar, navegar e visualizar pokémons de forma responsiva.

## Visão geral

- Lista pokémons com imagem, tipos e identificador.
- Busca em tempo real (nome / id), sem recarregar a página.
- Paginação client-side e layout adaptável conforme o tamanho da tela.
- Projeto sem frameworks para facilitar estudo e customização.

## Funcionalidades

- Listagem com imagens e tipos.
- Busca por nome ou ID (parcial e case-insensitive).
- Paginação com botões e números de página.
- Layout responsivo (grid) e suporte a dark mode via preferência do sistema.

## Tecnologias

- HTML5, CSS3 (Grid/Flexbox), JavaScript (ES6+)
- PokéAPI (https://pokeapi.co)
- Docker + Nginx para servir estáticos

## Pré-requisitos

- Docker e Docker Compose instalados

## Como rodar

Modo desenvolvimento (com hot-reload, se o `docker-compose.yml` estiver configurado com volumes):

```bash
docker compose up --build
```

Abra no navegador: http://localhost:8080

Se não ver alterações após editar CSS/JS, faça um hard refresh (`Ctrl+Shift+R`) ou reconstrua:

```bash
docker compose down
docker compose up --build
```

## Estrutura do projeto

- `index.html` — página principal
- `css/style.css` — estilos
- `js/app.js` — lógica da aplicação (fetch, filtros, paginação, render)
- `Dockerfile`, `docker-compose.yml`, `nginx.conf` — configuração do container

## Desenvolvimento

- Edite `css/` e `js/` localmente. Se estiver usando o `docker compose` com volumes, as mudanças serão refletidas automaticamente no container.
- Se preferir testar rápido sem Docker:

```bash
python3 -m http.server 8000
# e acessar http://localhost:8000
```

## Observações

- Os dados vêm da PokéAPI; limites e disponibilidade dependem do serviço externo.
- O projeto é intencionalmente minimalista e adequado para aprendizado.

## Melhoria futura (exemplos)

- Filtros por tipo
- Sistema de favoritos
- Modal com estatísticas completas
- Transformar em PWA com cache offline

## Licença

Uso livre para estudo e modificações.

---

Desenvolvido com ❤️ — Dados: PokéAPI
