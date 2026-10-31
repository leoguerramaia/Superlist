# Superlist — primeira versão funcional

## Como executar
1. Extraia o ZIP.
2. Abra `index.html` em um navegador moderno.
3. Para testar a consulta de código de barras, use uma conexão com internet. A consulta usa a API pública Open Food Facts.

## O que já funciona
- Dashboard e navegação responsiva.
- Cadastro de supermercados.
- Catálogo inicial com mais de 60 produtos e categorias.
- Unidade de compra por produto (unidade, kg, g, litro e ml).
- Criação de listas com data e supermercado.
- Importação de texto com tentativa de reconhecimento de quantidades e produtos.
- Itens não reconhecidos entram em “Outros”.
- Tela de compra com quantidade, preço, checkbox, subtotais e total.
- Associação de código de barras digitado e consulta Open Food Facts.
- Registro de preços quando uma compra é concluída.
- Histórico filtrável e exportação CSV compatível com Excel.
- Persistência local via localStorage.

## Limitações desta versão
- Os dados ficam no navegador/dispositivo atual. Não há login, nuvem ou compartilhamento entre dispositivos ainda.
- A consulta Open Food Facts não é uma base universal completa; alguns produtos não serão encontrados.
- O campo de leitura de código de barras permite digitar o EAN. A captura pela câmera e integração de leitor físico são próximos incrementos.
- A exportação é CSV com separador `;`, que abre no Excel. XLSX nativo pode ser adicionado numa próxima etapa.
- A importação de texto usa correspondência simples; vale evoluir para interpretação mais inteligente, sinônimos e revisão antes de criar a lista.

## Próximas evoluções recomendadas
1. Firebase ou Supabase para autenticação, banco de dados e sincronização em tempo real.
2. Leitor de código de barras pela câmera (ZXing ou BarcodeDetector, com fallback).
3. Histórico de preço por produto, loja, embalagem e unidade comparável.
4. Prévia de compra baseada no último preço conhecido por supermercado.
5. Compartilhamento familiar e modo offline-first.
6. Exportação XLSX real e relatórios de economia.
