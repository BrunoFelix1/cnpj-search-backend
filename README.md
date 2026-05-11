# cnpj-search-backend

Web application to consult company information through CNPJ searches, providing organized, fast, and intuitive access to business data.

## Anotações durante o desenvolvimento

- Estou usando synchronize true por enquanto, pra produção seria ideal o uso de migrations.
- POST vai salvar no banco e retornar o resultado.

## Funcionalidades que poderiam ser implementadas com mais tempo

- Testes Unitários
- Persistência dos dados em um banco, caso usasse as informações do Lead para outra coisa
- Autenticação
- Filas pra processamento dos dados que estão sendo agregados pela API, se a regra de negócio viesse a aumentar, no caso
