# SuperList Mobile — plano técnico

## Decisões
- Aplicativo multiplataforma com Capacitor 8.
- Android e iOS compartilham a aplicação web existente.
- Supabase permanece como backend e fonte de sincronização entre dispositivos.
- O app nativo será empacotado com arquivos web locais em `www/`; não dependerá de abrir o site remoto dentro de um navegador.
- O projeto web atual continua independente e publicado como está.

## Fases

1. **Fundação Capacitor**
   - pacote npm, identidade do app, diretório de build e validação de arquivos.
2. **Experiência nativa**
   - navegação/retorno, status bar, splash screen, teclado, safe areas e deep links de autenticação.
3. **Recursos do aparelho**
   - câmera e captura de imagens;
   - leitura de código de barras;
   - entrada por voz;
   - notificações push e locais;
   - haptics e conectividade.
4. **Offline-first**
   - SQLite local como fila/cache durável;
   - sincronização idempotente com Supabase;
   - resolução de conflitos e indicador de estado.
5. **Qualidade e publicação**
   - testes em dispositivos reais;
   - ícones e screenshots;
   - políticas de privacidade e permissões;
   - assinatura Android, TestFlight e publicação nas lojas.

## Atenções identificadas na aplicação atual
- O projeto é HTML/CSS/JavaScript sem bundler e não possui `package.json` na branch principal.
- O manifesto PWA atual está sem ícones.
- A autenticação usa Supabase Auth e precisa de retorno por deep link para os fluxos nativos.
- Os dados da família são sincronizados hoje por snapshot JSON em `household_snapshots`; o offline nativo deve preservar esse contrato na primeira etapa e evoluir sem alterar dados existentes.
- A seleção da família ainda depende do primeiro vínculo retornado; isso deve ser corrigido antes da distribuição ampla, conforme documentado no pacote de aplicação.
- Não colocar service-role/secret keys no app. O cliente mobile usa somente publishable key e depende de RLS.

## Requisitos de build
- Node.js 22+.
- Android: Android Studio e SDK.
- iOS: macOS, Xcode 26+ e assinatura Apple Developer para distribuição.
- O diretório `www/` é gerado por `npm run build:mobile` e não deve ser editado manualmente.
