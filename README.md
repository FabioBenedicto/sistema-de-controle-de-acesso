# Sistema de Controle de Acesso

Sistema de controle de acesso a salas de aula utilizando o ESP32, a tecnologia RFID, comunicação MQTT,  arquitetura de microsserviços e uma página WEB.

## Índice

- [Sistema de Controle de Acesso](#sistema-de-controle-de-acesso)
  - [Índice](#índice)
  - [Principais funcionalidades](#principais-funcionalidades)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
    - [Hardware](#hardware)
    - [Software](#software)
  - [Pré-Requisitos](#pré-requisitos)
  - [Instalação e Configuração](#instalação-e-configuração)
    - [1. Infraestrutura](#1-infraestrutura)
    - [2. Backend (API)](#2-backend-api)
    - [3. Frontend (WEB)](#3-frontend-web)
    - [4. Configuração do ESP32](#4-configuração-do-esp32)
      - [1. Pinagem (Wiring):](#1-pinagem-wiring)
      - [2. Botões:](#2-botões)
      - [3. Upload do Código:](#3-upload-do-código)
  - [Primeiro Acesso](#primeiro-acesso)
  - [Configuração Inicial da Sala](#configuração-inicial-da-sala)
      - [1. Conecte-se ao Wi-Fi do ESP32:](#1-conecte-se-ao-wi-fi-do-esp32)
      - [2. Acesse o Portal:](#2-acesse-o-portal)
      - [3. Preencha os Dados:](#3-preencha-os-dados)
  - [Manual do ESP32](#manual-do-esp32)
    - [Estados do LED:](#estados-do-led)
  - [Manual da WEB](#manual-da-web)
    - [Área do administrador:](#área-do-administrador)
      - [1. Criar Sala:](#1-criar-sala)
      - [2. Criar professor:](#2-criar-professor)
      - [3. Cadastrar cartão:](#3-cadastrar-cartão)
      - [4. Forçar liberar sala:](#4-forçar-liberar-sala)
    - [Área do professor:](#área-do-professor)
      - [1. Criar reserva:](#1-criar-reserva)
  - [Modo Offline](#modo-offline)



## Principais funcionalidades
*  Monitoramento em Tempo Real.
*  Validação de Entrada/Saída.
*  Modo de Cadastro Remoto.
*  Botão de Reset Físico para forçar liberação de sala sem rede.


## Tecnologias Utilizadas

### Hardware
* **Microcontrolador:** ESP32.
* **Leitor:** RFID-RC522.
* **Interface:** Display LCD 16x2 (I2C).
* **Atuadores:** LED's Verde, Vermelho, Branco, Amarelo e Botão Físico.

### Software
* **Backend:** NestJS, Prisma ORM.
* **Frontend:** React, Vite, Bootstrap.
* **Banco de Dados:** PostgreSQL.
* **Mensageria:** MQTT Broker EMQX.
* **Infraestrutura:** Docker & Docker Compose.


## Pré-Requisitos

Antes de iniciar, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* PNPM
* [Arduino IDE](https://www.arduino.cc/en/software)


## Instalação e Configuração

### 1. Infraestrutura
Realize o download das imagens e a execução dos containers do Banco de Dados PostgreSQL e do Broker MQTT EMQX.

```bash
cd esp32-api
docker-compose up -d
```

### 2. Backend (API)
1. Instale as dependências da API.
2. Execute as migrations.
3. Inicie a API.

```bash

cd esp32-api

# Instalar as dependências
pnpm install

# Executar as migrations
pnpm prisma:migrate:prod

# Iniciar a API
pnpm run start:dev
```


### 3. Frontend (WEB)
1. Instale as dependências da WEB.
2. Inicie a WEB.

```bash

cd esp32-web

# Instalar as dependências
pnpm install

# Iniciar a WEB
pnpm run dev
```

### 4. Configuração do ESP32

#### 1. Pinagem (Wiring):
```bash
RFID: SDA(15), RST(27), SCK(18), MOSI(23), MISO(19).

LCD I2C: SDA(21), SCL(22).

LEDs: Verde(2), Vermelho(4), Branco(12), Amarelo(13).
```

#### 2. Botões:
```bash
Configuração (Boot): GPIO 0.

Operação/Reset Sala: GPIO 14.
```

#### 3. Upload do Código:

1. Abra o arquivo .ino no Arduino IDE.

2. Instale as bibliotecas PubSubClient, ArduinoJson, MFRC522 e LiquidCrystal I2C.

3. Faça o upload do código para a placa.


## Primeiro Acesso
Como o banco de dados inicia vazio, é necessário criar o primeiro usuário administrador, então crie um registro na tabela teachers com a coluna ```is_admin``` como ```true```.

## Configuração Inicial da Sala
Ao ligar o ESP32 pela primeira vez ou se não houver rede configurada, ele entrará em Modo de Configuração Manual.

#### 1. Conecte-se ao Wi-Fi do ESP32:

* Nome da Rede (SSID): ESP32-Config

* Senha: (Nenhuma)

#### 2. Acesse o Portal:

Abra o navegador e digite: 192.168.4.1

Login Padrão: 
* Usuário: admin
* Senha: admin

#### 3. Preencha os Dados:

1. Selecione sua rede e digite a senha.

2. Insira o IP do computador em que os serviços estam sendo executados.

3. Insira o número identificador da sala no banco de dados.

4.  Defina uma nova senha para proteger esta configuração.

5. Salve a configuração. O ESP32 irá reiniciar e tentar conectar, se houver sucesso, o LED Amarelo será apagado.

## Manual do ESP32

### Estados do LED:

🟢 Sala Livre.

🔴 Sala Ocupada.

⚪ Modo de Cadastro.

🟡 Erro de conexão ou leitura.

## Manual da WEB

### Área do administrador:

#### 1. Criar Sala:
1. Acesse o menu Salas.
2. Clique no botão (+).
3. Cadastre o nome da sala.

#### 2. Criar professor:
1. Acesse o menu Professores.
2. Clique no botão (+). 
3. Cadastre o nome, protocolo e senha do professor.

#### 3. Cadastrar cartão:
1. Acesse o menu Salas.
2. Clique no botão "Ativar modo de cadastro". O LED Branco será aceso.
3. Aproxime um cartão ainda não cadastrado.
4. Acesse o menu Cartões, localize o novo cartão e vincule-o a algum professor criado anteriormente.

#### 4. Forçar liberar sala:
1. Se um professor esquecer de registrar saída, clique no botão "Liberar Sala" no menu Salas. O sistema registrará a saída forçada e o LED Verde será aceso.
   
### Área do professor:

#### 1. Criar reserva:
1. Acesso o menu Reservas.
2. Clique no botão (+). 
3. Selecione a Sala desejada e o Horário.
4. Aproxime o cartão para entrar na sala reservada.

## Modo Offline
O sistema possui mecanismos para funcionar mesmo se perder a conexão com a Internet durante a execução.

Se houver falha de conexão e a sala estiver ocupada o professor pode acionar o comando de Reset físico. A sala ficará livre imediatamente para uso local e o LED verde será acesso.

O dispositivo armazenará a informação e enviará os dados de saída para o servidor assim que a conexão for restabelecida, mantendo a integridade dos dados.


