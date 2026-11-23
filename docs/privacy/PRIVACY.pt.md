# Política de Privacidade

_Data de vigência: 23 de novembro de 2026_

O Openings facilita a busca por anúncios públicos de vagas de tecnologia. Esta política se aplica ao site e ao aplicativo móvel do Openings e explica quais informações eles exibem, o que fica salvo no dispositivo e quando se conectam a serviços externos.

## 1. Dados públicos exibidos pelo Openings

O Openings lê dados públicos publicados pelo repositório `openings-dev/data-pipeline`. Um anúncio pode incluir título, descrição, resumo, tags, localização da vaga, informações salariais, datas, URL da fonte, repositório e identidade da comunidade.

O Openings também exibe informações públicas da conta no GitHub associada ao anúncio, como nome do autor, usuário e URL do avatar. O link para o perfil no GitHub é derivado do usuário público. As páginas de autores são geradas a partir desses registros públicos. Elas não indicam que o Openings verificou, representa ou tem vínculo com a pessoa, organização ou empresa exibida.

## 2. Preferências salvas no dispositivo

O Openings salva idioma, tema, vagas salvas e visualizadas, preferências de descoberta e suas escolhas sobre métricas e notificações no armazenamento local do navegador ou dispositivo móvel. Esses dados restauram a experiência escolhida e não criam uma conta. Eles permanecem ali até você alterá-los, limpar os dados do site ou app ou desinstalar o aplicativo.

No aplicativo móvel, os identificadores dos autores bloqueados ficam apenas no dispositivo para ocultar suas vagas, inclusive as salvas. Você pode desbloquear autores no menu de navegação sem apagar vagas salvas. Os identificadores dos autores bloqueados não são enviados como métricas.

## 3. Monitoramento técnico e métricas opcionais

Quando configurado, o Sentry recebe erros técnicos sanitizados para que os mantenedores possam diagnosticar falhas. Os apps Android e iOS também usam o Firebase Crashlytics para relatórios automáticos de falhas nativas. O Openings desativa a coleta padrão de dados pessoais e a gravação de sessões e não envia intencionalmente buscas, conteúdo de vagas, corpo de requisições, cookies, identidade do usuário nem parâmetros de URL. Serviços de diagnóstico podem receber dados técnicos do app, aparelho, sistema operacional, versão e falha necessários para identificar um problema.

As métricas de produto do Mixpanel permanecem desativadas até você permiti-las explicitamente. Quando permitido, ele recebe uma lista pequena de eventos anônimos, como dimensão de filtro, faixa de resultados, ID da vaga ou abertura da fonte original. Não recebe texto de busca, conteúdo de vagas, e-mails, URLs completas, localização derivada de IP, visualizações automáticas, autocaptura nem gravação de sessão.

Esta página controla as métricas do site neste navegador. No aplicativo móvel, use “Analytics opcionais” no menu de navegação para permitir ou desativar as métricas. Essas escolhas são independentes. Desativar as métricas interrompe o envio de eventos de produto e redefine a identidade local de métricas sem remover vagas salvas ou outras preferências. Isso não apaga eventos já recebidos pelo serviço de métricas.

No aplicativo móvel, o OneSignal é iniciado com consentimento obrigatório. O Openings só habilita o processamento de notificações depois que você permite as notificações no aplicativo. A exibição também depende da permissão do sistema operacional; são controles distintos. O OneSignal pode então processar um identificador do aparelho ou da instalação e informações de entrega ou interação necessárias para operar as notificações. Você pode desativá-las nos ajustes do dispositivo.

Os apps Android e iOS usam Firebase Remote Config para obter configurações de compatibilidade e atualização. O Firebase processa dados técnicos de instalação e conexão para esse serviço.

Dúvidas sobre monitoramento ou métricas podem ser enviadas para support@openings.dev.

## 4. Requisições e links externos

O site lê o índice público de vagas em arquivos brutos hospedados no GitHub. Quando há um avatar, o navegador solicita a URL remota incluída nos dados públicos; essa imagem pode estar hospedada no GitHub ou em outro domínio. Ao abrir um anúncio, repositório, perfil, discussão ou outro link externo, você acessa o serviço de destino, que trata a requisição segundo seus próprios termos e política de privacidade.

## 5. Como os dados são usados

O Openings usa os registros públicos descritos acima para oferecer busca, filtros, páginas de comunidades, páginas de autores, detalhes das vagas e links para cada fonte original. O Openings não recebe candidaturas, não cria contas de candidatos e não verifica empresas ou anúncios.

## 6. Dúvidas, correções e pedidos de remoção

Se uma informação pública estiver incorreta ou precisar ser removida do índice, use o [formulário de correção ou remoção](https://github.com/openings-dev/web/issues/new?template=content_correction.yml) ou escreva para support@openings.dev. Inclua a URL afetada no Openings e a URL da fonte original para que os contribuidores possam investigar.

As informações que você decidir enviar por e-mail ou GitHub serão tratadas por esse canal para que os contribuidores respondam ao pedido. Não envie dados pessoais sensíveis que não sejam necessários.

## 7. Alterações e retenção dos dados

As informações sobre vagas e autores mudam quando a fonte pública e os dados publicados pelo Openings mudam. As preferências de tema e idioma permanecem no navegador até você alterá-las ou limpar o armazenamento local.

## 8. Segurança

Vulnerabilidades de segurança devem ser enviadas em particular para security@openings.dev, e não publicadas em uma issue. O tempo de resposta pode variar porque o projeto é mantido por contribuidores.

## 9. Atualizações desta política

Esta política pode mudar junto com o produto ou com o tratamento de dados. A data de vigência no início identifica a versão publicada atual.
