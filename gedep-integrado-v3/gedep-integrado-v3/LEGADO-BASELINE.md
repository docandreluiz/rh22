# GEDEP — baseline legado preservada

A versão recebida em `gedep-integrado-ultima-versao-rh2.zip` foi analisada sem alteração.

- Arquivo original: `/home/ubuntu/upload/gedep-integrado-ultima-versao-rh2.zip`
- SHA-256: `0ee4b2d98cc4dd8a127f1678775de963a2214b1c5548f5571a947e130970746c`
- Cópia extraída para análise: `/home/ubuntu/work/gedep-analysis/gedep-integrado`
- Relatório técnico: `/home/ubuntu/work/gedep-analysis/ANALISE-GEDEP-RH2.md`

## Fase 1 entregue

A nova aplicação em `client/` é uma casca única independente do legado, com autenticação Google em memória, modo de demonstração sem acesso externo, navegação interna por hash, estado compartilhado, adaptador centralizado para Google Sheets e telas-base para os módulos.

Nenhuma operação de escrita na planilha foi executada. A conexão somente é lida após o usuário clicar em **Testar conexão** ou **Carregar dados**.
