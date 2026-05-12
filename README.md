# cnpj-search-backend

API para consultar informacoes de empresas via CNPJ, agregando dados de fontes externas e retornando respostas organizadas.

## Requisitos

- Node.js 18+ (recomendado)
- npm 9+

## Instalacao

```bash
npm install
```

## Variaveis de ambiente

Crie um arquivo .env na raiz do projeto com as seguintes variaveis:

```
# Porta do servidor
PORT=3000

# Base URL da API de CNPJ
CNPJ_API_URL=https://sua-api-cnpj.exemplo

# Base URL do Geocoding (opcional)
GEOCODE_API_URL=https://nominatim.openstreetmap.org/search

# TTL do cache em ms (opcional)
CNPJ_CACHE_TTL_MS=300000
```

## Como rodar localmente

```bash
npm run start:dev
```

O servidor inicia em http://localhost:3000 (ou na porta definida em PORT).

## Endpoint para listar os dados que sã tratados e depois enviados ao frontend

POST em {BASE_URL}/leads/search

Com o seguinte payload:

```json
{
  "cnpj": "123456789012345"
}
```

## Uso de IA

- Geração de trechos
- Brainstorming na parte de GeoCoding
- Auxílio no debug de erros

## Decisoes de projeto e justificativas

- NestJS para estrutura modular e boa separacao de responsabilidades (Ajudaria pra escalar se fossemos adicionar mais funcionalidades).
- Configuracao global de variaveis de ambiente com fallback seguro.
- Cache em memoria com TTL para reduzir chamadas repetidas a API externa.
- Geocoding com URL configuravel, permitindo trocar o provedor sem alterar codigo (O retorno teria que ser validado).

## Tempo gasto

6 horas.

## Anotações durante o desenvolvimento

- Latitude e Longitude com Geocoding

## Funcionalidades que poderiam ser implementadas com mais tempo

- Testes Unitários
- Persistência dos dados em um banco, caso usasse as informações do Lead para outra coisa
- Autenticação
- Filas pra processamento dos dados que estão sendo agregados pela API, se a regra de negócio viesse a aumentar, no caso
- Consumo da API do Google Maps pra pegar a Latitude e Longitude, e mostrar no frontend um mapa com a localização exata da empresa.
- Migrations e estrategia de persistencia para dados de lead.
