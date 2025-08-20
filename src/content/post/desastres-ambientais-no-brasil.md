---
publishDate: 2025-08-20T00:00:00Z
author: Bruno Schaefer
title: Explorando dados sobre Desastres Ambientais no Brasil com o mape_municipios
excerpt: Uma análise dos desastres ambientais no Brasil utilizando a base mape_municipios
image: https://images.unsplash.com/photo-1723151532624-eafe0e87bce6
category: Análise
tags:
  - Desastres Ambientais
  - Brasil
  - Políticas Públicas
---

> **Bruno Schaefer, Professor Adjunto do IESP-UERJ**

# Introdução

Este texto é o primeiro de uma série de tutoriais sobre o uso da base de dados *mape_municipios* (Schaefer et al. 2024).

O *mape_municipios* é um dos mais completos bancos de dados sobre informações dos municípios brasileiros, cobrindo um escopo temporal de 30 anos, 17 dimensões, 31 pesquisas e 452 variáveis. Seu objetivo é oferecer dados de maneira fácil, padronizada e qualificada para pesquisadores/as, gestores/as e sociedade civil, que embase boas pesquisas e tomada de decisão no campo das políticas públicas.

Do ponto de vista operacional, a coleta de dados do mape_municipios foi feita de três formas: 1) direta, a partir de bases de dados oficiais (TSE, MUNIC, MCTI, entre outros); 2) indireta, a partir de pacotes de disponibilização de dados, como censoBR (Pereira and Barbosa 2024), electionsBR (Meireles, Costa, and Silva 2017) e basedosdados (Dahis et al. 2022); 3) e a partir de outras produções acadêmicas (Kustov and Pardelli 2024).

Todos os passos seguidos foram realizados no R e documentados por meio de rotinas de código. Isso, além de conferir transparência para o processo (Brodeur et al. 2024; Figueiredo Filho et al. 2019), permitirá a atualização e expansão periódica do banco de dados.

Neste texto, focamos em uma dimensão do meio-ambiente, presente no *mape_municipios*. Em específico, tratamos dos dados sobre desastres ambientais, ou eventos climáticos extremos.

# Dados e pacotes

O primeiro passo é o carregamento da base de dados, disponível no *OSF* (Open Science Framework) <https://osf.io/3yka9/>.

``` r
library(tidyverse)
library(rio)
library(geobr)
library(ggplot2)
library(ggthemes)
library(sf)
library(flextable)
library(here)
library(fixest)
library(ggrepel)
        
options(scipen = 999)


base <- import("base_municipios_brasileiros.csv")


# Criação de nova variável

# Total prejuízos 

base <- base %>%
  mutate(total_prejuizos = total_prejuizos_privados + total_prejuizos_publicos)
```

O banco original contém 452 variáveis e 180285 observações (município-ano). Somente na dimensão de meio-ambiente foram agregadas pesquisas sobre: desmatamento (Recorte temporal: 2000-2022, fonte original Instituto Nacional de Pesquisas Espaciais (INPE)), Adaptação e vulnerabilidade climática (Recorte temporal:2015-2016, fonte original: Ministério da Ciência e Tecnologia (MCTI) Ministério da Ciência e Tecnologia (MCTI)), Sistema Nacional de Informações sobre Saneamento (SNIS) (Recorte temporal: 1995 - 2022, fonte original: Ministério do Desenvolvimento Regional (MDR)), e a base de Desastres Naturais (Recorte temporal 1991-2023, fonte original: Ministério da Integração e Desenvolvimento Regional - MIDR).

Focamos nos dados sobre desastres ambientais. Esses dados foram organizados no formato de painel (municipio-ano), com totalizações para prejuízos, pessoas afetadas, total de desastres e total de desastres por tipo (climatológicos, hidrológicos e metereológicos <https://www.gov.br/mdr/pt-br/ultimas-noticias/entenda-a-diferenca-entre-os-tipos-de-desastres-naturais-e-tecnologicos-registrados-no-brasil>). Essas informações foram retiradas do Atlas Digital de Desastres Naturais, compilado pelo MIDR, através de dados das prefeituras e defesas civis municipais.

Conforme o Ministério:

“Os dados utilizados para sua criação são extraídos dos registros realizados pelos estados e municípios no Sistema Integrado de Informações sobre Desastres (S2ID). Apesar de serem dados oficiais, é importante destacar que o processo de registro desses eventos não foi estabelecido com o intuito de construir uma base de dados nacional, mas sim para cumprimento do processo de solicitação de recursos para as ações de resposta e reconstrução”.

Aliado a uma série de variáveis sobre desastres, criamos uma nova, intitulada *total_prejuizos*, somando as estimativas das perdas econômicas associadas aos desastres ambientais.

# Análise

## Distribuição ao longo do ano

Primeiramente, analisamos a distribuição temporal da ocorrência de desastres, seus prejuízos e pessoas afetadas.

Reestruturamos o banco de dados para o formato de ano, somando as variáveis para todos os municípios brasileiros em cada um dos anos da série.

``` r
# Transformação da base para o formato somente ano

base_desastres <- base %>%
  group_by(ano) %>%
  summarise(total_desastres = sum(total_desastres, na.rm = TRUE),
            total_prejuizos = sum(total_prejuizos, na.rm = TRUE),
            total_pessoas_afetadas = sum(total_pessoas_afetadas, na.rm = TRUE)) %>%
  ungroup() %>%
  mutate(total_prejuizos_mil = total_prejuizos/1000000,
         total_pessoas_afetadas_mil = total_pessoas_afetadas/1000000) %>%
  ungroup()
```

### Variação temporal de desastres ambientais registrados

Os dados indicam crescimento consistente no número de registros de desastres ambientais no Brasil. Em 1991, primeiro ano da série, foram registrados 402, em 2023, último ano, 5078. Crescimento percentual de 1163,2%. Isso indica, por um lado, efeitos possíveis de mudanças climáticas à nível global, mas, também, a melhoria dos sistemas de registro de desastres.

Conforme Manual do MIDR:

“Nos anos 60, com a consolidação de órgãos de P&DC, o registro dos desastres era realizado de forma descentralizada, sem padronização dos dados inseridos ou sistematização do processo. Na época, os agentes de proteção e defesa civil utilizavam jornais, portarias, notícias, além de outros documentos internos para realização dos registros de desastres, que ficavam armazenados como documento físico ou virtual nas próprias prefeituras ou em instituições relacionadas. Posteriormente, durante a década de 90, o uso do documento de Notificação Preliminar de Desastre (NOPRED) e o Formulário de Avaliação de Danos (AVADAN) foi consolidado. Os dois documentos seguiam a Codificação de Desastres, Ameaças e Riscos (CODAR). O NOPRED era utilizado para o registro inicial do desastre, devendo ser preenchido em até 12 horas após a sua ocorrência. Já o AVADAN apresentava os dados levantados, como a área afetada, os danos humanos, materiais e ambientais e os prejuízos econômicos e sociais. A partir de 2012, com a publicação da Portaria MI nº 526, de 06 de setembro de 2012, foram estabelecidos os procedimentos para a solicitação de reconhecimento de Situação de Emergência (SE) e de Estado de Calamidade Pública (ECP) por meio do Sistema Integrado de Informações sobre Desastres (S2ID)”.

``` r
graf_linha_desastres <- base_desastres |>
  ggplot(aes(x = ano, y = total_desastres)) +
  geom_line() + 
  geom_point() +
  geom_text_repel(aes(label = round(total_desastres, 2)), size = 4, 
                  box.padding = 0.35, point.padding = 0.5,
                  max.overlaps = Inf) +
  labs(title = "",
       x = "Ano",
       y = "Total Desastres") +
  theme_minimal() +
  theme(
    legend.title = element_text(size = 12), 
    legend.text = element_text(size = 10),
    axis.text.x = element_text(angle = 90, vjust = 0.5, hjust = 1)  # Rotaciona os anos para 90 graus
  ) +
  scale_x_continuous(breaks = seq(min(base_desastres$ano), max(base_desastres$ano), by = 2))

graf_linha_desastres
```

![](../desastres/unnamed-chunk-1-1.png)

### Variação temporal de prejuízos registrados

Percebemos também crescimento dos prejuízos (públicos e privados) registrados ao longo do tempo. O que segue a tendência de aumento do número de registros de desastres.

Os dados de prejuízos são produzidos pelos municípios, o que denota que: “(…) não há uma padronização nas informações acerca dos danos resultantes das ocorrências de desastres, podendo esses serem fornecidos por diferentes instituições envolvidas, de acordo com a organização do município e com a tipologia do desastre”.

``` r
graf_linha_danos <- base_desastres |>
  ggplot(aes(x = ano, y = total_prejuizos_mil)) +
  geom_line() + 
  geom_point() + 
  geom_text_repel(aes(label = round(total_prejuizos_mil, 2)), size = 4, 
                  box.padding = 0.35, point.padding = 0.5,
                  max.overlaps = Inf) +
  labs(title = "",
       x = "Ano",
       y = "Total Prejuízos (em milhões)") +
  theme_minimal() +
  theme(
    legend.title = element_text(size = 12), 
    legend.text = element_text(size = 10),
    axis.text.x = element_text(angle = 90, vjust = 0.5, hjust = 1)  # Rotação de 90 graus
  ) +
  scale_x_continuous(breaks = seq(min(base_desastres$ano), max(base_desastres$ano), by = 2))  # Ajuste o intervalo conforme necessário

graf_linha_danos
```

![](../desastres/unnamed-chunk-2-1.png)

### Variação temporal de pessoas afetadas

Há, também, crescimento no número de pessoas afetadas pelos desastres ao longo do tempo.

``` r
graf_linha_pessoas <- base_desastres |>
  ggplot(aes(x = ano, y = total_pessoas_afetadas_mil)) +
  geom_line() + 
  geom_point() + 
  geom_text_repel(aes(label = round(total_pessoas_afetadas_mil, 2)), size = 4, 
                  box.padding = 0.35, point.padding = 0.5,
                  max.overlaps = Inf) +
  labs(title = "",
       x = "Ano",
       y = "Total Pessoas Afetadas (em milhões)") +
  theme_minimal() +
  theme(
    legend.title = element_text(size = 12), 
    legend.text = element_text(size = 10),
    axis.text.x = element_text(angle = 90, vjust = 0.5, hjust = 1)  # Rotaciona o texto dos anos
  ) +
  scale_x_continuous(breaks = seq(min(base_desastres$ano), max(base_desastres$ano), by = 2))

graf_linha_pessoas
```

![](../desastres/unnamed-chunk-3-1.png)

### Correlações

Para ilustrar a relação da evolução entre os indicadores, plotamos a correlação de Pearson entre o total de desastres registrados (*X*) e o total de prejuízos registrados (*Y*).

``` r
library(ggpubr)

base_desastres %>%
  ggplot(aes(x = total_desastres, y = total_prejuizos_mil)) +
  geom_point() +
  geom_smooth(method = "lm", se = FALSE, color = "blue") +
  geom_text_repel(aes(label = ano), size = 3) +  # Adiciona os anos como rótulo
  stat_cor(method = "pearson", 
           aes(label = paste(..r.label.., ..p.label.., sep = "~`,`~")),
           label.x = min(base_desastres$total_desastres, na.rm = TRUE),
           label.y = max(base_desastres$total_prejuizos_mil, na.rm = TRUE),
           size = 5) +
  labs(x = "Total Desastres Registrados",
       y = "Total Prejuízos (em milhões)") +
  theme_minimal()
```

![](../desastres/unnamed-chunk-4-1.png)

## Distribuição ao longo do espaço

Variação espacial de desastres, utilizando o *geobr* (Pereira R 2022).

``` r
muni <- read_municipality(code_muni = "all", year = "2010", showProgress = FALSE)
estados_sf <- geobr::read_state(year = 2010, showProgress = FALSE)


# Organizar o banco de dados 

base <- base %>%
  mutate(total_desastres_per_capita = total_desastres/populacao,
         total_prejuizos_pib = total_prejuizos/pib,
         total_pessoas_afetadas_per_capita = total_pessoas_afetadas/populacao)

base_soma <- base %>%
  group_by(id_municipio, nome_municipio) %>%
  summarise(total_desastres = sum(total_desastres, na.rm = TRUE),
            total_prejuizos = sum(total_prejuizos, na.rm = TRUE),
            total_pessoas_afetadas = sum(total_pessoas_afetadas, na.rm = TRUE),
            total_desastres_per_capita = sum(total_desastres_per_capita, na.rm = TRUE),
            total_prejuizos_pib = sum(total_prejuizos_pib, na.rm = TRUE),
            total_pessoas_afetadas_per_capita = sum(total_pessoas_afetadas_per_capita, na.rm = TRUE)) %>%
  ungroup() %>%
  mutate(total_prejuizos_mil = total_prejuizos/1000000,
         total_pessoas_afetadas_mil = total_pessoas_afetadas/1000000) %>%
  ungroup()

# Juntar bases 


municipios <- left_join(muni, base_soma, by = c("code_muni" = "id_municipio"))  
```

### Total desastres

Apresentamos abaixo a distribuição espacial dos desastres ambientais registrados no Brasil entre 1991 e 2023. Observa-se que os desastres estão mais concentrados em determinados estados do país. A concentração de registros pode refletir tanto maior exposição a eventos extremos quanto melhor capacidade institucional de notificação e solicitação de apoio federal. As cidades com maior incidência de desastres são, respectivamente: Campo Grande (MS), Oriximiná (PA), Coronel Sapucaia (MS), Miracema (RJ) e Ipojuca (PE).

``` r
br_desastres <- ggplot() +
  geom_sf(data = municipios, aes(fill = total_desastres), color=NA) + 
  geom_sf(data = estados_sf, fill = NA, color = "black", size = 0.5) +  # Adiciona fronteiras dos estados
  labs(title = "Total Desastres (Soma)") +
  scale_fill_viridis_c(option = "C", limits = c(0, 160), name='') +
  theme_void() +
  theme(plot.title = element_text(size = 10))  # Ajusta o tamanho da fonte do título

br_desastres
```

![](../desastres/unnamed-chunk-6-1.png)

### Total prejuízos

A abaixo mostra a razão entre os prejuízos econômicos registrados em decorrência de desastres e o Produto Interno Bruto (PIB) de cada município, evidenciando o impacto relativo sobre as economias locais. Os municípios com maiores impactos são Caridade do Piauí (PI), Iconha (ES), Jequitaí (MG), Belém Do Piauí (PI) e Bela Vista Do Piauí (PI).

``` r
br_prejuizos <- ggplot() +
  geom_sf(data = municipios, aes(fill = total_prejuizos_pib ), color=NA) + 
  geom_sf(data = estados_sf, fill = NA, color = "black", size = 0.5) +  # Adiciona fronteiras dos estados
  labs(title = "Prejuizos PIB (Soma)") +
  scale_fill_viridis_c(option = "C", limits = c(0, 24), name='') +
  theme_void() +
  theme(plot.title = element_text(size = 10))  # Ajusta o tamanho da fonte do título

br_prejuizos
```

![](../desastres/unnamed-chunk-7-1.png)

### Total pessoas afetadas

A Figura abaixo representa a razão acumulada entre o total de pessoas afetadas por desastres e a população dos municípios. O mapa evidencia que, proporcionalmente, alguns municípios enfrentam situações recorrentes de desastres com alto impacto sobre a população, especialmente nas regiões Sul, Norte e Nordeste. Esse indicador contempla pessoas diretamente afetadas por eventos como alagamentos urbanos, enxurradas, vendavais e estiagens prolongadas.

Cidades com maior impacto na população per capita: Ascurra (SC), Corupá (SC), Aricanduva (MG), Careiro da Várzea (AM) e Lagoa do Barro do Piauí (PI).

``` r
br_pessoas <- ggplot() +
  geom_sf(data = municipios, aes(fill = total_pessoas_afetadas_per_capita ), color=NA) + 
  geom_sf(data = estados_sf, fill = NA, color = "black", size = 0.5) +  # Adiciona fronteiras dos estados
  labs(title = "Pessoas Afetadas Per Capita (Soma)") +
  scale_fill_viridis_c(option = "C", limits = c(0, 22), name='') +
  theme_void() +
  theme(plot.title = element_text(size = 10))  # Ajusta o tamanho da fonte do título

br_pessoas
```

![](../desastres/unnamed-chunk-8-1.png)

Como se pode notar pelos três mapas, há diferenças entre a incidência de desastres (acumulados ao longo da série temporal), o total de pessoas afetadas e prejuízos.

## Correlações

A Figura abaixo apresenta a matriz de correlação de Pearson entre variáveis agregadas por município, relacionadas à ocorrência de desastres naturais no Brasil. Foram incluídas: população (Pop), PIB per capita (PIB_pc), total de desastres registrados (Desastres), e os três grupos principais de desastres reconhecidos pelo Ministério da Integração e Desenvolvimento Regional — climatológicos, hidrológicos e meteorológicos — além de duas medidas de impacto: prejuízos econômicos em proporção ao PIB municipal (Prej_PIB) e total de pessoas afetadas per capita (Afet_percap).

A análise evidencia uma correlação forte entre o número total de desastres e os desastres climatológicos (r = 0.71), o que é esperado, uma vez que esse grupo inclui eventos recorrentes como secas, estiagens e queimadas. Também há correlação considerável com desastres meteorológicos (r = 0.44) — categoria que inclui vendavais, tempestades, granizo e temperaturas extremas — e com os desastres hidrológicos (r = 0.17), que englobam inundações, alagamentos e enxurradas.

Entre os grupos de desastres, destaca-se a correlação positiva entre desastres climatológicos e meteorológicos (r = 0.40), o que indica possível simultaneidade de ocorrência ou sobreposição de causas, como eventos climáticos extremos que envolvem tanto seca quanto aumento de temperatura e incêndios florestais. Já a correlação entre desastres hidrológicos e os demais tipos é mais fraca, refletindo sua dinâmica própria e tipicamente urbana, como enchentes associadas à infraestrutura deficiente de drenagem.

Do ponto de vista dos impactos, o total de desastres apresenta correlação positiva, ainda que moderada, com os prejuízos per capita (r = 0.10) e com o número de pessoas afetadas per capita (r = 0.13). Esses valores sugerem que a mera ocorrência de desastres não é, por si só, o único determinante dos danos causados — sendo também influenciada por fatores como vulnerabilidade local, capacidade institucional, e densidade populacional.

Por fim, o PIB per capita apresenta correlação fraca ou negativa com as variáveis de impacto e ocorrência de desastres, o que pode indicar que municípios mais ricos tendem a reportar menos desastres ou possuem maior capacidade de mitigação. Já a população apresenta correlações quase nulas com as demais variáveis, o que sugere que o volume populacional, isoladamente, não explica a frequência ou gravidade dos eventos registrados.

``` r
library(corrplot)

## Substituir NAs

base <- base %>%
  mutate(total_prejuizos_pib_novo = replace_na(total_prejuizos_pib, 0),
         total_pessoas_afetadas_per_capita_novo = replace_na(total_pessoas_afetadas_per_capita, 0))

# Correlações gerais 

correlacao_geral <- base %>%
  select(ano, id_municipio, nome_municipio, populacao, pib_per_capita,
         total_desastres, total_desastres_climatologicos, total_desastres_hidrologicos,
         total_desastres_meteorologicos,
         total_prejuizos_pib_novo, total_pessoas_afetadas_per_capita_novo)

# Calcula a correlação
correlacao_resultado <- cor(correlacao_geral[,4:11], use = "complete.obs")

# Renomear colunas e linhas com nomes mais curtos
colnames(correlacao_resultado) <- c("Pop", "PIB_pc", "Desastres", "Desastres Clima", "Desastres Hidro", "Desastres Meteo", "Prej_PIB", "Afet_percap")
rownames(correlacao_resultado) <- colnames(correlacao_resultado)

corrplot(correlacao_resultado, method = "color", 
         type = "upper",      # mostra apenas a metade superior
         tl.col = "black",    # cor dos nomes das variáveis
         tl.srt = 45,         # rotação dos nomes
         addCoef.col = "black", # adiciona os valores das correlações
         number.cex = 0.7,    # tamanho dos números
         col = colorRampPalette(c("red", "white", "blue"))(200))  # cores da correlação
```

![](../desastres/unnamed-chunk-9-1.png)

# Considerações Finais

Os dados do mape_municipios sobre desastres ambientais revelam uma trajetória de crescimento acentuado nos registros ao longo do tempo, tanto em número de ocorrências quanto em pessoas afetadas e prejuízos econômicos. O aumento de mais de 1100% entre 1991 e 2023 no número de registros pode ser interpretado como reflexo das transformações climáticas em escala global, mas também evidencia avanços institucionais na sistematização das notificações e nos instrumentos de monitoramento, como o S2ID.

Do ponto de vista espacial, observa-se uma distribuição desigual dos impactos dos desastres ambientais entre os municípios brasileiros. Enquanto algumas regiões acumulam dezenas de eventos ao longo da série histórica, outras apresentam registros mais pontuais. Essa heterogeneidade pode refletir tanto a exposição diferenciada a riscos ambientais quanto desigualdades na capacidade institucional de registrar, notificar e solicitar recursos em situações de emergência. A análise espacial sugere que os municípios mais impactados concentram-se em áreas de maior densidade populacional e/ou maior vulnerabilidade socioambiental.

As análises de correlação reforçam a existência de associações importantes entre os indicadores. O número de desastres apresenta correlação positiva e estatisticamente significativa com o total de prejuízos econômicos — o que sugere que, à medida que aumentam os registros de eventos, também crescem os impactos financeiros. Além disso, há correlações elevadas entre os diferentes tipos de desastres (climatológicos, hidrológicos e meteorológicos), indicando possível sobreposição de categorias ou a ocorrência simultânea desses eventos em determinados contextos. Por fim, tanto os prejuízos per capita quanto o total de pessoas afetadas guardam relação com o total de desastres, o que evidencia a necessidade de políticas públicas que aliem prevenção, adaptação e mitigação de riscos ambientais.

Este panorama demonstra como o acesso e o uso qualificado de dados padronizados — como os disponibilizados pelo *mape_municipios* — podem oferecer subsídios valiosos para o planejamento territorial, a formulação de políticas de resiliência climática e o fortalecimento da capacidade institucional dos entes federativos. Futuras análises poderão se aprofundar em estudos causais, padrões regionais mais finos ou na identificação de fatores socioeconômicos associados à maior vulnerabilidade frente aos desastre

# Referências Bibliográficas

Brodeur, Abel, Kevin Esterling, Jörg Ankel-Peters, Natália S Bueno, Scott Desposato, Anna Dreber, Federica Genovese, et al. 2024. “Promoting Reproducibility and Replicability in Political Science.” *Research & Politics* 11 (1): 20531680241233439.

Dahis, Ricardo, João Carabetta, Fernanda Scovino, Frederico Israel, and Diego Oliveira. 2022. “Data Basis (Base Dos Dados): Universalizing Access to High-Quality Data.” {SSRN} {Scholarly} {Paper}. Rochester, NY. <https://doi.org/10.2139/ssrn.4157813>.

Figueiredo Filho, Dalson, Rodrigo Lins, Amanda Domingos, Nicole Janz, and Lucas Silva. 2019. “Seven Reasons Why: A User’s Guide to Transparency and Reproducibility.” *Brazilian Political Science Review* 13 (2): e0001.

Kustov, Alexander, and Giuliana Pardelli. 2024. “Beyond Diversity: The Role of State Capacity in Fostering Social Cohesion in Brazil.” *World Development* 180 (August): 106625. <https://doi.org/10.1016/j.worlddev.2024.106625>.

Meireles, Fernando, Beatriz Silva da Costa, and Denisson Silva. 2017. “<span class="nocase">electionsBR</span>: R Functions to Download and Clean Brazilian Electoral Data.” <https://www.academia.edu/30307653/electionsBR_R_Functions_to_Download_and_Clean_Brazilian_Electoral_Data>.

Pereira R, Gonçalves. 2022. “\_Geobr: Download Official Spatial Data Sets of Brazil\_.” <https://cran.r-project.org/web/packages/geobr/vignettes/intro_to_geobr.html>.

Pereira, Rafael H. M., and Rogério Jerônimo Barbosa. 2024. “Censobr: Easy Access to Brazilian Population Census Data.” *SocArXiv*, November. <https://ideas.repec.org//p/osf/socarx/yfq5j.html>.

Schaefer, Bruno Marques, Fernando Meireles, Carlos Freitas, Tomás Paixão Borges, Olga Caldas, Luisa Barreto Fernandes, Frederico Augusto Auad de Gomes Filho, and Larissa Silva Mendes. 2024. “Mape_municipios Database.” OSF (Open Science Framework). <https://doi.org/10.17605/OSF.IO/3YKA9>.
